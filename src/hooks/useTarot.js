// src/hooks/useTarot.js
import { useState } from "react";
import { predict } from "../api/gemini";
import { tarotDeck } from "../data/tarot";

export const useTarot = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [activeModel, setActiveModel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const draw = () => {
    setIsAnalyzing(true);
    setPrediction("");
    setTimeout(() => {
      const card = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
      setSelectedCard(card);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getPrediction = async (question) => {
    setIsGeneratingAI(true);
    try {
      const system = `คุณคือ "ปรมาจารย์โหราศาสตร์พยากรณ์" วิเคราะห์ไพ่ด้วยภาษาไทยสละสลวย 6-8 ประโยค`;
      const prompt = `ไพ่: ${selectedCard.name}, คำถาม: ${question || "ดวงทั่วไป"}`;
      const res = await predict(prompt, system);
      setPrediction(res.text);
      setActiveModel(res.modelUsed);
    } catch (err) {
      setPrediction("สื่อจิตขัดข้อง: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const reset = () => {
    setSelectedCard(null);
    setPrediction("");
    setActiveModel("");
  };

  return {
    selectedCard,
    prediction,
    activeModel,
    isAnalyzing,
    isGeneratingAI,
    draw,
    getPrediction,
    reset,
  };
};
