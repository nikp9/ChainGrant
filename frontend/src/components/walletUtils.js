import {ethers} from 'ethers';
import addresses from '../../../addresses.json';
import admin_abi from '../../../artifacts/contracts/Admin.sol/Admin.json';

// Add these constants to represent user types
export const UserTypes = {
  NEW_USER: 0,
  RESEARCHER: 1,
  VALIDATOR: 2,
  ADMIN: 3
};

const contractABI = admin_abi.abi
const admin_address = addresses.Admin;
const RPC_URL = 'http://127.0.0.1:8545/'

// walletUtils.js
export const connectWallet = async () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  
  try {
    // Modern EIP-1102 standard way to request accounts
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0] || null;
  } catch (error) {
    console.error("Connection failed:", error);
    throw error; // Re-throw to handle in the UI
  }
};

export const switchAccounts = async () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  
  try {
    // This will trigger MetaMask to show the account switcher
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    });
    
    // Get the updated accounts
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error("Account switching failed:", error);
    return null; // User rejected the request
  }
};

export const getCurrentAccount = async () => {
  if (!window.ethereum) return null;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error("Failed to get accounts:", error);
    return null;
  }
};

// Get a signer for making transactions
export const getSigner = async () => {
  if (!window.ethereum) return null;
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return await provider.getSigner();
};


// Get a contract instance and check user type
export const getAdminContract = async () => {
  const signer = await getSigner();
  if (!signer) return UserTypes.NEW_USER; // Default to new user if no wallet connected
  
  try {
    const admin_contract = new ethers.Contract(admin_address, contractABI, signer);
    const isAdmin = await admin_contract.admins(signer.address);
    
    if (isAdmin) return UserTypes.ADMIN;
    
    // You might want to add similar checks for validator and researcher here
    // For example:
    // const isValidator = await admin_contract.validators(signer.address);
    // if (isValidator) return UserTypes.VALIDATOR;
    
    // Default case if none of the above
    return UserTypes.NEW_USER;
  } catch (error) {
    console.error("Error checking user type:", error);
    return UserTypes.NEW_USER; // Default to new user on error
  }
};

export const checkWalletConnection = async () => {
  if (!window.ethereum) return false;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return false;
  }
};

// Listen for account changes
export const onAccountsChanged = (callback) => {
  if (!window.ethereum) return;
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  provider.on("accountsChanged", (accounts) => {
      callback(accounts[0] || null);
  });
};