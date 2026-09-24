import axios from "axios";
import fs from "fs";
import FormData from "form-data";

async function testBackend() {
  console.log("Testing Subject & Curriculum API Endpoints...");

  // 1. Test template download
  const templateRes = await axios.get("http://localhost:5000/api/subjects/template", {
    responseType: "arraybuffer"
  });
  console.log(`✅ GET /api/subjects/template returned ${templateRes.data.length} bytes (Excel)`);

  // 2. Test subjects list
  const listRes = await axios.get("http://localhost:5000/api/subjects?curriculum_code=CS69");
  console.log(`✅ GET /api/subjects?curriculum_code=CS69 returned ${listRes.data.length} subjects`);

  // 3. Test curriculum programs
  const progRes = await axios.get("http://localhost:5000/api/curriculum/programs");
  console.log(`✅ GET /api/curriculum/programs returned ${progRes.data.length} programs`);

  console.log("\n🎉 All backend verification tests passed successfully!");
}

testBackend().catch(err => {
  console.error("❌ Test error:", err.message);
});
