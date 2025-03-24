const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Project Contract", function () {
  let projectContract, validatorContract, adminContract, milestoneContract;
  let owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3, project4;
  
  beforeEach(async function () {
    // Get signers
    [owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3, project4] = await ethers.getSigners();
    
    const Admin = await ethers.getContractFactory("Admin");
    adminContract = await Admin.deploy();
    await adminContract.waitForDeployment();

    // Add admins
    await adminContract.connect(owner).addAdmin(admin1);
    await adminContract.connect(owner).addAdmin(admin2);
    await adminContract.connect(owner).addAdmin(admin3);

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
    await adminContract.addResearch(2, 3, 1, 5000);
    // await adminContract.addResearch(3, 5, 10000);
    
    // Setup validators for testing
    await validatorContract.connect(validator1).addValidator(2);
    await validatorContract.connect(validator2).addValidator(2);
    await validatorContract.connect(validator3).addValidator(2);
    await validatorContract.connect(validator4).addValidator(2);
    await validatorContract.connect(validator5).addValidator(2);
    
    // Verify validators
    
    await validatorContract.connect(owner).updateValidatorStatus(validator1.address, 1);
    await validatorContract.connect(owner).updateValidatorStatus(validator2.address, 1);
    await validatorContract.connect(owner).updateValidatorStatus(validator3.address, 1);
    await validatorContract.connect(owner).updateValidatorStatus(validator4.address, 1);
    await validatorContract.connect(owner).updateValidatorStatus(validator5.address, 1);

    await validatorContract.connect(admin2).updateValidatorStatus(validator1.address, 1);
    await validatorContract.connect(admin2).updateValidatorStatus(validator2.address, 1);
    await validatorContract.connect(admin2).updateValidatorStatus(validator3.address, 1);
    await validatorContract.connect(admin2).updateValidatorStatus(validator4.address, 1);
    await validatorContract.connect(admin2).updateValidatorStatus(validator5.address, 1);

    await validatorContract.connect(admin3).updateValidatorStatus(validator1.address, 1);
    await validatorContract.connect(admin3).updateValidatorStatus(validator2.address, 1);
    await validatorContract.connect(admin3).updateValidatorStatus(validator3.address, 1);
    await validatorContract.connect(admin3).updateValidatorStatus(validator4.address, 1);
    await validatorContract.connect(admin3).updateValidatorStatus(validator5.address, 1);

    // Add project
    await projectContract.connect(project1).addProjectDetails(2000, 2);
    await projectContract.connect(project2).addProjectDetails(2400, 2);
    await projectContract.connect(project3).addProjectDetails(1900, 2);
    await projectContract.connect(project4).addProjectDetails(2200, 2); // Unverified

    // Verify project
    await projectContract.connect(validator1).updateScore(project1.address, "10110");
    await projectContract.connect(validator2).updateScore(project1.address, "11110");
    await projectContract.connect(validator3).updateScore(project1.address, "10110");
    await projectContract.connect(validator4).updateScore(project1.address, "10111");
    await projectContract.connect(validator5).updateScore(project1.address, "11111");

    await projectContract.connect(validator1).updateScore(project2.address, "10110");
    await projectContract.connect(validator2).updateScore(project2.address, "11100");
    await projectContract.connect(validator3).updateScore(project2.address, "10100");
    await projectContract.connect(validator4).updateScore(project2.address, "10111");
    await projectContract.connect(validator5).updateScore(project2.address, "11101");

    await projectContract.connect(validator1).updateScore(project3.address, "10110");
    await projectContract.connect(validator2).updateScore(project3.address, "11110");
    await projectContract.connect(validator3).updateScore(project3.address, "10110");
    await projectContract.connect(validator4).updateScore(project3.address, "10101");
    await projectContract.connect(validator5).updateScore(project3.address, "11101");

    projectContract.connect(validator1).updateScore(project4.address, "11111");

    // Select projects for funding
    await projectContract.connect(admin1).selectProjectsForFunding(2); // Research area 2
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
      // await projectContract.connect(project1).addProjectDetails(2000, 2);
      // await projectContract.connect(project2).addProjectDetails(2400, 2);
      // await projectContract.connect(project3).addProjectDetails(1900, 2);
      // Above projects are already added and validated

      const projectDetails = await projectContract.projectOwnerToProjectDetails(project1.address);
      expect(projectDetails.status).to.equal(3);
      expect(projectDetails.budgetEstimate).to.equal(2000);
      expect(projectDetails.researchArea).to.equal(2);
      expect(projectDetails.score).to.equal(19);
      expect(projectDetails.milestone).to.equal(3); // Based on research area 2 having 3 milestones
      expect(projectDetails.totalValidations).to.equal(5);
      expect(projectDetails.fundsReceived).to.equal(0);
      expect(projectDetails.additionalFundsReceived).to.equal(0);
    });
  });
  
  describe("Score Calculation", function() {
    it("Should calculate score correctly from binary choices", async function() {
      // Project1 already exists and has been scored
      const projectDetails = await projectContract.projectOwnerToProjectDetails(project1.address);
      
      // Verify that the score is calculated correctly based on validator inputs
      expect(projectDetails.score).to.equal(19); // Based on sum of ones in "10110", "11110", "10110", "10111", "11111"
      expect(projectDetails.totalValidations).to.equal(5);
    });
    
    it("Should prevent a validator from scoring the same project twice", async function() {
      // Try to score project1 again with validator1
      await expect(
        projectContract.connect(validator1).updateScore(project4.address, "11111")
      ).to.be.revertedWith("The validator has already scored this project");
    });
    
    it("Should reject scores from unverified validators", async function() {
      // Add a new project
      await projectContract.connect(project4).addProjectDetails(2200, 2);
      
      // Try to score with non-validator
      await expect(
        projectContract.connect(nonValidator).updateScore(project4.address, "11111")
      ).to.be.revertedWith("Validator not verified");
    });
    
    it("Should update status to 2 after 5 validations", async function() {
      // Project should be in status 1 initially
      let projectDetails = await projectContract.projectOwnerToProjectDetails(project4.address);
      expect(projectDetails.status).to.equal(1);
      
      // Add 4 validations (1 already added)
      await projectContract.connect(validator2).updateScore(project4.address, "10100");
      await projectContract.connect(validator3).updateScore(project4.address, "10010");
      await projectContract.connect(validator4).updateScore(project4.address, "10001");
      await projectContract.connect(validator5).updateScore(project4.address, "11111");
      
      // Check if status updated to 2
      projectDetails = await projectContract.projectOwnerToProjectDetails(project4.address);
      expect(projectDetails.status).to.equal(2); // Updated to status 2
      expect(projectDetails.totalValidations).to.equal(5);
    });
  });
  
  describe("Project Funding Selection", function() {
    it("Should only allow owner or admin to select projects for funding", async function() {
      await expect(
        projectContract.connect(nonValidator).selectProjectsForFunding(2)
      ).to.be.revertedWith("Not authorized");
      
      // Should work for admin
      await expect(
        projectContract.connect(admin1).selectProjectsForFunding(2)
      ).not.to.be.reverted;
    });
    
    it("Should select projects based on score and budget constraints", async function() {
      // projects 1, 2, 3 have already been selected for funding in beforeEach
      
      // Verify their status is 3 (selected for funding)
      const project1Details = await projectContract.projectOwnerToProjectDetails(project1.address);
      const project2Details = await projectContract.projectOwnerToProjectDetails(project2.address);
      const project3Details = await projectContract.projectOwnerToProjectDetails(project3.address);
      
      expect(project1Details.status).to.equal(3);
      expect(project2Details.status).to.equal(2);
      expect(project3Details.status).to.equal(3);
    });
    
    it("Should select projects in order of score until budget runs out", async function() {
      // Add a new project with high budget that will exceed the limit
      const project4 = await ethers.Wallet.createRandom().connect(ethers.provider);
      
      // Fund the wallet to pay for gas
      await owner.sendTransaction({
        to: project4.address,
        value: ethers.parseEther("1.0")
      });
      
      await projectContract.connect(project4).addProjectDetails(1200, 2); // Total now: 7500 > budget 5000
      
      // Add validations with low score
      await projectContract.connect(validator1).updateScore(project4.address, "10000");
      await projectContract.connect(validator2).updateScore(project4.address, "01000");
      await projectContract.connect(validator3).updateScore(project4.address, "00100");
      await projectContract.connect(validator4).updateScore(project4.address, "00010");
      await projectContract.connect(validator5).updateScore(project4.address, "00001");
      
      // Reset research area and select projects again
      // This is a bit of a hack for testing - in a real scenario you'd probably
      // have functionality to reset or change selections
      await adminContract.resetResearchArea(2);
      await adminContract.addResearch(2, 3, 1, 5000);
      
      await projectContract.connect(admin1).selectProjectsForFunding(2);
      
      // Projects 1, 2, 3 should be selected as they have higher scores
      const project1Details = await projectContract.projectOwnerToProjectDetails(project1.address);
      const project2Details = await projectContract.projectOwnerToProjectDetails(project2.address);
      const project3Details = await projectContract.projectOwnerToProjectDetails(project3.address);
      const project4Details = await projectContract.projectOwnerToProjectDetails(project4.address);
      
      expect(project1Details.status).to.equal(3);
      expect(project2Details.status).to.equal(3);
      expect(project3Details.status).to.equal(3);
      
      // Project 4 should not be selected (lowest score and would exceed budget)
      expect(project4Details.status).to.equal(2);
    });
    
    it("Should create milestone tracker entries for selected projects", async function() {
      // Check if milestone entries were created for the projects selected in beforeEach
      const project1Exists = await milestoneContract.projectExists(project1.address);
      const project2Exists = await milestoneContract.projectExists(project2.address);
      const project3Exists = await milestoneContract.projectExists(project3.address);
      
      expect(project1Exists).to.be.true;
      expect(project2Exists).to.be.true;
      expect(project3Exists).to.be.true;
    });
  });
  
  describe("Funds Management", function() {
    it("Should only allow milestone contract to update funds received", async function() {
      await expect(
        projectContract.connect(owner).updateFundsReceived(project1.address, 500)
      ).to.be.revertedWith("Only MilestoneTracker can update funds");
      
      // Mock a call from milestone contract by temporarily changing the address
      await projectContract.connect(owner).setMilestoneContractAddress(owner.address);
      await projectContract.connect(owner).updateFundsReceived(project1.address, 500);
      
      const projectDetails = await projectContract.projectOwnerToProjectDetails(project1.address);
      expect(projectDetails.fundsReceived).to.equal(500);
      
      // Reset milestone contract address
      await projectContract.connect(owner).setMilestoneContractAddress(await milestoneContract.getAddress());
    });
    
    it("Should correctly update additional funds received", async function() {
      // Mock a call from milestone contract
      await projectContract.connect(owner).setMilestoneContractAddress(owner.address);
      await projectContract.connect(owner).updateAdditionalFundsReceived(project1.address, 300);
      
      const projectDetails = await projectContract.projectOwnerToProjectDetails(project1.address);
      expect(projectDetails.additionalFundsReceived).to.equal(300);
      
      // Reset milestone contract address
      await projectContract.connect(owner).setMilestoneContractAddress(await milestoneContract.getAddress());
    });
  });
  
  describe("View Functions", function() {
    it("Should return validator scores for existing projects", async function() {
      const validatorScores = await projectContract.viewScores(project1.address);
      
      // Check if all validators and their scores are present
      expect(validatorScores.length).to.equal(5);
      
      // Check individual validator scores
      const validator1Score = validatorScores.find(v => v.validatorId === validator1.address);
      expect(validator1Score.choices).to.equal("10110");
      
      const validator5Score = validatorScores.find(v => v.validatorId === validator5.address);
      expect(validator5Score.choices).to.equal("11111");
    });
    
    it("Should return project details for a project owner", async function() {
      const projectDetails = await projectContract.projectOwnerToProjectDetails(project1.address);
      
      expect(projectDetails.status).to.equal(3);
      expect(projectDetails.budgetEstimate).to.equal(2000);
      expect(projectDetails.researchArea).to.equal(2);
    });
    
    it("Should return projects by research area", async function() {
      const projects = await projectContract.getProjectsByResearchArea(2);
      
      // Should have at least 3 projects
      expect(projects.length).to.be.at.least(3);
      
      // Should include our test projects
      expect(projects).to.include(project1.address);
      expect(projects).to.include(project2.address);
      expect(projects).to.include(project3.address);
    });
    
    it("Should revert when trying to view scores of non-existent project", async function() {
      const nonExistentAddress = ethers.Wallet.createRandom().address;
      await expect(projectContract.viewScores(nonExistentAddress))
        .to.be.revertedWith("Project does not exist");
    });
  });
});