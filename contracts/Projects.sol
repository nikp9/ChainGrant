// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
// import "./validator.sol";

interface IValidator{
    function updateValidatorStatus(uint256 _id, uint8 _status) external;
    function getValidatorDetails(uint256 _id) external view returns (uint256,uint256,uint8);
}

interface IAdmin {
    function getResearchMilestones(uint256 _id) external view returns (uint256);
}

contract ProjectTracker {
    IValidator public validatorContract;
    Admin public adminContract;
    
    struct validatorChoices {
        uint256 validatorId;
        string choices; // ** Make it integer **
    }

    struct projectDetails {
        uint8 status; // Status Codes {0: Does not exist, 1: Exists, 2: Atleast 5 validators have validated}
        uint16 score;
        uint8 milestone;
        uint256 budgetEstimate;
        validatorChoices[5] validatorScores; // Each validator that have scored this project
        uint8 totalValidations;
        uint256 researchArea;
    }

    mapping (uint => projectDetails) public idToProjectDetails;
    uint256[] public ids;

    constructor(address _validatorContractAddress, address _adminContractAddress) {
        validatorContract = IValidator(_validatorContractAddress);
        adminContract = Admin(_adminContractAddress);
    }

    function addProjectDetails(uint256 _id, uint256 _budgetEstimate, uint256 _researchArea) public {
        ids.push(_id);
        idToProjectDetails[_id].status = 1;
        idToProjectDetails[_id].researchArea = researchArea;
        idToProjectDetails[_id].budgetEstimate = _budgetEstimate;
        idToProjectDetails[_id].score = 0;
        idToProjectDetails[_id].milestone = 0;
        idToProjectDetails[_id].totalValidations = 0;

        uint8 totalMilestones = uint8(adminContract.getResearchMilestones(_researchArea));
        idToProjectDetails[_id].milestone = totalMilestones;
    }

    // Only validator can call it and ** match it with validator address **
    function updateScore(uint256 _id, uint256 _validatorId, uint16 _score, string memory _choices) public {
        require(idToProjectDetails[_id].status == 1, "Invalid status");
        projectDetails storage details = idToProjectDetails[_id];

        for (uint8 i = 0; i<5; i++){
            if (details.validatorId == _validatorId){
                revert("The validator has already scored this project");
            }
        }

        (, uint256 researchArea, uint8 verificationStatus) = validatorContract.getValidatorDetails(_validatorId);
        require(researchArea == projectDetails[_id].researchArea && verificationStatus == 1); // Check if the research area and the validator is verified

        
        details.score += _score;
        details.validatorScores[details.totalValidations] = validatorChoices(_validatorId, _choices);
        details.totalValidations++;
        if (details.totalValidations == 5){
            details.status = 2;
        }
    }

    function viewScores(uint256 _id) public view returns(validatorChoices[5] memory){
        require(idToProjectDetails[_id].status != 0, "Project does not exist");
        return idToProjectDetails[_id].validatorScores;
    }
}