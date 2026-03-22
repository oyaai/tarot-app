// src/api/gemini.js
const logger = {
  info: (msg, data) =>
    console.log(`%c[API] ${msg}`, "color: #10b981", data || ""),
  error: (msg, err) =>
    console.error(`%c[API_ERR] ${msg}`, "color: #ef4444", err),
};

const MODELS = [
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
];

export const predict = async (prompt, systemInstruction) => {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;

  const payload = {
    contents: [
      { parts: [{ text: `${systemInstruction}\n\nโจทย์: ${prompt}` }] },
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 2048, // ขยายเพื่อภาษาไทยที่ไม่ขาดตอน
    },
  };

  for (const model of MODELS) {
    logger.info(`Connecting to ${model}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        if (
          [503, 429].includes(data.error.code) ||
          data.error.message.includes("high demand")
        ) {
          continue; // สลับรุ่นถัดไป
        }
        throw new Error(data.error.message);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text, modelUsed: model };
    } catch (error) {
      if (model === MODELS[MODELS.length - 1]) throw error;
    }
  }
};
