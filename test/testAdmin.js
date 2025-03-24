const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Admin Contract", function () {
  let admin;
  let owner;
  let addr1;
  let addr2;
  // Use a simple budget value instead of ethers.utils.parseEther
  const budget = 100;
  
  beforeEach(async function () {
    // Deploy the Admin contract
    const Admin = await ethers.getContractFactory("Admin");
    [owner, addr1, addr2] = await ethers.getSigners();
    admin = await Admin.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await admin.admin()).to.equal(owner.address);
    });

    it("Should set deployer as admin", async function () {
      expect(await admin.isAdmin(owner.address)).to.equal(true);
    });
  });

  describe("Admin Management", function () {
    it("Should allow super admin to add new admin", async function () {
      await admin.addAdmin(addr1.address);
      expect(await admin.isAdmin(addr1.address)).to.equal(true);
    });

    it("Should prevent non-super admin from adding new admin", async function () {
      await admin.addAdmin(addr1.address);
      await expect(
        admin.connect(addr1).addAdmin(addr2.address)
      ).to.be.revertedWith("Only super admin can add admins");
    });
  });

  describe("Research Management", function () {
    beforeEach(async function () {
      // Add a research area first - use simple number instead of parseEther
      await admin.addResearch(101, 5, 1, budget);
    });

    it("Should add a new research area", async function () {
      // Check research exists
      const researchDetails = await admin.researches(101);
      expect(researchDetails.id).to.equal(101);
      expect(researchDetails.totalMilestones).to.equal(5);
      expect(researchDetails.budget).to.equal(budget);
      expect(researchDetails.exists).to.equal(true);
    });

    it("Should prevent adding duplicate research IDs", async function () {
      await expect(
        admin.addResearch(101, 5, 1, budget)
      ).to.be.revertedWith("Research ID already exists");
    });

    it("Should allow admin to add multiple research areas", async function () {
      await admin.addResearch(102, 3, 1, budget);
      await admin.addResearch(103, 7, 1, budget);
      
      // Check count
      expect(await admin.getResearchCount()).to.equal(3);
      
      // Check retrieval of all IDs
      const ids = await admin.getAllResearchIds();
      expect(ids.length).to.equal(3);
      expect(ids[0]).to.equal(101);
      expect(ids[1]).to.equal(102);
      expect(ids[2]).to.equal(103);
    });

    it("Should prevent non-admins from adding research", async function () {
      await expect(
        admin.connect(addr1).addResearch(101, 5, 1, budget)
      ).to.be.revertedWith("Only admins can add new research areas");
    });

    it("Should correctly return research milestones", async function () {
      expect(await admin.getResearchMilestones(101)).to.equal(5);
    });

    it("Should revert when querying non-existent research", async function () {
      await expect(
        admin.getResearchMilestones(999)
      ).to.be.revertedWith("Research ID does not exist");
    });
  });
});