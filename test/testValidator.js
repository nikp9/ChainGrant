const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Validator Contract", function () {
  let adminContract;
  let validatorContract;
  let owner, validator1, validator2, admin1, admin2, admin3;

  beforeEach(async function () {
    [owner, validator1, validator2, admin1, admin2, admin3] = await ethers.getSigners();

    // Deploy Admin contract
    const Admin = await ethers.getContractFactory("Admin");
    adminContract = await Admin.deploy();
    await adminContract.waitForDeployment();

    // Add admins (corrected to use .address)
    await adminContract.connect(owner).addAdmin(admin1.address);
    await adminContract.connect(owner).addAdmin(admin2.address);
    await adminContract.connect(owner).addAdmin(admin3.address);

    // Deploy Validator contract
    const Validator = await ethers.getContractFactory("Validator");
    validatorContract = await Validator.deploy(await adminContract.getAddress());
    await validatorContract.waitForDeployment();

    // Add research area
    await adminContract.addResearch(1, 5, 1, 100);
  });

  describe("Validator Registration", function () {
    it("Should allow new validator registration", async function () {
      await validatorContract.connect(validator1).addValidator(1);
      const v = await validatorContract.validators(validator1.address);
      
      expect(v.validatorId).to.equal(validator1.address);
      expect(v.researchArea).to.equal(1);
      expect(v.verificationStatus).to.equal(0);
    });

    it("Should prevent duplicate registration", async function () {
      await validatorContract.connect(validator1).addValidator(1);
      await expect(
        validatorContract.connect(validator1).addValidator(1)
      ).to.be.revertedWith("Only add a new validator");
    });
  });

  describe("Validator Verification", function () {
    beforeEach(async function () {
      await validatorContract.connect(validator1).addValidator(1);
      await validatorContract.connect(validator2).addValidator(1);
    });

    it("Should verify validator with admin votes", async function () {
      // Admin1 approves
      await validatorContract.connect(admin1).updateValidatorStatus(validator1.address, 1);
      // Admin2 approves
      await validatorContract.connect(admin2).updateValidatorStatus(validator1.address, 1);
      // Admin3 approves
      await validatorContract.connect(admin3).updateValidatorStatus(validator1.address, 1);

      const v = await validatorContract.validators(validator1.address);
      expect(v.verificationStatus).to.equal(1);
      expect(v.positiveVotes).to.equal(3);
    });

    it("Should reject non-admin verification attempts", async function () {
      await expect(
        validatorContract.connect(validator1).updateValidatorStatus(validator2.address, 1)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should handle vote changes correctly", async function () {
      await validatorContract.connect(admin1).updateValidatorStatus(validator1.address, 1);
      await validatorContract.connect(admin1).updateValidatorStatus(validator1.address, 0);

      const v = await validatorContract.validators(validator1.address);
      expect(v.positiveVotes).to.equal(0);
    });
  });

});