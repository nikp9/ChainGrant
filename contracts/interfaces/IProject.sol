// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IProject {
    function projectOwnerToProjectDetails(address _projectOwner) external view returns (
        address projectOwner,
        bytes32 userId,
        uint8 status,
        uint16 score,
        uint8 milestone,
        uint256 budgetEstimate,
        uint8 totalValidations,
        uint256 researchArea,
        uint256 fundsReceived,
        uint256 additionalFundsReceived
    );

    function updateFundsReceived(address _projectOwner, uint256 _newAmount) external;
    function markProjectAsCompleted(address _projectOwner) external;
    function setMilestoneContractAddress(address _milestoneContractAddress) external;
}