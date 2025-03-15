// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./interfaces/IAdmin.sol";
import "./interfaces/IValidator.sol";

contract Validator is IValidator {
    IAdmin public adminContract;

    struct adminChoices {
        address admin;
        uint8 vote;
        bool hasVoted; // ** Make it integer **
    }
    
    struct ValidatorDetails {
        uint256 id;
        uint256 researchArea;
        uint8 verificationStatus; // 0: pending, 1: verified
        uint8 adminCount;
        uint8 positiveVotes;
        mapping(address => adminChoices) adminsVoted;
        bytes32 validatorHash;
    }
    
    uint256 public validatorCount = 0;
    mapping(uint256 => ValidatorDetails) public validators;
    
    constructor(address _adminContractAddress) {
        adminContract = IAdmin(_adminContractAddress);
    }
    
    modifier onlyAdmin() {
        require(adminContract.admins(msg.sender) == 1, "Only admin can perform this action");
        _;
    }
    
    function addValidator(uint256 _id, uint256 _researchArea) public {
        (, , bool exists) = adminContract.researches(_researchArea);
        require(exists == true, "Research area doesn't exist");
        require(validators[_id].id != _id, "Only add a new validator");
        validatorCount++;
        validators[validatorCount].id = _id;
        validators[validatorCount].researchArea = _researchArea;
        validators[validatorCount].verificationStatus = 0;  // Defaults to pending admin need to verify a validator
        validators[validatorCount].validatorHash = 0;
    }

    function updateValidatorStatus(uint256 _id, uint8 _status) public override onlyAdmin {
        require(_id > 0 && _id <= validatorCount, "Invalid id"); // ** To be removed **
        require(_status == 0 || _status == 1, "Invalid status");
        ValidatorDetails storage validator = validators[_id];
        
        if (validator.adminsVoted[msg.sender].hasVoted == false){
            validator.adminCount++;
        }
        else{
            validator.positiveVotes = validator.positiveVotes - validator.adminsVoted[msg.sender].vote;
        }

        validator.adminsVoted[msg.sender].vote = _status;
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
    
    function getValidatorDetails(uint256 _id) public view override returns (uint256,uint256, uint8) {
        require(_id > 0 && _id <= validatorCount, "Invalid id");
        ValidatorDetails storage validator = validators[_id];
        return (validator.id,validator.researchArea, validator.verificationStatus);
    }

    function getValidatorAdminCount(uint256 _id) public view returns (uint8) {
        ValidatorDetails storage validator = validators[_id];
        return (validator.adminCount);
    }
}