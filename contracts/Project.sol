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
        address validatorId;
        string choices;
    }

    struct projectDetails {
        address projectOwner;
        bytes32 userId;
        uint8 status; // Status Codes {0: Does not exist, 1: Exists, 2: Atleast 5 validators have validated, 3: Selected for funding, 4: Completed}
        uint16 score;
        uint8 milestone;
        uint256 budgetEstimate;
        validatorChoices[5] validatorScores; // Each validator that have scored this project
        uint8 totalValidations;
        uint256 researchArea;
        uint256 fundsReceived;
        uint256 additionalFundsReceived;
    }

    mapping (address => projectDetails) public projectOwnerToProjectDetails;
    mapping(uint256 => address[]) public researchAreaToProjectOwners;

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

    function addProjectDetails(uint256 _budgetEstimate, uint256 _researchArea) public {
        (uint256 _id,,,,) = adminContract.researches(_researchArea); // Check if the research area exists
        require(_researchArea == _id, "Research does not exist");
        projectOwnerToProjectDetails[msg.sender].projectOwner = msg.sender;
        projectOwnerToProjectDetails[msg.sender].status = 1;
        projectOwnerToProjectDetails[msg.sender].researchArea = _researchArea;
        projectOwnerToProjectDetails[msg.sender].budgetEstimate = _budgetEstimate;
        projectOwnerToProjectDetails[msg.sender].score = 0;
        projectOwnerToProjectDetails[msg.sender].milestone = 0;
        projectOwnerToProjectDetails[msg.sender].totalValidations = 0;
        projectOwnerToProjectDetails[msg.sender].fundsReceived = 0;
        projectOwnerToProjectDetails[msg.sender].additionalFundsReceived = 0;

        uint8 totalMilestones = uint8(adminContract.getResearchMilestones(_researchArea));
        projectOwnerToProjectDetails[msg.sender].milestone = totalMilestones;
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
    function updateScore(address _projectOwner, string memory _choices) public {
        (address _validatorId,,) = validatorContract.getValidatorDetails(msg.sender);
        require(projectOwnerToProjectDetails[_projectOwner].status == 1, "Project does not exist");
        projectDetails storage details = projectOwnerToProjectDetails[_projectOwner];

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
            researchAreaToProjectOwners[details.researchArea].push(_projectOwner);
        }
    }

    // Owner invokes this function when the project verification phase is over
    function selectProjectsForFunding(uint256 _researchArea) public {
        require(msg.sender == owner || adminContract.admins(msg.sender) == 1, "Not authorized");
        
        address[] storage projects = researchAreaToProjectOwners[_researchArea];
        (,,,uint256 totalBudget,) = adminContract.researches(_researchArea);
        
        // Sort projects by score
        sortProjectsByScore(_researchArea);
        
        // Select projects for funding based on budget
        for (uint i = 0; i < projects.length; i++) {
            address projectOwner = projects[i];
            projectDetails storage details = projectOwnerToProjectDetails[projectOwner];
            
            // Only consider fully validated projects
            if (details.status == 2) {
                if (details.budgetEstimate <= totalBudget) {
                    details.status = 3; // Approved for funding
                    milestoneContract.setProjectOwner(projectOwner); // Create a project entry in the milestone tracker contract
                    totalBudget -= details.budgetEstimate;
                }
            }
        }
    }

    function sortProjectsByScore(uint256 _researchArea) internal {
        address[] storage projects = researchAreaToProjectOwners[_researchArea];
        for (uint i = 0; i < projects.length; i++) {
            for (uint j = i + 1; j < projects.length; j++) {
                if (projectOwnerToProjectDetails[projects[i]].score < projectOwnerToProjectDetails[projects[j]].score) {
                    // Swap
                    address temp = projects[i];
                    projects[i] = projects[j];
                    projects[j] = temp;
                }
            }
        }
    }


    function updateFundsReceived(address _projectOwner, uint256 _newAmount) external {
        require(msg.sender == milestoneContractAddress, "Only Milestone contract can update funds");
        projectOwnerToProjectDetails[_projectOwner].fundsReceived = _newAmount;
    }

    function markProjectAsCompleted(address _projectOwner) external {
        require(msg.sender == milestoneContractAddress, "Only Milestone contract can call this function");
        projectOwnerToProjectDetails[_projectOwner].status = 4;
    }

    function viewScores(address _projectOwner) public view returns(validatorChoices[5] memory){
        require(projectOwnerToProjectDetails[_projectOwner].status != 0, "Project does not exist");
        return projectOwnerToProjectDetails[_projectOwner].validatorScores;
    }
}