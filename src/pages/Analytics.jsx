import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Chart.js imports
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Filler } from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import { UsersIcon, CurrencyDollarIcon, DocumentChartBarIcon } from "@heroicons/react/24/outline";

// تسجيل كل مكونات ChartJS
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
            const { data: clientsData, error: clientsError } = await supabase.from("clients").select("*");
            if (clientsError) throw clientsError;

            const { data: ordersData, error: ordersError } = await supabase.from("orders").select("*");
            if (ordersError) throw ordersError;

            setClients(clientsData || []);
            setOrders(ordersData || []);
        } catch (err) {
            console.error("Error fetching analytics data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Metrics
    const totalClients = clients.length;
    const totalOrders = orders.length;
    const totalDue = orders.reduce((sum, o) => sum + parseFloat(o.price), 0);

    // Pie Chart: Paid vs Unpaid
    const paidOrders = orders.filter((o) => o.paid);
    const unpaidOrders = orders.filter((o) => !o.paid);
    const pieData = {
        labels: ["مدفوعة", "غير مدفوعة"],
        datasets: [
            {
                data: [paidOrders.length, unpaidOrders.length],
                backgroundColor: ["#10B981", "#EF4444"],
                hoverBackgroundColor: ["#059669", "#B91C1C"],
            },
        ],
    };

    // Bar Chart: Orders per client
    const clientsLabels = clients.map((c) => c.name);
    const ordersPerClient = clients.map((c) => orders.filter((o) => o.client_id === c.id).length);
    const barData = {
        labels: clientsLabels,
        datasets: [
            {
                label: "عدد السحوبات لكل عميل",
                data: ordersPerClient,
                backgroundColor: "#3B82F6",
                borderRadius: 4,
            },
        ],
    };

    // Line Chart: Monthly total
    const monthlyTotals = {};
    orders.forEach((order) => {
        const month = new Date(order.created_at).toLocaleString("default", { month: "short", year: "numeric" });
        monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(order.price);
    });
    const lineLabels = Object.keys(monthlyTotals).sort((a, b) => new Date(a) - new Date(b));
    const lineData = {
        labels: lineLabels,
        datasets: [
            {
                label: "المبالغ الشهرية",
                data: lineLabels.map((m) => monthlyTotals[m]),
                fill: true,
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return null;
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
                    gradient.addColorStop(1, "rgba(59, 130, 246, 0.7)");
                    return gradient;
                },
                borderColor: "#3B82F6",
                tension: 0.3,
                pointRadius: 4,
            },
        ],
    };

    return (
        <div className="p-6 space-y-6 w-300 ml-68 mt-5">
            <h1 className="text-3xl font-bold mb-4">لوحة الإحصائيات</h1>

            {loading ? (
                <p>جاري تحميل البيانات...</p>
            ) : (
                <>
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                            <UsersIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-500">عدد العملاء</p>
                                <p className="text-xl font-bold">{totalClients}</p>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                            <DocumentChartBarIcon className="w-8 h-8 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-500">عدد السحوبات</p>
                                <p className="text-xl font-bold">{totalOrders}</p>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                            <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-500">إجمالي الحسابات</p>
                                <p className="text-xl font-bold">{totalDue} جنيه</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg p-4">
                            <h2 className="font-semibold mb-2">توزيع السحوبات (مدفوعة / غير مدفوعة)</h2>
                            <Doughnut data={pieData} />
                        </div>

                        <div className="bg-white shadow rounded-lg p-4">
                            <h2 className="font-semibold mb-2">عدد السحوبات لكل عميل</h2>
                            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        </div>

                        <div className="bg-white shadow rounded-lg p-4 md:col-span-2">
                            <h2 className="font-semibold mb-2">التطور الشهري للمبالغ</h2>
                            <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: true } }, interaction: { mode: "index", intersect: false } }} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
