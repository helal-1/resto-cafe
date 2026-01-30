import { useState } from "react";
import { supabase } from "../lib/supabase";

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
            onClientAdded(); // لإعادة جلب الداتا في Clients.jsx
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0000005e] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">إضافة عميل جديد</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-semibold">الاسم</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="block font-semibold">رقم الهاتف</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full border rounded p-2" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                            إلغاء
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                            {loading ? "جاري الإضافة..." : "إضافة"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
