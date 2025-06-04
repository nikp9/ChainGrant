const { expect } = require("chai");
const { ethers } = require("hardhat");

// Storage for performance metrics
const performanceMetrics = new Map();

async function measureCall(contractCall, functionName) {
  // Check if we already measured this function (without parameters)
  const baseFunctionName = functionName.split('(')[0];
  if (performanceMetrics.has(baseFunctionName)) {
    const result = await contractCall;
    // Only call .wait() if it's a transaction with that method available
    if (result.wait && typeof result.wait === 'function') {
      await result.wait();
    }
    return result;
  }
  
  const startTime = Date.now();
  const result = await contractCall;
  const endTime = Date.now();
  
  // Handle transaction waits for non-view functions
  if (result.wait && typeof result.wait === 'function') {
    await result.wait();
  }
  
  performanceMetrics.set(baseFunctionName, {
    function: baseFunctionName,
    timeMs: endTime - startTime,
    sampleCall: functionName // Store one sample call for reference
  });
  
  return result;
}

after(function() {
  console.log("\nPerformance Metrics Summary:");
  console.table(Array.from(performanceMetrics.values()));
});

describe("Admin Contract View Functions - Sepolia", function () {
  let admin;
  let owner, addr1, addr2;
  const budget = 100;

  before(async function () {
    this.timeout(120000);
    // Get signers from Hardhat
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract properly
    const Admin = await ethers.getContractFactory("Admin");
    admin = await Admin.deploy();
    admin = await measureCall(admin.waitForDeployment(), "Admin.deploy()");
    
    console.log(`Admin contract deployed to ${await admin.getAddress()}`);

    // Prepare test data with transaction waits
    await measureCall(admin.addResearch(101, 5, 1, budget), "addResearch");
    const tx2 = await admin.addResearch(102, 3, 1, budget);
    await tx2.wait();
    const tx3 = await admin.addResearch(103, 7, 1, budget);
    await tx3.wait();
  });

  describe("getResearchMilestones View Function", function () {
      it("Should return correct milestones", async function () {
        const milestones = await measureCall(
          admin.getResearchMilestones(101),
          "getResearchMilestones"
        );
        expect(milestones).to.equal(5);
        
        // These won't be measured again
        expect(await admin.getResearchMilestones(102)).to.equal(3);
        expect(await admin.getResearchMilestones(103)).to.equal(7);
      });
  
      it("Should revert for non-existent research", async function () {
        await expect(admin.getResearchMilestones(999))
          .to.be.revertedWith("Research ID does not exist");
      });
    });
  
    describe("getAllResearchIds View Function", function () {
      it("Should return research IDs", async function () {
        const researchIds = await measureCall(
          admin.getAllResearchIds(),
          "getAllResearchIds"
        );
        expect(researchIds).to.deep.equal([101, 102, 103]);
      });
    });
  
    describe("getResearchCount View Function", function () {
      it("Should return correct count", async function () {
        const count = await measureCall(
          admin.getResearchCount(),
          "getResearchCount"
        );
        expect(count).to.equal(3);
      });
    });
  
    describe("isAdmin View Function", function () {
      it("Should handle admin checks", async function () {
        const isOwnerAdmin = await measureCall(
          admin.isAdmin(owner.address),
          "isAdmin"
        );
        expect(isOwnerAdmin).to.equal(true);
        
        // // Add and verify new admin without measuring again
        // const txn = await admin.addAdmin(addr1.address);
        // await txn.wait();
        // expect(await admin.isAdmin(addr1.address)).to.equal(true);
      });
    });
  
    describe("Researches Mapping View", function () {
      it("Should show research details", async function () {
        let research = await measureCall(
          admin.researches(101),
          "researches"
        );
        expect(research.exists).to.equal(true);
        research = await admin.researches(999);
        expect(research.id).to.equal(0);
        expect(research.totalMilestones).to.equal(0);
        expect(research.budget).to.equal(0);
        expect(research.exists).to.equal(false);
      });
    });
  });