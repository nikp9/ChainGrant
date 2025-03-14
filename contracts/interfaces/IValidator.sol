// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IValidator{
    function updateValidatorStatus(uint256 _id, uint8 _status) external;
    function getValidatorDetails(uint256 _id) external view returns (uint256,uint256,uint8);
}