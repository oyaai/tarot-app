import { motion } from "framer-motion";
import { useState } from "react";

const PalmistryView = () => {
  const [images, setImages] = useState({ left: null, right: null });

  const handleUpload = (side, e) => {
    const file = e.target.files[0];
    if (file) setImages({ ...images, [side]: URL.createObjectURL(file) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl bg-white/5 p-8 rounded-[2rem] border border-emerald-500/20"
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
        disabled={!images.left || !images.right}
        className="w-full bg-emerald-600 disabled:bg-slate-800 py-4 rounded-xl font-bold mt-8 transition-all"
      >
        เริ่มการวิเคราะห์ด้วย AI Vision
      </button>
    </motion.div>
  );
};

const HandUpload = ({ label, side, img, onUpload }) => (
  <div className="flex flex-col items-center">
    <label className="text-[10px] text-emerald-200/40 mb-3 uppercase">
      {label}
    </label>
    <div className="relative w-full aspect-[3/4] bg-black/40 border-2 border-dashed border-emerald-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
      {img ? (
        <img src={img} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl text-emerald-500/30">+</span>
      )}
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => onUpload(side, e)}
      />
    </div>
  </div>
);

export default PalmistryView;
