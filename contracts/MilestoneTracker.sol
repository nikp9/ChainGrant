// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Projects.sol";
import "./validator.sol";

contract MilestoneTracker {
    ProjectSelector public projectSelector;
    ValidatorRegistry public validatorRegistry;
    Admin public adminContract;
    
    struct MilestoneStatus {
        uint8 isCompleted;
        uint completionDate;
    }
    
    struct ProjectMilestones {
        uint256 projectId;
        
        mapping(uint8 => MilestoneStatus) milestoneStatuses; // milestone number => status
    }
    
    mapping(uint256 => ProjectMilestones) public projects;
    
    constructor(address _projectSelectorAddress, address _validatorRegistryAddress, address _adminAddress) {
        projectSelector = ProjectSelector(_projectSelectorAddress);
        validatorRegistry = ValidatorRegistry(_validatorRegistryAddress);
        adminContract = Admin(_adminAddress);
    }
    
    modifier onlyVerifiedValidator(uint256 validatorId) {
        (uint256 id, uint8 status) = validatorRegistry.getValidatorDetails(validatorId);
        require(id == validatorId && status == 1, "Not a verified validator");
        _;
    }
    
    modifier validProject(uint256 projectId) {
        (uint8 status, , ,) = projectSelector.idToProjectDetails(projectId);
        require(status != 0, "Project does not exist");
        _;
    }
    
    function updateMilestoneStatus(
        uint256 projectId,
        uint8 milestoneNumber,
        uint8 status,
        uint256 validatorId
    ) public 
        onlyVerifiedValidator(validatorId)
        validProject(projectId) 
    {    
        require(milestoneNumber < adminContract.Total_milestone(), "Invalid milestone number");
        require(status == 0 || status == 1, "Invalid status");
        
        // If marking as complete, store completion date
        if (status == 1) {
            projects[projectId].milestoneStatuses[milestoneNumber].completionDate = block.timestamp;
        }
        
        projects[projectId].milestoneStatuses[milestoneNumber].isCompleted = status;
    }
    
    
    function getMilestoneDetails(uint256 projectId) public view 
    validProject(projectId)
    returns (uint[] memory completionDates, uint8[] memory statuses) 
{
    // Get total milestones from admin contract
    uint256 totalMilestones = adminContract.Total_milestone();
    
    completionDates = new uint[](totalMilestones);
    statuses = new uint8[](totalMilestones);
    
    for (uint8 i = 0; i < totalMilestones; i++) {
        completionDates[i] = projects[projectId].milestoneStatuses[i].completionDate;
        statuses[i] = projects[projectId].milestoneStatuses[i].isCompleted;
    }
    
    return (completionDates, statuses);
}
}