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
    <div className="relative bg-slate-900 text-white overflow-hidden aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] max-h-[480px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.desktop_image_url}
          alt={current.title}
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00225d]/95 via-[#003893]/75 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex flex-col justify-center">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {current.badge_text && (
            <span className="inline-block bg-[#009fe3] text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              {current.badge_text}
            </span>
          )}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
            {current.title}
          </h1>
          {current.subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-xl line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {current.subtitle}
            </p>
          )}
          <div className="pt-2">
            <Link
              to={current.link_url}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>{current.button_text || 'Conferir Produtos'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-all"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-all"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
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
