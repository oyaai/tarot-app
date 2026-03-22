import { motion } from "framer-motion";
import { useState } from "react";

const AstrologyView = () => {
  const [formData, setFormData] = useState({
    dob: "",
    time: "",
    gender: "ไม่ระบุ",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("ระบบกำลังเชื่อมต่อกับดวงดาวเพื่อคำนวณลัคนา...");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md bg-white/5 p-8 rounded-[2rem] border border-indigo-500/20 backdrop-blur-md"
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
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[10px] text-indigo-200/50 uppercase tracking-widest mb-2">
            เวลาเกิด (ตกฟาก)
          </label>
          <input
            type="time"
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/40"
        >
          คำนวณดวงชะตา
        </button>
      </form>
    </motion.div>
  );
};

export default AstrologyView;
