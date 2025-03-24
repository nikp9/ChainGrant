const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Milestone Contract", function () {
  let projectContract, validatorContract, adminContract, milestoneContract;
  let owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3;
  
  beforeEach(async function () {
    // Get signers
    [owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3] = await ethers.getSigners();
    
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

  describe("Project Selection", function() {
    it("Should select project according the to algorithm", async function() {
        // Projects and their scores {Project1: 19, Project2: 16, Project3: 17}
        const project1Details = await projectContract.projectOwnerToProjectDetails(project1.address);
        const project2Details = await projectContract.projectOwnerToProjectDetails(project2.address);
        const project3Details = await projectContract.projectOwnerToProjectDetails(project3.address);
        expect(project1Details.status).to.equal(3);
        expect(project2Details.status).to.equal(2);
        expect(project3Details.status).to.equal(3);
    });

    it("Should set the completion status after the project is completed", async function() {
        let project1Milestone, project1Details, funds = [];
        await milestoneContract.connect(project1).requestMilestoneApproval();
        await milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1);

        project1Details = await projectContract.projectOwnerToProjectDetails(project1.address);
        funds.push(project1Details.fundsReceived);

        await milestoneContract.connect(project1).requestMilestoneApproval();
        await milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1);

        project1Milestone = await milestoneContract.projects(project1.address);
        expect(project1Milestone.currentMilestoneSubmissionStatus).to.equal(0); // All milestones completed

        project1Details = await projectContract.projectOwnerToProjectDetails(project1.address);
        expect(project1Details.fundsReceived).to.equal(1334);
        expect(project1Details.status).to.equal(3); // Project completed

        funds.push(project1Details.fundsReceived);

        await milestoneContract.connect(project1).requestMilestoneApproval();
        await milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1);

        project1Details = await projectContract.projectOwnerToProjectDetails(project1.address);
        funds.push(project1Details.fundsReceived);
        
        await milestoneContract.connect(project1).requestMilestoneApproval();
        await milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1);

        project1Milestone = await milestoneContract.projects(project1.address);
        expect(project1Milestone.currentMilestoneSubmissionStatus).to.equal(4); // All milestones completed

        project1Details = await projectContract.projectOwnerToProjectDetails(project1.address);
        expect(project1Details.fundsReceived).to.equal(2000);
        expect(project1Details.status).to.equal(4); // Project completed

        for (let i = 0; i<3; i++){
            console.log(`Milestone ${i+1}, Funds Received ${funds[i]}`)
        }
    });
  });

});