import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GrantsTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('allPools');
    const [grantsData, setGrantsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGrantsData = async () => {
            try {
                const response = await fetch('/data/grants.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch grants data');
                }
                const data = await response.json();
                setGrantsData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGrantsData();
    }, []);

    const filteredGrants = grantsData.filter(grant => 
        grant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.agency.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowClick = (grantId) => {
        navigate(`/projects/${grantId}`);
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-400">Loading grants data...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            {/* Tabs */}
            <div className="flex space-x-4 mb-8">
                <button
                    className={`px-6 py-3 rounded-xl text-lg font-medium ${
                        activeTab === 'allPools' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-transparent text-gray-400 hover:text-white'
                    } transition-colors`} 
                    onClick={() => setActiveTab('allPools')}
                >
                    Ongoing Grants
                </button>
                <button
                    className={`px-6 py-3 rounded-xl text-lg font-medium ${
                        activeTab === 'smartPools' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-transparent text-gray-400 hover:text-white'
                    } transition-colors`}
                    onClick={() => setActiveTab('smartPools')}
                >
                    Completed Grants
                </button>
            </div>
                        
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Search */}
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search grants..."
                        className="bg-[#1e293b] border-2 border-[#2d3748] rounded-xl pl-12 pr-4 py-3 text-base hover:ring-2 hover:ring-[#374151] focus:outline-none focus:ring-2 focus:ring-[#374151] w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Filters */}
                <div className="flex space-x-3">
                    <button className="inline-flex items-center px-5 py-3 border-2 border-[#2d3748] rounded-xl bg-[#1e293b] text-white hover:bg-[#2d3748] text-base font-medium transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                        Filters
                    </button>
                </div>
            </div>
            
            {/* Table */}
            <div className="bg-[#1e293b] border-2 border-[#2d3748] rounded-xl overflow-hidden shadow-lg">
                <div className="px-6 py-5 border-b-2 border-[#2d3748]">
                    <h2 className="text-xl font-semibold text-white">
                        Research Grants <span className="text-gray-400">({filteredGrants.length})</span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 border-b-2 border-[#2d3748]">
                                <th className="py-5 px-6 text-base font-medium">Research Project</th>
                                <th className="py-5 px-6 text-base font-medium">Total Budget</th>
                                <th className="py-5 px-6 text-base font-medium">Quarterly Spend</th>
                                <th className="py-5 px-6 text-base font-medium">YTD Spend</th>
                                <th className="py-5 px-6 text-base font-medium">Proposals</th>
                                <th className="py-5 px-6 text-base font-medium">Success Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGrants.map((grant) => (
                                <tr 
                                    key={grant.id} 
                                    className="border-b border-[#2d3748] hover:bg-[#252f3f] cursor-pointer transition-colors"
                                    onClick={() => handleRowClick(grant.id)}
                                >
                                    <td className="py-5 px-6">
                                        <div className="font-semibold text-white text-lg">{grant.name}</div>
                                        <div className="text-gray-400 text-sm mt-1">{grant.agency}</div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="font-semibold text-white text-lg">{grant.budget}</div>
                                        <div className={`text-sm ${
                                            grant.budgetChange.startsWith('+') 
                                                ? 'text-green-400' 
                                                : grant.budgetChange.startsWith('-') 
                                                    ? 'text-red-400' 
                                                    : 'text-gray-400'
                                        }`}>
                                            {grant.budgetChange}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="font-semibold text-white text-lg">{grant.qtrExpenditure}</div>
                                        <div className={`text-sm ${
                                            grant.qtrChange.startsWith('+') 
                                                ? 'text-green-400' 
                                                : grant.qtrChange.startsWith('-') 
                                                    ? 'text-red-400' 
                                                    : 'text-gray-400'
                                        }`}>
                                            {grant.qtrChange}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="font-semibold text-white text-lg">{grant.ytdExpenditure}</div>
                                        <div className={`text-sm ${
                                            grant.ytdChange.startsWith('+') 
                                                ? 'text-green-400' 
                                                : grant.ytdChange.startsWith('-') 
                                                    ? 'text-red-400' 
                                                    : 'text-gray-400'
                                        }`}>
                                            {grant.ytdChange}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-white font-semibold text-lg">{grant.proposals}</td>
                                    <td className="py-5 px-6 text-white font-semibold text-lg">{grant.successRate}</td>
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