import { Outlet } from "react-router-dom";

function PageLayout() {
    return (
        <div className="bg-[#141c2e] min-h-screen text-white pt-16">
            <div className="bg-[#0f172a] pb-6 border-b-[1px] border-opacity-50 border-gray-600">
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
}

export default PageLayout;