import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { predict } from "../../api/gemini";

// แปลงไฟล์รูปเป็น base64 (ไม่รวม prefix data:...;base64,)
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const PalmistryView = () => {
  const [files, setFiles] = useState({ left: null, right: null }); // เก็บ File object จริง
  const [images, setImages] = useState({ left: null, right: null }); // เก็บ preview URL
  const [basicReading, setBasicReading] = useState(""); // ผลฟรี
  const [prediction, setPrediction] = useState(""); // ผลจ่ายเงิน
  const [activeModel, setActiveModel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = (side, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((f) => ({ ...f, [side]: file }));
      setImages((img) => ({ ...img, [side]: URL.createObjectURL(file) }));
    }
  };

  const buildImageParts = async () => {
    const parts = [];
    if (files.left) {
      parts.push({ mimeType: files.left.type, data: await fileToBase64(files.left) });
    }
    if (files.right) {
      parts.push({ mimeType: files.right.type, data: await fileToBase64(files.right) });
    }
    return parts;
  };

  // 1. ขั้นตอนฟรี: อ่านลายมือแบบสั้นๆ ด้วย AI Vision
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError("");
    try {
      const imageParts = await buildImageParts();
      const system = `คุณคือหมอดูลายมือผู้เชี่ยวชาญ ดูภาพฝ่ามือซ้ายและขวาที่แนบมา สรุปลักษณะเส้นสำคัญ (เส้นชีวิต เส้นสมอง เส้นหัวใจ) แบบสั้นกระชับ 2-3 ประโยคเท่านั้น เป็นภาษาไทย เพื่อเป็นตัวอย่างก่อนขอคำทำนายแบบเต็ม`;
      const res = await predict(
        "ช่วยสรุปภาพรวมลายมือแบบสั้นๆ",
        system,
        imageParts
      );
      setBasicReading(res.text);
      setActiveModel(res.modelUsed);
    } catch (err) {
      setError("สื่อจิตขัดข้อง: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenPayment = () => {
    if (!basicReading) return;
    setShowPayModal(true);
  };

  // 2. ขั้นตอนจ่ายเงิน: อ่านลายมือแบบละเอียด
  const handleConfirmPayment = async () => {
    setShowPayModal(false);
    setIsGeneratingAI(true);
    setError("");
    try {
      const imageParts = await buildImageParts();
      const system = `คุณคือหมอดูลายมือผู้เชี่ยวชาญระดับปรมาจารย์ ดูภาพฝ่ามือซ้าย (อดีต) และขวา (อนาคต) ที่แนบมาอย่างละเอียด วิเคราะห์เส้นชีวิต เส้นสมอง เส้นหัวใจ เส้นวาสนา และภูเขาบนฝ่ามือ อธิบายความหมายด้านสุขภาพ การงาน ความรัก และโชคลาภ เป็นภาษาไทยสละสลวย ความยาว 8-10 ประโยค`;
      const res = await predict(
        "ช่วยวิเคราะห์ลายมือแบบละเอียดครบทุกด้าน",
        system,
        imageParts
      );
      setPrediction(res.text);
      setActiveModel(res.modelUsed);
    } catch (err) {
      setError("สื่อจิตขัดข้อง: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleReset = () => {
    setFiles({ left: null, right: null });
    setImages({ left: null, right: null });
    setBasicReading("");
    setPrediction("");
    setError("");
  };

  const canAnalyze = images.left && images.right;
  const isBusy = isAnalyzing || isGeneratingAI;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl px-4">
      {!basicReading && !isBusy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full bg-white/5 p-8 rounded-[2rem] border border-emerald-500/20"
        >
          <h2 className="text-2xl font-bold text-emerald-300 mb-2 text-center italic">
            วิเคราะห์ลายมือ
          </h2>
          <p className="text-slate-500 text-center text-xs mb-8 uppercase tracking-widest">
            Upload photos of both palms
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HandUpload
              label="ฝ่ามือซ้าย (อดีต)"
              side="left"
              img={images.left}
              onUpload={handleUpload}
            />
            <HandUpload
              label="ฝ่ามือขวา (อนาคต)"
              side="right"
              img={images.right}
              onUpload={handleUpload}
            />
          </div>

          <button
            disabled={!canAnalyze}
            onClick={handleAnalyze}
            className="w-full bg-emerald-600 disabled:bg-slate-800 hover:bg-emerald-500 py-4 rounded-xl font-bold mt-8 transition-all"
          >
            เริ่มการวิเคราะห์ด้วย AI Vision (ฟรี)
          </button>
        </motion.div>
      )}

      {isBusy && (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-emerald-200 animate-pulse tracking-widest uppercase text-xs">
            {isAnalyzing
              ? "กำลังอ่านลายเส้นบนฝ่ามือ..."
              : "กำลังสื่อจิตกับจักรวาล..."}
          </p>
        </div>
      )}

      {/* ผลฟรี: อ่านแบบสั้น + ปุ่มขอละเอียด */}
      {basicReading && !prediction && !isBusy && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white/5 p-8 rounded-[2.5rem] border border-emerald-500/30 backdrop-blur-xl text-center"
        >
          <div className="flex justify-center gap-4 mb-6">
            <img src={images.left} className="w-24 h-24 object-cover rounded-xl grayscale-[0.4]" />
            <img src={images.right} className="w-24 h-24 object-cover rounded-xl grayscale-[0.4]" />
          </div>
          <p className="text-emerald-400 text-xs uppercase tracking-widest mb-2">
            ผลวิเคราะห์เบื้องต้น
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mb-8 text-left whitespace-pre-line">
            {basicReading}
          </p>

          <button
            onClick={handleOpenPayment}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            ขอคำทำนายแบบละเอียด (99.-)
          </button>
          <button
            onClick={handleReset}
            className="mt-4 text-slate-500 hover:text-emerald-400 underline text-xs uppercase tracking-widest transition-colors"
          >
            เริ่มใหม่
          </button>
        </motion.div>
      )}

      {/* ผลจ่ายเงิน: อ่านแบบละเอียด */}
      {prediction && !isBusy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center w-full"
        >
          <div className="flex justify-center gap-4 mb-6">
            <img src={images.left} className="w-32 h-32 object-cover rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
            <img src={images.right} className="w-32 h-32 object-cover rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
          </div>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm relative">
            <p className="text-lg leading-relaxed text-emerald-50 font-serif whitespace-pre-line text-left">
              {prediction}
            </p>
            <p className="text-[9px] mt-6 text-slate-600 tracking-[0.3em] uppercase">
              Predicted by: {activeModel?.replace("models/", "")}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="mt-8 text-emerald-500/50 hover:text-emerald-500 underline text-sm uppercase tracking-widest transition-colors"
          >
            วิเคราะห์ใหม่
          </button>
        </motion.div>
      )}

      {error && !isBusy && (
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
              className="bg-[#1a1a1a] border border-emerald-500/40 p-8 rounded-[3rem] max-w-sm w-full text-center relative shadow-[0_0_100px_rgba(16,185,129,0.15)]"
            >
              <button
                onClick={() => setShowPayModal(false)}
                className="absolute top-6 right-8 text-slate-500 hover:text-white text-2xl"
              >
                ×
              </button>

              <div className="mb-6">
                <div className="w-16 h-1 bg-emerald-500 mx-auto mb-6 rounded-full"></div>
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

const HandUpload = ({ label, side, img, onUpload }) => (
  <div className="flex flex-col items-center">
    <label className="text-[10px] text-emerald-200/40 mb-3 uppercase">
      {label}
    </label>
    <label className="relative w-full aspect-[3/4] bg-black/40 border-2 border-dashed border-emerald-500/20 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors">
      {img ? (
        <img src={img} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl text-emerald-500/30">+</span>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(side, e)}
      />
    </label>
  </div>
);

export default PalmistryView;
