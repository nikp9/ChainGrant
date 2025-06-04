require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [
        process.env.PRIVATE_KEY, // Main account
        process.env.PRIVATE_KEY_1, // Test account 1
        process.env.PRIVATE_KEY_2, // Test account 2
        process.env.PRIVATE_KEY_3, // Test account 3
        process.env.PRIVATE_KEY_4, // Test account 4
        process.env.PRIVATE_KEY_5, // Test account 5
        process.env.PRIVATE_KEY_6, // Test account 6
        process.env.PRIVATE_KEY_7, // Test account 7
        process.env.PRIVATE_KEY_8, // Test account 8
        process.env.PRIVATE_KEY_9, // Test account 9
        process.env.PRIVATE_KEY_10, // Test account 10
        process.env.PRIVATE_KEY_11, // Test account 11
        process.env.PRIVATE_KEY_12, // Test account 12
        process.env.PRIVATE_KEY_13, // Test account 13
      ],
      timeout: 120000, // 2 minutes
      confirmations: 2,
    },
  },
  mocha: {
    timeout: 600000, // 10 minutes global timeout - applies to ALL tests
    slow: 30000, // Tests over 30s are marked as slow
    reporter: 'spec',
    bail: false // Continue running tests even if one fails
  }
};