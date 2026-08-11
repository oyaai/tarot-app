import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { predict } from "../../api/gemini";
import { getZodiacSign } from "../../data/astrology";

const AstrologyView = () => {
  const [formData, setFormData] = useState({
    dob: "",
    time: "",
    gender: "ไม่ระบุ",
  });
  const [zodiac, setZodiac] = useState(null); // ผลฟรี: ราศีพื้นฐาน
  const [prediction, setPrediction] = useState(""); // ผลจ่ายเงิน: คำทำนายละเอียดจาก AI
  const [activeModel, setActiveModel] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [error, setError] = useState("");

  // 1. ขั้นตอนฟรี: คำนวณราศีทันทีจากวันเกิด ไม่ต้องเรียก AI
  const handleSubmit = (e) => {
    e.preventDefault();
    const sign = getZodiacSign(formData.dob);
    setZodiac(sign);
    setPrediction("");
  };

  // 2. ขั้นตอนจ่ายเงิน: เปิด Modal สแกน QR
  const handleOpenPayment = () => {
    if (!zodiac) return;
    setShowPayModal(true);
  };

  // 3. เมื่อชำระเงินสำเร็จ (จำลอง) ให้เรียก AI วิเคราะห์ดวงแบบละเอียด
  const handleConfirmPayment = async () => {
    setShowPayModal(false);
    setIsGeneratingAI(true);
    setError("");
    try {
      const system = `คุณคือ "ปรมาจารย์โหราศาสตร์สากล" ผูกดวงชะตาอย่างละเอียดจากวันเดือนปีเกิด เวลาเกิด และเพศ วิเคราะห์ราศี องค์ธาตุ และแนวโน้มชีวิตด้านความรัก การงาน การเงิน และสุขภาพ ใช้ภาษาไทยสละสลวย ความยาว 8-10 ประโยค`;
      const prompt = `ราศี: ${zodiac?.name}, วันเกิด: ${formData.dob}, เวลาเกิด: ${
        formData.time || "ไม่ระบุ"
      }, เพศ: ${formData.gender}`;
      const res = await predict(prompt, system);
      setPrediction(res.text);
      setActiveModel(res.modelUsed);
    } catch (err) {
      setError("สื่อจิตขัดข้อง: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleReset = () => {
    setZodiac(null);
    setPrediction("");
    setError("");
    setFormData({ dob: "", time: "", gender: "ไม่ระบุ" });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md px-4">
      {/* หน้าฟอร์มกรอกข้อมูล */}
      {!zodiac && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full bg-white/5 p-8 rounded-[2rem] border border-indigo-500/20 backdrop-blur-md"
        >
          <h2 className="text-2xl font-bold text-indigo-300 mb-6 text-center italic">
            ผูกดวงชะตาสากล
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] text-indigo-200/50 uppercase tracking-widest mb-2">
                วันเดือนปีเกิด
              </label>
              <input
                type="date"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] text-indigo-200/50 uppercase tracking-widest mb-2">
                เวลาเกิด (ตกฟาก)
              </label>
              <input
                type="time"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] text-indigo-200/50 uppercase tracking-widest mb-2">
                เพศ
              </label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option value="ไม่ระบุ">ไม่ระบุ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/40"
            >
              คำนวณราศี (ฟรี)
            </button>
          </form>
        </motion.div>
      )}

      {/* ผลฟรี: แสดงราศีพื้นฐาน + ปุ่มขอคำทำนายละเอียด */}
      {zodiac && !prediction && !isGeneratingAI && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white/5 p-8 rounded-[2.5rem] border border-indigo-500/30 backdrop-blur-xl text-center"
        >
          <p className="text-indigo-400 text-xs uppercase tracking-widest mb-2">
            ราศีของคุณคือ
          </p>
          <h3 className="text-3xl font-bold text-white mb-2">
            {zodiac.name}
          </h3>
          <p className="text-indigo-300 text-xs uppercase tracking-widest mb-4">
            ธาตุประจำราศี: {zodiac.element}
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            {zodiac.trait}
          </p>

          <button
            onClick={handleOpenPayment}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-black font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            ขอคำทำนายแบบละเอียด (99.-)
          </button>
          <button
            onClick={handleReset}
            className="mt-4 text-slate-500 hover:text-indigo-400 underline text-xs uppercase tracking-widest transition-colors"
          >
            เริ่มใหม่
          </button>
        </motion.div>
      )}

      {/* กำลังประมวลผล AI */}
      {isGeneratingAI && (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-indigo-200 animate-pulse tracking-widest uppercase text-xs">
            กำลังผูกดวงชะตากับจักรวาล...
          </p>
        </div>
      )}

      {/* ผลจ่ายเงิน: คำทำนายละเอียด */}
      {prediction && !isGeneratingAI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center w-full max-w-2xl"
        >
          <h3 className="text-2xl font-bold text-indigo-300 mb-4">
            {zodiac?.name}
          </h3>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm relative">
            <p className="text-lg leading-relaxed text-indigo-50 font-serif whitespace-pre-line text-left">
              {prediction}
            </p>
            <p className="text-[9px] mt-6 text-slate-600 tracking-[0.3em] uppercase">
              Predicted by: {activeModel?.replace("models/", "")}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="mt-8 text-indigo-500/50 hover:text-indigo-500 underline text-sm uppercase tracking-widest transition-colors"
          >
            ผูกดวงใหม่
          </button>
        </motion.div>
      )}

      {error && !isGeneratingAI && (
        <p className="text-red-400 text-xs mt-4 text-center">{error}</p>
      )}

      {/* MODAL สแกนชำระเงิน */}
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
              className="bg-[#1a1a1a] border border-indigo-500/40 p-8 rounded-[3rem] max-w-sm w-full text-center relative shadow-[0_0_100px_rgba(99,102,241,0.15)]"
            >
              <button
                onClick={() => setShowPayModal(false)}
                className="absolute top-6 right-8 text-slate-500 hover:text-white text-2xl"
              >
                ×
              </button>

              <div className="mb-6">
                <div className="w-16 h-1 bg-indigo-500 mx-auto mb-6 rounded-full"></div>
                <h3 className="text-xl font-bold text-white mb-2">
                  สแกนเพื่อรับคำทำนายละเอียด
                </h3>
                <p className="text-slate-400 text-xs">ยอดชำระ 99.00 บาท</p>
              </div>

              <div className="bg-white p-4 rounded-3xl mb-6 inline-block shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="w-48 h-48 bg-slate-200 flex items-center justify-center border-2 border-dashed border-slate-300 relative">
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

export default AstrologyView;
