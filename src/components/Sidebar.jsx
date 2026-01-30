import { NavLink } from "react-router-dom";
import { UsersIcon, DocumentChartBarIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
    return (
        <aside className="fixed top-0 left-0 w-64 h-screen bg-gray-900 text-white p-6 flex flex-col z-50">
            <h1 className="text-2xl font-bold mb-8 tracking-wider">Caffe Resto</h1>

            <ul className="flex flex-col gap-3">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                                isActive ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105" : "hover:bg-gray-800 hover:text-blue-400 hover:scale-105"
                            }`
                        }>
                        <UsersIcon className="w-5 h-5" />
                        <span>العملاء</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/analytics"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                                isActive ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105" : "hover:bg-gray-800 hover:text-blue-400 hover:scale-105"
                            }`
                        }>
                        <DocumentChartBarIcon className="w-5 h-5" />
                        <span>التحليلات</span>
                    </NavLink>
                </li>
            </ul>
        </aside>
    );
}
