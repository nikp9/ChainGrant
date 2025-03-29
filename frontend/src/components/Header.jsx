import { useState } from 'react';

function Header() {
    const [timeRange, setTimeRange] = useState('1M');

    return (
        <>
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Ethereum TVL Card */}
                <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
                    <h2 className="text-gray-400 text-sm mb-1">Ethereum TVL</h2>
                    <p className="text-2xl font-bold mb-1">$82.55m</p>
                    <p className="text-gray-400 text-xs">29 Mar 2025 05:30 AM</p>
                </div>

                {/* Time Range Selector */}
                <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
                    <h2 className="text-gray-400 text-sm mb-2">Year</h2>
                    <div className="flex flex-wrap gap-2">
                        {['2023', '2024', 'Apr 27', 'Aug 29', 'Dec 31', 'Mar 29'].map((time) => (
                            <button
                                key={time}
                                className={`px-3 py-1 text-xs rounded-md ${time === 'Mar 29' ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-gray-300'}`}
                                onClick={() => setTimeRange(time)}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ethereum Volume Card */}
                <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
                    <h2 className="text-gray-400 text-sm mb-1">Ethereum Volume</h2>
                    <p className="text-2xl font-bold mb-1">$116.62m</p>
                    <p className="text-gray-400 text-xs">Past month</p>
                </div>
            </div>
        </>
    )
}

export default Header;