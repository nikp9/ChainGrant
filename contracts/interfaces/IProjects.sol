// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IProjects {
    function idToProjectDetails(uint256 _projectId) external view returns (
        uint8 status,
        uint16 score,
        uint8 milestone,
        uint256 budgetEstimate,
        validatorChoices[5] memory validatorScores,
        uint8 totalValidations,
        uint256 researchArea,
        uint256 fundsReceived,
        uint256 additionalFundsReceived
    );

    function updateFundsReceived(uint256 projectId, uint256 newAmount) external;

    struct validatorChoices {
        uint256 validatorId;
        string choices; // Note: As per your comment, you might want to change this to integer type
    }
}