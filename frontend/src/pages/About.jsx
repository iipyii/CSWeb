import React from 'react';

const About = () => {
  const sections = [
    { title: "วิสัยทัศน์ (Vision)", detail: "เป็นผู้นำด้านการจัดการศึกษาและวิจัยทางวิทยาการคอมพิวเตอร์ในระดับสากล เพื่อสร้างนวัตกรรมและบุคลากรที่มีคุณภาพ" },
    { title: "พันธกิจ (Mission)", detail: "ผลิตบัณฑิตที่มีความรู้คู่คุณธรรม พัฒนาผลงานวิจัยที่เป็นที่ยอมรับ และให้บริการวิชาการเพื่อเสริมสร้างศักยภาพของสังคม" }
  ];

  return (
    <div className="container-custom py-16 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 border-l-8 border-red-800 pl-4">แนะนำภาควิชาฯ</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-100 h-64 rounded-2xl flex items-center justify-center text-gray-400 italic">
          [รูปภาพอาคารหรือบรรยากาศภาควิชา]
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xl text-gray-700 leading-relaxed mb-4">
            ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ มุ่งเน้นการผลิตบัณฑิตให้มีความเชี่ยวชาญทั้งด้านทฤษฎีและปฏิบัติ 
            รองรับการเปลี่ยนแปลงของเทคโนโลยีที่รวดเร็วในยุคดิจิทัล
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {sections.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-red-800 mb-4">{s.title}</h3>
            <p className="text-lg text-gray-600 leading-relaxed">{s.detail}</p>
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-8">โครงสร้างการบริหาร</h2>
      <div className="bg-gray-50 p-10 rounded-2xl border-2 border-dashed border-gray-200 text-center">
        <div className="inline-block bg-red-800 text-white p-4 rounded-lg mb-4">หัวหน้าภาควิชา</div>
        <div className="flex justify-center space-x-4">
          <div className="bg-white border p-3 rounded shadow-sm">รองหัวหน้าฯ ฝ่ายวิชาการ</div>
          <div className="bg-white border p-3 rounded shadow-sm">รองหัวหน้าฯ ฝ่ายกิจการนักศึกษา</div>
          <div className="bg-white border p-3 rounded shadow-sm">รองหัวหน้าฯ ฝ่ายบริหาร</div>
        </div>
      </div>
    </div>
  );
};

export default About;