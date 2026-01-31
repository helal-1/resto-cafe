import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ClientOrdersModal from "../components/ClientOrdersModal";
import AddClientModal from "../components/AddClientModal";
import { FaTrash, FaWhatsapp, FaUser, FaPhone, FaExclamationTriangle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [ordersModalOpen, setOrdersModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const CREDIT_LIMIT = 500; // سقف الائتمان المحدد

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

            if (error) throw error;

            const clientsWithTotal = await Promise.all(
                data.map(async (client) => {
                    const { data: orders, error: orderErr } = await supabase.from("orders").select("price").eq("client_id", client.id);
                    const total = orders?.reduce((sum, o) => sum + parseFloat(o.price), 0) || 0;
                    return { ...client, total };
                }),
            );

            setClients(clientsWithTotal);
        } catch (err) {
            console.error("Error fetching clients:", err);
            toast.error("حدث خطأ أثناء جلب العملاء");
        } finally {
            setLoading(false);
        }
    };

    const openOrders = (client, form = false) => {
        setSelectedClient(client);
        setOrdersModalOpen(true);
        setShowForm(form);
    };

    const fetchOrders = async (clientId) => {
        const { data, error } = await supabase.from("orders").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
        return data || [];
    };

    const generateWhatsAppMessage = async (client) => {
        const orders = await fetchOrders(client.id);
        if (!orders || orders.length === 0) return `مرحبًا ${client.name}،\nيرجى دفع الحساب.`;

        const total = orders.reduce((sum, o) => sum + parseFloat(o.price), 0);
        let message = `مرحبًا ${client.name}،\nيرجى دفع الحساب التالي:\n`;
        orders.forEach((o, i) => (message += `${i + 1}. ${o.drink_name} - ${o.price} جنيه\n`));
        message += `الإجمالي: ${total} جنيه\nشكرًا لتعاونك!`;
        return message;
    };

    const handleWhatsAppClick = async (client) => {
        const text = await generateWhatsAppMessage(client);
        let phone = client.phone.replace(/\D/g, "");
        if (phone.startsWith("0")) phone = "20" + phone.substring(1);
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    const handleDeleteClient = async (clientId) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا العميل وكل بياناته؟")) return;

        try {
            await supabase.from("orders").delete().eq("client_id", clientId);
            await supabase.from("clients").delete().eq("id", clientId);
            toast.success("تم حذف العميل بنجاح");
            fetchClients();
        } catch (err) {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    return (
        <div className="p-4 mt-5" dir="rtl">
            <ToastContainer position="top-right" autoClose={2000} />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">إدارة العملاء</h2>
                    <p className="text-sm text-gray-500">
                        حد الائتمان الحالي: <span className="font-bold text-red-600">{CREDIT_LIMIT} جنيه</span>
                    </p>
                </div>
                <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all">
                    إضافة عميل جديد
                </button>
            </div>

            {loading ? (
                <p className="text-center py-10">جاري تحميل العملاء...</p>
            ) : clients.length === 0 ? (
                <p className="text-center py-10">لا يوجد عملاء بعد</p>
            ) : (
                <div className="grid gap-4">
                    {clients.map((client) => {
                        const isOverLimit = client.total >= CREDIT_LIMIT;
                        const progress = Math.min((client.total / CREDIT_LIMIT) * 100, 100);

                        return (
                            <div
                                key={client.id}
                                className={`relative overflow-hidden bg-white rounded-xl shadow-sm border-r-4 p-4 transition-all hover:shadow-md ${isOverLimit ? "border-red-600 bg-red-50" : "border-green-500"}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        {/* بيانات العميل */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <FaUser className={isOverLimit ? "text-red-600" : "text-gray-400"} />
                                                <p className={`font-bold text-lg ${isOverLimit ? "text-red-800" : "text-gray-800"}`}>{client.name}</p>
                                                {isOverLimit && <FaExclamationTriangle className="text-red-600 animate-bounce" title="تجاوز الحد!" />}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FaPhone />
                                                <p>{client.phone}</p>
                                            </div>
                                        </div>

                                        {/* إجمالي الحساب */}
                                        <div className="text-center px-4 border-r border-l">
                                            <p className="text-xs text-gray-400 mb-1 font-medium">إجمالي المديونية</p>
                                            <span className={`text-xl font-black ${isOverLimit ? "text-red-600" : "text-green-700"}`}>
                                                {client.total} <small className="text-xs">ج.م</small>
                                            </span>
                                        </div>

                                        {/* شريط التقدم */}
                                        <div className="w-48 hidden md:block">
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span>الاستهلاك</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${isOverLimit ? "bg-red-600" : "bg-green-500"}`}
                                                    style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* الأزرار */}
                                    <div className="flex gap-2">
                                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" onClick={() => handleDeleteClient(client.id)} title="حذف">
                                            <FaTrash />
                                        </button>
                                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-all" onClick={() => openOrders(client)}>
                                            عرض الحساب
                                        </button>
                                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-all" onClick={() => openOrders(client, true)}>
                                            إضافة سحب
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-green-500 text-white rounded flex items-center gap-1 hover:bg-green-600 text-sm transition-all"
                                            onClick={() => handleWhatsAppClick(client)}>
                                            <FaWhatsapp /> واتس
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AddClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onClientAdded={fetchClients} />
            {selectedClient && <ClientOrdersModal isOpen={ordersModalOpen} onClose={() => setOrdersModalOpen(false)} client={selectedClient} showForm={showForm} />}
        </div>
    );
}
