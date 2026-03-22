import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import AstrologyView from "./components/Astrology/AstrologyView";
import PalmistryView from "./components/Palmistry/PalmistryView";
import TarotView from "./components/Tarot/TarotView";
import { useTarot } from "./hooks/useTarot";

const App = () => {
  const [currentView, setCurrentView] = useState("home");
  const tarotHook = useTarot(); // [Controller] สำหรับหน้า Tarot

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col items-center p-6 relative overflow-hidden font-serif">
      {/* Background Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header
        className="text-center mb-12 z-10 cursor-pointer"
        onClick={() => setCurrentView("home")}
      >
        <h1 className="text-5xl font-bold bg-gradient-to-b from-amber-200 to-amber-600 bg-clip-text text-transparent mb-2">
          🔮 The Oracle Portal
        </h1>
        <p className="text-slate-500 text-xs uppercase tracking-[0.5em]">
          Digital Wisdom & Divination
        </p>
      </header>

      {/* Main Navigation / Routing */}
      <main className="w-full flex justify-center z-10">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
            >
              <MenuCard
                title="ไพ่ยิปซี (Tarot)"
                icon="🎴"
                desc="เปิดไพ่พยากรณ์ชะตาชีวิต"
                color="border-amber-500/30"
                onClick={() => setCurrentView("tarot")}
              />
              <MenuCard
                title="โหราศาสตร์ (Astrology)"
                icon="♈"
                desc="ผูกดวงจากวันเดือนปีเกิด"
                color="border-indigo-500/30"
                onClick={() => setCurrentView("astrology")}
              />
              <MenuCard
                title="ดูลายมือ (Palmistry)"
                icon="✋"
                desc="วิเคราะห์เส้นวาสนาด้วย AI"
                color="border-emerald-500/30"
                onClick={() => setCurrentView("palmistry")}
              />
            </motion.div>
          )}

          {currentView === "tarot" && (
            <TarotView key="tarot" tarotHook={tarotHook} />
          )}
          {currentView === "astrology" && <AstrologyView key="astro" />}
          {currentView === "palmistry" && <PalmistryView key="palm" />}
        </AnimatePresence>
      </main>

      {/* Back Button */}
      {currentView !== "home" && (
        <button
          onClick={() => setCurrentView("home")}
          className="mt-12 text-slate-500 hover:text-amber-500 transition-colors text-sm uppercase tracking-widest"
        >
          ← Back to Main Menu
        </button>
      )}

      <footer className="fixed bottom-6 text-slate-700 text-[10px] tracking-[0.4em] uppercase z-10 text-center w-full">
        Oracle Portal • Powered by Rawikarn (oYai) • © 2026
      </footer>
    </div>
  );
};

// Sub-component สำหรับเมนูหลัก
const MenuCard = ({ title, icon, desc, color, onClick }) => (
  <div
    onClick={onClick}
    className={`p-10 bg-white/5 border ${color} rounded-[2.5rem] cursor-pointer hover:bg-white/10 transition-all hover:scale-105 text-center group`}
  >
    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;
