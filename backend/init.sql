CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE lecturers (
  id SERIAL PRIMARY KEY,
  lecturer_code VARCHAR(10) UNIQUE,
  fullname_th TEXT,
  fullname_en TEXT,
  position_th TEXT,
  position_en TEXT,
  email TEXT,
  tel TEXT,
  education_th TEXT,
  education_en TEXT,
  image_path TEXT
);

INSERT INTO lecturers
(lecturer_code, fullname_th, fullname_en, position_th, position_en, email, tel)
VALUES
('TNA', 'รองศาสตราจารย์ ดร.ธนภัทร์ อนุศาสน์อมรกุล',
 'Associate Professor Tanapat Anusas-amornkul, Ph.D.',
 'หัวหน้าภาควิชาฯ',
 'Head of Department',
 'tanapat.a@sci.kmutnb.ac.th',
 '0-2555-2000 ต่อ 4621');