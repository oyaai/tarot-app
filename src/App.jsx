import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { tarotDeck } from "./data/tarot";

// --- 🛡️ SPECIALIST UTILITIES ---
const logger = {
  info: (tag, msg, data = "") =>
    console.log(
      `%c[${tag}] %c${msg}`,
      "color: #10b981; font-weight: bold",
      "color: #d1d5db",
      data,
    ),
  warn: (tag, msg) =>
    console.warn(
      `%c[${tag}] %c${msg}`,
      "color: #f59e0b; font-weight: bold",
      "color: #d1d5db",
    ),
  error: (tag, msg, err) =>
    console.error(
      `%c[${tag}] %c${msg}`,
      "color: #ef4444; font-weight: bold",
      "color: #fca5a5",
      err,
    ),
};

const App = () => {
  // --- 🧭 ROUTING STATE ---
  // ใช้สำหรับควบคุมว่าจะแสดงหน้าจอไหน ('home', 'tarot', 'astrology', 'palmistry')
  const [currentView, setCurrentView] = useState("home");

  // --- 📦 SHARED STATES ---
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeModel, setActiveModel] = useState("");

  // ==========================================
  // 🔮 1. TAROT STATES & LOGIC (ฟีเจอร์เดิม)
  // ==========================================
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");

  const drawCard = useCallback(() => {
    setIsAnalyzing(true);
    setPrediction("");
    setIsPaid(false);
    setTimeout(() => {
      const drawn = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
      setSelectedCard(drawn);
      setIsAnalyzing(false);
    }, 1800);
  }, []);

  const requestAIPrediction = async (prompt, systemInstruction) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    const modelsToTry = [
      "gemini-3.1-pro-preview",
      "gemini-3-flash-preview",
      "gemini-2.5-flash",
    ];

    // โครงสร้าง Payload พื้นฐาน (รองรับการขยายไปใช้กับศาสตร์อื่น)
    const payload = {
      contents: [
        { parts: [{ text: `${systemInstruction}\n\nโจทย์: ${prompt}` }] },
      ],
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
    };

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (data.error) {
          if (data.error.code === 503 || data.error.code === 429) continue;
          throw new Error(data.error.message);
        }
        const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (resultText) return { text: resultText, modelUsed: model };
      } catch (error) {
        if (model === modelsToTry[modelsToTry.length - 1])
          throw new Error("พลังงานจักรวาลหนาแน่น โปรดลองใหม่");
      }
    }
  };

  const confirmTarotPayment = async () => {
    setShowPayModal(false);
    setIsPaid(true);
    setIsGeneratingAI(true);
    try {
      const instruction = `คุณคือ "ปรมาจารย์โหราศาสตร์พยากรณ์" วิเคราะห์ไพ่ด้วยภาษาไทยสละสลวย 6-8 ประโยค`;
      const prompt = `ไพ่ที่ได้: "${selectedCard.name}", คำถาม: "${userQuestion || "ดวงชะตาภาพรวม"}"`;

      const { text, modelUsed } = await requestAIPrediction(
        prompt,
        instruction,
      );
      setPrediction(text);
      setActiveModel(modelUsed);
      setUserQuestion("");
    } catch (error) {
      setPrediction("สื่อจิตขัดข้อง: " + error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ==========================================
  // ♈ 2. ASTROLOGY STATES (ศาสตร์สากล/เวทอินเดีย)
  // ==========================================
  const [astroData, setAstroData] = useState({
    dob: "",
    time: "",
    gender: "ไม่ระบุ",
  });

  const handleAstroSubmit = (e) => {
    e.preventDefault();
    logger.info("ASTRO_SUBMIT", "เตรียมส่งข้อมูลดวงดาว", astroData);
    alert(
      `ระบบกำลังเตรียมคำนวณดวงชะตาของ: เพศ ${astroData.gender}, เกิด ${astroData.dob} เวลา ${astroData.time}\n(รอเชื่อมต่อ AI ในเฟสถัดไป)`,
    );
  };

  // ==========================================
  // ✋ 3. PALMISTRY STATES (ดูลายมือ)
  // ==========================================
  const [handImages, setHandImages] = useState({ left: null, right: null });

  const handleImageUpload = (side, e) => {
    const file = e.target.files[0];
    if (file) {
      // แปลงไฟล์รูปเป็น URL เพื่อแสดงผลแบบ Preview
      const imageUrl = URL.createObjectURL(file);
      setHandImages((prev) => ({ ...prev, [side]: imageUrl }));
      logger.info(
        "IMAGE_UPLOAD",
        `อัปโหลดภาพมือ${side === "left" ? "ซ้าย" : "ขวา"}สำเร็จ`,
      );
    }
  };

  // ==========================================
  // 🎨 RENDERERS (ส่วนควบคุมการแสดงผล)
  // ==========================================

  // --- หน้าเมนูหลัก ---
  const renderMenu = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10"
    >
      {/* Menu 1: Tarot */}
      <div
        onClick={() => setCurrentView("tarot")}
        className="group cursor-pointer bg-white/5 border border-amber-500/20 hover:border-amber-500/60 p-8 rounded-3xl backdrop-blur-md transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(180,130,50,0.2)] text-center flex flex-col items-center"
      >
        <div className="text-6xl mb-4 group-hover:animate-bounce">🎴</div>
        <h3 className="text-2xl font-bold text-amber-200 mb-2 font-sans">
          ไพ่ยิปซี (Tarot)
        </h3>
        <p className="text-slate-400 text-sm">
          เปิดไพ่พยากรณ์ชะตาชีวิตและตอบคำถามที่ค้างคาใจ
        </p>
      </div>

      {/* Menu 2: Astrology */}
      <div
        onClick={() => setCurrentView("astrology")}
        className="group cursor-pointer bg-white/5 border border-indigo-500/20 hover:border-indigo-500/60 p-8 rounded-3xl backdrop-blur-md transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] text-center flex flex-col items-center"
      >
        <div className="text-6xl mb-4 group-hover:animate-pulse">♈</div>
        <h3 className="text-2xl font-bold text-indigo-200 mb-2 font-sans">
          โหราศาสตร์สากล
        </h3>
        <p className="text-slate-400 text-sm">
          ผูกดวงชะตาด้วยวันเดือนปีเกิด ตามหลักเวทอินเดียและสากล
        </p>
      </div>

      {/* Menu 3: Palmistry */}
      <div
        onClick={() => setCurrentView("palmistry")}
        className="group cursor-pointer bg-white/5 border border-emerald-500/20 hover:border-emerald-500/60 p-8 rounded-3xl backdrop-blur-md transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] text-center flex flex-col items-center"
      >
        <div className="text-6xl mb-4 group-hover:rotate-12 transition-transform">
          ✋
        </div>
        <h3 className="text-2xl font-bold text-emerald-200 mb-2 font-sans">
          วิเคราะห์ลายมือ
        </h3>
        <p className="text-slate-400 text-sm">
          อ่านเส้นชีวิต วาสนา และความรัก ผ่านฝ่ามือของคุณด้วย AI Vision
        </p>
      </div>
    </motion.div>
  );

  // --- หน้าโหราศาสตร์ (Astrology Form) ---
  const renderAstrology = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg bg-white/5 border border-indigo-500/30 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl z-10"
    >
      <h2 className="text-3xl font-bold text-indigo-200 mb-6 text-center">
        ผูกดวงชะตา
      </h2>
      <form onSubmit={handleAstroSubmit} className="space-y-5 font-sans">
        <div>
          <label className="block text-indigo-200/60 text-xs uppercase tracking-widest mb-2">
            วัน/เดือน/ปี เกิด
          </label>
          <input
            type="date"
            required
            value={astroData.dob}
            onChange={(e) =>
              setAstroData({ ...astroData, dob: e.target.value })
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-indigo-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-indigo-200/60 text-xs uppercase tracking-widest mb-2">
            เวลาเกิด (ตกฟาก)
          </label>
          <input
            type="time"
            required
            value={astroData.time}
            onChange={(e) =>
              setAstroData({ ...astroData, time: e.target.value })
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-indigo-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-indigo-200/60 text-xs uppercase tracking-widest mb-2">
            เพศสภาพ (มีผลต่อการคำนวณบางตำรา)
          </label>
          <select
            value={astroData.gender}
            onChange={(e) =>
              setAstroData({ ...astroData, gender: e.target.value })
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-indigo-100 focus:outline-none focus:border-indigo-500 [&>option]:bg-gray-900"
          >
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
            <option value="ไม่ระบุ">ไม่ระบุ</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-lg shadow-indigo-900/50"
        >
          คำนวณลัคนาราศี
        </button>
      </form>
    </motion.div>
  );

  // --- หน้าดูลายมือ (Palmistry Form) ---
  const renderPalmistry = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl bg-white/5 border border-emerald-500/30 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl z-10"
    >
      <h2 className="text-3xl font-bold text-emerald-200 mb-2 text-center">
        อัปโหลดภาพฝ่ามือ
      </h2>
      <p className="text-slate-400 text-center text-sm mb-8">
        กรุณาถ่ายภาพฝ่ามือให้เห็นเส้นชัดเจน ในที่มีแสงสว่างเพียงพอ
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* มือซ้าย */}
        <div className="flex flex-col items-center">
          <label className="block text-emerald-200/60 text-xs uppercase tracking-widest mb-3">
            ฝ่ามือซ้าย (อดีต/พื้นดวง)
          </label>
          <div className="relative w-full aspect-[3/4] bg-black/40 border-2 border-dashed border-emerald-500/30 rounded-2xl flex items-center justify-center overflow-hidden hover:border-emerald-400 transition-colors group">
            {handImages.left ? (
              <img
                src={handImages.left}
                alt="Left Hand"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-emerald-500/50 flex flex-col items-center">
                <span className="text-4xl mb-2">+</span> แตะเพื่อเลือกรูป
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload("left", e)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* มือขวา */}
        <div className="flex flex-col items-center">
          <label className="block text-emerald-200/60 text-xs uppercase tracking-widest mb-3">
            ฝ่ามือขวา (ปัจจุบัน/อนาคต)
          </label>
          <div className="relative w-full aspect-[3/4] bg-black/40 border-2 border-dashed border-emerald-500/30 rounded-2xl flex items-center justify-center overflow-hidden hover:border-emerald-400 transition-colors group">
            {handImages.right ? (
              <img
                src={handImages.right}
                alt="Right Hand"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-emerald-500/50 flex flex-col items-center">
                <span className="text-4xl mb-2">+</span> แตะเพื่อเลือกรูป
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload("right", e)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <button
        disabled={!handImages.left || !handImages.right}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl mt-8 transition-all shadow-lg shadow-emerald-900/50"
      >
        วิเคราะห์เส้นลายมือด้วย AI
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#050510] text-amber-50 flex flex-col items-center justify-center p-6 font-serif selection:bg-amber-500/30 relative overflow-hidden">
      {/* Dynamic Background Effect based on current view */}
      <div
        className={`fixed inset-0 pointer-events-none transition-colors duration-1000 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] 
        ${currentView === "home" ? "from-slate-900/50 via-[#050510] to-[#050510]" : ""}
        ${currentView === "tarot" ? "from-amber-900/20 via-[#050510] to-[#050510]" : ""}
        ${currentView === "astrology" ? "from-indigo-900/20 via-[#050510] to-[#050510]" : ""}
        ${currentView === "palmistry" ? "from-emerald-900/20 via-[#050510] to-[#050510]" : ""}
      `}
      />

      {/* 🧭 ปุ่มกลับหน้าหลัก (Back Button) */}
      <AnimatePresence>
        {currentView !== "home" && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setCurrentView("home")}
            className="fixed top-6 left-6 z-50 text-slate-400 hover:text-white flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
          >
            <span>←</span> กลับหน้าเมนูหลัก
          </motion.button>
        )}
      </AnimatePresence>

      <header className="text-center mb-10 z-10 mt-12 md:mt-0">
        <h1 className="text-5xl font-bold bg-gradient-to-b from-slate-100 to-slate-500 bg-clip-text text-transparent mb-4">
          ✨ The Oracle Portal
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase italic">
          Choose Your Divination Method
        </p>
      </header>

      {/* Main Content Area (Switch/Case Routing) */}
      <AnimatePresence mode="wait">
        {currentView === "home" && (
          <motion.div key="home" className="w-full flex justify-center">
            {renderMenu()}
          </motion.div>
        )}
        {currentView === "astrology" && (
          <motion.div key="astrology" className="w-full flex justify-center">
            {renderAstrology()}
          </motion.div>
        )}
        {currentView === "palmistry" && (
          <motion.div key="palmistry" className="w-full flex justify-center">
            {renderPalmistry()}
          </motion.div>
        )}

        {/* หน้า Tarot (ดึงฟีเจอร์เดิมมาใช้) */}
        {currentView === "tarot" && (
          <motion.div
            key="tarot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl flex flex-col items-center z-10"
          >
            {/* ใส่ UI เดิมของ Tarot ลงตรงนี้ได้เลย (ผมรวบรัดไว้ให้เพื่อความสะอาดของโค้ด) */}
            {!selectedCard && !isAnalyzing && (
              <button
                onClick={drawCard}
                className="bg-amber-700 hover:bg-amber-600 px-12 py-5 rounded-full text-xl font-bold transition-all mt-10"
              >
                เริ่มสับไพ่และทำนาย
              </button>
            )}
            {/* ... ส่วนแสดงไพ่ ป๊อปอัปจ่ายเงิน และคำทำนาย (ใช้ตัวเดิมของคุณได้เลย) ... */}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-6 text-slate-700 text-[10px] tracking-[0.4em] uppercase z-10">
        Oracle Portal • Powered by Rawikarn (oYai) • © 2026
      </footer>
    </div>
  );
};

export default App;
