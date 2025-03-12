// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Projects.sol";
import "./validator.sol";
import "./Admin.sol";

 contract Fund_tracking {
     Admin public adminContract;
     ProjectSelector public projectSelector;
     ValidatorRegistry public validatorRegistry;
 
     struct fund_Transfered {
         uint256 P_id;
         uint256[] Transfered_amount;
         uint8 count;
     }
      
     mapping(uint => fund_Transfered) public funds;
 
     constructor(address _projectSelectorAddress, address _validatorRegistryAddress) {
         projectSelector = ProjectSelector(_projectSelectorAddress);
         validatorRegistry = ValidatorRegistry(_validatorRegistryAddress);
     }
     
     modifier onlyVerifiedValidator(uint256 validatorId,uint256 Research_id) {
         (uint256 id,uint256 R_id, uint8 status) = validatorRegistry.getValidatorDetails(validatorId);
         require(id == validatorId && status == 1, "Not a verified validator");
         require(R_id == Research_id, "Validator is not of this research Topic");
         _;
     }
     
     modifier validProject(uint256 projectId) {
         (uint8 status, , , ,,) = projectSelector.idToProjectDetails(projectId);
         require(status != 0, "Project does not exist");
         _;
     }
     
     function update_amount(uint256 _id, uint256 New_funds_transfered, uint256 v_id,uint256 Research_Id) public
         validProject(_id) 
         onlyVerifiedValidator(v_id,Research_Id) 
     {
         (, , , uint256 Total_fund_req,, ) = projectSelector.idToProjectDetails(_id);
         require(Total_fund_req >= New_funds_transfered, "Amount Greater");
         
         // Initialize the array if it hasn't been initialized yet
         if (funds[_id].Transfered_amount.length == 0) {
             funds[_id].P_id = _id;
             funds[_id].Transfered_amount = new uint256[](1);
             funds[_id].count = 0;
         }
         
         // Update or push the new amount
         if (funds[_id].count == 0) {
             funds[_id].Transfered_amount[0] = New_funds_transfered;
         } else {
             funds[_id].Transfered_amount.push(New_funds_transfered);
         }
         funds[_id].count++;
     }
 }