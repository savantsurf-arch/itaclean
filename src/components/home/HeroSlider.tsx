import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '../../types';
import { getBanners } from '../../lib/data-service';

export const HeroSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getBanners().then((data) => {
      setBanners(data);
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[currentIndex];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden min-h-[360px] sm:min-h-[420px] md:min-h-[480px] max-h-[540px] flex items-center justify-center">
      {/* Background Image with Darkened Center-Legible Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.desktop_image_url}
          alt={current.title}
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00173d]/90 via-[#00225d]/80 to-[#00173d]/90 backdrop-brightness-90" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 max-w-5xl mx-auto h-full px-8 sm:px-14 lg:px-20 py-12 flex flex-col justify-center items-center text-center">
        <div className="max-w-3xl flex flex-col items-center space-y-3 sm:space-y-4">
          {current.badge_text && (
            <span className="inline-flex items-center gap-1.5 bg-[#009fe3] text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              {current.badge_text}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {current.title}
          </h1>
          {current.subtitle && (
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-100 max-w-2xl leading-relaxed drop-shadow-sm font-normal">
              {current.subtitle}
            </p>
          )}
          <div className="pt-2 sm:pt-4">
            <Link
              to={current.link_url}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm md:text-base px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>{current.button_text || 'Conferir Produtos'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg border border-white/10"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg border border-white/10"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-2.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 sm:h-2.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-7 sm:w-8 bg-amber-400' : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Ir para banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
