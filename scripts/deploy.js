const hre = require("hardhat");
const fs = require("fs");

async function main(){
    const EntryPoint = await hre.ethers.deployContract("EntryPoint");
    await EntryPoint.waitForDeployment();
    console.log(`EntryPoint deployed to ${EntryPoint.target}`);
    
    const Admin = await hre.ethers.deployContract("Admin");
    await Admin.waitForDeployment();
    console.log(`ProjectDetails deployed to ${Admin.target}`);

    const Validator = await hre.ethers.deployContract("Validator", [Admin.target]);
    await Validator.waitForDeployment();
    console.log(`ProjectDetails deployed to ${Validator.target}`);

    const Project = await hre.ethers.deployContract("Project", [Validator.target, Admin.target]);
    await Project.waitForDeployment();
    console.log(`ProjectDetails deployed to ${Project.target}`);

    const Milestone = await hre.ethers.deployContract("Milestone", [Project.target, Validator.target]);
    await Milestone.waitForDeployment();
    console.log(`ProjectDetails deployed to ${Milestone.target}`);
    
    const accounts = await hre.ethers.deployContract("Accounts", [EntryPoint.target, ProjectDetails.target]);
    await accounts.waitForDeployment();
    console.log(`Accounts deployed to ${accounts.target}`);
    
    const paymaster = await hre.ethers.deployContract("Paymaster", [accounts.target]);
    await paymaster.waitForDeployment();
    console.log(`Paymaster deployed to ${paymaster.target}`);
    
    console.log("Creating paymaster stake in EntryPoint...");
    const depositTx = await EntryPoint.depositTo(paymaster, {
        value: hre.ethers.parseEther("0.2")
    });
    await depositTx.wait();
    const balance = await EntryPoint.balanceOf(paymaster);
    console.log("Paymaster stake in EntryPoint:", hre.ethers.formatEther(balance), "ETH");

    
    const addresses = {
        EntryPoint: EntryPoint.target,
        Accounts: accounts.target,
        Paymaster: paymaster.target,
        Admin: Admin.target,
        Validator: Validator,
        Project: Project.target,
        Milestone: Milestone.target
    }

    fs.writeFileSync("addresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});