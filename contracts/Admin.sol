// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IAdmin.sol";

contract Admin is IAdmin {
    // Super admin address - cannot be changed after deployment
    address public immutable admin;
    
    uint256[] public researchArea;
    
    // Struct to store research details
    struct researchDetails {
        uint256 id;
        uint8 totalMilestones;
        uint256 budget;
        bool exists;
    }
    
    // Mapping to store research details by ID
    mapping(uint256 => researchDetails) public researches;
   
    // Tracks admin status: 0 = not admin, 1 = admin
    mapping(address => uint8) public admins;

    // Sets contract deployer as initial super admin
    constructor() {
        admin = msg.sender;
        admins[msg.sender] = 1;
    }

    // Add a new research with ID and name
    function addResearch(uint256 _id, uint8 _totalMilestones, uint256 _budget) public {
        require(isAdmin(msg.sender), "Only admins can add new research areas");
        require(!researches[_id].exists, "Research ID already exists");
        
        researches[_id] = researchDetails(_id, _totalMilestones, _budget, true);
        researchArea.push(_id);
    }
    
    
  // Get research total milestones by ID
    function getResearchMilestones(uint256 _id) external view override returns (uint256) {
        require(researches[_id].exists, "Research ID does not exist");
        return researches[_id].totalMilestones;
    }
    
    // Get all research IDs
    function getAllResearchIds() public view returns (uint256[] memory) {
        return researchArea;
    }
    
    // Get research count
    function getResearchCount() public view returns (uint256) {
        return researchArea.length;
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