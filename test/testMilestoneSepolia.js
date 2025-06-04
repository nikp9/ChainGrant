const { expect } = require("chai");
const { ethers } = require("hardhat");

// Storage for performance metrics
const performanceMetrics = new Map();

async function measureCall(contractCall, functionName) {
  const baseFunctionName = functionName.split('(')[0];
  if (performanceMetrics.has(baseFunctionName)) {
    const result = await contractCall;
    if (result.wait) await result.wait();
    return result;
  }

  const startTime = Date.now();
  const result = await contractCall;
  const endTime = Date.now();
  
  if (result.wait) await result.wait();
  
  performanceMetrics.set(baseFunctionName, {
    function: baseFunctionName,
    timeMs: endTime - startTime,
    sampleCall: functionName
  });
  
  return result;
}

after(function() {
  console.log("\nPerformance Metrics Summary:");
  console.table(Array.from(performanceMetrics.values()));
});

describe("Milestone Contract", function () {
  let projectContract, validatorContract, adminContract, milestoneContract;
  let owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3;
  
  // Increase timeout for test network
  this.timeout(3600000); // 20 minutes

  beforeEach(async function () {
    // Get signers
    [owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3] = await ethers.getSigners();
    
    // Deploy contracts with measurement
    const Admin = await ethers.getContractFactory("Admin");
    adminContract = await measureCall(Admin.deploy(), "Admin.deploy()");
    await adminContract.waitForDeployment();

    // Add admins with measurement
    await measureCall(adminContract.connect(owner).addAdmin(admin1.address), "addAdmin");
    await measureCall(adminContract.connect(owner).addAdmin(admin2.address), "addAdmin");
    await measureCall(adminContract.connect(owner).addAdmin(admin3.address), "addAdmin");

    const Validator = await ethers.getContractFactory("Validator");
    validatorContract = await measureCall(
      Validator.deploy(await adminContract.getAddress()),
      "Validator.deploy()"
    );
    await validatorContract.waitForDeployment();
    
    const Project = await ethers.getContractFactory("Project");
    projectContract = await measureCall(
      Project.deploy(await validatorContract.getAddress(), await adminContract.getAddress()),
      "Project.deploy()"
    );
    await projectContract.waitForDeployment();
    
    const Milestone = await ethers.getContractFactory("Milestone");
    milestoneContract = await measureCall(
      Milestone.deploy(await projectContract.getAddress(), await validatorContract.getAddress()),
      "Milestone.deploy()"
    );
    await milestoneContract.waitForDeployment();
    
    // Set milestone contract address with measurement
    await measureCall(
      projectContract.setMilestoneContractAddress(await milestoneContract.getAddress()),
      "setMilestoneContractAddress"
    );

    // Setup research areas with measurement
    await measureCall(adminContract.addResearch(2, 3, 1, 5000), "addResearch");
    
    // Setup validators for testing with measurement
    await measureCall(validatorContract.connect(validator1).addValidator(2), "addValidator");
    await measureCall(validatorContract.connect(validator2).addValidator(2), "addValidator");
    await measureCall(validatorContract.connect(validator3).addValidator(2), "addValidator");
    await measureCall(validatorContract.connect(validator4).addValidator(2), "addValidator");
    await measureCall(validatorContract.connect(validator5).addValidator(2), "addValidator");
    
    // Verify validators with measurement
    await measureCall(validatorContract.connect(owner).updateValidatorStatus(validator1.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(owner).updateValidatorStatus(validator2.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(owner).updateValidatorStatus(validator3.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(owner).updateValidatorStatus(validator4.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(owner).updateValidatorStatus(validator5.address, 1), "updateValidatorStatus");

    await measureCall(validatorContract.connect(admin2).updateValidatorStatus(validator1.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin2).updateValidatorStatus(validator2.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin2).updateValidatorStatus(validator3.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin2).updateValidatorStatus(validator4.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin2).updateValidatorStatus(validator5.address, 1), "updateValidatorStatus");

    await measureCall(validatorContract.connect(admin3).updateValidatorStatus(validator1.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin3).updateValidatorStatus(validator2.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin3).updateValidatorStatus(validator3.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin3).updateValidatorStatus(validator4.address, 1), "updateValidatorStatus");
    await measureCall(validatorContract.connect(admin3).updateValidatorStatus(validator5.address, 1), "updateValidatorStatus");

    // Add project with measurement
    await measureCall(projectContract.connect(project1).addProjectDetails(2000, 2), "addProjectDetails");
    await measureCall(projectContract.connect(project2).addProjectDetails(2400, 2), "addProjectDetails");
    await measureCall(projectContract.connect(project3).addProjectDetails(1900, 2), "addProjectDetails");

    // Verify project with measurement
    await measureCall(projectContract.connect(validator1).updateScore(project1.address, "10110"), "updateScore");
    await measureCall(projectContract.connect(validator2).updateScore(project1.address, "11110"), "updateScore");
    await measureCall(projectContract.connect(validator3).updateScore(project1.address, "10110"), "updateScore");
    await measureCall(projectContract.connect(validator4).updateScore(project1.address, "10111"), "updateScore");
    await measureCall(projectContract.connect(validator5).updateScore(project1.address, "11111"), "updateScore");

    await measureCall(projectContract.connect(validator1).updateScore(project2.address, "10110"), "updateScore");
    await measureCall(projectContract.connect(validator2).updateScore(project2.address, "11100"), "updateScore");
    await measureCall(projectContract.connect(validator3).updateScore(project2.address, "10100"), "updateScore");
    await measureCall(projectContract.connect(validator4).updateScore(project2.address, "10111"), "updateScore");
    await measureCall(projectContract.connect(validator5).updateScore(project2.address, "11101"), "updateScore");

    await measureCall(projectContract.connect(validator1).updateScore(project3.address, "10110"), "updateScore");
    await measureCall(projectContract.connect(validator2).updateScore(project3.address, "11110"), "updateScore");
    await measureCall(projectContract.connect(validator3).updateScore(project3.address, "10110"), "updateScore");
    await measureCall(projectContract.connect(validator4).updateScore(project3.address, "10101"), "updateScore");
    await measureCall(projectContract.connect(validator5).updateScore(project3.address, "11101"), "updateScore");

    // Select projects for funding with measurement
    await measureCall(projectContract.connect(admin1).selectProjectsForFunding(2), "selectProjectsForFunding");
  });

  describe("Deployment", function() {
    it("Should set right addresses for contract interfaces", async function() {
      const validatorAddr = await measureCall(projectContract.validatorContract(), "validatorContract");
      const adminAddr = await measureCall(projectContract.adminContract(), "adminContract");
      const milestoneAddr = await measureCall(projectContract.milestoneContractAddress(), "milestoneContractAddress");
      const ownerAddr = await measureCall(projectContract.owner(), "owner");
      
      expect(validatorAddr).to.equal(await validatorContract.getAddress());
      expect(adminAddr).to.equal(await adminContract.getAddress());
      expect(milestoneAddr).to.equal(await milestoneContract.getAddress());
      expect(ownerAddr).to.equal(owner.address);
    });
    
    it("Should only allow owner to set milestone contract address", async function() {
      await expect(
        measureCall(
          projectContract.connect(nonValidator).setMilestoneContractAddress(ethers.ZeroAddress),
          "setMilestoneContractAddress(unauthorized)"
        )
      ).to.be.revertedWith("Only owner can set milestone contract address");
      
      await expect(
        measureCall(
          projectContract.connect(owner).setMilestoneContractAddress(ethers.ZeroAddress),
          "setMilestoneContractAddress(authorized)"
        )
      ).not.to.be.reverted;
    });
  });

  describe("Project Selection", function() {
    it("Should select project according the to algorithm", async function() {
      const project1Details = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      const project2Details = await measureCall(
        projectContract.projectOwnerToProjectDetails(project2.address),
        "projectOwnerToProjectDetails"
      );
      const project3Details = await measureCall(
        projectContract.projectOwnerToProjectDetails(project3.address),
        "projectOwnerToProjectDetails"
      );
      expect(project1Details.status).to.equal(3);
      expect(project2Details.status).to.equal(2);
      expect(project3Details.status).to.equal(3);
    });

    it("Should set the completion status after the project is completed", async function() {
      let project1Milestone, project1Details, funds = [];
      
      await measureCall(
        milestoneContract.connect(project1).requestMilestoneApproval(),
        "requestMilestoneApproval"
      );
      await measureCall(
        milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1),
        "updateMilestoneStatus"
      );

      project1Details = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      funds.push(project1Details.fundsReceived);

      await measureCall(
        milestoneContract.connect(project1).requestMilestoneApproval(),
        "requestMilestoneApproval"
      );
      await measureCall(
        milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1),
        "updateMilestoneStatus"
      );

      project1Milestone = await measureCall(
        milestoneContract.projects(project1.address),
        "milestoneContract.projects"
      );
      expect(project1Milestone.currentMilestoneSubmissionStatus).to.equal(0);

      project1Details = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      expect(project1Details.fundsReceived).to.equal(1334);
      expect(project1Details.status).to.equal(3);

      funds.push(project1Details.fundsReceived);

      await measureCall(
        milestoneContract.connect(project1).requestMilestoneApproval(),
        "requestMilestoneApproval"
      );
      await measureCall(
        milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1),
        "updateMilestoneStatus"
      );

      project1Details = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      funds.push(project1Details.fundsReceived);
      
      await measureCall(
        milestoneContract.connect(project1).requestMilestoneApproval(),
        "requestMilestoneApproval"
      );
      await measureCall(
        milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1),
        "updateMilestoneStatus"
      );

      project1Milestone = await measureCall(
        milestoneContract.projects(project1.address),
        "milestoneContract.projects"
      );
      expect(project1Milestone.currentMilestoneSubmissionStatus).to.equal(4);

      project1Details = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      expect(project1Details.fundsReceived).to.equal(2000);
      expect(project1Details.status).to.equal(4);
    });
  });

  describe("View Functions", function() {
    it("Should return correct milestone details", async function() {
      await measureCall(
        milestoneContract.connect(project1).requestMilestoneApproval(),
        "requestMilestoneApproval"
      );
      await measureCall(
        milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1),
        "updateMilestoneStatus"
      );
      
      const [completionDates, statuses] = await measureCall(
        milestoneContract.getMilestoneDetails(project1.address),
        "getMilestoneDetails"
      );
      
      expect(completionDates.length).to.be.greaterThan(0);
      expect(statuses.length).to.be.greaterThan(0);
    });

    it("Should return last disbursed milestone", async function() {
      await measureCall(
        milestoneContract.connect(project1).requestMilestoneApproval(),
        "requestMilestoneApproval"
      );
      await measureCall(
        milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1),
        "updateMilestoneStatus"
      );
  
      await measureCall(
        milestoneContract.connect(project1).requestMilestoneApproval(),
        "requestMilestoneApproval"
      );
      await measureCall(
        milestoneContract.connect(validator1).updateMilestoneStatus(project1.address, 1),
        "updateMilestoneStatus"
      );
      
      const lastMilestone = await measureCall(
        milestoneContract.getLastDisbursedMilestone(project1.address),
        "getLastDisbursedMilestone"
      );
      expect(lastMilestone).to.be.equal(1);
    });
  });
});