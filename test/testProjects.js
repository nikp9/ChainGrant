const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Project Contract", function () {
  let projectContract, validatorContract, adminContract, milestoneContract;
  let owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin;
  
  beforeEach(async function () {
    // Get signers
    [owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin] = await ethers.getSigners();
    
    const Admin = await ethers.getContractFactory("Admin");
    adminContract = await Admin.deploy();
    await adminContract.waitForDeployment();

    // Add admin
    await adminContract.addAdmin(admin.address);

    const Validator = await ethers.getContractFactory("Validator");
    validatorContract = await Validator.deploy(await adminContract.getAddress());
    await validatorContract.waitForDeployment();
    
    const Project = await ethers.getContractFactory("Project");
    projectContract = await Project.deploy(await validatorContract.getAddress(), await adminContract.getAddress());
    await projectContract.waitForDeployment();
    
    const Milestone = await ethers.getContractFactory("Milestone");
    milestoneContract = await Milestone.deploy(await projectContract.getAddress(), await validatorContract.getAddress());
    await milestoneContract.waitForDeployment();
    
    // Set milestone contract address
    await projectContract.setMilestoneContractAddress(await milestoneContract.getAddress());

    // Setup research areas
    await adminContract.addResearch(2, 3, 5000);
    await adminContract.addResearch(3, 5, 10000);
    
    // Setup validators for testing
    await validatorContract.connect(owner).addValidator(validator1.address, 2);
    await validatorContract.connect(owner).addValidator(validator2.address, 2);
    await validatorContract.connect(owner).addValidator(validator3.address, 2);
    await validatorContract.connect(owner).addValidator(validator4.address, 2);
    await validatorContract.connect(owner).addValidator(validator5.address, 2);
    
    // Verify validators
    
    await validatorContract.connect(owner).updateValidatorStatus(validator1.address);
    await validatorContract.connect(owner).updateValidatorStatus(validator2.address);
    await validatorContract.connect(owner).updateValidatorStatus(validator3.address);
    await validatorContract.connect(owner).updateValidatorStatus(validator4.address);
    await validatorContract.connect(owner).updateValidatorStatus(validator5.address);
  });

  describe("Deployment", function() {
    it("Should set right addresses for contract interfaces", async function() {
      expect(await projectContract.validatorContract()).to.equal(await validatorContract.getAddress());
      expect(await projectContract.adminContract()).to.equal(await adminContract.getAddress());
      expect(await projectContract.milestoneContractAddress()).to.equal(await milestoneContract.getAddress());
      expect(await projectContract.owner()).to.equal(owner.address);
    });
    
    it("Should only allow owner to set milestone contract address", async function() {
      await expect(
        projectContract.connect(nonValidator).setMilestoneContractAddress(ethers.ZeroAddress)
      ).to.be.revertedWith("Only owner can set milestone contract address");
      
      await expect(
        projectContract.connect(owner).setMilestoneContractAddress(ethers.ZeroAddress)
      ).not.to.be.reverted;
    });
  });

  describe("Project Creation", function() {
    it("Should create a project with correct details", async function() {
      await projectContract.addProjectDetails(1, 1000, 2);
      
      const projectDetails = await projectContract.idToProjectDetails(1);
      expect(projectDetails.status).to.equal(1);
      expect(projectDetails.budgetEstimate).to.equal(1000);
      expect(projectDetails.researchArea).to.equal(2);
      expect(projectDetails.score).to.equal(0);
      expect(projectDetails.milestone).to.equal(3); // Based on research area 2 having 3 milestones
      expect(projectDetails.totalValidations).to.equal(0);
      expect(projectDetails.fundsReceived).to.equal(0);
      expect(projectDetails.additionalFundsReceived).to.equal(0);
    });
    
    it("Should set correct milestone count based on research area", async function() {
      await projectContract.addProjectDetails(1, 1000, 2); // Research area 2 has 3 milestones
      await projectContract.addProjectDetails(2, 2000, 3); // Research area 3 has 5 milestones
      
      const project1 = await projectContract.idToProjectDetails(1);
      const project2 = await projectContract.idToProjectDetails(2);
      
      expect(project1.milestone).to.equal(3);
      expect(project2.milestone).to.equal(5);
    });
  });
  
  describe("Score Calculation", function() {
    it("Should calculate score correctly from binary choices", async function() {
      // Add project
      await projectContract.addProjectDetails(1, 1000, 2);
      
      // Update score with a set of binary choices "101010" (3 ones = score of 3)
      await projectContract.connect(validator1).updateScore(1, validator1.address, "101010");
      
      const projectDetails = await projectContract.idToProjectDetails(1);
      expect(projectDetails.score).to.equal(3);
      expect(projectDetails.totalValidations).to.equal(1);
    });
    
    it("Should add validator to validatorScores array", async function() {
      await projectContract.addProjectDetails(1, 1000, 2);
      await projectContract.connect(validator1).updateScore(1, validator1.address, "111");
      
      const validatorScores = await projectContract.viewScores(1);
      expect(validatorScores[0].validatorId).to.equal(validator1.address);
      expect(validatorScores[0].choices).to.equal("111");
    });
    
    it("Should prevent a validator from scoring the same project twice", async function() {
      await projectContract.addProjectDetails(1, 1000, 2);
      await projectContract.connect(validator1).updateScore(1, validator1.address, "111");
      
      await expect(
        projectContract.connect(validator1).updateScore(1, validator1.address, "000")
      ).to.be.revertedWith("The validator has already scored this project");
    });
    
    it("Should reject scores from validators with wrong research area", async function() {
      // Add a validator for research area 3
      await validatorContract.connect(owner).addValidator(nonValidator.address, 3);
      await validatorContract.connect(owner).updateValidatorStatus(nonValidator.address);
      
      await projectContract.addProjectDetails(1, 1000, 2); // Project is research area 2
      
      await expect(
        projectContract.connect(nonValidator).updateScore(1, nonValidator.address, "111")
      ).to.be.revertedWith("Validator not verified");
    });
    
    it("Should reject scores from unverified validators", async function() {
      // Add unverified validator
      await validatorContract.connect(owner).addValidator(nonValidator.address, 2);
      // Not verifying the validator
      
      await projectContract.addProjectDetails(1, 1000, 2);
      
      await expect(
        projectContract.connect(nonValidator).updateScore(1, nonValidator.address, "111")
      ).to.be.revertedWith("Validator not verified");
    });
    
    it("Should update status to 2 after 5 validations", async function() {
      await projectContract.addProjectDetails(1, 1000, 2);
      
      await projectContract.connect(validator1).updateScore(1, validator1.address, "11");
      await projectContract.connect(validator2).updateScore(1, validator2.address, "10");
      await projectContract.connect(validator3).updateScore(1, validator3.address, "11");
      await projectContract.connect(validator4).updateScore(1, validator4.address, "10");
      
      let projectDetails = await projectContract.idToProjectDetails(1);
      expect(projectDetails.status).to.equal(1); // Still in status 1
      
      await projectContract.connect(validator5).updateScore(1, validator5.address, "11");
      
      projectDetails = await projectContract.idToProjectDetails(1);
      expect(projectDetails.status).to.equal(2); // Updated to status 2
      expect(projectDetails.totalValidations).to.equal(5);
    });
    
    it("Should add project to researchAreaToProjectIds after 5 validations", async function() {
      await projectContract.addProjectDetails(1, 1000, 2);
      
      // Add 5 validations
      await projectContract.connect(validator1).updateScore(1, validator1.address, "11");
      await projectContract.connect(validator2).updateScore(1, validator2.address, "10");
      await projectContract.connect(validator3).updateScore(1, validator3.address, "11");
      await projectContract.connect(validator4).updateScore(1, validator4.address, "10");
      await projectContract.connect(validator5).updateScore(1, validator5.address, "11");
      
      const projectIds = await projectContract.researchAreaToProjectIds(2, 0);
      expect(projectIds).to.equal(1); // First project in research area 2
    });
  });
  
  describe("Project Funding Selection", function() {
    beforeEach(async function() {
      // Create projects with different scores
      await projectContract.addProjectDetails(1, 2000, 2); // Budget 2000
      await projectContract.addProjectDetails(2, 1500, 2); // Budget 1500
      await projectContract.addProjectDetails(3, 1000, 2); // Budget 1000
      
      // Add validations to first project (highest score: 7)
      await projectContract.connect(validator1).updateScore(1, validator1.address, "111");
      await projectContract.connect(validator2).updateScore(1, validator2.address, "110");
      await projectContract.connect(validator3).updateScore(1, validator3.address, "101");
      await projectContract.connect(validator4).updateScore(1, validator4.address, "100");
      await projectContract.connect(validator5).updateScore(1, validator5.address, "001");
      
      // Add validations to second project (medium score: 5)
      await projectContract.connect(validator1).updateScore(2, validator1.address, "110");
      await projectContract.connect(validator2).updateScore(2, validator2.address, "100");
      await projectContract.connect(validator3).updateScore(2, validator3.address, "010");
      await projectContract.connect(validator4).updateScore(2, validator4.address, "001");
      await projectContract.connect(validator5).updateScore(2, validator5.address, "000");
      
      // Add validations to third project (lowest score: 3)
      await projectContract.connect(validator1).updateScore(3, validator1.address, "100");
      await projectContract.connect(validator2).updateScore(3, validator2.address, "010");
      await projectContract.connect(validator3).updateScore(3, validator3.address, "001");
      await projectContract.connect(validator4).updateScore(3, validator4.address, "000");
      await projectContract.connect(validator5).updateScore(3, validator5.address, "000");
    });
    
    it("Should only allow owner or admin to select projects for funding", async function() {
      await expect(
        projectContract.connect(nonValidator).selectProjectsForFunding(2)
      ).to.be.revertedWith("Not authorized");
      
      // Should work for owner
      await expect(
        projectContract.connect(owner).selectProjectsForFunding(2)
      ).not.to.be.reverted;
      
      // Should work for admin
      await expect(
        projectContract.connect(admin).selectProjectsForFunding(2)
      ).not.to.be.reverted;
    });
    
    it("Should select projects based on score and budget constraints", async function() {
      // Research area 2 has budget 5000
      // Projects 1 (2000), 2 (1500), and 3 (1000) total to 4500
      await projectContract.connect(owner).selectProjectsForFunding(2);
      
      const project1 = await projectContract.idToProjectDetails(1);
      const project2 = await projectContract.idToProjectDetails(2);
      const project3 = await projectContract.idToProjectDetails(3);
      
      // All projects should be selected as they fit within budget
      expect(project1.status).to.equal(3);
      expect(project2.status).to.equal(3);
      expect(project3.status).to.equal(3);
    });
    
    it("Should select projects in order of score until budget runs out", async function() {
      // Create a new project with high budget that will exceed the limit
      await projectContract.addProjectDetails(4, 2000, 2); // Total now: 6500 > budget 5000
      
      // Add validations to fourth project (lowest score: 2)
      await projectContract.connect(validator1).updateScore(4, validator1.address, "10");
      await projectContract.connect(validator2).updateScore(4, validator2.address, "00");
      await projectContract.connect(validator3).updateScore(4, validator3.address, "00");
      await projectContract.connect(validator4).updateScore(4, validator4.address, "00");
      await projectContract.connect(validator5).updateScore(4, validator5.address, "00");
      
      await projectContract.connect(owner).selectProjectsForFunding(2);
      
      const project1 = await projectContract.idToProjectDetails(1);
      const project2 = await projectContract.idToProjectDetails(2);
      const project3 = await projectContract.idToProjectDetails(3);
      const project4 = await projectContract.idToProjectDetails(4);
      
      // Project 1, 2, 3 should be selected (highest scores, within budget)
      expect(project1.status).to.equal(3);
      expect(project2.status).to.equal(3);
      expect(project3.status).to.equal(3);
      
      // Project 4 should not be selected (lowest score, exceeds budget)
      expect(project4.status).to.equal(2);
    });
    
    it("Should create milestoneTracker entries for selected projects", async function() {
      await projectContract.connect(owner).selectProjectsForFunding(2);
      
      // Check if milestone entries were created (would need to get this from milestone contract)
      // This assumes the milestone contract has a projectExists function to check
      const project1Exists = await milestoneContract.projectExists(1);
      const project2Exists = await milestoneContract.projectExists(2);
      const project3Exists = await milestoneContract.projectExists(3);
      
      expect(project1Exists).to.be.true;
      expect(project2Exists).to.be.true;
      expect(project3Exists).to.be.true;
    });
  });
  
  describe("Funds Management", function() {
    beforeEach(async function() {
      await projectContract.addProjectDetails(1, 1000, 2);
    });
    
    it("Should only allow milestone contract to update funds received", async function() {
      await expect(
        projectContract.connect(owner).updateFundsReceived(1, 500)
      ).to.be.revertedWith("Only MilestoneTracker can update funds");
      
      // Mock a call from milestone contract by mocking the milestone address temporarily
      await projectContract.setMilestoneContractAddress(owner.address);
      await projectContract.connect(owner).updateFundsReceived(1, 500);
      
      const projectDetails = await projectContract.idToProjectDetails(1);
      expect(projectDetails.fundsReceived).to.equal(500);
      
      // Reset milestone contract address
      await projectContract.setMilestoneContractAddress(await milestoneContract.getAddress());
    });
  });
  
  describe("View Functions", function() {
    it("Should return validator scores for existing projects", async function() {
      await projectContract.addProjectDetails(1, 1000, 2);
      await projectContract.connect(validator1).updateScore(1, validator1.address, "111");
      
      const validatorScores = await projectContract.viewScores(1);
      expect(validatorScores[0].validatorId).to.equal(validator1.address);
      expect(validatorScores[0].choices).to.equal("111");
    });
    
    it("Should revert when trying to view scores of non-existent project", async function() {
      await expect(projectContract.viewScores(999)).to.be.revertedWith("Project does not exist");
    });
  });
});