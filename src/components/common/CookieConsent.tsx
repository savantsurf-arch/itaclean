import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';
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

  const dismiss = () => {
    // Dismiss for session without permanent storage
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de Cookies e LGPD"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-slate-900/95 text-white backdrop-blur-md border-t border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 sm:gap-3 flex-1">
          <Cookie className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
            Utilizamos cookies para personalizar sua experiência e analisar o tráfego conforme nossa{' '}
            <Link to="/privacidade" className="text-sky-400 underline hover:text-sky-300 font-medium">
              Política de Privacidade e LGPD
            </Link>
            . Ao continuar navegando, você concorda com nossos termos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={acceptAll}
            className="flex-1 sm:flex-initial px-4 py-2 bg-[#009fe3] hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-300 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Aceitar e Continuar</span>
          </button>
          <button
            onClick={dismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
            aria-label="Fechar aviso de cookies"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
