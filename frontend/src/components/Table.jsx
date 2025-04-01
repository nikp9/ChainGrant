import { useState } from 'react';

function GrantsTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('allPools');

    const grantsData = [
        {
            id: "NIH-2023-001",
            name: "Cancer Research Initiative",
            agency: "National Institutes of Health",
            agencyShort: "NIH",
            budget: "$12.45M",
            budgetChange: "+5.2%",
            qtrExpenditure: "$2.18M",
            qtrChange: "+12.7%",
            ytdExpenditure: "$8.32M",
            ytdChange: "+3.4%",
            proposals: "84",
            successRate: "25%",
            fee: "0.3%"
        },
        {
            id: "NSF-2023-042",
            name: "Quantum Computing Advancement",
            agency: "National Science Foundation",
            agencyShort: "NSF",
            budget: "$8.75M",
            budgetChange: "-2.1%",
            qtrExpenditure: "$1.62M",
            qtrChange: "-5.3%",
            ytdExpenditure: "$5.91M",
            ytdChange: "-1.8%",
            proposals: "67",
            successRate: "10%",
            fee: "0.3%"
        },
        {
            id: "DOE-2023-156",
            name: "Renewable Energy Solutions",
            agency: "Department of Energy",
            agencyShort: "DOE",
            budget: "$15.20M",
            budgetChange: "+8.9%",
            qtrExpenditure: "$3.45M",
            qtrChange: "+22.1%",
            ytdExpenditure: "$10.12M",
            ytdChange: "+7.3%",
            proposals: "112",
            successRate: "31%",
            fee: "0.3%"
        },
        {
            id: "DELTA-2023-008",
            name: "Climate Change Mitigation Research",
            agency: "Environmental Protection Agency",
            agencyShort: "EPA",
            budget: "$5.35M",
            budgetChange: "0.0%",
            qtrExpenditure: "$1.23M",
            qtrChange: "-10.0%",
            ytdExpenditure: "$2.70M",
            ytdChange: "+7.92%",
            proposals: "35",
            successRate: "15%",
            fee: "0.3%"
        }
    ];

    const filteredGrants = grantsData.filter(grant => 
        grant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.agency.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Generate a color based on agency name for consistent agency circles
    const getAgencyColor = (agency) => {
        const colors = {
            'NIH': 'bg-blue-500',
            'NSF': 'bg-yellow-500',
            'DOE': 'bg-green-500',
            'EPA': 'bg-red-500',
            'default': 'bg-purple-500'
        };
        
        return colors[agency] || colors.default;
    };
    
    return (
        <>
            {/* Tabs for All Pools / Smart Pools */}
            <div className="flex space-x-4 mb-6">
                <button
                    className={`px-4 py-2 rounded-lg ${activeTab === 'allPools' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-400'}`} 
                    onClick={() => setActiveTab('allPools')}
                >
                    Ongoing
                </button>
                <button
                    className={`px-4 py-2 rounded-lg ${activeTab === 'smartPools' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-400'}`}
                    onClick={() => setActiveTab('smartPools')}
                >
                    Completed
                </button>
            </div>
                        
            {/* Search and Filters Row - made more compact */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-[#1e293b] border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Filters - made more compact */}
                <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-lg bg-[#161b29] text-white hover:bg-gray-800 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                        Research Area
                    </button>
                    
                    <button className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-lg bg-[#161b29] text-white hover:bg-gray-800 text-sm">
                        <span className="flex items-center">
                            <div className="w-3 h-3 mr-2 rounded-full bg-blue-500"></div>
                            New
                        </span>
                    </button>
                    
                    <button className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-lg bg-[#161b29] text-white hover:bg-gray-800 text-sm">
                        <span className="flex items-center">
                            <div className="w-3 h-3 mr-2 rounded-full bg-yellow-500"></div>
                            In-Progress
                        </span>
                    </button>
                </div>
            </div>
            
            
            {/* Table - made more compact */}
            <div className="bg-[#0f172a] border border-gray-700 rounded-md overflow-hidden shadow-sm w-full">

                {/* Pools Counter */}
                <div className="mb-4 flex px-4 py-4 items-center border-b-[1px] border-opacity-50 border-gray-600">
                    <h2 className="text-lg font-medium text-white mr-1">Projects </h2>
                    <p className="text-lg font-medium text-gray-400">({filteredGrants.length})</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-800">
                                <th className="py-3 px-4 text-sm">Name</th>
                                <th className="py-3 px-4 text-sm">TVL</th>
                                <th className="py-3 px-4 text-sm">Volume (24h)</th>
                                <th className="py-3 px-4 text-sm">Volume (1w)</th>
                                <th className="py-3 px-4 text-sm">Txns</th>
                                <th className="py-3 px-4 text-sm">APR</th>
                                <th className="py-3 px-4 text-sm"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGrants.map((grant, index) => (
                                <tr key={index} className="border-b border-gray-800 hover:bg-[#182032] pointer:hand">
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium text-white text-sm">{grant.name}</div>
                                            <div className="flex space-x-1 mt-1">
                                                <div className="text-xs px-1 rounded bg-[#212b3f] text-gray-400">v2</div>
                                                <div className="text-xs px-1 rounded bg-[#212b3f] text-gray-400">{grant.fee}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-white text-sm">{grant.budget}</div>
                                        <div className={`text-xs ${grant.budgetChange.startsWith('+') ? 'text-green-500' : grant.budgetChange.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                            {grant.budgetChange}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-white text-sm">{grant.qtrExpenditure}</div>
                                        <div className={`text-xs ${grant.qtrChange.startsWith('+') ? 'text-green-500' : grant.qtrChange.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                            {grant.qtrChange}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-white text-sm">{grant.ytdExpenditure}</div>
                                        <div className={`text-xs ${grant.ytdChange.startsWith('+') ? 'text-green-500' : grant.ytdChange.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                            {grant.ytdChange}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-white font-medium text-sm">{grant.proposals}</td>
                                    <td className="py-3 px-4 text-white font-medium text-sm">{grant.successRate}</td>
                                    <td className="py-3 px-4">
                                        <button className="text-gray-400 hover:text-white">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default GrantsTable;