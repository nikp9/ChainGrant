// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IValidator{
    function updateValidatorStatus(address _validatorId, uint8 _status) external;
    function getValidatorDetails(address _validatorId) external view returns (address,uint256,uint8);
}