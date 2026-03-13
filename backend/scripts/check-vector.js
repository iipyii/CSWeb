// เปลี่ยนพาธตรงนี้ให้ตรงกับที่อยู่ไฟล์ getLocalEmbedding ของคุณ
import { getLocalEmbedding } from "../src/services/embedding.service.js"; 

async function checkDimension() {
    try {
        console.log("⏳ กำลังทดสอบแปลงข้อความเป็น Vector...");
        
        // ลองโยนข้อความสั้นๆ เข้าไปในโมเดลของคุณ
        const resultVector = await getLocalEmbedding("ทดสอบระบบ Chatbot AI");

        console.log("✅ แปลงข้อความสำเร็จ!");
        
        // 🎯 จุดสำคัญ: ปรินต์หาขนาดของ Vector
        console.log(`📏 ขนาด Vector (Dimension) ของโมเดลคุณคือ: ${resultVector.length}`);
        
        // แอบดูหน้าตาตัวเลขข้างในสัก 3 ตัวแรก
        console.log("👀 ตัวอย่างค่าที่ได้:", resultVector.slice(0, 3), "...");

    } catch (error) {
        console.error("💥 เกิดข้อผิดพลาด:", error);
    }
}

checkDimension();