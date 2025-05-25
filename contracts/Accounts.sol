// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {EntryPoint} from "@account-abstraction/contracts/core/EntryPoint.sol";
import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";
import {ECDSA} from "node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

// contract Accounts is IAccount{

//     address public entryPoint;
//     mapping (address => uint8) public users;
//     bytes4 private constant ADD_PROJECT_DETAILS_SELECTOR = bytes4(keccak256("addProjectDetails(uint256, uint256)"));
//     address immutable EXPECTED_ADDRESS;

//     constructor(address _entryPoint, address _expectedAddress) {
//         entryPoint = _entryPoint;
//         EXPECTED_ADDRESS = _expectedAddress;
//     }

//     event ValidationFailed(
//         string reason,
//         bytes4 actualSelector,
//         bytes4 expectedSelector
//     );

//     function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256) external returns (uint256 validationData){
//         address recovered = ECDSA.recover(ECDSA.toEthSignedMessageHash(userOpHash), userOp.signature);
//         if (recovered == address(0)) {
//             return 1;
//         }
        
//         if (users[recovered] == 0) {
//             bytes calldata callData = userOp.callData;
//             address target = address(bytes20(callData[16:36]));
//             require(callData.length > 132, "Invalid callData length");
//             bytes calldata data = callData[132:];
//             require(data.length >= 4, "Invalid data length");

//             bytes4 innerSelector = bytes4(data[:4]);
//             if (innerSelector == ADD_PROJECT_DETAILS_SELECTOR && target == EXPECTED_ADDRESS){
//                 users[recovered] = 1;
//                 return 0;
//             }
//         }

//         return 1;
//     }

//     function execute(address target, uint256 value, bytes calldata data) external {
//         require(msg.sender == entryPoint, "only entrypoint");
//         (bool success,) = target.call{value: value}(data);
//         require(success, "execution failed");
//     }
// }

contract Accounts is IAccount {
    address public immutable entryPoint;
    mapping(address => bool) public owners;
    bytes4 private constant ADD_PROJECT_DETAILS_SELECTOR = bytes4(keccak256("addProjectDetails(uint256,uint256)"));
    address public immutable EXPECTED_ADDRESS;

    // Use proper validation failure return value
    uint256 private constant SIG_VALIDATION_FAILED = 1;

    constructor(address _entryPoint, address _expectedAddress) {
        entryPoint = _entryPoint;
        EXPECTED_ADDRESS = _expectedAddress;
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        // Only EntryPoint can call this
        require(msg.sender == entryPoint, "only entrypoint");
        
        // Recover the signer (don't add Ethereum prefix - userOpHash is already prepared)
        address recovered = ECDSA.recover(userOpHash, userOp.signature);
        
        // Check if this is a new user trying to call addProjectDetails
        if (!owners[recovered]) {
            // Only allow if calling the specific function on expected contract
            (address target, bytes4 selector) = _parseCallData(userOp.callData);
            if (target == EXPECTED_ADDRESS && selector == ADD_PROJECT_DETAILS_SELECTOR) {
                owners[recovered] = true;
                return 0; // Validation success
            }
            return SIG_VALIDATION_FAILED;
        }
        
        // Existing owners are always allowed
        return 0;
    }

    function _parseCallData(bytes calldata callData) internal pure returns (address target, bytes4 selector) {
        require(callData.length >= 24 + 4, "invalid callData");
        target = address(bytes20(callData[16:36]));
        selector = bytes4(callData[132:136]);
    }

    function execute(address target, uint256 value, bytes calldata data) external {
        require(msg.sender == entryPoint, "only entrypoint");
        (bool success,) = target.call{value: value}(data);
        require(success, "execution failed");
    }
}