import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageCircle,
  Truck,
  User,
  MapPin,
  Building2,
  ArrowRight,
  AlertCircle,
  Copy,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Phone,
  FileText,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency,
  formatPhone,
  formatCEP,
  fetchAddressByCEP,
  calculateShippingEstimate,
} from '../lib/utils';
import { createOrder } from '../lib/data-service';
import { Address } from '../types';
import {
  ITACLEAN_WHATSAPP_NUMBER,
  buildWhatsAppOrderMessage,
  generateWhatsAppOrderUrl,
  formatWhatsAppPrice,
} from '../lib/whatsapp';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, appliedCoupon, total, clearCart } = useCart();
  const { user } = useAuth();

  // Dados do Cliente
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [isCompany, setIsCompany] = useState(false);
  const [companyDoc, setCompanyDoc] = useState(user?.document_number || '');

  // Endereço de Entrega
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Itabuna');
  const [state, setState] = useState('BA');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Opções de Frete
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  // Estados de Envio e Modal de Confirmação
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState<string | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Redireciona se carrinho estiver vazio
  useEffect(() => {
    if (items.length === 0 && !showConfirmationModal) {
      navigate('/carrinho');
    }
  }, [items.length, showConfirmationModal, navigate]);

  // Preenche dados do usuário autenticado se disponível
  useEffect(() => {
    if (user) {
      if (user.full_name) setCustomerName(user.full_name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.document_number) setCompanyDoc(user.document_number);
      if (user.document_type === 'CNPJ') setIsCompany(true);
    }
  }, [user]);

  // Busca automática do CEP via ViaCEP
  const handleCepChange = async (val: string) => {
    const formatted = formatCEP(val);
    setCep(formatted);
    const clean = formatted.replace(/\D/g, '');

    if (clean.length === 8) {
      setIsSearchingCep(true);
      try {
        const addr = await fetchAddressByCEP(clean);
        if (addr) {
          setStreet(addr.logradouro || '');
          setNeighborhood(addr.bairro || '');
          setCity(addr.localidade || 'Itabuna');
          setState(addr.uf || 'BA');

          const opts = calculateShippingEstimate(clean, subtotal);
          setShippingOptions(opts);
          if (opts.length > 0) {
            setSelectedShipping(opts[0]);
          }
        }
      } catch (e) {
        console.error('Erro ao consultar ViaCEP:', e);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Finalização do pedido pelo WhatsApp
  const handleFinalizeWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validação de itens no carrinho
    if (items.length === 0) {
      setErrorMessage('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
      navigate('/carrinho');
      return;
    }

    // 2. Validação dos dados obrigatórios do cliente
    if (!customerName.trim()) {
      setErrorMessage('Por favor, informe seu Nome Completo.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Por favor, informe um número de Telefone/WhatsApp válido com DDD.');
      return;
    }

    if (!cep.trim() || cep.replace(/\D/g, '').length !== 8) {
      setErrorMessage('Por favor, informe um CEP válido com 8 dígitos.');
      return;
    }

    if (!street.trim()) {
      setErrorMessage('Por favor, informe o Endereço (Rua/Avenida).');
      return;
    }

    if (!number.trim()) {
      setErrorMessage('Por favor, informe o Número do endereço de entrega.');
      return;
    }

    if (!neighborhood.trim()) {
      setErrorMessage('Por favor, informe o Bairro de entrega.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Monta a mensagem organizada conforme o modelo obrigatório
      const message = buildWhatsAppOrderMessage({
        customer: {
          name: customerName,
          phone: customerPhone,
          cep,
          street,
          number,
          neighborhood,
          city,
          state,
          complement,
          reference,
          notes,
        },
        items: items.map((it) => ({
          name: it.product.name,
          variantName: it.variant?.name,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          totalPrice: it.total_price,
        })),
        subtotal,
        total: grandTotal,
        discountAmount,
        couponCode: appliedCoupon?.code,
        shippingAmount: shippingCost,
        shippingMethod: selectedShipping?.name,
      });

      // 4. Gera o link oficial wa.me/NUMERO?text=MENSAGEM_URL_ENCODED
      const whatsappUrl = generateWhatsAppOrderUrl(message, ITACLEAN_WHATSAPP_NUMBER);

      // 5. Salva o pedido no banco/localStorage para registro de histórico
      const shippingAddress: Address = {
        id: `addr-${Date.now()}`,
        recipient_name: customerName,
        postal_code: cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        reference,
      };

      const orderData = {
        user_id: user?.id,
        customer_name: customerName,
        customer_email: user?.email || `${cleanPhone}@itaclean.com.br`,
        customer_phone: customerPhone,
        customer_document: companyDoc || undefined,
        shipping_address: shippingAddress,
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingCost,
        total_amount: grandTotal,
        coupon_code: appliedCoupon?.code,
        payment_status: 'pending' as const,
        order_status: 'pending_payment' as const,
        payment_method: 'whatsapp' as const,
        shipping_method: selectedShipping?.name || 'A combinar via WhatsApp',
        notes: notes ? `${notes} (Pedido finalizado via WhatsApp)` : 'Finalizado via WhatsApp',
        items: items.map((i) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          order_id: '',
          product_id: i.product.id,
          product_name_snapshot: i.product.name,
          sku_snapshot: i.variant?.sku || i.product.sku,
          variant_snapshot: i.variant?.attributes,
          image_url: i.product.images[0],
          unit_price: i.unit_price,
          quantity: i.quantity,
          line_total: i.total_price,
        })),
      };

      const createdOrder = await createOrder(orderData);
      setCreatedOrderNumber(createdOrder.order_number);
      setGeneratedMessage(message);
      setPendingWhatsAppUrl(whatsappUrl);

      // Abre o WhatsApp em nova aba imediatamente
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Exibe a tela/modal de confirmação (sem apagar o carrinho prematuramente)
      setShowConfirmationModal(true);
    } catch (err) {
      console.error('Erro ao preparar pedido WhatsApp:', err);
      setErrorMessage('Ocorreu uma falha ao preparar o seu pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = () => {
    if (!generatedMessage) return;
    navigator.clipboard.writeText(generatedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  const handleFinishAndClearCart = () => {
    clearCart();
    if (createdOrderNumber) {
      navigate(`/pedido/confirmado/${createdOrderNumber}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Checkout Direto via WhatsApp
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Finalização do Pedido
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Preencha seus dados de entrega abaixo. O pedido será enviado pronto para a equipe da ItaClean pelo WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#003893] bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#003893]" />
            <span>Sem necessidade de cartão no site</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleFinalizeWhatsApp}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: DADOS E ENDEREÇO */}
            <div className="lg:col-span-8 space-y-6">
              {/* ETAPA 1: DADOS DO CLIENTE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-[#003893]" />
                      Dados do Cliente
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompany(!isCompany)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                      isCompany
                        ? 'bg-blue-100 text-[#003893] font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isCompany ? 'Pessoa Jurídica (PJ) Ativa' : 'Comprar como PJ / Empresa'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {isCompany ? 'Razão Social ou Nome Fantasia *' : 'Nome Completo *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isCompany ? 'Ex: Condomínio Edifício Paulista' : 'Ex: João da Silva Santos'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Telefone / WhatsApp com DDD *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(73) 99999-9999"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Número onde você receberá a confirmação da equipe ItaClean.
                    </span>
                  </div>

                  {isCompany && (
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        CNPJ da Empresa (Opcional para faturamento B2B)
                      </label>
                      <input
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={companyDoc}
                        onChange={(e) => setCompanyDoc(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ETAPA 2: ENDEREÇO DE ENTREGA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#003893]" />
                    Endereço de Entrega
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      CEP * (Preenchimento Automático)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="45600-077"
                      maxLength={9}
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                    {isSearchingCep && (
                      <span className="text-[10px] text-sky-600 block mt-1 font-semibold animate-pulse">
                        Buscando endereço via CEP...
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Endereço / Logradouro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Av. Cinquentenário, Rua do Comércio..."
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 187 ou S/N"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Centro"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cidade / Estado *</label>
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        type="text"
                        required
                        placeholder="Cidade"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="col-span-2 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="UF"
                        maxLength={2}
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        className="px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none text-xs uppercase text-center font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Complemento (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Apto 101, Galpão 2, Sala 3..."
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Ponto de Referência (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Próximo à Praça Camacan, em frente ao posto..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ETAPA 3: OPÇÃO DE ENTREGA / RETIRADA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#003893]" />
                    Modalidade de Entrega ou Retirada
                  </h2>
                </div>

                {shippingOptions.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    <p className="font-semibold text-slate-700">
                      💡 Digite seu CEP no passo anterior para consultar as opções de entrega.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Também disponibilizamos retirada sem custo na loja física de Itabuna: Av. Cinquentenário, 187 - Centro.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedShipping?.id === opt.id
                            ? 'border-[#003893] bg-blue-50/70 font-bold ring-1 ring-[#003893]/30'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping_method"
                            checked={selectedShipping?.id === opt.id}
                            onChange={() => setSelectedShipping(opt)}
                            className="text-[#003893] focus:ring-[#003893]"
                          />
                          <div>
                            <span className="text-xs text-slate-800">{opt.name}</span>
                            <p className="text-[11px] text-slate-500 font-normal">Prazo: {opt.deadline}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#003893]">
                          {opt.price === 0 ? (
                            <span className="text-emerald-600 uppercase font-bold">Grátis</span>
                          ) : (
                            formatCurrency(opt.price)
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* ETAPA 4: OBSERVAÇÕES DO PEDIDO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#003893]" />
                    Observações do Pedido (Opcional)
                  </h2>
                </div>

                <div className="text-xs">
                  <textarea
                    rows={3}
                    placeholder="Instruções especiais de entrega, preferências de faturamento, horários de recebimento..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* INFORMAÇÃO SOBRE PAGAMENTO DIRETO NO WHATSAPP */}
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <span>Como funciona o pagamento?</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Para maior comodidade e segurança, <strong>todas as formas de pagamento são combinadas diretamente pelo WhatsApp</strong> com a equipe da ItaClean:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-emerald-950">
                  <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200/60">
                    <strong className="block text-emerald-800">Pix à Vista:</strong>
                    <span>5% de desconto imediato sobre o pedido.</span>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200/60">
                    <strong className="block text-emerald-800">Cartão de Crédito:</strong>
                    <span>Parcelamento em até 12x (3x sem juros).</span>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200/60">
                    <strong className="block text-emerald-800">Boleto Faturado PJ:</strong>
                    <span>Condições especiais de até 30 dias para empresas e condomínios.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: RESUMO DO PEDIDO E BOTÃO WHATSAPP */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5 sticky top-24">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Resumo do Pedido</span>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? 'produto' : 'produtos'}
                  </span>
                </h3>

                {/* Lista de itens com scroll compacto */}
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="py-2.5 flex items-center gap-3">
                      <img
                        src={it.product.images[0]}
                        alt={it.product.name}
                        className="w-12 h-12 object-contain rounded-lg border border-slate-100 shrink-0 bg-slate-50 p-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {it.product.name}
                        </p>
                        {it.variant && (
                          <span className="text-[10px] text-sky-700 font-medium">
                            {it.variant.name}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-500">
                          {it.quantity}x {formatCurrency(it.unit_price)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {formatCurrency(it.total_price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Linhas de valores */}
                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Desconto ({appliedCoupon?.code}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    <span className="font-bold text-slate-800">
                      {shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total do Pedido:</span>
                    <span className="text-2xl font-black text-[#003893]">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL DE FINALIZAÇÃO PELO WHATSAPP */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>
                    {isSubmitting ? 'Preparando WhatsApp...' : 'FINALIZAR PEDIDO PELO WHATSAPP'}
                  </span>
                </button>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 text-center space-y-1">
                  <p className="font-semibold text-slate-700 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Seus dados estão protegidos
                  </p>
                  <p>
                    O carrinho permanecerá salvo até que você confirme o envio com a equipe ItaClean no WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* MODAL DE CONFIRMAÇÃO PÓS-CLIQUE (GARANTE QUE O CARRINHO NÃO SEJA PERDIDO) */}
        {showConfirmationModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Pedido Pronto para Envio!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Abrimos o WhatsApp em uma nova aba para você enviar a mensagem com o seu pedido.
                  Caso a janela não tenha aberto automaticamente pelo navegador, use os botões abaixo:
                </p>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="space-y-2.5">
                {pendingWhatsAppUrl && (
                  <a
                    href={pendingWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Abrir WhatsApp da ItaClean Agora</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedMessage ? 'Mensagem Copiada com Sucesso!' : 'Copiar Texto da Mensagem'}</span>
                </button>
              </div>

              {/* Prévia da mensagem gerada */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Prévia da Mensagem Gerada:
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap select-all">
                  {generatedMessage}
                </div>
              </div>

              {/* Ações Finais: Limpar Carrinho ou Continuar */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleFinishAndClearCart}
                  className="flex-1 py-3 bg-[#003893] hover:bg-[#002766] text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Já enviei no WhatsApp (Concluir)
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmationModal(false)}
                  className="py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Voltar / Editar Dados
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
