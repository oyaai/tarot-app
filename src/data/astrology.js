// src/data/astrology.js
// รายชื่อราศีสากล 12 ราศี พร้อมช่วงวันที่ (ปฏิทินสุริยคติ) และคำทำนายพื้นฐานแบบฟรี

export const zodiacSigns = [
  { name: "มังกร (Capricorn)", start: [12, 22], end: [1, 19], element: "ดิน", trait: "มุ่งมั่น อดทน มีวินัยสูง ทำงานหนักเพื่อเป้าหมายระยะยาว" },
  { name: "กุมภ์ (Aquarius)", start: [1, 20], end: [2, 18], element: "ลม", trait: "มีความคิดสร้างสรรค์ เป็นตัวของตัวเอง รักอิสระและความแปลกใหม่" },
  { name: "มีน (Pisces)", start: [2, 19], end: [3, 20], element: "น้ำ", trait: "อ่อนโยน จินตนาการสูง เข้าใจความรู้สึกผู้อื่นได้ลึกซึ้ง" },
  { name: "เมษ (Aries)", start: [3, 21], end: [4, 19], element: "ไฟ", trait: "กล้าหาญ ตัดสินใจไว ชอบความท้าทายและเป็นผู้นำ" },
  { name: "พฤษภ (Taurus)", start: [4, 20], end: [5, 20], element: "ดิน", trait: "มั่นคง รักความสบาย ให้คุณค่ากับความมั่นคงทางการเงินและความสัมพันธ์" },
  { name: "เมถุน (Gemini)", start: [5, 21], end: [6, 20], element: "ลม", trait: "ฉลาดไหวพริบดี พูดเก่ง ปรับตัวเร็ว ชอบเรียนรู้สิ่งใหม่" },
  { name: "กรกฎ (Cancer)", start: [6, 21], end: [7, 22], element: "น้ำ", trait: "อ่อนไหว รักครอบครัว ดูแลคนรอบข้างด้วยความใส่ใจ" },
  { name: "สิงห์ (Leo)", start: [7, 23], end: [8, 22], element: "ไฟ", trait: "มั่นใจในตัวเอง มีเสน่ห์ อยากเป็นจุดสนใจ และมีน้ำใจนักเลง" },
  { name: "กันย์ (Virgo)", start: [8, 23], end: [9, 22], element: "ดิน", trait: "ละเอียดรอบคอบ วิเคราะห์เก่ง มาตรฐานสูงทั้งกับตัวเองและผู้อื่น" },
  { name: "ตุลย์ (Libra)", start: [9, 23], end: [10, 22], element: "ลม", trait: "รักความยุติธรรมและความสมดุล เข้าสังคมเก่ง มีรสนิยม" },
  { name: "พิจิก (Scorpio)", start: [10, 23], end: [11, 21], element: "น้ำ", trait: "ลึกลับ หลงใหลในความจริง มุ่งมั่นและรักอย่างเข้มข้น" },
  { name: "ธนู (Sagittarius)", start: [11, 22], end: [12, 21], element: "ไฟ", trait: "รักการผจญภัย มองโลกในแง่ดี ชอบเสรีภาพและการเดินทาง" },
];

// คืนค่าราศีจากวันเดือนปีเกิด (รับ string รูปแบบ YYYY-MM-DD)
export const getZodiacSign = (dobString) => {
  if (!dobString) return null;
  const date = new Date(dobString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return zodiacSigns.find(({ start, end }) => {
    const [sm, sd] = start;
    const [em, ed] = end;
    if (sm === em) return month === sm && day >= sd && day <= ed;
    if (sm > em) {
      // ช่วงข้ามปี เช่น มังกร (22 ธ.ค. - 19 ม.ค.)
      return (month === sm && day >= sd) || (month === em && day <= ed);
    }
    return (month === sm && day >= sd) || (month === em && day <= ed) || (month > sm && month < em);
  });
};
