// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./validator.sol";  

contract ProjectSelector {
    ValidatorRegistry public validatorRegistry;
    Admin public adminContract;
    
    struct validatorChoices {
        uint256 validatorId;
        string choices;
    }

    struct projectDetails {
        uint8 status; // Status Codes {0: Does not exist, 1: Exists, 2: Atleast 5 validators have validated}
        uint16 score;
        uint8 mile_stone;
        uint256 Total_fund_req;
        validatorChoices[5] validatorScores;
        uint8 numberOfValidators;
        uint256 research_id;
    }

    mapping (uint => projectDetails) public idToProjectDetails;
    uint256[] public ids;

    constructor(address _validatorRegistryAddress, address _adminContractAddress) {
        validatorRegistry = ValidatorRegistry(_validatorRegistryAddress);
        adminContract = Admin(_adminContractAddress);
    }

    function addProjectDetails(uint256 _id, uint256 Total_fund, uint256 Research_id) public {
        ids.push(_id);
        idToProjectDetails[_id].status = 1;
        idToProjectDetails[_id].research_id = Research_id;
        idToProjectDetails[_id].Total_fund_req = Total_fund;
        idToProjectDetails[_id].score = 0;
        idToProjectDetails[_id].mile_stone = 0;
        idToProjectDetails[_id].numberOfValidators = 0;

        uint8 totalMilestones = uint8(adminContract.getResearchMilestones(Research_id));
        idToProjectDetails[_id].mile_stone = totalMilestones;
    }

    function updateScore(uint256 _id, uint256 _validatorId, uint16 _score,uint256 _ResearchId ,string memory _choices) public {
        require(idToProjectDetails[_id].status == 1, "Invalid status"); 

        (uint256 id,uint256 R_id, uint8 status) = validatorRegistry.getValidatorDetails(_validatorId);
        require(id == _validatorId && R_id == _ResearchId && status == 1 );

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