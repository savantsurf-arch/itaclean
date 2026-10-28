import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('itaclean_lgpd_consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('itaclean_lgpd_consent', 'accepted');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-slate-900/95 text-white backdrop-blur-xs border-t border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 leading-relaxed">
            Utilizamos cookies para personalizar sua experiência de compra e analisar o tráfego em nosso
            catálogo de acordo com a nossa{' '}
            <Link to="/privacidade" className="text-sky-400 underline hover:text-sky-300">
              Política de Privacidade e LGPD
            </Link>
            . Ao continuar navegando, você concorda com nossos termos.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={acceptAll}
            className="px-4 py-2 bg-[#009fe3] hover:bg-sky-500 text-white font-bold rounded-md shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Aceitar e Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
