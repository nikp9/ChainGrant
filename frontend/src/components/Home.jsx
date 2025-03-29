// Home.jsx
import Header from "./Header.jsx";
import Table from "./Table.jsx";

function Home() {
    return (
        <div className="bg-[#141c2e] min-h-screen text-white pt-16">
            {/* Header Section with custom background */}
            <div className="bg-[#0f172a] pb-6 border-b-[1px] border-opacity-50 border-gray-600">
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <Header />
                </div>
            </div>
            
            {/* Table Section with different background */}
            <div className="bg-[#141c2e] pb-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Table />
                </div>
            </div>
        </div>
    );
}

export default Home;