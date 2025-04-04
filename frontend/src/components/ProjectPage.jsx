import { motion } from 'framer-motion';

function ProjectPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Project Header Section */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#2d3748] p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          {/* Left Column - Project Info */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Decentralized Climate Research</h1>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-gray-400 text-sm">Application Deadline</p>
                <p className="text-white font-medium">May 15, 2024</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Funding Available</p>
                <p className="text-white font-medium">$250,000</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Research Duration</p>
                <p className="text-white font-medium">12 Months</p>
              </div>
            </div>
          </div>

          {/* Right Column - Apply Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Apply for Funding
          </motion.button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Funding */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4">
          <p className="text-gray-400 text-sm">Total Funding</p>
          <p className="text-2xl font-bold text-white">$1.2M</p>
        </div>

        {/* Projects Funded */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4">
          <p className="text-gray-400 text-sm">Projects Funded</p>
          <p className="text-2xl font-bold text-white">24</p>
        </div>

        {/* Current Round */}
        <div className="bg-[#1e293b] rounded-xl border border-[#2d3748] p-4">
          <p className="text-gray-400 text-sm">Current Round</p>
          <p className="text-2xl font-bold text-white">Q2 2024</p>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#2d3748] overflow-hidden mb-6">
        {/* Tabs */}
        <div className="flex border-b border-[#2d3748]">
          <button className="flex-1 py-4 text-center text-white font-medium border-b-2 border-blue-500">
            Overview
          </button>
          <button className="flex-1 py-4 text-center text-gray-400 font-medium">
            Requirements
          </button>
          <button className="flex-1 py-4 text-center text-gray-400 font-medium">
            Funded Projects
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Research Area</p>
                <p className="text-white">Climate Science & Blockchain Applications</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Grant Type</p>
                <p className="text-white">Open Competition</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Eligibility</p>
                <p className="text-white">Academic Institutions & Research Organizations</p>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Funding Mechanism</p>
                <p className="text-white">Milestone-based Disbursement</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Reporting Requirements</p>
                <p className="text-white">Quarterly Progress Reports</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Smart Contract Address</p>
                <p className="text-blue-400">0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#2d3748] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Funding Statistics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2d3748]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Metric</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">This Week</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">This Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">This Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">All Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3748]">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">Applications</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">12</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">42</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">156</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">892</td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">Funding Distributed</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">$28,500</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">$142,000</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">$820,000</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">$4.2M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;