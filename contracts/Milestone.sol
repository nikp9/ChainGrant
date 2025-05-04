// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./interfaces/IAdmin.sol";
import "./interfaces/IValidator.sol";
import "./interfaces/IProject.sol";


contract Milestone {
    IProject public projectsContract;
    IValidator public validatorContract;
    
    struct MilestoneStatus {
        uint8 isCompleted;
        uint256 startDate;
        uint256 completionDate;
    }
    
    struct ProjectMilestones {
        address projectOwner;
        mapping(uint8 => MilestoneStatus) milestoneStatuses; // milestone number => status
        uint8 currentMilestoneSubmissionStatus; // 0: Work not submitted, 1: Work submitted for review, 2: Validator wants a resubmission, 3: Final Submission, 4: Completed
        uint8 currentMilestone;
        uint8 lastDisbursedMilestone; // Track the last milestone for which funds were disbursed
    }
    
    mapping(address => ProjectMilestones) public projects;
    
    constructor(address _projectsContractAddress, address _validatorContractAddress) {
        projectsContract = IProject(_projectsContractAddress);
        validatorContract = IValidator(_validatorContractAddress);
    }
    
    modifier onlyVerifiedProjectAndValidator(address _projectOwner, address _validatorId) {
        (, uint256 validatorResearchArea, uint8 validatorStatus) = validatorContract.getValidatorDetails(_validatorId);
        (,,uint8 projectStatus,,,,,uint256 projectResearchArea,,) = projectsContract.projectOwnerToProjectDetails(_projectOwner);
        require(projectStatus == 3, "Project does not exist or is not approved to receive funding");
        require(validatorStatus == 1, "Not a verified validator");
        require(projectResearchArea == validatorResearchArea, "Validator is not of this research Topic");
        _;
    }
    
    modifier validProject(address _projectOwner) {
        (,,uint8 status,,,,,,,) = projectsContract.projectOwnerToProjectDetails(_projectOwner);
        require(status == 3, "Project not approved for funding");
        _;
    }

    function setProjectOwner(address _projectOwner) external {
        require(msg.sender == address(projectsContract), "Only projects contract can call this function");
        projects[_projectOwner].projectOwner = _projectOwner;
        projects[_projectOwner].currentMilestoneSubmissionStatus;
        projects[_projectOwner].milestoneStatuses[0].startDate = block.timestamp;
        projects[_projectOwner].currentMilestone = 0;
        projects[_projectOwner].lastDisbursedMilestone;
    }

    function requestMilestoneApproval() public {
        (address _projectOwner,,uint8 _projectStatus,,,,,,,) = projectsContract.projectOwnerToProjectDetails(msg.sender);
        require(_projectStatus == 3, "Project does not exist or is not approved to receive funding");
        projects[_projectOwner].currentMilestoneSubmissionStatus = 1;
    }
    
    function updateMilestoneStatus(
        address _projectOwner,
        uint8 _status
    ) public 
        onlyVerifiedProjectAndValidator(_projectOwner, msg.sender)
    {
        // Get total milestones for the project
        (,,,, uint8 totalMilestones,,,,,) = projectsContract.projectOwnerToProjectDetails(_projectOwner);
        uint8 currentMilestone = projects[_projectOwner].currentMilestone;
        
        require(currentMilestone <= totalMilestones, "Invalid milestone number");
        require(_status == 0 || _status == 1, "Invalid status");
        require(projects[_projectOwner].currentMilestoneSubmissionStatus == 1, "Work not submitted");

        verify(_projectOwner, currentMilestone, _status);
    }

    function verify(address _projectOwner, uint8 _currentMilestone, uint8 _verificationStatus) internal {
        // If marking as complete, store completion date and disburse funds
        (,,,, uint8 totalMilestones,,,,,) = projectsContract.projectOwnerToProjectDetails(_projectOwner);

        if (_verificationStatus == 1) {
            if (_currentMilestone == totalMilestones) {
                projects[_projectOwner].currentMilestoneSubmissionStatus = 4;
                projects[_projectOwner].milestoneStatuses[_currentMilestone].completionDate = block.timestamp;
                projectsContract.markProjectAsCompleted(_projectOwner);
            }
            else {
                projects[_projectOwner].milestoneStatuses[_currentMilestone].completionDate = block.timestamp;
            
                // Disburse funds without sequential milestone check
                disburseFunds(_projectOwner, _currentMilestone);
            }
        }
        else { // verificationStatus == 0
            projects[_projectOwner].currentMilestoneSubmissionStatus = 2;
        }
        
        
        projects[_projectOwner].milestoneStatuses[_currentMilestone].isCompleted = _verificationStatus;
    }
    
    function disburseFunds(address _projectOwner, uint8 _currentMilestone) internal {
        // Get project details
        (,,,, uint8 totalMilestones, uint256 budgetEstimate,,,uint256 fundsReceived,) = 
            projectsContract.projectOwnerToProjectDetails(_projectOwner);
        
        // Calculate the amount to disburse (only using budgetEstimate, not additionalFunds)
        uint256 amountToDisburse;
        
        if (_currentMilestone == totalMilestones - 1) {
            // For the last milestone, disburse any remaining funds
            amountToDisburse = budgetEstimate - fundsReceived;

        } else {
            // For other milestones, calculate the per-milestone amount
            uint256 baseAmount = budgetEstimate / totalMilestones;
            
            // Handle remainder
            if (_currentMilestone < budgetEstimate % totalMilestones) {
                baseAmount += 1;
            }
            
            amountToDisburse = baseAmount;
        }
        
        projects[_projectOwner].currentMilestone += 1;
        projects[_projectOwner].currentMilestoneSubmissionStatus = 0;
        // Update the project's funds received
        projectsContract.updateFundsReceived(_projectOwner, fundsReceived + amountToDisburse);

        uint8 nextMilestone = projects[_projectOwner].currentMilestone;
        projects[_projectOwner].milestoneStatuses[nextMilestone].startDate = block.timestamp;
        
        // Update the last disbursed milestone
        projects[_projectOwner].lastDisbursedMilestone = _currentMilestone;
    }
    
    function getMilestoneDetails(address _projectOwner) public view 
        validProject(_projectOwner)
        returns (uint[] memory completionDates, uint8[] memory statuses) 
    {
        // Get total milestones for the project
        (,,,,uint8 totalMilestones,,,,,) = projectsContract.projectOwnerToProjectDetails(_projectOwner);
        
        completionDates = new uint[](totalMilestones);
        statuses = new uint8[](totalMilestones);
        
        for (uint8 i = 0; i < totalMilestones; i++) {
            completionDates[i] = projects[_projectOwner].milestoneStatuses[i].completionDate;
            statuses[i] = projects[_projectOwner].milestoneStatuses[i].isCompleted;
        }
        
        return (completionDates, statuses);
    }
    
    function getLastDisbursedMilestone(address _projectOwner) public view
        validProject(_projectOwner)
        returns (uint8)
    {
        return projects[_projectOwner].lastDisbursedMilestone;
    }
}