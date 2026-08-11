# ONHAND — สถานะปัจจุบันของ The Oracle Portal

อัปเดตล่าสุด: 2026-08-11

## ภาพรวมโปรเจกต์

React + Vite SPA ดีพลอยผ่าน GitHub Pages ที่ https://oyaai.github.io/tarot-app/
เป็นเว็บดูดวง 3 ฟีเจอร์: ไพ่ยิปซี, โหราศาสตร์ผูกดวง, ดูลายมือ ทั้งหมดใช้โมเดลธุรกิจแบบ **freemium เดียวกัน**:

> ใช้งานพื้นฐาน (สุ่มไพ่ / คำนวณราศี / อ่านลายมือคร่าวๆ) **ฟรีไม่จำกัดครั้ง** → ถ้าต้องการ **คำทำนายแบบ AI ละเอียด** ต้องจ่าย **99 บาท** ผ่านการสแกน QR (ปัจจุบันเป็น mockup ยังไม่เชื่อม payment gateway จริง)

## สถานะแต่ละฟีเจอร์

### 1. ไพ่ยิปซี (Tarot) — ใช้งานได้เต็มรูปแบบ
- สุ่มไพ่จาก `src/data/tarot.js` ฟรีไม่จำกัด
- กด "ขอคำทำนายแบบละเอียด (99.-)" → เปิด modal QR (mockup) → ยืนยันแล้วเรียก Gemini AI ผ่าน `src/api/gemini.js`
- ไฟล์หลัก: `src/components/Tarot/TarotView.jsx`, `src/hooks/useTarot.js`

### 2. โหราศาสตร์ (Astrology) — ทำงานได้แล้ว (เพิ่งพัฒนา)
- กรอกวันเกิด/เวลาเกิด/เพศ → คำนวณ **ราศีสากล 12 ราศี** ทันทีแบบฟรี (คำนวณ client-side ไม่ต้องเรียก AI) จาก `src/data/astrology.js`
- แสดงผลฟรี: ชื่อราศี, ธาตุประจำราศี, คำอธิบายนิสัยสั้นๆ
- กด "ขอคำทำนายแบบละเอียด (99.-)" → เปิด modal QR (mockup) → ยืนยันแล้วเรียก Gemini AI วิเคราะห์ดวงชะตาแบบละเอียด (ความรัก/การงาน/การเงิน/สุขภาพ)
- ไฟล์หลัก: `src/components/Astrology/AstrologyView.jsx`, `src/data/astrology.js`

### 3. ดูลายมือ (Palmistry) — ทำงานได้แล้ว (เพิ่งพัฒนา)
- อัปโหลดรูปฝ่ามือซ้าย-ขวา → กด "เริ่มการวิเคราะห์ด้วย AI Vision (ฟรี)" → ส่งรูปเป็น base64 เข้า Gemini Vision ผ่าน `predict()` (รองรับ image parts แล้ว) → ได้ผลอ่านสั้นๆ 2-3 ประโยคฟรี
- กด "ขอคำทำนายแบบละเอียด (99.-)" → เปิด modal QR (mockup) → ยืนยันแล้วเรียก Gemini Vision อีกครั้งด้วย prompt ละเอียดกว่า (เส้นชีวิต/สมอง/หัวใจ/วาสนา/ภูเขาบนฝ่ามือ)
- ไฟล์หลัก: `src/components/Palmistry/PalmistryView.jsx`

## การเปลี่ยนแปลงระบบกลาง

- `src/api/gemini.js`: ฟังก์ชัน `predict(prompt, systemInstruction, images)` เพิ่ม parameter `images` (optional array ของ `{ mimeType, data }` แบบ base64) เพื่อรองรับ Gemini Vision — ใช้ร่วมกันทั้ง Tarot (text-only), Astrology (text-only), Palmistry (มีรูป)
- `index.html`: เพิ่ม SEO/OG/Twitter meta tags ครบ (title, description, keywords, og:*, twitter:*) ภาษาไทย เพื่อให้แชร์ลิงก์ใน LINE/Facebook มีพรีวิวและติด SEO ได้ดีขึ้น

## ความเสี่ยง / จุดที่ยังไม่พร้อมโปรดักชัน

1. **QR ชำระเงินเป็น mockup ทั้ง 3 ฟีเจอร์** — ยังไม่เชื่อม PromptPay/payment gateway จริง กดยืนยันแล้วปลดคำทำนายได้เลยโดยไม่ตรวจสอบการจ่ายจริง
2. **API key ของ Gemini (`VITE_GEMINI_KEY`) ฝังอยู่ฝั่ง client** — เพราะ build ด้วย Vite แล้ว deploy เป็น static site บน GitHub Pages ใครเปิด dev tools ก็ดึง key ออกมาใช้เองได้ ควรย้ายไปเรียกผ่าน backend/serverless function ก่อนเปิดใช้งานจริงกับผู้ใช้จำนวนมาก
3. **og:image ที่อ้างถึงใน index.html (`og-image.jpg`) ยังไม่มีไฟล์จริง** — ต้องสร้างรูปภาพขนาด 1200x630 แล้ววางไว้ใน `public/`
4. ยังไม่มีการทดสอบอัตโนมัติ (unit/e2e test) สำหรับ flow การจ่ายเงินและการเรียก AI

## วิธีรันโปรเจกต์

```
npm install
npm run dev      # dev server
npm run build    # build สำหรับ production
npm run lint     # ตรวจ eslint
```

ต้องมีไฟล์ `.env` ที่มี `VITE_GEMINI_KEY=<your_gemini_api_key>`
