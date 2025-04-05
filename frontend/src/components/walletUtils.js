// walletUtils.js
export const connectWallet = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    
    const accounts = await window.ethereum.request({ 
      method: "eth_requestAccounts" 
    });
    return accounts[0] || null;
  };
  
  export const switchAccounts = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    
    try {
      // This will always trigger the account switcher
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });
      
      // Get the new account after switching
      const accounts = await window.ethereum.request({ 
        method: "eth_accounts" 
      });
      return accounts[0] || null;
    } catch (error) {
      // User rejected the request
      return null;
    }
  };
  
  export const getCurrentAccount = async () => {
    if (!window.ethereum) return null;
    const accounts = await window.ethereum.request({ 
      method: "eth_accounts" 
    });
    return accounts[0] || null;
  };