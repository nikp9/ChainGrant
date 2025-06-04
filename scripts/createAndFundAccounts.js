// scripts/createAndFundAccounts.js
const { ethers } = require("hardhat");

async function main() {
  // Get the deployer account (your funded account)
  const [deployer] = await ethers.getSigners();
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  
  console.log("=".repeat(60));
  console.log("CREATING AND FUNDING 13 SEPOLIA TEST ACCOUNTS");
  console.log("=".repeat(60));
  console.log(`Deployer account: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`);
  console.log("=".repeat(60));
  
  const fundingAmount = ethers.parseEther("0.05"); // 0.08 ETH per account
  const totalRequired = ethers.parseEther("1"); // 13 * 0.08 = 1.04 ETH + gas
  
  // Check if deployer has enough balance
  if (deployerBalance < totalRequired) {
    console.log(`❌ Insufficient balance! Need at least ${ethers.formatEther(totalRequired)} ETH`);
    console.log(`Current balance: ${ethers.formatEther(deployerBalance)} ETH`);
    return;
  }
  
  const accounts = [];
  const privateKeys = [];
  
  // Create 13 new accounts
  for (let i = 1; i <= 13; i++) {
    const wallet = ethers.Wallet.createRandom();
    accounts.push(wallet);
    privateKeys.push(wallet.privateKey);
    
    console.log(`Account ${i}:`);
    console.log(`  Address: ${wallet.address}`);
    console.log(`  Private Key: ${wallet.privateKey}`);
    console.log();
  }
  
  console.log("=".repeat(60));
  console.log("FUNDING ACCOUNTS...");
  console.log("=".repeat(60));
  
  // Fund each account
  for (let i = 0; i < accounts.length; i++) {
    const wallet = accounts[i];
    
    try {
      console.log(`Funding account ${i + 1}: ${wallet.address}...`);
      
      const tx = await deployer.sendTransaction({
        to: wallet.address,
        value: fundingAmount,
        gasLimit: 21000 // Standard ETH transfer gas limit
      });
      
      console.log(`  Transaction hash: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait(2);
      console.log(`  ✅ Confirmed in block ${receipt.blockNumber}`);
      
      // Check balance
      const balance = await ethers.provider.getBalance(wallet.address);
      console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
      
    } catch (error) {
      console.log(`  ❌ Failed to fund account ${i + 1}: ${error.message}`);
    }
    
    console.log();
    
    // Small delay to prevent nonce issues
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("=".repeat(60));
  console.log("SUMMARY - COPY THESE TO YOUR .env FILE:");
  console.log("=".repeat(60));
  
  console.log("# Main account (your original)");
  console.log(`PRIVATE_KEY=${process.env.PRIVATE_KEY}`);
  console.log();
  
  console.log("# Test accounts (add these)");
  privateKeys.forEach((key, index) => {
    console.log(`PRIVATE_KEY_${index + 1}=${key}`);
  });
  
  console.log();
  console.log("=".repeat(60));
  console.log("HARDHAT CONFIG ACCOUNTS ARRAY:");
  console.log("=".repeat(60));
  
  console.log("accounts: [");
  console.log(`  process.env.PRIVATE_KEY, // Main account`);
  privateKeys.forEach((key, index) => {
    console.log(`  process.env.PRIVATE_KEY_${index + 1}, // Test account ${index + 1}`);
  });
  console.log("].filter(Boolean),");
  
  console.log();
  console.log("=".repeat(60));
  console.log("✅ SETUP COMPLETE!");
  console.log(`💰 Total ETH sent: ${ethers.formatEther(fundingAmount * BigInt(13))} ETH`);
  console.log("🔑 13 new funded accounts created");  
  console.log("📝 Copy the private keys to your .env file");
  console.log("⚙️  Update your hardhat.config.js with the accounts array");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });