import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // ضيف السطر ده

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(), // ضيف السطر ده هنا
    ],
});
