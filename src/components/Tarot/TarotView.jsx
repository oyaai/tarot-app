// src/components/TarotView.jsx
import { motion } from "framer-motion";
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

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      {!selectedCard && !isAnalyzing && (
        <button
          onClick={draw}
          className="bg-amber-600 px-8 py-4 rounded-full font-bold"
        >
          สับไพ่ทำนายดวง
        </button>
      )}

      {selectedCard && !isGeneratingAI && !prediction && (
        <div className="bg-white/5 p-6 rounded-2xl border border-amber-500/30 w-full max-w-md">
          <img
            src={selectedCard.image}
            className="w-48 mx-auto mb-4 rounded-xl blur-sm"
          />
          <input
            type="text"
            placeholder="ตั้งจิตอธิษฐานถามเรื่องที่อยากรู้..."
            className="w-full p-3 bg-black/40 rounded-lg mb-4"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            onClick={() => getPrediction(question)}
            className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl"
          >
            ขอดูคำทำนาย (99.-)
          </button>
        </div>
      )}

      {prediction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <img
            src={selectedCard.image}
            className="w-48 mx-auto mb-6 rounded-xl"
          />
          <p className="italic text-lg text-amber-100">{prediction}</p>
          <p className="text-[10px] mt-4 opacity-30">
            Powered by {activeModel}
          </p>
          <button onClick={reset} className="mt-6 text-amber-500 underline">
            เริ่มใหม่
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default TarotView;
