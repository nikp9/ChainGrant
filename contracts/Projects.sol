// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./Validator.sol";  

contract ProjectSelector {
    ValidatorRegistry public validatorRegistry;

    struct validatorChoices {
        uint256 validatorId;
        string choices;
    }

    struct projectDetails {
        uint8 status; // Status Codes {0: Does not exist, 1: Exists, 2: Atleast 5 validators have validated}
        uint16 score;
        validatorChoices[5] validatorScores;
        uint8 numberOfValidators;
    }

    mapping (uint => projectDetails) public idToProjectDetails;
    uint256[] public ids;

    constructor(address _validatorRegistryAddress) {
        validatorRegistry = ValidatorRegistry(_validatorRegistryAddress);
    }

    function addProjectDetails(uint256 _id) public {
        ids.push(_id);
        idToProjectDetails[_id].status = 1;
        idToProjectDetails[_id].score = 0;
        idToProjectDetails[_id].numberOfValidators = 0;
    }

    function updateScore(uint256 _id, uint256 _validatorId, uint16 _score, string memory _choices) public {
        require(idToProjectDetails[_id].status == 1, "Invalid status"); 

        (uint256 id, uint8 status) = validatorRegistry.getValidatorDetails(_validatorId);
        require(id == _validatorId && status == 1);

        projectDetails storage details = idToProjectDetails[_id];
        details.score += _score;
        details.validatorScores[details.numberOfValidators] = validatorChoices(_validatorId, _choices);
        details.numberOfValidators++;
        if (details.numberOfValidators == 5){
            details.status = 2;
        }
    }

    function viewScores(uint256 _id) public view returns(validatorChoices[5] memory){
        require(idToProjectDetails[_id].status != 0, "Project does not exist");
        return idToProjectDetails[_id].validatorScores;
    }
}
