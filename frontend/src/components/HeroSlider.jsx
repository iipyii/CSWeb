import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/appearance/banners?active=true`);
        setSlides(
          res.data.map((banner) => ({
            id: banner.id,
            url: `${API_BASE}${banner.image_path}`,
            title: banner.title || 'Banner',
          }))
        );
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (slides.length === 0 ? 0 : (prev + 1) % slides.length));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (slides.length === 0 ? 0 : (prev === 0 ? slides.length - 1 : prev - 1)));
  };

  // ตั้งค่าเปลี่ยนรูปอัตโนมัติทุกๆ 5 วินาที (ไม่ต้องเล่นถ้ามีรูปเดียวหรือไม่มีเลย)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  return (
    <div className="w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[24/9] relative group overflow-hidden bg-slate-100">
      {loading ? (
        <div className="absolute inset-0 animate-pulse bg-slate-200" />
      ) : slides.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
          <ImageOff size={40} strokeWidth={1.5} />
          <span className="text-sm font-medium">ยังไม่มีรูปแบนเนอร์</span>
        </div>
      ) : (
        <>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
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

          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="flex md:hidden md:group-hover:flex absolute left-8 top-1/2 -translate-y-1/2 hover:scale-110 z-20 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition-all shadow-lg"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={nextSlide}
                className="flex md:hidden md:group-hover:flex absolute right-8 top-1/2 -translate-y-1/2 hover:scale-110 z-20 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition-all shadow-lg"
              >
                <ChevronRight size={32} />
              </button>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'w-10 h-3 bg-black'
                        : 'w-3 h-3 bg-black/20 hover:bg-black/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
