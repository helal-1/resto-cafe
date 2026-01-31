import { useState } from "react";
import { supabase } from "../lib/supabase";
import { FaUserPlus, FaUser, FaPhoneAlt, FaTimes } from "react-icons/fa";

export default function AddClientModal({ isOpen, onClose, onClientAdded }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.from("clients").insert([{ name, phone }]);

        setLoading(false);

        if (error) {
            alert("حدث خطأ: " + error.message);
        } else {
            setName("");
            setPhone("");
            onClose();
            onClientAdded();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* الخلفية المضببة (Overlay) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* محتوى المودال */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all overflow-hidden border border-gray-100" dir="rtl">
                {/* الرأس (Header) */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <FaUserPlus className="text-xl" />
                        </div>
                        <h2 className="text-xl font-bold">إضافة عميل جديد</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* النموذج (Form) */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* حقل الاسم */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                            <FaUser className="text-green-600" size={14} />
                            اسم العميل
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="أدخل الاسم الرباعي..."
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                        />
                    </div>

                    {/* حقل الهاتف */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                            <FaPhoneAlt className="text-green-600" size={14} />
                            رقم الهاتف
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="01xxxxxxxxx"
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 placeholder:text-gray-400 text-left"
                        />
                    </div>

                    {/* الأزرار (Actions) */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 active:transform active:scale-95 transition-all shadow-lg shadow-green-200 disabled:bg-gray-400 disabled:shadow-none">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    جاري الحفظ...
                                </span>
                            ) : (
                                "إضافة العميل"
                            )}
                        </button>

                        <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
