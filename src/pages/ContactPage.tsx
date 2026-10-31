import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { formatPhone } from '../lib/utils';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('cotacao');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulação de envio com feedback visual
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSent(false);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setMessage('');
    setSubject('cotacao');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#003893] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Fale com a Itaclean
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Central de Atendimento & Cotações PJ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Nossa equipe técnica e comercial está à disposição para elaborar orçamentos personalizados, tirar dúvidas de diluição e fornecer fichas técnicas (FISPQ).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CANAIS OFICIAIS DE ATENDIMENTO */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Canais Oficiais de Atendimento
              </h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#003893] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <a href="tel:7341419517" className="font-bold text-slate-900 block text-sm hover:underline">
                      (73) 4141-9517
                    </a>
                    <span className="text-slate-500">Televendas e Suporte de Pedidos</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <a
                      href="https://wa.me/557341419517?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20minha%20empresa."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-900 hover:text-green-600 block text-sm"
                    >
                      (73) 4141-9517
                    </a>
                    <span className="text-slate-500">WhatsApp Comercial Itaclean</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003893] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#003893]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">contato@itaclean.com.br</span>
                    <span className="text-slate-500">Envio de pedidos de compra e faturamento</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Horário de Atendimento</span>
                    <span className="text-slate-500">Seg a Sex: 08:00 às 18:00 | Sáb: 08:00 às 13:00</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Loja & Showroom</span>
                    <span className="text-slate-500">
                      Av. Cinquentenário, 187 - Centro - Itabuna/BA (CEP: 45600-077)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO DE CONTATO / COTAÇÃO */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
            {isSent ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Mensagem Enviada com Sucesso!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Recebemos a sua solicitação. Nosso consultor comercial entrará em contato em até 2 horas úteis através do e-mail ou WhatsApp informado.
                </p>
                <div className="pt-2">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Enviar Outra Mensagem
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate={false}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Formulário de Contato e Cotação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div>
                    <label htmlFor="contact-name" className="font-bold text-slate-700 block mb-1">
                      Seu Nome *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      aria-required="true"
                      placeholder="Ex: João da Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                    />
                  </div>

                  {/* E-mail Corporativo */}
                  <div>
                    <label htmlFor="contact-email" className="font-bold text-slate-700 block mb-1">
                      E-mail Corporativo *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      placeholder="joao@empresa.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                    />
                  </div>

                  {/* Telefone / WhatsApp com Máscara Padronizada */}
                  <div>
                    <label htmlFor="contact-phone" className="font-bold text-slate-700 block mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      aria-required="true"
                      placeholder="(73) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                    />
                  </div>

                  {/* Nome da Empresa */}
                  <div>
                    <label htmlFor="contact-company" className="font-bold text-slate-700 block mb-1">
                      Nome da Empresa / Condomínio
                    </label>
                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Ex: Condomínio Residencial Bella Vista"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                    />
                  </div>
                </div>

                {/* Motivo do Contato: Select Funcional */}
                <div>
                  <label htmlFor="contact-subject" className="font-bold text-slate-700 block mb-1">
                    Motivo do Contato *
                  </label>
                  <div className="relative">
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      aria-required="true"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors appearance-none pr-8 cursor-pointer"
                    >
                      <option value="cotacao">Cotação em Grande Quantidade / Venda Faturada PJ</option>
                      <option value="duvida_tecnica">Dúvida Técnica sobre Diluição ou FISPQ</option>
                      <option value="duvida_pedido">Consultar Status de Pedido Existente</option>
                      <option value="fornecedor">Parceria / Cadastro de Fornecedor</option>
                      <option value="outro">Outros Assuntos</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Mensagem / Lista de Produtos */}
                <div>
                  <label htmlFor="contact-message" className="font-bold text-slate-700 block mb-1">
                    Mensagem / Lista de Produtos para Orçamento *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    aria-required="true"
                    rows={4}
                    placeholder="Descreva quais produtos precisa (ex: 10 caixas de papel toalha, 4 galões de desengraxante 5L...) ou sua dúvida."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors resize-y"
                  />
                </div>

                {/* Botão com Estado de Loading */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#003893] focus:ring-offset-2"
                >
                  <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
                  <span>{isLoading ? 'Enviando Mensagem...' : 'Enviar Mensagem para o Comercial'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
