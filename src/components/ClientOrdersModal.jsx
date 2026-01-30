import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientOrdersModal({ isOpen, onClose, client, showForm }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drinkName, setDrinkName] = useState("");
    const [price, setPrice] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (client && isOpen) fetchOrders();
    }, [client, isOpen]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("orders").select("*").eq("client_id", client.id).order("created_at", { ascending: false });

            if (error) throw error;
            setOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast.error("حدث خطأ أثناء جلب السحوبات");
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrder = async (e) => {
        e.preventDefault();
        if (!drinkName || !price) return;

        setAdding(true);
        try {
            const { error } = await supabase.from("orders").insert([
                {
                    client_id: client.id,
                    drink_name: drinkName,
                    price: parseFloat(price),
                },
            ]);
            if (error) throw error;
            toast.success("تم إضافة السحب بنجاح");
            setDrinkName("");
            setPrice("");
            fetchOrders();
        } catch (err) {
            console.error("Error adding order:", err);
            toast.error("حدث خطأ أثناء الإضافة");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!orderId) return toast.error("خطأ: لا يوجد ID للحذف");
        const confirmDelete = toast.success("هل أنت متأكد من حذف هذا السحب؟");
        if (!confirmDelete) return;

        try {
            const { error } = await supabase.from("orders").delete().eq("id", orderId);
            if (error) throw error;
            toast.success("تم حذف السحب");
            fetchOrders();
        } catch (err) {
            console.error("Error deleting order:", err);
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const total = orders.reduce((sum, o) => sum + parseFloat(o.price), 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
            <ToastContainer position="top-right" autoClose={2000} />
            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto transform transition-transform duration-300 scale-95 animate-scaleUp">
                <h2 className="text-xl font-bold mb-4">حساب {client.name}</h2>

                {showForm && (
                    <form onSubmit={handleAddOrder} className="flex gap-2 mb-4 items-center">
                        <input type="text" placeholder="اسم المشروب" value={drinkName} onChange={(e) => setDrinkName(e.target.value)} className="flex-1 border rounded p-2" required />
                        <input type="number" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} className="w-20 border rounded p-2" required />
                        <button type="submit" disabled={adding} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all">
                            {adding ? "جاري الإضافة..." : "إضافة"}
                        </button>
                    </form>
                )}

                {loading ? (
                    <p>جاري تحميل الحساب...</p>
                ) : orders.length === 0 ? (
                    <p>لا يوجد سحوبات حتى الآن</p>
                ) : (
                    <div className="space-y-2">
                        {orders.map((order, index) => (
                            <div key={order.id ?? `${client.id}-${index}`} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 transition-all">
                                <span>{order.drink_name}</span>
                                <span className="flex items-center gap-2">
                                    <span>{order.price} جنيه</span>
                                    <button onClick={() => handleDeleteOrder(order.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-all">
                                        حذف
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* الإجمالي */}
                <div className="mt-4 border-t pt-3 flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-green-700">{total} جنيه</span>
                </div>

                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-all">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}
