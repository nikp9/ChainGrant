// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {IPaymaster} from "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

contract Paymaster is IPaymaster {
    address public immutable ALLOWED_ACCOUNT;
    constructor(address _allowedAccount) {
        ALLOWED_ACCOUNT = _allowedAccount;
    }
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32,
        uint256
    ) external view returns (bytes memory context, uint256 validationData)
    {
        if (userOp.sender != ALLOWED_ACCOUNT) {
            return ("", 1);
        }
    
        return ("", 0);
    }

    function postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) external{}
}