import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Analytics from "./pages/Analytics";
import Clients from "./pages/Clients";

export default function App() {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                <Routes>
                    <Route path="/" element={<Clients />} />
                    <Route path="/analytics" element={<Analytics />} />
                </Routes>
            </main>
        </div>
    );
}
