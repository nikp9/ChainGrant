// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
// Simple admin management contract
contract Admin {
    // Super admin address - cannot be changed after deployment
    address public immutable admin;
    
    uint256[] public Research_ids;
    
    // Struct to store research details
    struct Research {
        uint256 id;
        uint8 totalMilestones;
        bool exists;
    }
    
    // Mapping to store research details by ID
    mapping(uint256 => Research) public researches;
   
    // Tracks admin status: 0 = not admin, 1 = admin
    mapping(address => uint8) public admins;

    // Sets contract deployer as initial super admin
    constructor() {
        admin = msg.sender;
        admins[msg.sender] = 1;
    }

    // Add a new research with ID and name
    function addResearch(uint256 _id, uint8 _totalMilestones) public {
        require(isAdmin(msg.sender), "Only admins can add research");
        require(!researches[_id].exists, "Research ID already exists");
        
        researches[_id] = Research(_id, _totalMilestones, true);
        Research_ids.push(_id);
    }
    
    // Update total milestones for a specific research
    function updateResearchMilestones(uint256 _id, uint8 _totalMilestones) public {
        require(isAdmin(msg.sender), "Only admins can update research");
        require(researches[_id].exists, "Research ID does not exist");
        
        researches[_id].totalMilestones = _totalMilestones;
    }
    
    
  // Get research total milestones by ID
    function getResearchMilestones(uint256 _id) public view returns (uint256) {
        require(researches[_id].exists, "Research ID does not exist");
        return researches[_id].totalMilestones;
    }
    
    // Get all research IDs
    function getAllResearchIds() public view returns (uint256[] memory) {
        return Research_ids;
    }
    
    // Get research count
    function getResearchCount() public view returns (uint256) {
        return Research_ids.length;
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