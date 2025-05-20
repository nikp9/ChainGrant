const hre = require("hardhat");
const fs = require("fs");

/*
TODO

Deploy and test on:
1. Hardhat local chain
2. Fork of the main chain
3. Sepolia Testnet

*/

async function main() {
    addresses = JSON.parse(fs.readFileSync("addresses.json", "utf-8"));
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", addresses["EntryPoint"]);
    const Accounts = await hre.ethers.getContractAt("Accounts", addresses["Accounts"]);
    const Paymaster = await hre.ethers.getContractAt("Paymaster", addresses["Paymaster"]);
    const Project = await hre.ethers.getContractAt("Project", addresses["Project"]);
    const Admin = await hre.ethers.getContractAt("Admin", addresses["Admin"]);
    const Validator = await hre.ethers.getContractAt("Validator", addresses["Validator"]);
    // Get contract instances
    const [signer] = await hre.ethers.getSigners();

    // Get the current nonce
    const nonce = await EntryPoint.getNonce(Accounts.target, 0);
    console.log("Current nonce:", nonce);

    // Encoding the function to call
    const targetFunction = Project.interface.encodeFunctionData("addProjectDetails", [10000, 2]);

    // Prepare the execute call
    const functionCallData = Accounts.interface.encodeFunctionData("execute", [Project.target, 0, targetFunction]);
    
    const userOp = {
        sender: Accounts.target,
        nonce: nonce,
        initCode: "0x",
        callData: functionCallData,
        callGasLimit: 100_000,
        verificationGasLimit: 100_000,
        preVerificationGas: 50_000,
        maxFeePerGas: hre.ethers.parseUnits("20", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymasterAndData: Paymaster.target,
        signature: "0x"
    };

    // console.log("UserOperation:", userOp);

    try {
        // Estimate gas for the handleOps call
        const gasLimit = await EntryPoint.handleOps.estimateGas(
            [userOp],
            signer
        );
        // console.log("Estimated gas limit:", gasLimit);

        // Send the operation
        const tx = await EntryPoint.handleOps(
            [userOp],
            signer,
            {
                gasLimit: gasLimit * 2n
            }
        );
        console.log("Transaction hash:", tx.hash);
        
        const receipt = await tx.wait();
        // console.log("Transaction Receipt:", receipt);

        // Verify the count was incremented
        const update = await Project.idToProjectDetails(1);
        console.log("Response :", update);
    } catch (error) {
        console.error("Error executing UserOperation:");
        if (error.data) {
            // Try to decode the revert reason
            console.error("Revert reason:", error.data);
        }
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });