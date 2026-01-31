import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Withdrawals from "./pages/Withdrawals";
import Analytics from "./pages/Analytics";
import Clients from "./pages/Clients";

export default function App() {
    return (
        <Router>
            {/* رسالة تظهر فقط على الشاشات الصغيرة (الموبايل والتابلت) */}
            <div className="lg:hidden h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-900 text-white" dir="rtl">
                <div className="text-6xl mb-4">💻</div>
                <h1 className="text-2xl font-bold mb-2">عذراً، لوحة التحكم مخصصة للكمبيوتر فقط</h1>
                <p className="text-gray-400">يرجى تسجيل الدخول من جهاز كمبيوتر أو لاب توب للوصول إلى البيانات.</p>
            </div>

            {/* محتوى الموقع يظهر فقط من شاشات الـ LG (أجهزة الكمبيوتر) وما فوق */}
            <div className="hidden lg:flex min-h-screen">
                <Sidebar />
                <main className="flex-1 p-6 bg-gray-100">
                    <Routes>
                        <Route path="/" element={<Clients />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/withdrawals" element={<Withdrawals />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
