import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  FileText,
  Lock,
} from 'lucide-react';
import { InstagramIcon } from '../common/InstagramIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* COLUNA 1: SOBRE A ITACLEAN */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700">
                <img
                  src="/itaclean-logo.jpg"
                  alt="Itaclean Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">ITACLEAN</span>
                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                  Limpeza & Descartável
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distribuidora especializada em produtos de limpeza profissional, químicos de alta
              performance, papéis institucionais, descartáveis e equipamentos para empresas, indústrias,
              clínicas e condomínios.
            </p>
            <div className="pt-2 text-xs space-y-1.5 text-slate-400">
              <p className="font-semibold text-white">Razão Social: Itaclean Pro Distribuidora Ltda</p>
              <p>CNPJ: 38.452.190/0001-44</p>
            </div>
          </div>

          {/* COLUNA 2: ATENDIMENTO & LOCALIZAÇÃO */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#009fe3] pl-2.5">
              Central de Atendimento
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">(11) 4004-2020</span>
                  <p className="text-[11px] text-slate-500">Televendas e Suporte Técnico</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <a
                  href="https://wa.me/5511987654321"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-300 font-medium text-white transition-colors"
                >
                  (11) 98765-4321
                  <p className="text-[11px] text-green-400/80">Atendimento WhatsApp Comercial</p>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <InstagramIcon className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <a
                  href="https://www.instagram.com/itacleanlimpeza/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-300 font-medium text-white transition-colors"
                >
                  @itacleanlimpeza
                  <p className="text-[11px] text-pink-400/80">Siga nosso perfil no Instagram</p>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>comercial@itaclean.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Seg a Sex: 08:00 às 18:00 | Sáb: 08:00 às 13:00</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Av. Industrial, 1500 - Galpão 04 - São Paulo/SP</span>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: NAVEGAÇÃO INSTITUCIONAL */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#009fe3] pl-2.5">
              Políticas e Institucional
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">
                  Quem Somos (Sobre a Itaclean)
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-white transition-colors">
                  Cotações para Empresas & Faturamento PJ
                </Link>
              </li>
              <li>
                <Link to="/politica-de-frete" className="hover:text-white transition-colors">
                  Política de Entregas e Frete Grátis
                </Link>
              </li>
              <li>
                <Link to="/trocas-e-devolucoes" className="hover:text-white transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-white transition-colors">
                  Termos e Condições de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-white transition-colors">
                  Privacidade de Dados & LGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: SEGURANÇA E FORMAS DE PAGAMENTO */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#009fe3] pl-2.5 mb-3">
                Formas de Pagamento
              </h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-sky-300">
                  <QrCode className="w-4 h-4" />
                  <span className="font-semibold text-white">Pix com 5% de Desconto Imediato</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Cartões de Crédito em até 12x (Visa, Master, Elo)</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Boleto Faturado PJ (Sujeito a Análise)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-green-400" />
                Compra 100% Segura
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> SSL Criptografado
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">
                  Produtos Notificados ANVISA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT & LEGAL STATEMENT */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Itaclean Limpeza e Descartável. Todos os direitos reservados.
            Preços e condições válidos exclusivamente para compras no site oficial.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/privacidade" className="hover:underline">
              LGPD
            </Link>
            <span>•</span>
            <Link to="/termos" className="hover:underline">
              Termos
            </Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-blue-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Painel Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
