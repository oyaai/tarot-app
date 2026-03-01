import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { tarotDeck } from "./data/tarot";

const App = () => {
  // ย้าย useState ทั้งหมดมาไว้ในนี้
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // ฟังก์ชันสุ่มไพ่
  const drawCard = () => {
    setIsAnalyzing(true);
    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    setTimeout(() => {
      setSelectedCard(tarotDeck[randomIndex]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const generatePrediction = async (cardName) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    // ใช้เวอร์ชัน v1beta ตามที่คุณเช็คในลิสต์ว่ารองรับ
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const prompt = `
    คุณคือ "ปรมาจารย์โหราศาสตร์พยากรณ์" ผู้เชี่ยวชาญศาสตร์ไพ่ยิปซีพลังจิต 
    บทบาทของคุณคือการทำนายดวงชะตาจากไพ่: ${cardName}
    
    ข้อกำหนดการตอบ:
    1. ใช้ภาษาสวยงาม ดูลึกลับแต่เปี่ยมด้วยความหวัง (เช่น "ดวงชะตาเปิดฟ้า", "กระแสพลังงานไหลเวียน")
    2. แบ่งเนื้อหาเป็น 3 ส่วนหลัก: 
       - [ภาพรวมชะตา]: วิเคราะห์พลังงานหลักของไพ่ใบนี้
       - [เจาะลึก 3 ด้าน]: การงาน, การเงิน, ความรัก (ให้คำแนะนำที่นำไปใช้ได้จริง)
       - [ข้อความจากจักรวาล]: ประโยคทิ้งท้ายที่สร้างแรงบันดาลใจ
    3. ความยาวรวมประมาณ 6-8 ประโยค
    4. ห้ามบอกว่าเป็น AI ให้ทำตัวเป็นหมอดูจริงๆ
    5. พิมพ์เป็นภาษาไทยเท่านั้น
  `;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("API Error:", data.error);
        return `ขออภัย... ขณะนี้กระแสจิตสื่อสารขัดข้อง: ${data.error.message}`;
      }

      if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }

      return "พลังงานจากไพ่ยังไม่นิ่งพอ... กรุณาตั้งจิตใหม่อีกครั้ง";
    } catch (error) {
      return "การเชื่อมต่อกับจักรวาลขัดข้อง... กรุณาตรวจสอบอินเทอร์เน็ตของคุณ";
    }
  };

  const handlePayment = () => {
    setShowPayModal(true);
  };

  const confirmPayment = async () => {
    setShowPayModal(false);
    setIsPaid(true);
    setIsGeneratingAI(true);

    const result = await generatePrediction(selectedCard.name);
    setPrediction(result);
    setIsGeneratingAI(false);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-amber-50 flex flex-col items-center justify-center p-6 font-serif">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>

      <header className="text-center mb-10 z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold bg-gradient-to-b from-amber-200 to-amber-600 bg-clip-text text-transparent mb-4"
        >
          🔮 AI Tarot
        </motion.h1>
        <p className="text-slate-400 italic">
          ตั้งจิตให้เป็นสมาธิ แล้วขอคำชี้แนะจากจักรวาล
        </p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center z-10">
        {!selectedCard && !isAnalyzing && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={drawCard}
              className="bg-amber-700 hover:bg-amber-600 px-12 py-5 rounded-full text-xl font-bold shadow-[0_0_20px_rgba(180,130,50,0.5)] transition-all"
            >
              สับไพ่และทำนายดวง
            </button>
          </motion.div>
        )}

        {(isAnalyzing || isGeneratingAI) && (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <p className="animate-pulse text-amber-200 font-sans">
              {isGeneratingAI
                ? "หมอดูกำลังถอดรหัสชะตาชีวิต..."
                : "หมอดูกำลังเชื่อมต่อกับดวงดาว..."}
            </p>
          </div>
        )}

        {/* แสดงผลไพ่ที่สุ่มได้ */}
        <AnimatePresence>
          {selectedCard && !isAnalyzing && !isGeneratingAI && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col md:flex-row items-center gap-10 bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10"
            >
              <div className="w-64 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden border-4 border-amber-900/30">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className={`w-full transition-all duration-1000 ${!isPaid ? "blur-md grayscale" : "blur-0"}`}
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-amber-200 mb-2">
                  {selectedCard.name}
                </h2>

                {!isPaid ? (
                  <div className="bg-amber-950/50 p-6 rounded-xl border border-amber-500/30">
                    <p className="text-slate-300 mb-4 text-sm">
                      ความลับแห่งจักรวาลรอคุณอยู่...
                      ปลดล็อกเพื่ออ่านคำทำนายเจาะลึก
                    </p>
                    <button
                      onClick={handlePayment}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition-all shadow-lg"
                    >
                      สแกนค่าครู 99.- เพื่อดูดวง
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-lg leading-relaxed text-slate-200 whitespace-pre-line text-left italic font-sans">
                      {prediction}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCard(null);
                        setIsPaid(false);
                        setPrediction("");
                      }}
                      className="mt-6 text-amber-500 hover:underline text-sm"
                    >
                      ต้องการเริ่มต้นใหม่อีกครั้ง?
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal ชำระเงิน */}
        <AnimatePresence>
          {showPayModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPayModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-[#1a1a2e] border border-amber-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(180,130,50,0.3)]"
              >
                <h3 className="text-2xl font-bold text-amber-200 mb-2">
                  ชำระค่าครู
                </h3>
                <p className="text-slate-400 text-xs mb-6 font-sans">
                  สแกน QR Code ด้านล่างเพื่อปลดล็อกคำทำนาย
                  <br />
                  รายได้ส่วนหนึ่งจะนำไปทำบุญเสริมดวงชะตา
                </p>

                <div className="bg-white p-3 rounded-2xl mb-6 shadow-inner">
                  <img
                    src="https://i.postimg.cc/KY1xvMxQ/S-171040770.jpg"
                    alt="PromptPay QR"
                    className="w-full h-auto rounded-lg"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={confirmPayment}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-all shadow-lg"
                  >
                    ฉันโอนเงินเรียบร้อยแล้ว
                  </button>
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="w-full text-slate-500 hover:text-slate-300 text-sm py-2 transition-colors font-sans"
                  >
                    ไว้คราวหลัง
                  </button>
                </div>
                <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-sans">
                  ชำระเงินเพียง 99.- เพื่อเปิดดวงชะตา
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 text-slate-600 text-[10px] uppercase tracking-[0.2em] z-10">
        © 2026 AI Tarot • มนตราแห่งปัญญาดิจิทัล
      </footer>
    </div>
  );
};

export default App;
