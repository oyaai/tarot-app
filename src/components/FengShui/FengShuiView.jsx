import { motion } from "framer-motion";
import { useState } from "react";

const FengShuiView = () => {
  const [formData, setFormData] = useState({
    propertyType: "บ้านเดี่ยว",
    facingDirection: "0", // องศา (0-359)
    environment: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `กำลังคำนวณผังแปดทิศ (Bagua Map) สำหรับ${formData.propertyType} ทิศหน้าบ้าน ${formData.facingDirection}°`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg bg-white/5 border border-red-500/20 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl z-10"
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">☯️</div>
        <h2 className="text-3xl font-bold text-red-400 font-sans tracking-tight">
          วิเคราะห์ฮวงจุ้ยดิจิทัล
        </h2>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em]">
          Feng Shui Analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        {/* ประเภทสถานที่ */}
        <div>
          <label className="block text-red-200/40 text-[10px] uppercase tracking-widest mb-2 ml-1">
            ประเภทสิ่งปลูกสร้าง
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) =>
              setFormData({ ...formData, propertyType: e.target.value })
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-red-100 focus:outline-none focus:border-red-500 transition-all [&>option]:bg-gray-900"
          >
            <option value="บ้านเดี่ยว">บ้านเดี่ยว</option>
            <option value="คอนโด/อพาร์ทเม้นท์">คอนโด / อพาร์ทเม้นท์</option>
            <option value="ทาวน์โฮม">ทาวน์โฮม / อาคารพาณิชย์</option>
            <option value="ออฟฟิศ/ร้านค้า">ออฟฟิศ / ร้านค้า</option>
          </select>
        </div>

        {/* เข็มทิศหน้าบ้าน */}
        <div>
          <label className="block text-red-200/40 text-[10px] uppercase tracking-widest mb-2 ml-1">
            องศาหน้าบ้าน ({formData.facingDirection}°)
          </label>
          <input
            type="range"
            min="0"
            max="359"
            value={formData.facingDirection}
            onChange={(e) =>
              setFormData({ ...formData, facingDirection: e.target.value })
            }
            className="w-full h-2 bg-red-900/30 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-1 font-mono">
            <span>N (0°)</span>
            <span>E (90°)</span>
            <span>S (180°)</span>
            <span>W (270°)</span>
          </div>
        </div>

        {/* สภาพแวดล้อมรอบๆ */}
        <div>
          <label className="block text-red-200/40 text-[10px] uppercase tracking-widest mb-2 ml-1">
            สิ่งปลูกสร้างรอบข้าง (ถ้ามี)
          </label>
          <textarea
            placeholder="เช่น มีเสาไฟฟ้าหน้าบ้าน, ติดถนนทางสามแพร่ง, ใกล้สวนสาธารณะ..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-red-100 placeholder:text-slate-700 focus:outline-none focus:border-red-500 min-h-[100px] transition-all"
            value={formData.environment}
            onChange={(e) =>
              setFormData({ ...formData, environment: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-lg shadow-red-900/40 border border-red-500/50"
        >
          ตรวจชัยภูมิและพลังชี่
        </button>
      </form>
    </motion.div>
  );
};

export default FengShuiView;
