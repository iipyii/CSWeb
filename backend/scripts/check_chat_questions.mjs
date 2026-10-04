import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  console.log('=== 1. Checking 040613003 in subjects ===');
  const sub1 = await prisma.subjects.findMany({
    where: {
      OR: [
        { subject_code: { contains: '040613003' } },
        { title_th: { contains: 'โครงสร้างข้อมูล' } }
      ]
    }
  });
  console.log(sub1.map(s => ({ code: s.subject_code, title: s.title_th, prereq1: s.prereq1, prereq2: s.prereq2, year: s.curriculum_year })));

  console.log('=== 2. Checking 040613011 (คลาวด์คอมพิวติงและเดฟออปส์) ===');
  const sub2 = await prisma.subjects.findMany({
    where: {
      OR: [
        { subject_code: { contains: '040613011' } },
        { title_th: { contains: 'คลาวด์' } },
        { title_th: { contains: 'เดฟออปส์' } }
      ]
    }
  });
  console.log(sub2.map(s => ({ code: s.subject_code, title: s.title_th, desc: s.description_th })));

  console.log('=== 3. Checking Tracks in subjects ===');
  const tracks = await prisma.subjects.groupBy({
    by: ['track'],
    _count: true
  });
  console.log('Tracks in DB:', tracks);

  console.log('=== 4. Checking Curriculum 2569 subjects ===');
  const cs69 = await prisma.subjects.count({ where: { curriculum_year: 2569 } });
  console.log('Total subjects in 2569:', cs69);

  console.log('=== 5. Checking อาจารย์ รศ.ดร.ธนภัทร์ in advisors ===');
  const adv = await prisma.advisors.findMany({
    include: {
      lecturer: true,
      advisor_students: {
        include: { student: true }
      }
    }
  });
  console.log('Advisors count:', adv.length);
  const tanapat = adv.filter(a => a.lecturer?.fullname_th?.includes('ธนภัทร์'));
  console.log('ธนภัทร์ advisors:', tanapat.map(t => ({
    lecturer: t.lecturer.fullname_th,
    year: t.year,
    level: t.level,
    studentCount: t.advisor_students.length,
    sampleStudents: t.advisor_students.slice(0, 3).map(s => s.student.student_id + ' ' + s.student.firstname)
  })));

  console.log('=== 6. Checking internships table ===');
  const interns = await prisma.internships.findMany();
  console.log('Internships count:', interns.length);
  interns.forEach(i => console.log(i.section, '|', i.title));

  console.log('=== 7. Checking scholarships in student_handbooks or FAQ ===');
  const handbooks = await prisma.student_handbooks.findMany({
    where: {
      OR: [
        { category: { contains: 'ทุน' } },
        { topic: { contains: 'ทุน' } },
        { content: { contains: 'ทุน' } }
      ]
    }
  });
  console.log('Scholarship in student_handbooks:', handbooks.map(h => ({ cat: h.category, topic: h.topic })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
