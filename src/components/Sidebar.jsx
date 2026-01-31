import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "../lib/supabase"; // تأكد من صحة مسار ملف supabase
import { UsersIcon, DocumentChartBarIcon, BanknotesIcon, ArrowLeftOnRectangleIcon, FireIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
    const [userLabel, setUserLabel] = useState("جاري التحميل...");

    // جلب بيانات المستخدم عند تحميل المكون
    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user && user.email) {
                // استخراج الاسم من الإيميل (mohamed@cafe.com تصبح mohamed)
                const name = user.email.split("@")[0];
                setUserLabel(name);
            }
        };
        getUser();
    }, []);

    // دالة تسجيل الخروج
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Error logging out:", error.message);
    };

    const menuItems = [
        { to: "/", icon: UsersIcon, label: "إدارة العملاء" },
        { to: "/withdrawals", icon: BanknotesIcon, label: "سجلات السحوبات" },
        { to: "/analytics", icon: DocumentChartBarIcon, label: "التحليلات المالية" },
    ];

    return (
        <aside className="fixed top-0 left-0 w-72 h-screen bg-[#0f172a] text-white p-6 flex flex-col z-50 shadow-2xl border-r border-white/5" dir="rtl">
            {/* Logo Section */}
            <div className="flex items-center gap-4 mb-12 px-2">
                <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 relative z-10">
                        <FireIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-white uppercase leading-none">
                        Resto <span className="text-blue-400">Cafe</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-bold tracking-[2px] mt-1">DASHBOARD V2</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1">
                <p className="text-[10px] font-black text-gray-600 mb-6 px-4 tracking-[3px] uppercase">القائمة الرئيسية</p>
                <ul className="flex flex-col gap-3">
                    {menuItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                                        isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-2" : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-2"
                                    }`
                                }>
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <item.icon className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-white" : "group-hover:text-blue-400"}`} />
                                            <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                        </div>
                                        {isActive && <SparklesIcon className="w-4 h-4 text-blue-200 animate-pulse" />}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Card - User Profile & Logout */}
            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="bg-gradient-to-br from-gray-800/40 to-transparent p-5 rounded-[2rem] border border-white/5 group hover:border-blue-500/30 transition-all duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black border border-blue-500/30 uppercase">{userLabel.charAt(0)}</div>
                        <div>
                            <p className="text-xs font-black text-white capitalize tracking-wide">{userLabel}</p>
                            <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                                نشط الآن
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                        <ArrowLeftOnRectangleIcon className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
                        خروج من النظام
                    </button>
                </div>
            </div>
        </aside>
    );
}
