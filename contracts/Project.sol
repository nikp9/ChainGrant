// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IAdmin.sol";
import "./interfaces/IValidator.sol";
import "./interfaces/IMilestone.sol";

contract Project {
    IValidator public validatorContract;
    IAdmin public adminContract;
    IMilestone public milestoneContract;
    address public milestoneContractAddress;
    address public owner;
    
    struct validatorChoices {
        uint256 validatorId;
        string choices;
    }

    struct projectDetails {
        uint8 status; // Status Codes {0: Does not exist, 1: Exists, 2: Atleast 5 validators have validated, 3: Selected for funding}
        uint16 score;
        uint8 milestone;
        uint256 budgetEstimate;
        validatorChoices[5] validatorScores; // Each validator that have scored this project
        uint8 totalValidations;
        uint256 researchArea;
        uint256 fundsReceived;
        uint256 additionalFundsReceived;
    }

    mapping (uint256 => projectDetails) public idToProjectDetails;
    mapping(uint256 => uint256[]) public researchAreaToProjectIds;

    constructor(address _validatorContractAddress, address _adminContractAddress) {
        validatorContract = IValidator(_validatorContractAddress);
        adminContract = IAdmin(_adminContractAddress);
        owner = msg.sender;
    }

    function setMilestoneContractAddress(address _milestoneContractAddress) public {
        require(msg.sender == owner, "Only owner can set milestone contract address");
        milestoneContractAddress = _milestoneContractAddress;
        milestoneContract = IMilestone(milestoneContractAddress);
    }

    function addProjectDetails(uint256 _id, uint256 _budgetEstimate, uint256 _researchArea) public { // Check research area
        idToProjectDetails[_id].status = 1;
        idToProjectDetails[_id].researchArea = _researchArea;
        idToProjectDetails[_id].budgetEstimate = _budgetEstimate;
        idToProjectDetails[_id].score = 0;
        idToProjectDetails[_id].milestone = 0;
        idToProjectDetails[_id].totalValidations = 0;
        idToProjectDetails[_id].fundsReceived = 0;
        idToProjectDetails[_id].additionalFundsReceived = 0;

        uint8 totalMilestones = uint8(adminContract.getResearchMilestones(_researchArea));
        idToProjectDetails[_id].milestone = totalMilestones;
    }

    function calculateScoreFromChoices(string memory _binaryChoices) internal pure returns (uint16) {
        bytes memory choicesBytes = bytes(_binaryChoices);
        uint16 score = 0;
        
        for (uint i = 0; i < choicesBytes.length; i++) {
            if (choicesBytes[i] == '1') {
                score += 1;
            }
        }
        
        return score;
    }

    // Only validator can call it and ** match it with validator address **
    function updateScore(uint256 _id, uint256 _validatorId, string memory _choices) public {
        require(idToProjectDetails[_id].status == 1, "Project does not exist");
        projectDetails storage details = idToProjectDetails[_id];

        for (uint8 i = 0; i<5; i++){ // Update validator contract and this will get fixed
            if (details.validatorScores[i].validatorId == _validatorId){
                revert("The validator has already scored this project");
            }
        }

        (, uint256 researchArea, uint8 verificationStatus) = validatorContract.getValidatorDetails(_validatorId); // Validator id is address msg.sender == _validatorId
        require(researchArea == details.researchArea && verificationStatus == 1, "Validator not verified"); // Check if the research area and the validator is verified
        // Validator id check validatorContract.validators(msg.sender).status == 1

        uint16 score = calculateScoreFromChoices(_choices);
        details.score += score;
        details.validatorScores[details.totalValidations] = validatorChoices(_validatorId, _choices);
        details.totalValidations++;
        if (details.totalValidations == 5){
            details.status = 2;
            researchAreaToProjectIds[details.researchArea].push(_id);
        }
    }

    function selectProjectsForFunding(uint256 _researchArea) public {
        require(msg.sender == owner || adminContract.admins(msg.sender) == 1, "Not authorized");
        
        uint256[] storage projects = researchAreaToProjectIds[_researchArea];
        (,,uint256 totalBudget,) = adminContract.researches(_researchArea);
        
        // Sort projects by score
        sortProjectsByScore(_researchArea);
        
        // Select projects for funding based on budget
        for (uint i = 0; i < projects.length; i++) {
            uint256 projectId = projects[i];
            projectDetails storage details = idToProjectDetails[projectId];
            
            // Only consider fully validated projects
            if (details.status == 2) {
                if (details.budgetEstimate <= totalBudget) {
                    details.status = 3; // Approved for funding
                    milestoneContract.setProjectId(projectId); // Create a project entry in the milestone tracker contract
                    totalBudget -= details.budgetEstimate;
                }
            }
        }
    }

    function sortProjectsByScore(uint256 _researchArea) internal {
        uint256[] storage projects = researchAreaToProjectIds[_researchArea];
        for (uint i = 0; i < projects.length; i++) {
            for (uint j = i + 1; j < projects.length; j++) {
                if (idToProjectDetails[projects[i]].score < idToProjectDetails[projects[j]].score) {
                    // Swap
                    uint256 temp = projects[i];
                    projects[i] = projects[j];
                    projects[j] = temp;
                }
            }
        }
    }


    function updateFundsReceived(uint256 projectId, uint256 newAmount) external {
        require(msg.sender == milestoneContractAddress, "Only MilestoneTracker can update funds");
        idToProjectDetails[projectId].fundsReceived = newAmount;
    }

    function viewScores(uint256 _id) public view returns(validatorChoices[5] memory){
        require(idToProjectDetails[_id].status != 0, "Project does not exist");
        return idToProjectDetails[_id].validatorScores;
    }
}