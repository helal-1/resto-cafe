import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase"; // تأكد من المسار
import Sidebar from "./components/Sidebar";
import Withdrawals from "./pages/Withdrawals";
import Analytics from "./pages/Analytics";
import Clients from "./pages/Clients";
import Login from "./pages/Login";

export default function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. التحقق من الجلسة عند فتح التطبيق
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // 2. الاستماع لتغيرات حالة الدخول (تسجيل دخول أو خروج)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // أثناء التحقق من الجلسة، لا تظهر شيئاً أو أظهر علامة تحميل
    if (loading) {
        return <div className="h-screen bg-[#0f172a] flex items-center justify-center text-white text-xl font-bold font-sans">جاري تشغيل النظام...</div>;
    }

    return (
        <Router>
            {/* رسالة تظهر فقط على الشاشات الصغيرة */}
            <div className="lg:hidden h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-900 text-white" dir="rtl">
                <div className="text-6xl mb-4">💻</div>
                <h1 className="text-2xl font-bold mb-2">عذراً، لوحة التحكم مخصصة للكمبيوتر فقط</h1>
                <p className="text-gray-400">يرجى تسجيل الدخول من جهاز كمبيوتر للوصول إلى البيانات.</p>
            </div>

            {/* منطق الحماية والدخول */}
            <div className="hidden lg:block min-h-screen">
                {!session ? (
                    // إذا لم يكن هناك جلسة، لا يوجد سوى صفحة تسجيل الدخول
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                ) : (
                    // إذا سجل دخوله، تظهر لوحة التحكم مع السايدبار
                    <div className="flex">
                        <Sidebar />
                        <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
                            {/* تم إضافة ml-72 لأن السايدبار يسار وثابت */}
                            <Routes>
                                <Route path="/" element={<Clients />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/withdrawals" element={<Withdrawals />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                    </div>
                )}
            </div>
        </Router>
    );
}
