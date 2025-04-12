// Navbar.jsx
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { connectWallet, switchAccounts, getCurrentAccount } from './walletUtils';

function Navbar() {
  const [walletAddress, setWalletAddress] = useState(null);

  // Check initial connection
  useEffect(() => {
    const checkConnection = async () => {
      const address = await getCurrentAccount();
      setWalletAddress(address);
    };
    checkConnection();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setWalletAddress(accounts[0] || null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const handleWalletClick = async () => {
    try {
      if (walletAddress) {
        // Already connected - switch accounts
        const newAddress = await switchAccounts();
        if (newAddress) {
          setWalletAddress(newAddress);
        }
      } else {
        // Not connected - connect wallet
        const address = await connectWallet();
        setWalletAddress(address);
      }
    } catch (error) {
      console.error("Wallet action failed:", error);
    }
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  };

  return (
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
      <style jsx>{`
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
  )
}

export default Navbar;