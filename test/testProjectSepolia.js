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
      const receipt = await result.wait();
      // Add small delay for Sepolia network
      await new Promise(resolve => setTimeout(resolve, 1000));
      return result;
    }
    return result;
  }
  
  const startTime = Date.now();
  const result = await contractCall;
  const endTime = Date.now();
  
  // Handle transaction waits for non-view functions
  if (result.wait && typeof result.wait === 'function') {
    const receipt = await result.wait();
    // Add small delay for Sepolia network stability
    await new Promise(resolve => setTimeout(resolve, 1000));
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

describe("Project Contract", function () {
  let projectContract, validatorContract, adminContract, milestoneContract;
  let owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3, project4;
  
  // Increase timeout for Sepolia network
  this.timeout(900000); // 15 minutes
  
  before(async function () {
    console.log("Starting contract deployment and setup...");
    
    // Get signers
    [owner, validator1, validator2, validator3, validator4, validator5, nonValidator, admin1, admin2, admin3, project1, project2, project3, project4] = await ethers.getSigners();
    
    console.log("Deploying Admin contract...");
    // Deploy contracts with measurement
    const Admin = await ethers.getContractFactory("Admin");
    adminContract = await measureCall(Admin.deploy(), "Admin.deploy()");
    await adminContract.waitForDeployment();
    console.log("Admin contract deployed");

    console.log("Adding admins...");
    // Add admins with measurement - batch these
    await measureCall(adminContract.connect(owner).addAdmin(admin1.address), "addAdmin");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await measureCall(adminContract.connect(owner).addAdmin(admin2.address), "addAdmin");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await measureCall(adminContract.connect(owner).addAdmin(admin3.address), "addAdmin");
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Deploying Validator contract...");
    const Validator = await ethers.getContractFactory("Validator");
    validatorContract = await measureCall(
      Validator.deploy(await adminContract.getAddress()),
      "Validator.deploy()"
    );
    await validatorContract.waitForDeployment();
    console.log("Validator contract deployed");
    
    console.log("Deploying Project contract...");
    const Project = await ethers.getContractFactory("Project");
    projectContract = await measureCall(
      Project.deploy(await validatorContract.getAddress(), await adminContract.getAddress()),
      "Project.deploy()"
    );
    await projectContract.waitForDeployment();
    console.log("Project contract deployed");
    
    console.log("Deploying Milestone contract...");
    const Milestone = await ethers.getContractFactory("Milestone");
    milestoneContract = await measureCall(
      Milestone.deploy(await projectContract.getAddress(), await validatorContract.getAddress()),
      "Milestone.deploy()"
    );
    await milestoneContract.waitForDeployment();
    console.log("Milestone contract deployed");
    
    // Set milestone contract address
    console.log("Setting milestone contract address...");
    await measureCall(
      projectContract.setMilestoneContractAddress(await milestoneContract.getAddress()),
      "setMilestoneContractAddress"
    );

    // Setup research areas
    console.log("Adding research area...");
    await measureCall(
      adminContract.addResearch(2, 3, 1, 5000),
      "addResearch"
    );
    
    console.log("Adding validators...");
    // Setup validators for testing - batch these
    const validators = [validator1, validator2, validator3, validator4, validator5];
    for (const validator of validators) {
      await measureCall(
        validatorContract.connect(validator).addValidator(2),
        "addValidator"
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("Verifying validators...");
    // Verify validators - batch these operations
    const admins = [owner, admin2, admin3];
    
    for (const admin of admins) {
      for (const validator of validators) {
        await measureCall(
          validatorContract.connect(admin).updateValidatorStatus(validator.address, 1),
          "updateValidatorStatus"
        );
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      // Longer delay between admin batches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("Adding projects...");
    // Add projects
    await measureCall(
      projectContract.connect(project1).addProjectDetails(2000, 2),
      "addProjectDetails"
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
    await measureCall(
      projectContract.connect(project2).addProjectDetails(2400, 2),
      "addProjectDetails"
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
    await measureCall(
      projectContract.connect(project3).addProjectDetails(1900, 2),
      "addProjectDetails"
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
    await measureCall(
      projectContract.connect(project4).addProjectDetails(2200, 2),
      "addProjectDetails"
    );
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Scoring projects...");
    // Verify projects - batch scoring operations
    const scores = {
      [project1.address]: ["10110", "11110", "10110", "10111", "11111"],
      [project2.address]: ["10110", "11100", "10100", "10111", "11101"],
      [project3.address]: ["10110", "11110", "10110", "10101", "11101"],
      [project4.address]: ["11111"]
    };

    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i];
      for (const [project, projectScores] of Object.entries(scores)) {
        if (projectScores[i]) {
          await measureCall(
            projectContract.connect(validator).updateScore(project, projectScores[i]),
            "updateScore"
          );
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      // Delay between validators
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("Selecting projects for funding...");
    // Select projects for funding
    await measureCall(
      projectContract.connect(admin1).selectProjectsForFunding(2),
      "selectProjectsForFunding"
    );
    
    console.log("Setup completed successfully!");
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
      
      // Reset the milestone contract address
      await measureCall(
        projectContract.connect(owner).setMilestoneContractAddress(await milestoneContract.getAddress()),
        "setMilestoneContractAddress(reset)"
      );
    });
  });

  describe("Project Creation", function() {
    it("Should create a project with correct details", async function() {
      const projectDetails = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      expect(projectDetails.status).to.equal(3);
      expect(projectDetails.budgetEstimate).to.equal(2000);
      expect(projectDetails.researchArea).to.equal(2);
      expect(projectDetails.score).to.equal(19);
      expect(projectDetails.milestone).to.equal(3);
      expect(projectDetails.totalValidations).to.equal(5);
      expect(projectDetails.fundsReceived).to.equal(0);
      expect(projectDetails.additionalFundsReceived).to.equal(0);
    });
  });

  describe("Score Calculation", function() {
    it("Should calculate score correctly from binary choices", async function() {
      const projectDetails = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      expect(projectDetails.score).to.equal(19);
      expect(projectDetails.totalValidations).to.equal(5);
    });
    
    it("Should prevent a validator from scoring the same project twice", async function() {
      await expect(
        measureCall(
          projectContract.connect(validator1).updateScore(project4.address, "11111"),
          "updateScore(duplicate)"
        )
      ).to.be.revertedWith("The validator has already scored this project");
    });
    
    it("Should reject scores from unverified validators", async function() {
      // Create a new project for this test
      await measureCall(
        projectContract.connect(nonValidator).addProjectDetails(1500, 2),
        "addProjectDetails(new)"
      );
      
      await expect(
        measureCall(
          projectContract.connect(nonValidator).updateScore(nonValidator.address, "11111"),
          "updateScore(unverified)"
        )
      ).to.be.revertedWith("Validator not verified");
    });
    
    it("Should update status to 2 after 5 validations", async function() {
      let projectDetails = await measureCall(
        projectContract.projectOwnerToProjectDetails(project4.address),
        "projectOwnerToProjectDetails"
      );
      expect(projectDetails.status).to.equal(1);
      
      await measureCall(
        projectContract.connect(validator2).updateScore(project4.address, "10100"),
        "updateScore"
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await measureCall(
        projectContract.connect(validator3).updateScore(project4.address, "10010"),
        "updateScore"
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await measureCall(
        projectContract.connect(validator4).updateScore(project4.address, "10001"),
        "updateScore"
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await measureCall(
        projectContract.connect(validator5).updateScore(project4.address, "11111"),
        "updateScore"
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      projectDetails = await measureCall(
        projectContract.projectOwnerToProjectDetails(project4.address),
        "projectOwnerToProjectDetails"
      );
      expect(projectDetails.status).to.equal(2);
      expect(projectDetails.totalValidations).to.equal(5);
    });
  });

  describe("Project Funding Selection", function() {
    it("Should only allow owner or admin to select projects for funding", async function() {
      await expect(
        measureCall(
          projectContract.connect(nonValidator).selectProjectsForFunding(2),
          "selectProjectsForFunding(unauthorized)"
        )
      ).to.be.revertedWith("Not authorized");
    });
    
    it("Should select projects based on score and budget constraints", async function() {
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
    
    it("Should create milestone tracker entries for selected projects", async function() {
      const project1Exists = await measureCall(
        milestoneContract.projects(project1.address),
        "milestoneContract.projects"
      );
      expect(project1Exists.projectOwner).to.equal(project1.address);
    });
  });

  describe("Funds Management", function() {
    it("Should only allow milestone contract to update funds received", async function() {
      await expect(
        measureCall(
          projectContract.connect(owner).updateFundsReceived(project1.address, 500),
          "updateFundsReceived(unauthorized)"
        )
      ).to.be.revertedWith("Only Milestone contract can update funds");
      
      // Temporarily set owner as milestone contract for testing
      await measureCall(
        projectContract.connect(owner).setMilestoneContractAddress(owner.address),
        "setMilestoneContractAddress"
      );
      
      await measureCall(
        projectContract.connect(owner).updateFundsReceived(project1.address, 500),
        "updateFundsReceived(authorized)"
      );
      
      const projectDetails = await measureCall(
        projectContract.projectOwnerToProjectDetails(project1.address),
        "projectOwnerToProjectDetails"
      );
      expect(projectDetails.fundsReceived).to.equal(500);
      
      // Reset milestone contract address
      await measureCall(
        projectContract.connect(owner).setMilestoneContractAddress(await milestoneContract.getAddress()),
        "setMilestoneContractAddress"
      );
    });
  });

  describe("View Functions", function() {
    describe("viewScores", function() {
      it("Should return validator scores for an existing project", async function() {
        const scores = await measureCall(
          projectContract.viewScores(project1.address),
          "viewScores"
        );
        
        const expectedValidators = [validator1, validator2, validator3, validator4, validator5];
        const expectedChoices = ["10110", "11110", "10110", "10111", "11111"];
        
        for (let i = 0; i < 5; i++) {
          expect(scores[i].validatorId).to.equal(expectedValidators[i].address);
          expect(scores[i].choices).to.equal(expectedChoices[i]);
        }
      });
      
      it("Should revert when trying to view scores for non-existent project", async function() {
        const randomAddress = ethers.Wallet.createRandom().address;
        await expect(
          measureCall(
            projectContract.viewScores(randomAddress),
            "viewScores(invalid)"
          )
        ).to.be.revertedWith("Project does not exist");
      });
    });
  });
});