// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
contract Admin {
    address public immutable admin;
    mapping(address => uint8) public admins;

    constructor() {
        admin = msg.sender;
        admins[msg.sender] = 1;
    }

    function addAdmin(address _newAdmin) public {
        require(msg.sender == admin, "Only super admin can add admins");
        admins[_newAdmin] = 1;
    }

    function isAdmin(address _address) public view returns (bool) {
        return admins[_address] == 1;
    }
}
