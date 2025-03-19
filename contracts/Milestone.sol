// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IAdmin.sol";
import "./interfaces/IValidator.sol";
import "./interfaces/IProject.sol";


contract Milestone {
    IProject public projectsContract;
    IValidator public validatorContract;
    
    struct MilestoneStatus {
        uint8 isCompleted;
        uint completionDate;
    }
    
    struct ProjectMilestones {
        uint256 projectId;
        mapping(uint8 => MilestoneStatus) milestoneStatuses; // milestone number => status
        uint8 currentMilestoneSubmissionStatus; // 0: Work not submitted, 1: Work submitted for review, 2: Validator wants a resubmission, 3: Final Submission
        uint8 currentMilestone;
        uint8 lastDisbursedMilestone; // Track the last milestone for which funds were disbursed
    }
    
    mapping(uint256 => ProjectMilestones) public projects;
    
    constructor(address _projectsContractAddress, address _validatorContractAddress) {
        projectsContract = IProject(_projectsContractAddress);
        validatorContract = IValidator(_validatorContractAddress);
    }
    
    modifier onlyVerifiedProjectAndValidator(uint256 projectId, uint256 _validatorId) {
        // Msg.sender == validator address
        (uint256 validatorId, uint256 validatorResearchArea, uint8 validatorStatus) = validatorContract.getValidatorDetails(_validatorId);
        (uint8 projectStatus,,,,,uint256 projectResearchArea,,) = projectsContract.idToProjectDetails(projectId);
        require(projectStatus == 3, "Project does not exist or is not approved to receive funding");
        require(validatorId == _validatorId && validatorStatus == 1, "Not a verified validator");
        require(projectResearchArea == validatorResearchArea, "Validator is not of this research Topic");
        _;
    }
    
    modifier validProject(uint256 projectId) {
        (uint8 status,,,,,,,) = projectsContract.idToProjectDetails(projectId);
        require(status != 0, "Project does not exist");
        _;
    }

    function setProjectId(uint256 _id) external {
        require(msg.sender == address(projectsContract), "Only projects contract can call this function");
        projects[_id].projectId = _id;
        projects[_id].currentMilestoneSubmissionStatus;
        projects[_id].currentMilestone;
        projects[_id].lastDisbursedMilestone;
    }

    function requestMilestoneApproval(uint256 projectId) public {
        (uint8 projectStatus,,,,,,,) = projectsContract.idToProjectDetails(projectId); // ECDSA recover sender address to cross verify
        require(projectStatus == 3, "Project does not exist or is not approved to receive funding");
        projects[projectId].currentMilestoneSubmissionStatus = 1;
    }
    
    function updateMilestoneStatus(
        uint256 projectId,
        uint8 status,
        uint256 validatorId
    ) public 
        onlyVerifiedProjectAndValidator(projectId, validatorId)
    {
        // Get total milestones for the project
        (,, uint8 totalMilestones,,,,,) = projectsContract.idToProjectDetails(projectId);
        uint8 currentMilestone = projects[projectId].currentMilestone;
        
        require(currentMilestone < totalMilestones, "Invalid milestone number");
        require(status == 0 || status == 1, "Invalid status");
        require(projects[projectId].currentMilestoneSubmissionStatus == 1, "Work not submitted");

        verify(projectId, currentMilestone, status);
    }

    function verify(uint256 projectId, uint8 currentMilestone, uint8 verificationStatus) internal {
        // If marking as complete, store completion date and disburse funds
        if (verificationStatus == 1) {
            projects[projectId].milestoneStatuses[currentMilestone].completionDate = block.timestamp;
            
            // Disburse funds without sequential milestone check
            disburseFunds(projectId, currentMilestone);
        }
        else { // verificationStatus == 0
            projects[projectId].currentMilestoneSubmissionStatus = 2;
        }
        
        projects[projectId].milestoneStatuses[currentMilestone].isCompleted = verificationStatus;
    }
    
    function disburseFunds(uint256 projectId, uint8 currentMilestone) internal {
        // Get project details
        (,, uint8 totalMilestones, uint256 budgetEstimate,,,uint256 fundsReceived,) = 
            projectsContract.idToProjectDetails(projectId);
        
        // Calculate the amount to disburse (only using budgetEstimate, not additionalFunds)
        uint256 amountToDisburse;
        
        if (currentMilestone == totalMilestones - 1) {
            // For the last milestone, disburse any remaining funds
            amountToDisburse = budgetEstimate - fundsReceived;
            // Reset submission status to 0 (work not submitted)
            projects[projectId].currentMilestoneSubmissionStatus = 4; // Final Submission
        } else {
            projects[projectId].currentMilestone += 1;
            // Reset submission status to 0 (work not submitted)
            projects[projectId].currentMilestoneSubmissionStatus = 0;

            // For other milestones, calculate the per-milestone amount
            uint256 baseAmount = budgetEstimate / totalMilestones;
            
            // Handle remainder
            if (currentMilestone < budgetEstimate % totalMilestones) {
                baseAmount += 1;
            }
            
            amountToDisburse = baseAmount;
        }
        
        // Update the project's funds received
        projectsContract.updateFundsReceived(projectId, fundsReceived + amountToDisburse);
        
        // Update the last disbursed milestone
        projects[projectId].lastDisbursedMilestone = currentMilestone;
    }
    
    function getMilestoneDetails(uint256 projectId) public view 
        validProject(projectId)
        returns (uint[] memory completionDates, uint8[] memory statuses) 
    {
        // Get total milestones for the project
        (,,uint8 totalMilestones,,,,,) = projectsContract.idToProjectDetails(projectId);
        
        completionDates = new uint[](totalMilestones);
        statuses = new uint8[](totalMilestones);
        
        for (uint8 i = 0; i < totalMilestones; i++) {
            completionDates[i] = projects[projectId].milestoneStatuses[i].completionDate;
            statuses[i] = projects[projectId].milestoneStatuses[i].isCompleted;
        }
        
        return (completionDates, statuses);
    }
    
    function getLastDisbursedMilestone(uint256 projectId) public view
        validProject(projectId)
        returns (uint8)
    {
        return projects[projectId].lastDisbursedMilestone;
    }
}