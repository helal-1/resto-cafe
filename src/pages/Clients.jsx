import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ClientOrdersModal from "../components/ClientOrdersModal";
import AddClientModal from "../components/AddClientModal";
import { FaTrash, FaWhatsapp, FaUser, FaPhone } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [ordersModalOpen, setOrdersModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

            if (error) throw error;

            // احسب الإجمالي لكل عميل
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

        if (error) {
            console.error("Error fetching orders:", error);
            return [];
        }
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

        // تحويل الرقم للصيغة الدولية
        let phone = client.phone.replace(/\D/g, ""); // إزالة أي رموز أو مسافات
        if (phone.startsWith("0")) {
            phone = "20" + phone.substring(1); // مصر: استبدال 0 بـ 20
        }

        // فتح واتس آب
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    const handleDeleteClient = async (clientId) => {
        if (!clientId) return toast.error("خطأ: لا يوجد ID للحذف");

        const confirmDelete = toast.success("هل أنت متأكد من حذف هذا العميل وكل بياناته؟");
        if (!confirmDelete) return;

        try {
            const { error: orderError } = await supabase.from("orders").delete().eq("client_id", clientId);
            if (orderError) throw orderError;

            const { error: clientError } = await supabase.from("clients").delete().eq("id", clientId);
            if (clientError) throw clientError;

            toast.success("تم حذف العميل بنجاح");
            fetchClients();
        } catch (err) {
            console.error("Error deleting client:", err);
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    return (
        <div className="p-4  w-300 ml-64 mt-5" dir="rtl">
            <ToastContainer position="top-right" autoClose={2000} />
            <div className="flex justify-between items-center mb-4 ">
                <h2 className="text-2xl font-bold">العملاء</h2>
                <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all">
                    إضافة عميل جديد
                </button>
            </div>

            {loading ? (
                <p>جاري تحميل العملاء...</p>
            ) : clients.length === 0 ? (
                <p>لا يوجد عملاء بعد</p>
            ) : (
                <div className="bg-white rounded shadow ">
                    {clients.map((client) => (
                        <div key={client.id} className="flex justify-between items-center p-4 border-b transition-all hover:bg-gray-50">
                            {/* اليسار: أيقونات + بيانات العميل */}
                            <div className="flex items-center gap-4">
                                {/* حذف */}
                                <button onClick={() => handleDeleteClient(client.id)} title="حذف العميل">
                                    <FaTrash className="text-red-600 hover:text-red-800 text-xl transition-colors" />
                                </button>

                                {/* أيقونة العميل + الاسم */}
                                <div className="flex items-center gap-1">
                                    <FaUser className="text-gray-600" />
                                    <p className="font-semibold">{client.name}</p>
                                </div>

                                {/* أيقونة الهاتف + الرقم */}
                                <div className="flex items-center gap-1">
                                    <FaPhone className="text-gray-600" />
                                    <p className="text-sm text-gray-500">{client.phone}</p>
                                </div>

                                {/* إجمالي الحساب */}
                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded text-sm font-medium">{client.total} جنيه</span>
                            </div>

                            {/* اليمين: الأزرار */}
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all" onClick={() => openOrders(client)}>
                                    عرض الحساب
                                </button>
                                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all" onClick={() => openOrders(client, true)}>
                                    إضافة سحب
                                </button>
                                <button className="px-3 py-1 bg-green-500 text-white rounded flex items-center gap-1 hover:bg-green-600 transition-all" onClick={() => handleWhatsAppClick(client)}>
                                    <FaWhatsapp /> واتس
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onClientAdded={fetchClients} />

            {selectedClient && <ClientOrdersModal isOpen={ordersModalOpen} onClose={() => setOrdersModalOpen(false)} client={selectedClient} showForm={showForm} />}
        </div>
    );
}
