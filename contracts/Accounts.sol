// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {EntryPoint} from "@account-abstraction/contracts/core/EntryPoint.sol";
import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";
import {ECDSA} from "node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract Accounts is IAccount{

    address public entryPoint;
    mapping (address => uint8) public users;
    bytes4 private constant ADD_PROJECT_DETAILS_SELECTOR = bytes4(keccak256("addProjectDetails(bytes32)"));
    address immutable EXPECTED_ADDRESS;

    constructor(address _entryPoint, address _expectedAddress) {
        entryPoint = _entryPoint;
        EXPECTED_ADDRESS = _expectedAddress;
    }

    event ValidationFailed(
        string reason,
        bytes4 actualSelector,
        bytes4 expectedSelector
    );

    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256) external returns (uint256 validationData){
        address recovered = ECDSA.recover(ECDSA.toEthSignedMessageHash(userOpHash), userOp.signature);
        if (recovered == address(0)) {
            return 1;
        }
        
        if (users[recovered] == 0) {
            bytes calldata callData = userOp.callData;
            address target = address(bytes20(callData[16:36]));
            require(callData.length > 132, "Invalid callData length");
            bytes calldata data = callData[132:];
            require(data.length >= 4, "Invalid data length");

            bytes4 innerSelector = bytes4(data[:4]);
            if (innerSelector == ADD_PROJECT_DETAILS_SELECTOR && target == EXPECTED_ADDRESS){
                users[recovered] = 1;
                return 0;
            }
        }

        return 1;
    }

    function execute(address target, uint256 value, bytes calldata data) external {
        require(msg.sender == entryPoint, "only entrypoint");
        (bool success,) = target.call{value: value}(data);
        require(success, "execution failed");
    }
}