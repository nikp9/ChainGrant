// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Admin.sol";  // Make sure Admin contract is in this file

contract ValidatorRegistry {
    Admin public adminContract;
    
    struct ValidatorDetails {
        uint256 id;
        uint256 R_id;
        uint8 verificationStatus; // 0: pending, 1: verified
        uint8 admin_count ;
        bytes32 validatorHash;
    }
    
    uint256 public validatorCount = 0;
    mapping(uint256 => ValidatorDetails) public validators;
    
    constructor(address _adminContractAddress) {
        adminContract = Admin(_adminContractAddress);
    }
    
    modifier onlyAdmin() {
        require(adminContract.admins(msg.sender) == 1, "Only admin can perform this action");
        _;
    }
    
    function addValidator(uint256 _id,uint256 R1_id) public {
        validatorCount++;
        validators[validatorCount].id = _id;
        validators[validatorCount].R_id =R1_id;
        validators[validatorCount].verificationStatus = 0;  // Default to pending
        validators[validatorCount].validatorHash = 0;
    }

    function updateValidatorStatus(uint256 _id, uint8 _status) public onlyAdmin {
        require(_id > 0 && _id <= validatorCount, "Invalid id");
        require(_status == 0 || _status == 1, "Invalid status");
        
        ValidatorDetails storage v = validators[_id];
        if(_status==1)
        {
            v.admin_count++;
        }       
        if(v.admin_count==5)
        {
            v.verificationStatus = _status;
        }
    }
    
    function getValidatorDetails(uint256 _id) public view returns (uint256,uint256, uint8) {
        require(_id > 0 && _id <= validatorCount, "Invalid id");
        ValidatorDetails storage v = validators[_id];
        return (v.id,v.R_id, v.verificationStatus);
    }
}