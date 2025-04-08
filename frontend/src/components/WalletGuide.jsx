// WalletGuide.jsx
import { motion } from 'framer-motion';
import { MetaMask, WalletConnect, CoinbaseWallet } from './WalletIcons'; // You'll need to create these icon components

function WalletGuide() {
  const steps = [
    {
      title: "1. Install a Web3 Wallet",
      content: "Download and install a compatible wallet like MetaMask, WalletConnect, or Coinbase Wallet on your device.",
      icon: <MetaMask className="w-20 h-20" />
    },
    {
      title: "2. Create or Import Wallet",
      content: "Set up a new wallet or import an existing one using your secret recovery phrase.",
      icon: <WalletConnect className="w-20 h-20" />
    },
    {
      title: "3. Connect to Research Grants",
      content: "Click the 'Connect Wallet' button in the top right corner of our platform.",
      icon: <CoinbaseWallet className="w-20 h-20" />
    },
    {
      title: "4. Select Your Wallet",
      content: "Choose your wallet provider from the popup options and approve the connection.",
      icon: <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>
    },
    {
      title: "5. Approve Connection",
      content: "Confirm the connection request in your wallet interface.",
      icon: <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
    }
  ];

  const supportedWallets = [
    { name: "MetaMask", link: "https://metamask.io" },
    { name: "WalletConnect", link: "https://walletconnect.com" },
    { name: "Coinbase Wallet", link: "https://wallet.coinbase.com" },
    { name: "Trust Wallet", link: "https://trustwallet.com" },
    { name: "Ledger", link: "https://ledger.com" }
  ];

  return (
    <div className="bg-[#141c2e] min-h-screen text-white pt-16">
        <div className="bg-[#0f172a] pb-6 border-b-[1px] border-opacity-50 border-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">Wallet Connection Guide</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Follow these simple steps to connect your crypto wallet and start interacting with research grants
            </p>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-16">
            {steps.map((step, index) => (
            <motion.div
                key={index}
                className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-6 hover:border-blue-500 transition-colors"
                whileHover={{ y: -4 }}
            >
                <div className="flex flex-col items-center text-center h-full">
                <div className="mb-4 text-blue-400">
                    {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300 flex-grow">{step.content}</p>
                </div>
            </motion.div>
            ))}
        </div>

        {/* Supported Wallets */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Supported Wallets</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {supportedWallets.map((wallet, index) => (
                <motion.a
                key={index}
                href={wallet.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#252f3f] rounded-lg p-4 flex items-center justify-center hover:bg-[#2d3748] transition-colors"
                whileHover={{ scale: 1.05 }}
                >
                <span className="text-white font-medium">{wallet.name}</span>
                </motion.a>
            ))}
            </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Why do I need a wallet?</h3>
                <p className="text-gray-300">
                Your crypto wallet acts as your digital identity and allows you to securely interact with blockchain-based research grants, submit proposals, and receive funding.
                </p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is there a cost to connect?</h3>
                <p className="text-gray-300">
                No, connecting your wallet is completely free. You only incur blockchain transaction fees when you interact with smart contracts.
                </p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">What chains are supported?</h3>
                <p className="text-gray-300">
                We currently support Ethereum, Polygon, and Arbitrum networks. More chains will be added soon.
                </p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is my wallet information secure?</h3>
                <p className="text-gray-300">
                Yes, we never access your private keys or funds. The connection is read-only for wallet addresses and required signatures.
                </p>
            </div>
            </div>
        </div>
        </div>
        </div>
    </div>    
  );
}

export default WalletGuide;