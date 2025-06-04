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

describe("Validator Contract", function () {
  let adminContract;
  let validatorContract;
  let owner, validator1, validator2, admin1, admin2, admin3;

  beforeEach(async function () {
    [owner, validator1, validator2, admin1, admin2, admin3] = await ethers.getSigners();

    // Deploy Admin contract
    const Admin = await ethers.getContractFactory("Admin");
    adminContract = await Admin.deploy();
    adminContract = await measureCall(adminContract.waitForDeployment(), "Admin.deploy()");

    // Add admins (corrected to use .address)
    await measureCall(adminContract.connect(owner).addAdmin(admin1.address), "addAdmin");
    await measureCall(adminContract.connect(owner).addAdmin(admin2.address), "addAdmin");
    await measureCall(adminContract.connect(owner).addAdmin(admin3.address), "addAdmin");

    // Deploy Validator contract
    const Validator = await ethers.getContractFactory("Validator");
    validatorContract = await Validator.deploy(await adminContract.getAddress());
    validatorContract = await measureCall(validatorContract.waitForDeployment(), "Validator.deploy()");

    // Add research area
    await measureCall(adminContract.addResearch(1, 5, 1, 100), "addResearch");
  });

  describe("Validator Registration", function () {
    it("Should allow new validator registration", async function () {
      const tx = await measureCall(
        validatorContract.connect(validator1).addValidator(1),
        "addValidator"
      );
      const v = await measureCall(
        validatorContract.validators(validator1.address),
        "validators"
      );
      
      expect(v.validatorId).to.equal(validator1.address);
      expect(v.researchArea).to.equal(1);
      expect(v.verificationStatus).to.equal(0);
    });

    it("Should prevent duplicate registration", async function () {
      await measureCall(validatorContract.connect(validator1).addValidator(1), "addValidator");
      await expect(
        measureCall(validatorContract.connect(validator1).addValidator(1), "addValidator(duplicate)")
      ).to.be.revertedWith("Only add a new validator");
    });
  });

  describe("Validator Verification", function () {
    beforeEach(async function () {
      await measureCall(validatorContract.connect(validator1).addValidator(1), "addValidator");
      await measureCall(validatorContract.connect(validator2).addValidator(1), "addValidator");
    });

    it("Should verify validator with admin votes", async function () {
      // Admin1 approves
      await measureCall(
        validatorContract.connect(admin1).updateValidatorStatus(validator1.address, 1),
        "updateValidatorStatus(approve)"
      );
      // Admin2 approves
      await measureCall(
        validatorContract.connect(admin2).updateValidatorStatus(validator1.address, 1),
        "updateValidatorStatus(approve)"
      );
      // Admin3 approves
      await measureCall(
        validatorContract.connect(admin3).updateValidatorStatus(validator1.address, 1),
        "updateValidatorStatus(approve)"
      );

      const v = await measureCall(
        validatorContract.validators(validator1.address),
        "validators"
      );
      expect(v.verificationStatus).to.equal(1);
      expect(v.positiveVotes).to.equal(3);
    });

    it("Should reject non-admin verification attempts", async function () {
      await expect(
        measureCall(
          validatorContract.connect(validator1).updateValidatorStatus(validator2.address, 1),
          "updateValidatorStatus(non-admin)"
        )
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should handle vote changes correctly", async function () {
      await measureCall(
        validatorContract.connect(admin1).updateValidatorStatus(validator1.address, 1),
        "updateValidatorStatus(approve)"
      );
      await measureCall(
        validatorContract.connect(admin1).updateValidatorStatus(validator1.address, 0),
        "updateValidatorStatus(reject)"
      );

      const v = await measureCall(
        validatorContract.validators(validator1.address),
        "validators"
      );
      expect(v.positiveVotes).to.equal(0);
    });
  });

  describe("Validator Details", function () {
    beforeEach(async function () {
      await measureCall(validatorContract.connect(validator1).addValidator(1), "addValidator");
      await measureCall(validatorContract.connect(validator2).addValidator(1), "addValidator");
    });
    
    it("Should return verified validator details", async function () {
      // Verify validator first
      await measureCall(
        validatorContract.connect(admin1).updateValidatorStatus(validator1.address, 1),
        "updateValidatorStatus(approve)"
      );
      await measureCall(
        validatorContract.connect(admin2).updateValidatorStatus(validator1.address, 1),
        "updateValidatorStatus(approve)"
      );
      await measureCall(
        validatorContract.connect(admin3).updateValidatorStatus(validator1.address, 1),
        "updateValidatorStatus(approve)"
      );

      const details = await measureCall(
        validatorContract.getValidatorDetails(validator1.address),
        "getValidatorDetails"
      );
      expect(details[0]).to.equal(validator1.address);
      expect(details[1]).to.equal(1);
      expect(details[2]).to.equal(1);
    });

    it("Should reject unverified validators", async function () {
      await expect(
        measureCall(
          validatorContract.getValidatorDetails(validator1.address),
          "getValidatorDetails(unverified)"
        )
      ).to.be.revertedWith("Validator not verified");
    });
  });
});