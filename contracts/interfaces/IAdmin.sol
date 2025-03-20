// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IAdmin {
    function getResearchMilestones(uint256 _id) external view returns (uint256);
    function admins(address _address) external view returns (uint8);
    function researches(uint256 _researchId) external view returns (uint256, uint8, uint256, uint256, bool);
}