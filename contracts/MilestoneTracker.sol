// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Projects.sol";
import "./validator.sol";
import "./Admin.sol";
 contract MilestoneTracker {
     ProjectSelector public projectSelector;
     ValidatorRegistry public validatorRegistry;
     
     struct MilestoneStatus {
         uint8 isCompleted;
         uint completionDate;
     }
     
     struct ProjectMilestones {
         uint256 projectId;
         
         mapping(uint8 => MilestoneStatus) milestoneStatuses; // milestone number => status
     }
     
     mapping(uint256 => ProjectMilestones) public projects;
     
     constructor(address _projectSelectorAddress, address _validatorRegistryAddress) {
         projectSelector = ProjectSelector(_projectSelectorAddress);
         validatorRegistry = ValidatorRegistry(_validatorRegistryAddress);
     }
     
     modifier onlyVerifiedValidator(uint256 validatorId,uint256 Research_id) {
         (uint256 id,uint256 R_id, uint8 status) = validatorRegistry.getValidatorDetails(validatorId);
         require(id == validatorId && status == 1, "Not a verified validator");
         require(R_id == Research_id, "Validator is not of this research Topic");
         _;
     }
     
     modifier validProject(uint256 projectId) {
         (uint8 status, , uint8 totalMilestones, , ,) = projectSelector.idToProjectDetails(projectId);
         require(status != 0, "Project does not exist");
         _;
     }
     
     function updateMilestoneStatus(
         uint256 projectId,
         uint8 milestoneNumber,
         uint8 status,
         uint256 validatorId,
         uint256 Res_Id
     ) public 
         onlyVerifiedValidator(validatorId,Res_Id)
         validProject(projectId) 
     {
         // Get total milestones for the project
         (, , uint8 totalMilestones, ,,) = projectSelector.idToProjectDetails(projectId);
         
         require(milestoneNumber < totalMilestones, "Invalid milestone number");
         require(status == 0 || status == 1, "Invalid status");

            varify(projectId,milestoneNumber,status);

     }
    function varify( uint256 projectId,uint8 milestoneNumber,uint8 status)   internal
         // If marking as complete, store completion date
        {
         if (status == 1) {
             projects[projectId].milestoneStatuses[milestoneNumber].completionDate = block.timestamp;
         }
         
         projects[projectId].milestoneStatuses[milestoneNumber].isCompleted = status;
     }
     
     
     function getMilestoneDetails(uint256 projectId) public view 
         validProject(projectId)
         returns (uint[] memory completionDates, uint8[] memory statuses) 
     {
         // Get total milestones for the project
         (, , uint8 totalMilestones, ,,) = projectSelector.idToProjectDetails(projectId);
         
         completionDates = new uint[](totalMilestones);
         statuses = new uint8[](totalMilestones);
         
         for (uint8 i = 0; i < totalMilestones; i++) {
             completionDates[i] = projects[projectId].milestoneStatuses[i].completionDate;
             statuses[i] = projects[projectId].milestoneStatuses[i].isCompleted;
         }
         
         return (completionDates, statuses);
     }
 }