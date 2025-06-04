// scripts/checkBalances.js
const { ethers } = require("hardhat");

async function main() {
  console.log("=".repeat(70));
  console.log("CHECKING ACCOUNT BALANCES ON SEPOLIA");
  console.log("=".repeat(70));
  
  // Get all signers from hardhat config
  const signers = await ethers.getSigners();
  
  console.log(`Found ${signers.length} accounts in configuration\n`);
  
  let totalBalance = 0n;
  const accounts = [];
  
  // Check each account
  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    
    try {
      const balance = await ethers.provider.getBalance(signer.address);
      const balanceInEth = ethers.formatEther(balance);
      
      accounts.push({
        index: i,
        address: signer.address,
        balance: balance,
        balanceInEth: balanceInEth
      });
      
      totalBalance += balance;
      
      const accountLabel = i === 0 ? "Main Account" : `Test Account ${i}`;
      
      console.log(`${accountLabel}:`);
      console.log(`  Address: ${signer.address}`);
      console.log(`  Balance: ${balanceInEth} ETH`);
      
      // Status indicator
      if (balance > ethers.parseEther("0.01")) {
        console.log(`  Status:  ✅ Well funded`);
      } else if (balance > ethers.parseEther("0.001")) {
        console.log(`  Status:  ⚠️  Low balance`);
      } else {
        console.log(`  Status:  ❌ Very low/empty`);
      }
      
      console.log();
      
    } catch (error) {
      console.log(`❌ Error checking account ${i}: ${error.message}\n`);
    }
  }
  
  console.log("=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));
  
  const totalInEth = ethers.formatEther(totalBalance);
  console.log(`Total accounts: ${accounts.length}`);
  console.log(`Total balance: ${totalInEth} ETH`);
  console.log(`Average balance: ${(parseFloat(totalInEth) / accounts.length).toFixed(4)} ETH`);
  
  // Count by status
  const wellFunded = accounts.filter(acc => acc.balance > ethers.parseEther("0.01")).length;
  const lowBalance = accounts.filter(acc => acc.balance > ethers.parseEther("0.001") && acc.balance <= ethers.parseEther("0.01")).length;
  const veryLow = accounts.filter(acc => acc.balance <= ethers.parseEther("0.001")).length;
  
  console.log();
  console.log("Account Status:");
  console.log(`  ✅ Well funded (>0.01 ETH): ${wellFunded}`);
  console.log(`  ⚠️  Low balance (0.001-0.01 ETH): ${lowBalance}`);
  console.log(`  ❌ Very low/empty (<0.001 ETH): ${veryLow}`);
  
  console.log();
  console.log("=".repeat(70));
  
  // Recommendations
  if (veryLow > 0) {
    console.log("⚠️  RECOMMENDATION: Some accounts need funding for testing");
  }
  
  if (wellFunded >= 5) {
    console.log("✅ GOOD: Sufficient accounts available for comprehensive testing");
  }
  
  console.log("=".repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });