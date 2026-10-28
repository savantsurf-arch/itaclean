import React from 'react';
import { Phone, MessageCircle, Clock, ShieldCheck, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopBar: React.FC = () => {
  return (
    <div className="bg-[#00225d] text-white text-xs border-b border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Contact info & hours */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span>(11) 4004-2020</span>
          </div>
          <a
            href="https://wa.me/5511987654321?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos%20Itaclean."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-green-300 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-400" />
            <span className="font-medium">WhatsApp Comercial</span>
          </a>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Seg a Sex: 08h às 18h | Sáb: 08h às 13h</span>
          </div>
        </div>

        {/* Commercial Highlights Ticker / Corporate Link */}
        <div className="flex items-center gap-4 text-blue-100">
          <div className="hidden sm:flex items-center gap-1.5 text-sky-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>5% de desconto à vista no Pix</span>
          </div>
          <span className="hidden sm:inline text-blue-400">•</span>
          <Link
            to="/contato"
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-medium transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vendas Corporativas & Cotações PJ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
