import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const TarotView = ({ tarotHook }) => {
  const {
    selectedCard,
    prediction,
    activeModel,
    isAnalyzing,
    isGeneratingAI,
    draw,
    getPrediction,
    reset,
  } = tarotHook;
  const [question, setQuestion] = useState("");
  const [showPayModal, setShowPayModal] = useState(false); // 👈 เพิ่ม State ควบคุม Modal

  // ฟังก์ชันเมื่อกดปุ่ม "ขอดูคำทำนาย (99.-)"
  const handleOpenPayment = () => {
    if (!selectedCard) return;
    setShowPayModal(true); // เปิด Modal สแกน
  };

  // ฟังก์ชันเมื่อชำระเงินสำเร็จ (จำลอง)
  const handleConfirmPayment = () => {
    setShowPayModal(false);
    getPrediction(question); // เรียก AI ทำนาย
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl px-4">
      {/* 1. หน้าแรก: ปุ่มสับไพ่ */}
      {!selectedCard && !isAnalyzing && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={draw}
          className="bg-amber-600 hover:bg-amber-500 px-12 py-5 rounded-full font-bold text-xl shadow-lg shadow-amber-900/20 transition-all active:scale-95"
        >
          เริ่มสับไพ่พยากรณ์
        </motion.button>
      )}

      {/* 2. หน้าเลือกไพ่แล้ว: รอใส่คำถามและชำระเงิน */}
      {selectedCard && !prediction && !isGeneratingAI && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 p-8 rounded-[2.5rem] border border-amber-500/30 w-full max-w-md backdrop-blur-xl"
        >
          <div className="text-center mb-6">
            <p className="text-amber-500 text-xs uppercase tracking-widest mb-2">
              ไพ่ที่คุณเลือกได้คือ
            </p>
            <h3 className="text-2xl font-bold text-white mb-4">
              {selectedCard.name}
            </h3>
            <img
              src={selectedCard.image}
              className="w-40 mx-auto rounded-xl shadow-2xl mb-4 grayscale-[0.5]"
            />
          </div>

          <input
            type="text"
            placeholder="ตั้งจิตอธิษฐานถามเรื่องที่อยากรู้..."
            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl mb-4 text-white focus:outline-none focus:border-amber-500"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button
            onClick={handleOpenPayment} // 👈 เปลี่ยนมาเรียกเปิด Modal
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            ขอคำทำนายแบบละเอียด (99.-)
          </button>
        </motion.div>
      )}

      {/* 3. หน้ากำลังประมวลผล AI */}
      {isGeneratingAI && (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-amber-200 animate-pulse tracking-widest uppercase text-xs">
            กำลังสื่อจิตกับจักรวาล...
          </p>
        </div>
      )}

      {/* 4. หน้าแสดงคำทำนาย */}
      {prediction && !isGeneratingAI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-2xl"
        >
          <img
            src={selectedCard.image}
            className="w-48 mx-auto mb-8 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.3)]"
          />
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm relative">
            <p className="text-lg leading-relaxed text-amber-50 font-serif whitespace-pre-line text-left">
              {prediction}
            </p>
            <p className="text-[9px] mt-6 text-slate-600 tracking-[0.3em] uppercase">
              Predicted by: {activeModel?.replace("models/", "")}
            </p>
          </div>
          {/* <button
            onClick={reset}
            className="mt-8 text-amber-500/50 hover:text-amber-500 underline text-sm uppercase tracking-widest transition-colors"
          >
            เริ่มทำนายใหม่
          </button> */}
        </motion.div>
      )}

      {/* --- 💳 MODAL สแกนชำระเงิน --- */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-amber-500/40 p-8 rounded-[3rem] max-w-sm w-full text-center relative shadow-[0_0_100px_rgba(251,191,36,0.15)]"
            >
              <button
                onClick={() => setShowPayModal(false)}
                className="absolute top-6 right-8 text-slate-500 hover:text-white text-2xl"
              >
                ×
              </button>

              <div className="mb-6">
                <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
                <h3 className="text-xl font-bold text-white mb-2">
                  สแกนเพื่อรับคำทำนาย
                </h3>
                <p className="text-slate-400 text-xs">ยอดชำระ 99.00 บาท</p>
              </div>

              {/* QR Code จำลอง */}
              <div className="bg-white p-4 rounded-3xl mb-6 inline-block shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="w-48 h-48 bg-slate-200 flex items-center justify-center border-2 border-dashed border-slate-300 relative">
                  {/* ตรงนี้ในอนาคตคุณสามารถใช้ API สร้าง PromptPay QR ได้ */}
                  <span className="text-slate-400 text-xs text-center px-4 italic">
                    Thai QR Payment <br /> (Mockup)
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition-all"
              >
                ยืนยันการชำระเงิน
              </button>
              <p className="text-[9px] text-slate-500 mt-4 uppercase tracking-widest">
                Secure Payment • Powered by oYai Pay
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TarotView;
