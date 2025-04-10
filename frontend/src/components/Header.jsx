import { motion } from 'framer-motion';

function Header() {
  const handleBrowseProjectsClick = () => {
    const element = document.getElementById('grants-table');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Cards - Compact style like token prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 - Total Grants */}
        <motion.div 
          className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4 hover:border-blue-500 transition-colors cursor-pointer"
          whileHover={{ y: -2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Grants</p>
              <p className="text-2xl font-bold text-white">$82.55M</p>
            </div>
            <p className="text-green-400 text-sm">▲ 1.33%</p>
          </div>
        </motion.div>

        {/* Card 2 - Active Projects */}
        <motion.div 
          className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4 hover:border-blue-500 transition-colors cursor-pointer"
          whileHover={{ y: -2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-white">142</p>
            </div>
            <p className="text-green-400 text-sm">▲ 12%</p>
          </div>
        </motion.div>

        {/* Card 3 - Institutions */}
        <motion.div 
          className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4 hover:border-blue-500 transition-colors cursor-pointer"
          whileHover={{ y: -2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Institutions</p>
              <p className="text-2xl font-bold text-white">36</p>
            </div>
            <p className="text-green-400 text-sm">▲ 5%</p>
          </div>
        </motion.div>

        {/* Card 4 - Transactions */}
        <motion.div 
          className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4 hover:border-blue-500 transition-colors cursor-pointer"
          whileHover={{ y: -2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-white">8,429</p>
            </div>
            <p className="text-green-400 text-sm">▲ 24%</p>
          </div>
        </motion.div>
      </div>

      {/* Core Features - Now in large cards like Uniswap */}
      {/* Core Features - Large cards with increased font sizes */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1 - Browse Projects */}
          <motion.div 
            className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-6 hover:border-blue-500 transition-colors cursor-pointer group"
            whileHover={{ y: -4 }}
            onClick={handleBrowseProjectsClick}
          >
            <div className="h-full flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-2xl font-bold text-white">Browse Projects</h3>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-blue-400 text-2xl"
                  >
                    →
                  </motion.div>
                </div>
                <p className="text-gray-300 text-lg mb-8">Discover funded research initiatives across all disciplines</p>
              </div>
              <div>
                <div className="text-blue-400 text-3xl font-bold mb-2">1,200+</div>
                <p className="text-gray-400 text-base">Active research listings</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 - Gasless Transactions */}
          <motion.div 
            className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-6 hover:border-blue-500 transition-colors cursor-pointer group"
            whileHover={{ y: -4 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-2xl font-bold text-white">Gasless Transactions</h3>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-blue-400 text-2xl"
                  >
                    →
                  </motion.div>
                </div>
                <p className="text-gray-300 text-lg mb-8">ERC-4337 powered, no crypto wallet needed</p>
              </div>
              <div>
                <div className="text-blue-400 text-3xl font-bold mb-2">$42.8M</div>
                <p className="text-gray-400 text-base">Total processed</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 - Transparent Grants */}
          <motion.div 
            className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-6 hover:border-blue-500 transition-colors cursor-pointer group"
            whileHover={{ y: -4 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-2xl font-bold text-white">Transparent Grants</h3>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-blue-400 text-2xl"
                  >
                    →
                  </motion.div>
                </div>
                <p className="text-gray-300 text-lg mb-8">Every transaction recorded on-chain</p>
              </div>
              <div>
                <div className="text-blue-400 text-3xl font-bold mb-2">128</div>
                <p className="text-gray-400 text-base">Projects funded</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 4 - Auto Disbursement */}
          <motion.div 
            className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-6 hover:border-blue-500 transition-colors cursor-pointer group"
            whileHover={{ y: -4 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-2xl font-bold text-white">Auto Disbursement</h3>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-blue-400 text-2xl"
                  >
                    →
                  </motion.div>
                </div>
                <p className="text-gray-300 text-lg mb-8">Smart contract powered milestone payments</p>
              </div>
              <div>
                <div className="text-blue-400 text-3xl font-bold mb-2">3.2d</div>
                <p className="text-gray-400 text-base">Avg approval time</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Header;