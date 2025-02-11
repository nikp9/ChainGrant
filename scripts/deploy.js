const hre = require("hardhat");
const fs = require("fs");

async function main(){
    const ep = await hre.ethers.deployContract("EntryPoint");
    await ep.waitForDeployment();
    console.log(`EntryPoint deployed to ${ep.target}`);

    const ProjectDetails = await hre.ethers.deployContract("ProjectDetails");
    await ProjectDetails.waitForDeployment();
    console.log(`ProjectDetails deployed to ${ProjectDetails.target}`);
    
    const accounts = await hre.ethers.deployContract("Accounts", [ep.target, ProjectDetails.target]);
    await accounts.waitForDeployment();
    console.log(`Accounts deployed to ${accounts.target}`);
    
    const paymaster = await hre.ethers.deployContract("Paymaster", [accounts.target]);
    await paymaster.waitForDeployment();
    console.log(`Paymaster deployed to ${paymaster.target}`);
    
    console.log("Creating paymaster stake in EntryPoint...");
    const depositTx = await ep.depositTo(paymaster, {
        value: hre.ethers.parseEther("0.2")
    });
    await depositTx.wait();
    const balance = await ep.balanceOf(paymaster);
    console.log("Paymaster stake in EntryPoint:", hre.ethers.formatEther(balance), "ETH");
    

    const addresses = {
        EntryPoint: ep.target,
        Accounts: accounts.target,
        Paymaster: paymaster.target,
        ProjectDetails: ProjectDetails.target,
    }

    fs.writeFileSync("addresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});