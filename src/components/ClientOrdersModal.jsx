import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast, ToastContainer } from "react-toastify";
import { FaCoffee, FaMoneyBillWave, FaTrashAlt, FaTimes, FaPlusCircle, FaHistory } from "react-icons/fa";
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
            const { error } = await supabase.from("orders").insert([{ client_id: client.id, drink_name: drinkName, price: parseFloat(price) }]);
            if (error) throw error;
            toast.success("تم إضافة السحب بنجاح");
            setDrinkName("");
            setPrice("");
            fetchOrders();
        } catch (err) {
            toast.error("حدث خطأ أثناء الإضافة");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("هل تريد حذف هذا السحب؟")) return;
        try {
            const { error } = await supabase.from("orders").delete().eq("id", orderId);
            if (error) throw error;
            toast.success("تم الحذف");
            fetchOrders();
        } catch (err) {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const total = orders.reduce((sum, o) => sum + parseFloat(o.price), 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}></div>
            <ToastContainer position="top-right" autoClose={2000} />

            <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col transform transition-all border border-white" dir="rtl">
                {/* Header */}
                <div className="bg-white border-b p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <FaHistory size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800">حساب {client.name}</h2>
                            <p className="text-xs text-gray-500">سجل المسحوبات والطلبات</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form Section */}
                {showForm && (
                    <div className="p-5 bg-white border-b shadow-sm">
                        <form onSubmit={handleAddOrder} className="flex gap-2">
                            <div className="relative flex-1">
                                <FaCoffee className="absolute right-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="اسم المشروب"
                                    value={drinkName}
                                    onChange={(e) => setDrinkName(e.target.value)}
                                    className="w-full pr-10 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50"
                                    required
                                />
                            </div>
                            <div className="relative w-28">
                                <FaMoneyBillWave className="absolute right-3 top-3.5 text-gray-400" />
                                <input
                                    type="number"
                                    placeholder="السعر"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full pr-9 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50 text-center font-bold"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={adding}
                                className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center min-w-[50px] shadow-lg shadow-green-100">
                                {adding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FaPlusCircle size={22} />}
                            </button>
                        </form>
                    </div>
                )}

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p>جاري جلب البيانات...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-lg italic">لا توجد سحوبات مسجلة لهذا العميل</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">#</span>
                                        <span className="font-semibold text-gray-700">{order.drink_name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-blue-600">{order.price} ج.م</span>
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Total */}
                <div className="p-6 bg-white border-t">
                    <div className="flex justify-between items-center bg-gray-900 p-4 rounded-2xl text-white shadow-xl">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs uppercase tracking-wider">إجمالي الحساب المطلوب</span>
                            <span className="text-2xl font-black">{total} جنيه</span>
                        </div>
                        <button onClick={onClose} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold text-sm border border-white/10">
                            إغلاق النافذة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
