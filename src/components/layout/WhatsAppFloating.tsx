import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Balloon Popup */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Atendimento Itaclean</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Olá! Precisa de auxílio técnico para escolher produtos de limpeza ou cotação corporativa em
            grande volume?
          </p>
          <a
            href="https://wa.me/5511987654321?text=Ol%C3%A1!%20Estou%20no%20site%20da%20Itaclean%20e%20gostaria%20de%20um%20or%C3%A7amento%20ou%20tirar%20d%C3%BAvidas."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Iniciar Conversa no WhatsApp</span>
          </a>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
        aria-label="Falar pelo WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-400"></span>
        </span>
      </button>
    </div>
  );
};
