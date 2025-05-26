const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Admin Contract View Functions", function () {
  let admin;
  let owner;
  let addr1;
  let addr2;
  
  // Consistent budget for testing
  const budget = 100;

  const performanceMetrics = {
    local: {},
    sepolia: {}
  };

  // Helper function to measure execution time
  const measureTime = async (fn, description, network) => {
    const start = Date.now();
    const result = await fn();
    const end = Date.now();
    const duration = end - start;
    
    if (!performanceMetrics[network][description]) {
      performanceMetrics[network][description] = [];
    }
    performanceMetrics[network][description].push(duration);
    
    return result;
  };

  after(async function () {
    console.log("\nPerformance Metrics:");
    console.log(JSON.stringify(performanceMetrics, null, 2));
  });
  
  beforeEach(async function () {
    // Deploy the Admin contract
    const Admin = await ethers.getContractFactory("Admin");
    [owner, addr1, addr2] = await ethers.getSigners();
    admin = await Admin.deploy();
    
    // Prepare some test research areas
    await admin.addResearch(101, 5, 1, budget);
    await admin.addResearch(102, 3, 1, budget);
    await admin.addResearch(103, 7, 1, budget);
  });

  describe("getResearchMilestones View Function", function () {
    it("Should return correct number of milestones for existing research", async function () {
      await measureTime(
        () => admin.getResearchMilestones(101),
        "getResearchMilestones",
        "local"
      );
      // const milestones = await admin.getResearchMilestones(101);
      expect(milestones).to.equal(5);
    });

    it("Should return different milestone counts for different research areas", async function () {
      const milestones101 = await admin.getResearchMilestones(101);
      const milestones102 = await admin.getResearchMilestones(102);
      const milestones103 = await admin.getResearchMilestones(103);

      expect(milestones101).to.equal(5);
      expect(milestones102).to.equal(3);
      expect(milestones103).to.equal(7);
    });

    it("Should revert when querying non-existent research", async function () {
      await expect(
        admin.getResearchMilestones(999)
      ).to.be.revertedWith("Research ID does not exist");
    });
  });

  describe("getAllResearchIds View Function", function () {
    it("Should return all research IDs in order of addition", async function () {
      const researchIds = await admin.getAllResearchIds();
      
      expect(researchIds.length).to.equal(3);
      expect(researchIds[0]).to.equal(101);
      expect(researchIds[1]).to.equal(102);
      expect(researchIds[2]).to.equal(103);
    });

    it("Should return an empty array if no research areas exist", async function () {
      // Create a new contract to ensure no prior research
      const Admin = await ethers.getContractFactory("Admin");
      const freshAdmin = await Admin.deploy();
      
      const researchIds = await freshAdmin.getAllResearchIds();
      expect(researchIds.length).to.equal(0);
    });
  });

  describe("getResearchCount View Function", function () {
    it("Should return correct number of research areas", async function () {
      const count = await admin.getResearchCount();
      expect(count).to.equal(3);
    });

    it("Should return zero for a fresh contract", async function () {
      const Admin = await ethers.getContractFactory("Admin");
      const freshAdmin = await Admin.deploy();
      
      const count = await freshAdmin.getResearchCount();
      expect(count).to.equal(0);
    });
  });

  describe("isAdmin View Function", function () {
    it("Should confirm contract deployer is an admin", async function () {
      const isOwnerAdmin = await admin.isAdmin(owner.address);
      expect(isOwnerAdmin).to.equal(true);
    });

    it("Should return false for addresses not added as admin", async function () {
      const isAddr1Admin = await admin.isAdmin(addr1.address);
      expect(isAddr1Admin).to.equal(false);
    });

    it("Should return true after adding a new admin", async function () {
      await admin.addAdmin(addr1.address);
      const isAddr1Admin = await admin.isAdmin(addr1.address);
      expect(isAddr1Admin).to.equal(true);
    });

    it("Should consistently return admin status", async function () {
      // Add multiple admins and check their status
      await admin.addAdmin(addr1.address);
      await admin.addAdmin(addr2.address);

      const ownerAdminStatus = await admin.isAdmin(owner.address);
      const addr1AdminStatus = await admin.isAdmin(addr1.address);
      const addr2AdminStatus = await admin.isAdmin(addr2.address);

      expect(ownerAdminStatus).to.equal(true);
      expect(addr1AdminStatus).to.equal(true);
      expect(addr2AdminStatus).to.equal(true);
    });
  });

  describe("Researches Mapping View", function () {
    it("Should allow viewing full research details", async function () {
      const research = await admin.researches(101);
      
      expect(research.id).to.equal(101);
      expect(research.totalMilestones).to.equal(5);
      expect(research.budget).to.equal(budget);
      expect(research.exists).to.equal(true);
    });

    it("Should return default values for non-existent research", async function () {
      const research = await admin.researches(999);
      
      expect(research.id).to.equal(0);
      expect(research.totalMilestones).to.equal(0);
      expect(research.budget).to.equal(0);
      expect(research.exists).to.equal(false);
    });
  });
});