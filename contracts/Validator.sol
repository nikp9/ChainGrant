// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./interfaces/IAdmin.sol";
import "./interfaces/IValidator.sol";

// Validator votes only once per project

contract Validator is IValidator {
    IAdmin public adminContract;

    struct adminChoices {
        address admin;
        uint8 vote;
        bool hasVoted; // * Make it integer *
    }
    
    struct ValidatorDetails {
        address validatorId;
        uint256 researchArea;
        uint8 verificationStatus; // 0: pending, 1: verified, 2: Pending verification
        uint8 adminCount;
        uint8 positiveVotes;
        mapping(address => adminChoices) adminsVoted;
        bytes32 validatorHash;
    }
    
    uint256 public validatorCount = 0;
    mapping(address => ValidatorDetails) public validators;
    
    constructor(address _adminContractAddress) {
        adminContract = IAdmin(_adminContractAddress);
    }
    
    modifier onlyAdmin() {
        require(adminContract.admins(msg.sender) == 1, "Only admin can perform this action");
        _;
    }
    
    function addValidator(uint256 _researchArea) public {
        (, , , , bool exists) = adminContract.researches(_researchArea);
        require(exists == true, "Research area doesn't exist");
        require(validators[msg.sender].validatorId != msg.sender, "Only add a new validator");
        validatorCount++;
        validators[msg.sender].validatorId = msg.sender;
        validators[msg.sender].researchArea = _researchArea;
        validators[msg.sender].verificationStatus = 0;  // Defaults to pending admin need to verify a validator
        validators[msg.sender].validatorHash = 0;
    }

    function updateValidatorStatus(address _validatorId, uint8 _vote) public override onlyAdmin {
        require(validators[_validatorId].verificationStatus == 0, "Invalid validator id");
        require(_vote == 0 || _vote == 1, "Invalid vote");
        ValidatorDetails storage validator = validators[_validatorId];
        
        if (validator.adminsVoted[msg.sender].hasVoted == false){
            validator.adminCount++;
        }
        else{
            validator.positiveVotes = validator.positiveVotes - validator.adminsVoted[msg.sender].vote; // Change previous vote
        }

        validator.positiveVotes += _vote;
        validator.adminsVoted[msg.sender].vote = _vote;
        validator.adminsVoted[msg.sender].hasVoted = true; // If revote happens we need to implement some logic to make increase or decrease votes

        uint8 minimumVotesNeeded = validator.adminCount / 2 + 1;
        
        // Check if either vote count has reached majority if equal status remains unchanged
        if (validator.adminCount > 2){
            if (validator.positiveVotes >= minimumVotesNeeded) {
                validator.verificationStatus = 1; // Approved by majority
            } else {
                validator.verificationStatus = 0; // Rejected by majority
            }
        }
    }
    
    function getValidatorDetails(address _validatorId) public view override returns (address,uint256, uint8) {
        require(validators[_validatorId].verificationStatus > 0, "Validator not verified");
        ValidatorDetails storage validator = validators[_validatorId];
        return (validator.validatorId,validator.researchArea, validator.verificationStatus);
    }
}