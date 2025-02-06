// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./projectselector.sol";
import "./validator.sol";

contract MilestoneTracker {
    ProjectSelector public projectSelector;
    ValidatorRegistry public validatorRegistry;
    
    struct Milestone {
        uint projectId;
        uint deadline;
        uint isCompleted;
    }
    
    mapping(uint => Milestone) public milestones;
    
    constructor(address _projectSelectorAddress, address _validatorRegistryAddress) {
        projectSelector = ProjectSelector(_projectSelectorAddress);
        validatorRegistry = ValidatorRegistry(_validatorRegistryAddress);
    }
    
    modifier onlyVerifiedValidator(uint256 validatorId) {
        (uint256 id, uint8 status) = validatorRegistry.getValidatorDetails(validatorId);
        require(id == validatorId && status == 1, "Not a verified validator");
        _;
    }
    
    modifier validProject(uint projectId) {
        (uint8 status, , ) = projectSelector.idToProjectDetails(projectId);
        require(status != 0, "Project does not exist");
        _;
    }
    
    function updateStatus(
        uint projectId, 
        uint status, 
        uint256 validatorId
    ) public 
        onlyVerifiedValidator(validatorId)
        validProject(projectId) 
    {
        milestones[projectId].isCompleted = status;
    }
    
    function changeDeadline(
        uint projectId, 
        uint newDeadline,
        uint256 validatorId
    ) public 
        onlyVerifiedValidator(validatorId)
        validProject(projectId) 
    {
        require(newDeadline > block.timestamp, "Invalid deadline");
        milestones[projectId].deadline = newDeadline;
    }
    
    function getMilestone(uint projectId) public view 
        validProject(projectId)
        returns (Milestone memory) 
    {
        return milestones[projectId];
    }
}
