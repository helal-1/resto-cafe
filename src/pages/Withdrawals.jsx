import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Withdrawals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [clients, setClients] = useState([]); // لتخزين قائمة العملاء للفلتر
    const [selectedClient, setSelectedClient] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);

        // 1. جلب السحوبات مع بيانات العملاء
        const { data: ordersData } = await supabase.from("orders").select(`id, drink_name, price, created_at, clients (id, name, phone)`).order("created_at", { ascending: false });

        // 2. جلب قائمة العملاء فقط لاستخدامها في الفلتر
        const { data: clientsData } = await supabase.from("clients").select("id, name");

        if (ordersData) setWithdrawals(ordersData);
        if (clientsData) setClients(clientsData);

        setLoading(false);
    };

    // فلترة البيانات بناءً على العميل المختار
    const filteredWithdrawals = selectedClient === "all" ? withdrawals : withdrawals.filter((w) => w.clients?.id === selectedClient);

    // حساب الإجمالي للبيانات المفلترة فقط
    const totalAmount = filteredWithdrawals.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    return (
        <div className="p-6 bg-gray-50 min-h-screen ml-64" dir="rtl">
            <div className="max-w-5xl mx-auto">
                {/* الرأس: العنوان والإجمالي */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">سجل السحوبات</h2>
                        <p className="text-gray-500 mt-1">إدارة وتتبع حسابات المشروبات</p>
                    </div>

                    <div className="bg-white border-2 border-green-500 p-4 rounded-2xl shadow-sm text-center min-w-[200px]">
                        <span className="block text-gray-500 text-sm mb-1 font-medium">إجمالي الحساب المفلتر</span>
                        <span className="text-3xl font-black text-green-600">
                            {totalAmount} <small className="text-sm">جنيه</small>
                        </span>
                    </div>
                </div>

                {/* شريط الفلترة */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4">
                    <label className="font-bold text-gray-700">تصفية حسب العميل:</label>
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}>
                        <option value="all">كل العملاء</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">جاري تحميل البيانات...</div>
                ) : (
                    <div className="grid gap-4">
                        {filteredWithdrawals.length === 0 ? (
                            <div className="bg-white p-10 text-center rounded-xl shadow-sm text-gray-400">لا توجد بيانات مسجلة لهذا الاختيار.</div>
                        ) : (
                            filteredWithdrawals.map((w) => (
                                <div key={w.id} className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-green-500 flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="font-bold text-xl text-gray-800">{w.clients?.name}</div>
                                        <div className="text-gray-600 flex gap-2 mt-1">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-sm">{w.drink_name}</span>
                                            <span className="text-gray-400 text-sm">{new Date(w.created_at).toLocaleDateString("ar-EG")}</span>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {w.price} <span className="text-xs text-gray-400">ج.م</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
