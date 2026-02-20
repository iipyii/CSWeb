import React, { useState } from 'react';
import { faqData } from '../data/mockData';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="container-1440 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-indigo-900 mb-4 flex items-center justify-center">
          <HelpCircle className="mr-3" size={40} /> คำถามที่พบบ่อย (FAQ)
        </h1>
        <p className="text-gray-500">รวบรวมคำถามที่พบบ่อยเกี่ยวกับการเรียนการสอนและการสมัครเข้าศึกษา</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-xl text-gray-800">{item.q}</span>
              {open === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {open === idx && (
              <div className="px-6 pb-6 text-gray-600 animate-fadeIn">
                <hr className="mb-4" />
                <p className="text-lg leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}