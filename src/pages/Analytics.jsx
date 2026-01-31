import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Filler } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { UsersIcon, CurrencyDollarIcon, DocumentChartBarIcon, ArrowTrendingUpIcon, FireIcon, CakeIcon } from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Filler);

export default function Analytics() {
    const [clients, setClients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: clientsData } = await supabase.from("clients").select("*");
            const { data: ordersData } = await supabase.from("orders").select("*");
            setClients(clientsData || []);
            setOrders(ordersData || []);
        } catch (err) {
            console.error("Error fetching analytics data:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- الحسابات والمنطق ---

    const totalClients = clients.length;
    const totalOrders = orders.length;
    const totalDue = orders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0);

    // 1. حساب أكثر المشروبات طلباً (Top Products)
    const drinkCounts = {};
    orders.forEach((order) => {
        const name = order.drink_name ? order.drink_name.trim() : "غير محدد";
        drinkCounts[name] = (drinkCounts[name] || 0) + 1;
    });

    const topDrinksData = Object.entries(drinkCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 2. حساب أكثر العملاء مديونية (Top Debtors)
    const topDebtors = clients
        .map((client) => {
            const clientTotal = orders.filter((o) => o.client_id === client.id).reduce((sum, o) => sum + parseFloat(o.price || 0), 0);
            return { name: client.name, total: clientTotal };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    const maxDebt = Math.max(...topDebtors.map((d) => d.total), 1);

    // 3. النمو المالي الشهري
    const monthlyTotals = {};
    orders.forEach((order) => {
        const month = new Date(order.created_at).toLocaleString("ar-EG", { month: "short" });
        monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(order.price || 0);
    });

    // --- إعدادات الرسوم البيانية ---

    const productsChartData = {
        labels: topDrinksData.map((d) => d.name),
        datasets: [
            {
                label: "عدد مرات الطلب",
                data: topDrinksData.map((d) => d.count),
                backgroundColor: "rgba(245, 158, 11, 0.8)", // لون برتقالي كهرماني
                borderRadius: 8,
            },
        ],
    };

    const pieData = {
        labels: ["مدفوعة", "غير مدفوعة"],
        datasets: [
            {
                data: [orders.filter((o) => o.paid).length, orders.filter((o) => !o.paid).length],
                backgroundColor: ["#10B981", "#F43F5E"],
                borderWidth: 0,
                hoverOffset: 10,
            },
        ],
    };

    const lineData = {
        labels: Object.keys(monthlyTotals),
        datasets: [
            {
                label: "المبيعات (ج.م)",
                data: Object.values(monthlyTotals),
                fill: true,
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                pointBackgroundColor: "#3B82F6",
                pointRadius: 5,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { family: "Cairo", size: 12 } } } },
    };

    const horizontalBarOptions = {
        ...chartOptions,
        indexAxis: "y",
        plugins: { legend: { display: false } },
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-90%" dir="rtl">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">إحصائيات النظام</h1>
                <p className="text-gray-500 mt-2 text-lg">تحليل دقيق للمنتجات، العملاء، والتدفق المالي</p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* المربعات الإحصائية العلوية */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: "إجمالي العملاء", val: totalClients, icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-100" },
                            { label: "إجمالي السحوبات", val: totalOrders, icon: DocumentChartBarIcon, color: "text-purple-600", bg: "bg-purple-100" },
                            { label: "إجمالي الحسابات", val: `${totalDue.toLocaleString()} ج.م`, icon: CurrencyDollarIcon, color: "text-green-600", bg: "bg-green-100" },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                                <div>
                                    <p className="text-gray-400 font-bold text-sm mb-1">{item.label}</p>
                                    <p className="text-3xl font-black text-gray-800">{item.val}</p>
                                </div>
                                <div className={`${item.bg} ${item.color} p-4 rounded-2xl`}>
                                    <item.icon className="w-8 h-8" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* كارت أكثر المشروبات طلباً */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                                <CakeIcon className="w-6 h-6 text-amber-500" />
                                الأكثر طلباً (الأصناف)
                            </h2>
                            <div className="h-64">
                                <Bar data={productsChartData} options={horizontalBarOptions} />
                            </div>
                        </div>

                        {/* قائمة أكثر العملاء مديونية */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                    <FireIcon className="w-5 h-5 text-red-500" />
                                    أكثر العملاء مديونية
                                </h2>
                                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">تنبيه المديونية</span>
                            </div>

                            <div className="space-y-6">
                                {topDebtors.map((debtor, index) => (
                                    <div key={index} className="space-y-2 group">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{debtor.name}</span>
                                            <span className="font-black text-red-600">{debtor.total.toLocaleString()} ج.م</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-l from-red-600 to-red-400 h-full rounded-full transition-all duration-1000 ease-out shadow-sm shadow-red-100"
                                                style={{ width: `${(debtor.total / maxDebt) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                                {topDebtors.length === 0 && <p className="text-center text-gray-400 py-10">لا توجد بيانات</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* النمو المالي (يأخذ مساحة أكبر) */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
                            <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />
                                التطور المالي الشهري
                            </h2>
                            <div className="h-64">
                                <Line data={lineData} options={chartOptions} />
                            </div>
                        </div>

                        {/* توزيع الدفع */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-1">
                            <h2 className="text-lg font-bold text-gray-700 mb-6 text-center">حالة التحصيل</h2>
                            <div className="h-64 relative">
                                <Doughnut data={pieData} options={{ ...chartOptions, cutout: "75%" }} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-gray-800">{totalOrders}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">إجمالي الطلبات</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
