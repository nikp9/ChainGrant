// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
// Simple admin management contract
contract Admin {
    // Super admin address - cannot be changed after deployment
    address public immutable admin;
    
    uint256 public Total_milestone;
   
    // Tracks admin status: 0 = not admin, 1 = admin
    mapping(address => uint8) public admins;

    // Sets contract deployer as initial super admin
    constructor() {
        admin = msg.sender;
        admins[msg.sender] = 1;
    }

     function add_TotalMilestone(uint256 M) public{
        Total_milestone=M;
     }

    // Allows super admin to add new admins
    function addAdmin(address _newAdmin) public {
        require(msg.sender == admin, "Only super admin can add admins");
        admins[_newAdmin] = 1;
    }

    // Checks if an address is an admin
    function isAdmin(address _address) public view returns (bool) {
        return admins[_address] == 1;
    }
}
