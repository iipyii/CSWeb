import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlider() {
  const slides = [
    { url: 'https://scontent.fbkk24-1.fna.fbcdn.net/v/t39.30808-6/566256971_1347866220460793_5481407962201855946_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=13d280&_nc_ohc=-9BTDNuWrhAQ7kNvwFldIyI&_nc_oc=Adl4O3tuGGP963BHOpDVXIicc_6lPg45puUe-IcpwV6bRIydWWLMkbkbi20yab-yUWiU5kp8qr0gp_Utill6-r9M&_nc_zt=23&_nc_ht=scontent.fbkk24-1.fna&_nc_gid=McyfTYSEsMhMLFzVAXBXOA&oh=00_AfvOf7k6ZebZ8ICKCBF-f1ThFBYwf0mk5un_BtQLwdULEQ&oe=699BCD1F', title: 'Slide 1' },
    { url: 'https://scontent.fbkk24-1.fna.fbcdn.net/v/t39.30808-6/569319179_1350317600215655_7340636591323933668_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=2a1932&_nc_ohc=TbZ2FIUgCeQQ7kNvwGNrm2C&_nc_oc=AdkDneze6E12I_S1hlFwJ9zWKTtnf27nZP50i4ehBZLNRO2YJBfXeHBFLdbNZZRNZJCGgtbeoT6mMHt3cr2uq-hY&_nc_zt=23&_nc_ht=scontent.fbkk24-1.fna&_nc_gid=CVC7okhymKBTtduT2OUf2Q&oh=00_AfvPzVkGmvhC0RRdP3Q7rapTIIa2HxeF1a1CkydDRrIv5w&oe=699BA308', title: 'Slide 2' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // ตั้งค่าเปลี่ยนรูปอัตโนมัติทุกๆ 5 วินาที
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="w-full aspect-[24/9] relative group overflow-hidden bg-slate-100">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover object-top"
/>
          <div className="absolute inset-0 bg-indigo-900/5"></div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="hidden group-hover:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all shadow-lg"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={nextSlide}
        className="hidden group-hover:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all shadow-lg"
      >
        <ChevronRight size={32} />
      </button>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-10 h-3 bg-black' 
                : 'w-3 h-3 bg-black/20 hover:bg-black/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}