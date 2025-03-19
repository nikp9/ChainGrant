const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Projects Contract", function () {
  let projects;
  let validatorContract, adminContract, milestoneContract;
  let owner, validator1, validator2, validator3, nonValidator;
  
  beforeEach(async function () {
    // Get signers
    [owner, validator1, validator2, validator3, nonValidator] = await ethers.getSigners();
    
    const Admin = await ethers.getContractFactory("Admin");
    adminContract = await Admin.deploy();
    await adminContract.waitForDeployment();

    const Validator = await ethers.getContractFactory("Validator");
    validatorContract = await Validator.deploy(await adminContract.getAddress());
    await validatorContract.waitForDeployment();
    
    const Projects = await ethers.getContractFactory("Projects");
    projects = await Projects.deploy(await validatorContract.getAddress(), await adminContract.getAddress());
    await projects.waitForDeployment();
    
    const Milestone = await ethers.getContractFactory("MilestoneTracker");
    milestoneContract = await Milestone.deploy(await projects.getAddress(), await validatorContract.getAddress());
    await milestoneContract.waitForDeployment();
    
    // Set milestone contract address
    await projects.setMilestoneContractAddress(await milestoneContract.getAddress());

    // Setup research areas
    await adminContract.addResearch(2, 3, 5000);
    await adminContract.addResearch(3, 5, 10000);
    
    // Setup validators for testing
    await validatorContract.addValidator(1, 2);
    await validatorContract.addValidator(2, 2);
    await validatorContract.addValidator(3, 2);

  });

  describe("Project Creation", function() {
    it("Should create a project with correct details", async function() {
      await projects.addProjectDetails(1, 1000, 2); // Is 101 the correct research area?
      
      const projectDetails = await projects.idToProjectDetails(1);
      expect(projectDetails.status).to.equal(1);
      expect(projectDetails.budgetEstimate).to.equal(1000);
      expect(projectDetails.researchArea).to.equal(3);
    });
  });
});