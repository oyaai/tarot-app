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
  // --- 📦 APPLICATION STATES ---
  const [selectedCard, setSelectedCard] = useState(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false); // สถานะตอนสับไพ่
  const [isGeneratingAI, setIsGeneratingAI] = useState(false); // สถานะตอนรอ AI
  const [isPaid, setIsPaid] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);

  // --- 🔮 CORE LOGIC ---

  // 1. สุ่มไพ่ (Draw Card)
  const drawCard = useCallback(() => {
    logger.info("ACTION", "User drawing card...");
    setIsAnalyzing(true);
    setPrediction("");
    setIsPaid(false);

    // Simulate spiritual connection delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * tarotDeck.length);
      const card = tarotDeck[randomIndex];
      setSelectedCard(card);
      setIsAnalyzing(false);
      logger.info("STATE", `Card selected: ${card.name}`);
    }, 1800);
  }, []);

  const requestAIPrediction = async (cardName, question) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;

    // ✅ ใช้รุ่นท็อปที่สุดจาก List ของคุณ: Gemini 3.1 Pro Preview (Jan 2026)
    const model = "gemini-flash-lite-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const cleanQuestion =
      question?.trim().substring(0, 150) || "ดวงชะตาโดยรวมในอนาคตอันใกล้";

    logger.info("API_REQUEST", `Consulting with ${model}...`);

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `คุณคือ "ปรมาจารย์โหราศาสตร์พยากรณ์" 
        โจทย์: ทำนายไพ่ "${cardName}" 
        คำถามจากลูกดวง: "${cleanQuestion}"
        
        ข้อกำหนด: 
        1. วิเคราะห์พลังงานไพ่และตอบคำถามอย่างละเอียด
        2. ใช้ภาษาไทยสละสลวย 6-8 ประโยค
        3. ห้ามหลุดคาแรคเตอร์ และห้ามบอกว่าเป็น AI`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Specialist Log: ตรวจสอบโครงสร้าง Response จริง
      if (data.error) {
        logger.error("API_LIMIT_ERROR", data.error.message);
        throw new Error(data.error.message);
      }

      const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText)
        throw new Error("จักรวาลยังไม่เปิดเผยคำตอบ (Empty Data)");

      return resultText;
    } catch (error) {
      logger.error("FETCH_EXCEPTION", error.message);
      throw error;
    }
  };

  // 3. ยืนยันการชำระเงินและประมวลผล (Final Trigger)
  const confirmPayment = async () => {
    logger.info("PAYMENT", "Payment confirmed, starting AI process...");
    setShowPayModal(false);
    setIsPaid(true);
    setIsGeneratingAI(true);

    try {
      const result = await requestAIPrediction(selectedCard.name, userQuestion);
      setPrediction(result);
      logger.info("SUCCESS", "Prediction generated successfully");

      // --- 🧹 CLEAR INPUT AFTER SUCCESS ---
      setUserQuestion("");
      logger.info("STATE", "Input box cleared.");
    } catch (error) {
      logger.error("PROCESS_ERROR", error.message, error);
      setPrediction("ขออภัย... สื่อจิตขัดข้อง: " + error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleReset = () => {
    logger.info("ACTION", "System Reset");
    setSelectedCard(null);
    setPrediction("");
    setIsPaid(false);
    setUserQuestion("");
  };

  return (
    <div className="min-h-screen bg-[#050510] text-amber-50 flex flex-col items-center justify-center p-6 font-serif selection:bg-amber-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="text-center mb-10 z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold bg-gradient-to-b from-amber-200 to-amber-600 bg-clip-text text-transparent mb-4"
        >
          🔮 AI Tarot
        </motion.h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase italic">
          The Wisdom of Digital Stars
        </p>
      </header>

      {/* Question Input Section */}
      {!isPaid && !isGeneratingAI && (
        <div className="w-full max-w-md mb-8 z-10">
          <label className="block text-amber-200/40 text-[10px] uppercase tracking-widest mb-3 ml-1 text-center">
            อธิษฐานจิตและระบุคำถาม
          </label>
          <div className="relative group">
            <input
              type="text"
              disabled={isAnalyzing || isGeneratingAI}
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="อยากรู้เรื่องอะไรเป็นพิเศษ?..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-amber-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all text-center"
            />
            {userQuestion && (
              <button
                onClick={() => setUserQuestion("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-amber-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Display Area */}
      <main className="w-full max-w-4xl flex flex-col items-center z-10 relative">
        {/* Draw Button */}
        {!selectedCard && !isAnalyzing && (
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(180, 130, 50, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={drawCard}
            className="bg-amber-700 hover:bg-amber-600 px-12 py-5 rounded-full text-xl font-bold transition-all"
          >
            เริ่มสับไพ่และทำนาย
          </motion.button>
        )}

        {/* Loading Indicators */}
        {(isAnalyzing || isGeneratingAI) && (
          <div className="flex flex-col items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="text-6xl mb-6"
            >
              ✨
            </motion.div>
            <p className="animate-pulse text-amber-200 font-sans tracking-widest text-sm italic">
              {isGeneratingAI
                ? "จักรวาลกำลังถอดรหัสชะตา..."
                : "กำลังเชื่อมต่อกระแสพลังงาน..."}
            </p>
          </div>
        )}

        {/* Result Area */}
        <AnimatePresence mode="wait">
          {selectedCard && !isAnalyzing && !isGeneratingAI && (
            <motion.div
              key={selectedCard.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col md:flex-row items-center gap-10 bg-white/[0.03] p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              {/* Card Image */}
              <div className="w-64 relative group">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className={`w-full rounded-2xl shadow-2xl transition-all duration-1000 ${!isPaid ? "blur-xl grayscale saturate-0" : "blur-0"}`}
                />
                {!isPaid && (
                  <div className="absolute inset-0 flex items-center justify-center text-amber-200/40 font-bold tracking-[0.5em] text-xs">
                    LOCKED
                  </div>
                )}
              </div>

              {/* Text Area */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-bold text-amber-200 mb-6 font-sans tracking-tight">
                  {selectedCard.name}
                </h2>

                {!isPaid ? (
                  <div className="space-y-6">
                    <p className="text-slate-400 italic">
                      "ความลับของดวงดาวใบนี้
                      กำลังรอการปลดปล่อยด้วยศรัทธาของคุณ..."
                    </p>
                    <button
                      onClick={() => setShowPayModal(true)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-[#050510] font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-900/20"
                    >
                      สแกนค่าครู 99.- เพื่อเปิดดวง
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <p className="text-lg leading-relaxed text-slate-100 italic whitespace-pre-line font-serif drop-shadow-sm">
                      {prediction || "ไม่พบคำทำนาย... กรุณาลองใหม่"}
                    </p>
                    <button
                      onClick={handleReset}
                      className="text-amber-500/60 hover:text-amber-400 text-xs uppercase tracking-[0.3em] transition-colors"
                    >
                      — เริ่มต้นทำนายใหม่อีกครั้ง —
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPayModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPayModal(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-[#0a0a1a] border border-amber-500/20 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl"
              >
                <h3 className="text-xl font-bold text-amber-200 mb-2">
                  ชำระค่าครูบูชาดวง
                </h3>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-6">
                  เพื่อเชื่อมต่อพลังงานแห่งจักรวาล
                </p>
                <div className="bg-white p-3 rounded-2xl mb-8">
                  <img
                    src="https://i.postimg.cc/KY1xvMxQ/S-171040770.jpg"
                    alt="PromptPay"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <button
                  onClick={confirmPayment}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl mb-4 transition-all"
                >
                  ฉันโอนเงิน 99.- เรียบร้อยแล้ว
                </button>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="text-slate-600 text-xs hover:text-white transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-16 text-slate-700 text-[9px] tracking-[0.4em] uppercase z-10">
        AI Engine 3.1 • Powered by oYaai • © 2026
      </footer>
    </div>
  );
};

export default App;
