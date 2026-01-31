import { useState } from "react";
import { supabase } from "../lib/supabase";
import { FireIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";

export default function Login() {
    const [username, setUsername] = useState(""); // استخدام username بدلاً من email
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // الخدعة: تحويل الاسم إلى إيميل وهمي ليقبله Supabase Auth
        const formattedEmail = `${username.trim().toLowerCase()}@cafe.com`;

        const { error } = await supabase.auth.signInWithPassword({
            email: formattedEmail,
            password,
        });

        if (error) {
            setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans" dir="rtl">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-block bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-500/20 mb-4">
                        <FireIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white">دخول النظام</h2>
                    <p className="text-gray-400 mt-2 text-sm italic">يرجى إدخال اسم المستخدم الخاص بك</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 mr-2 mb-2 block tracking-widest uppercase">اسم المستخدم</label>
                        <div className="relative group">
                            <UserIcon className="w-5 h-5 absolute right-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-12 pl-4 text-white focus:border-blue-500 transition-all outline-none"
                                placeholder="مثلاً: Admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 mr-2 mb-2 block tracking-widest uppercase">كلمة المرور</label>
                        <div className="relative group">
                            <LockClosedIcon className="w-5 h-5 absolute right-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="password"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-12 pl-4 text-white focus:border-blue-500 transition-all outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center py-3 rounded-xl animate-shake">{error}</div>}

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50">
                        {loading ? "جاري التحقق..." : "دخول النظام"}
                    </button>
                </form>
            </div>
        </div>
    );
}
