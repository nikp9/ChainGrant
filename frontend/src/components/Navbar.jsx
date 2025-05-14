// Navbar.jsx
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { connectWallet, switchAccounts, getCurrentAccount, getAdminContract, UserTypes, checkWalletConnection } from './walletUtils';
import { UserContext } from './UserContext';

function Navbar() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [userType, setUserType] = useState(UserTypes.NEW_USER);
  const [isConnected, setIsConnected] = useState(false);

  // Unified function to update wallet state
  const updateWalletState = async (address) => {
    setWalletAddress(address);
    setIsConnected(!!address);
    if (address) {
      const type = await getAdminContract();
      setUserType(type);
    } else {
      setUserType(UserTypes.NEW_USER);
    }
  };

  // Check initial connection
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkWalletConnection();
      if (!connected) {
        await updateWalletState(null);
        return;
      }
      const address = await getCurrentAccount();
      await updateWalletState(address);
    };
    checkConnection();

    // Setup event listeners
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // Wallet was disconnected
          await updateWalletState(null);
        } else {
          await updateWalletState(accounts[0]);
        }
      };
      
      const handleChainChanged = () => {
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', () => updateWalletState(null));
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', () => updateWalletState(null));
      };
    }
  }, []);

  const handleWalletClick = async () => {
    try {
      if (walletAddress) {
        // Already connected - switch accounts
        try {
          const newAddress = await switchAccounts();
          if (newAddress) {
            await updateWalletState(newAddress);
          }
        } catch (error) {
          console.error("Account switching failed:", error);
          // Handle switch error (optional: show user notification)
        }
      } else {
        // Not connected - connect wallet
        try {
          const address = await connectWallet();
          if (address) {
            await updateWalletState(address);
          }
        } catch (error) {
          console.error("Wallet connection failed:", error);
          // Handle connection error (optional: show user notification)
          await updateWalletState(null); // Ensure state is reset
        }
      }
    } catch (error) {
      console.error("Wallet action failed:", error);
      await updateWalletState(null); // Ensure state is reset on complete failure
    }
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  };

  return (
    <UserContext.Provider value={{ userType, walletAddress, updateWalletState }}>
      <nav className="bg-[#0f172a] p-3 w-full fixed border-b-[1px] border-opacity-50 border-gray-600 top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left Side: Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="font-bold text-3xl tracking-wide text-white font-sans">
              ChainGrant
            </div>
            
            {/* Navigation Links */}
            <div className="flex space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `px-3 py-2 font-medium rounded-lg transition-transform active:scale-95 ${
                    isActive ? 'text-white bg-[#374151]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/team"
                className={({ isActive }) => 
                  `px-3 py-2 font-medium rounded-lg transition-transform active:scale-95 ${
                    isActive ? 'text-white bg-[#374151]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Team
              </NavLink>
              <NavLink
                to="/project"
                className={({ isActive }) => 
                  `px-3 py-2 font-medium rounded-lg transition-transform active:scale-95 ${
                    isActive ? 'text-white bg-[#374151]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/guide"
                className={({ isActive }) => 
                  `px-3 py-2 font-medium rounded-lg transition-transform active:scale-95 ${
                    isActive ? 'text-white bg-[#374151]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Guide
              </NavLink>
            </div>
          </div>

          {/* Right Side: Notification Icon & Connect Wallet */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon with sideways wiggle effect */}
            <button className="text-gray-400 hover:text-white active:animate-wiggle">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>

            {/* Connect Wallet Button */}
            <button 
              onClick={handleWalletClick}
              className="px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600 
                        active:scale-95 active:bg-gray-500 transition-transform duration-75"
            >
              {walletAddress ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  {formatAddress(walletAddress)}
                </span>
              ) : "Connect Wallet"}
            </button>

          </div>
        </div>
        
        {/* Add the wiggle animation to your global CSS or in a style tag */}
        <style jsx = "true">{`
          @keyframes wiggle {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          .active\:animate-wiggle:active {
            animation: wiggle 0.2s ease-in-out;
          }
        `}</style>
      </nav>
    </UserContext.Provider>
  )
}

export default Navbar;