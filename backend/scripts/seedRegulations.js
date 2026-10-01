import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const regulationsData = [
  // 1. Finance (งานการเงิน)
  { title: "การจัดเก็บค่าธรรมเนียมและเงินอุดหนุนการศึกษาโครงการพิเศษ (สองภาษา) หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ พ.ศ.2557", category: "finance", file_path: "fin_01.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 2)", category: "finance", file_path: "fin_02.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 3)", category: "finance", file_path: "fin_03.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 4)", category: "finance", file_path: "fin_04.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 5)", category: "finance", file_path: "fin_05.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี (24 ส.ค. 58)", category: "finance", file_path: "fin_06.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี (ฉบับที่ 2)", category: "finance", file_path: "fin_07.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี (ฉบับที่ 3) 2562", category: "finance", file_path: "fin_08.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี 2561", category: "finance", file_path: "fin_09.pdf", file_type: "PDF" },
  { title: "ระเบียบมหาวิทยาลัย ว่าด้วย การเบิกจ่ายเงินรายได้ของมหาวิทยาลัย พ.ศ. 2551", category: "finance", file_path: "fin_10.pdf", file_type: "PDF" },
  { title: "ระเบียบมหาวิทยาลัย ว่าด้วย ค่าธรรมเนียมและเงินอุดหนุนการศึกษาหลักสูตรพิเศษ ระดับปริญญาตรี พ.ศ. 2563", category: "finance", file_path: "fin_11.pdf", file_type: "PDF" },

  // 2. Academic (งานวิชาการ)
  { title: "ประกาศ เรื่องเกณฑ์การยื่นขอสอบหัวข้อโครงงานพิเศษ (ฉบับหลักสูตรปรับปรุง พ.ศ.2564)", category: "academic", file_path: "academic_01.pdf", file_type: "PDF" },

  // 3. Personnel (งานบุคคล)
  { title: "ระเบียบมหาวิทยาลัย ว่าด้วย สวัสดิการด้านการรักษาพยาบาลสำหรับพนักงานมหาวิทยาลัยและครอบครัว พ.ศ.2567", category: "personnel", file_path: "hr_01.pdf", file_type: "PDF" },

  // 4. Graduate (งานบัณฑิตศึกษา)
  { title: "การกำหนดมาตรฐานวารสารวิชาการ ระดับปริญญาดุษฎีบัณฑิตเพื่อใช้ประกอบการสำเร็จการศึกษา", category: "graduate", file_path: "grad_01.pdf", file_type: "PDF" },
  { title: "การกำหนดมาตรฐานวารสารวิชาการ หรือการนำเสนอผลงานต่อที่ประชุมวิชาการระดับปริญญามหาบัณฑิต เพื่อใช้ประกอบการสำเร็จการศึกษา", category: "graduate", file_path: "grad_02.pdf", file_type: "PDF" },
  { title: "การยื่นใบแสดงผลการศึกษา (Transcript) ฉบับตรวจสอบ เพื่อใช้ประกอบการสอบประมวลความรู้ การสอบวัดคุณสมบัติ การสอบวิทยานิพนธ์ การสอบสารนิพนธ์ และการลาพักการศึกษา", category: "graduate", file_path: "grad_03.pdf", file_type: "PDF" },
  { title: "เกณฑ์มาตรฐานภาษาอังกฤษ สำหรับนักศึกษาระดับบัณฑิตศึกษา", category: "graduate", file_path: "grad_04.pdf", file_type: "PDF" },
  { title: "ขอแจ้งมติที่ประชุมกรณีศึกษาระดับบัณฑิตศึกษาลงทะเบียนวิชาเรียนผิด", category: "graduate", file_path: "grad_05.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัย ว่าด้วย การศึกษาระดับบัณฑิตศึกษา (ฉบับที่ 2) พ.ศ. 2561", category: "graduate", file_path: "grad_06.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัย ว่าด้วย การศึกษาระดับบัณฑิตศึกษา (ฉบับที่ 3) พ.ศ. 2562", category: "graduate", file_path: "grad_07.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัย ว่าด้วย การศึกษาระดับบัณฑิตศึกษา พ.ศ. 2560", category: "graduate", file_path: "grad_08.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วย เครื่องแบบ และเครื่องแต่งกายนักศึกษา พ.ศ. ๒๕๕๔", category: "graduate", file_path: "grad_09.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับบัณฑิตศึกษา (ฉบับที่ ๒) พ.ศ. ๒๕๕๔", category: "graduate", file_path: "grad_10.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับบัณฑิตศึกษา (ฉบับที่ ๓) พ.ศ. ๒๕๕๕", category: "graduate", file_path: "grad_11.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับบัณฑิตศึกษา (ฉบับที่ ๔) พ.ศ. ๒๕๕๕", category: "graduate", file_path: "grad_12.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับบัณฑิตศึกษา (ฉบับที่ ๕) พ.ศ. ๒๕๕๕", category: "graduate", file_path: "grad_13.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับบัณฑิตศึกษา (ฉบับที่ ๖) พ.ศ. ๒๕๕๙", category: "graduate", file_path: "grad_14.pdf", file_type: "PDF" },
  { title: "ข้อบังคับมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ว่าด้วยการศึกษาระดับบัณฑิตศึกษา พ.ศ. ๒๕๕๒", category: "graduate", file_path: "grad_15.pdf", file_type: "PDF" },
  { title: "ขั้นตอนการศึกษาระดับบัณฑิตศึกษา ระดับปริญญาโท แผน ก", category: "graduate", file_path: "grad_17.pdf", file_type: "PDF" },
  { title: "ขั้นตอนการศึกษาระดับบัณฑิตศึกษา ระดับปริญญาโท แผน ข", category: "graduate", file_path: "grad_18.pdf", file_type: "PDF" },
  { title: "ขั้นตอนการศึกษาระดับบัณฑิตศึกษา ระดับปริญญาเอก", category: "graduate", file_path: "grad_19.pdf", file_type: "PDF" },

  // 5. Student Affairs (งานกิจการนักศึกษา)
  { title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนการศึกษาเพื่อศึกษาต่อในระดับบัณฑิตศึกษา คณะวิทยาศาสตร์ประยุกต์", category: "student_affairs", file_path: "std_01.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนบุคลากรเข้าร่วมแข่งขันสิ่งประดิษฐ์ นวัตกรรม หรือผลงานวิจัย ณ ต่างประเทศ คณะวิทยาศาสตร์ประยุกต์", category: "student_affairs", file_path: "std_02.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนเพื่อพัฒนาศักยภาพนักศึกษา คณะวิทยาศาสตร์ประยุกต์", category: "student_affairs", file_path: "std_03.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนเพื่อพัฒนาศักยภาพนักศึกษาระดับปริญญาตรี คณะวิทยาศาสตร์ประยุกต์ (ฉบับที่ 2)", category: "student_affairs", file_path: "std_04.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนเพื่อพัฒนาศักยภาพนักศึกษาระดับปริญญาตรี คณะวิทยาศาสตร์ประยุกต์", category: "student_affairs", file_path: "std_05.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง กำหนดประเภทและลักษณะความผิดวินัยนักศึกษา", category: "student_affairs", file_path: "std_06.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง ลักษณะโทษความผิดวินัยนักศึกษากรณีดื่มสุราของมึนเมา หรือมั่วสุมสิ่งเสพติดและสูบบุหรี่ ภายในพื้นที่มหาวิทยาลัย", category: "student_affairs", file_path: "std_07.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง สวัสดิการช่วยเหลือสำหรับนักศึกษาและบุคลากร ในช่วงการแพร่ระบาดของโรคติดเชื้อไวรัสโคโรนา 2019 (COVID-19)", category: "student_affairs", file_path: "std_08.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การลงทะเบียนเรียนซ้ำวิชาเรียนในรายวิชาที่สอบตกของนักศึกษาระดับปริญญาตรี", category: "student_affairs", file_path: "std_09.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์และอัตราการจ้างนักศึกษาช่วยงานวิชาการ", category: "student_affairs", file_path: "std_10.pdf", file_type: "PDF" },
  { title: "เรื่องแต่งตั้งคณะกรรมการบริหารงานกิจการนักศึกษาภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ ประจำปีการศึกษา 2568", category: "student_affairs", file_path: "std_11.pdf", file_type: "PDF" },

  // 6. Coop (งานสหกิจศึกษา)
  { title: "ข้อบังคับมหาวิทยาลัย ว่าด้วย สหกิจศึกษาและการบูรณาการการเรียนรู้กับการทำงาน พ.ศ. 2562", category: "coop", file_path: "coop_01.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การจัดสรรเงินรายได้และการเบิกจ่ายค่าใช้จ่ายในการบริหารงาน โครงการสหกิจศึกษาและโครงการบูรณาการการเรียนรู้กับการทำงาน", category: "coop", file_path: "coop_02.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การจัดสรรเงินรายได้และการเบิกจ่ายค่าใช้จ่ายในการบริหารงาน โครงการสหกิจศึกษาและโครงการบูรณาการการเรียนรู้กับการทำงาน (ฉบับที่ 3)", category: "coop", file_path: "coop_03.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การจัดสรรและการเบิกจ่ายค่าใช้จ่ายในการบริหารงานโครงการสหกิจศึกษาและโครงการบูรณาการการเรียนรู้กับการทำงาน(ฉบับที่ 2)", category: "coop", file_path: "coop_04.pdf", file_type: "PDF" },
  { title: "ประกาศมหาวิทยาลัย เรื่อง อัตราค่าเบี้ยประชุม ค่าตอบแทน และค่าใช้จ่ายในการบริหารงานโครงการสหกิจศึกษา (ฉบับที่ 2)", category: "coop", file_path: "coop_05.pdf", file_type: "PDF" },
  { title: "ประกาศ คุณสมบัตินักศึกษาโครงการสหกิจ ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ", category: "coop", file_path: "coop_06.pdf", file_type: "PDF" },

  // 7. Scholarship (งานทุนการศึกษา)
  { title: "หลักเกณฑ์การให้ทุนการศึกษาประเภทยกเว้นค่าใช้จ่ายในการลงทะเบียนวิชาเรียน", category: "scholarship", file_path: "scholar_01.pdf", file_type: "PDF" },
  { title: "หลักเกณฑ์การให้ทุนการศึกษาจากเงินรายได้ประจำปีงบประมาณ", category: "scholarship", file_path: "scholar_02.pdf", file_type: "PDF" }
];

async function main() {
  console.log("Seeding regulations...");
  let count = 0;
  for (const item of regulationsData) {
    const existing = await prisma.downloads.findFirst({
      where: {
        title: item.title,
        audience: "regulation"
      }
    });

    if (!existing) {
      await prisma.downloads.create({
        data: {
          title: item.title,
          audience: "regulation",
          category: item.category,
          file_path: item.file_path,
          file_name: item.file_path,
          file_type: item.file_type
        }
      });
      count++;
    }
  }
  console.log(`Seeded ${count} regulation documents successfully.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
