import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  CreditCard,
  QrCode,
  FileText,
  User,
  MapPin,
  Building2,
  ArrowRight,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency,
  calculatePixPrice,
  formatDocument,
  formatPhone,
  formatCEP,
  fetchAddressByCEP,
  calculateShippingEstimate,
} from '../lib/utils';
import { createOrder } from '../lib/data-service';
import { Address, Order, PaymentMethod } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, appliedCoupon, total, clearCart } = useCart();
  const { user } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerDoc, setCustomerDoc] = useState(user?.document_number || '');
  const [isCompany, setIsCompany] = useState(false);

  // Address
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [reference, setReference] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Shipping
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState(1);

  // Credit card dummy inputs (not stored, compliant with PCI/LGPD)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrinho');
    }
  }, [items.length, navigate]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.full_name);
      setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.document_number) setCustomerDoc(user.document_number);
      if (user.document_type === 'CNPJ') setIsCompany(true);
    }
  }, [user]);

  // Lookup CEP when 8 digits are entered
  const handleCepChange = async (val: string) => {
    const formatted = formatCEP(val);
    setCep(formatted);
    const clean = formatted.replace(/\D/g, '');

    if (clean.length === 8) {
      setIsSearchingCep(true);
      try {
        const addr = await fetchAddressByCEP(clean);
        if (addr) {
          setStreet(addr.logradouro);
          setNeighborhood(addr.bairro);
          setCity(addr.localidade);
          setState(addr.uf);

          // Calculate shipping options
          const opts = calculateShippingEstimate(clean, subtotal);
          setShippingOptions(opts);
          if (opts.length > 0) {
            setSelectedShipping(opts[0]);
          }
        }
      } catch (e) {
        console.error('Erro ViaCEP:', e);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);
  const finalPixPrice = calculatePixPrice(grandTotal, 5);
  const effectiveTotal = paymentMethod === 'pix' ? finalPixPrice : grandTotal;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !customerDoc.trim()) {
      setErrorMessage('Por favor, preencha todos os dados de identificação do cliente.');
      return;
    }

    if (!cep.trim() || !street.trim() || !number.trim() || !city.trim() || !state.trim()) {
      setErrorMessage('Por favor, complete o endereço de entrega com número.');
      return;
    }

    if (!selectedShipping) {
      setErrorMessage('Selecione uma opção de entrega para continuar.');
      return;
    }

    if (paymentMethod === 'credit_card') {
      if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
        setErrorMessage('Por favor, preencha todos os dados do cartão de crédito.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
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
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_document: customerDoc,
        shipping_address: shippingAddress,
        subtotal,
        discount_amount: paymentMethod === 'pix' ? discountAmount + (grandTotal - finalPixPrice) : discountAmount,
        shipping_amount: shippingCost,
        total_amount: effectiveTotal,
        coupon_code: appliedCoupon?.code,
        payment_status: paymentMethod === 'pix' || paymentMethod === 'boleto' ? ('pending' as const) : ('paid' as const),
        order_status: paymentMethod === 'credit_card' ? ('payment_approved' as const) : ('pending_payment' as const),
        payment_method: paymentMethod,
        shipping_method: selectedShipping.name,
        notes: isCompany ? 'Cliente solicitou emissão de Nota Fiscal Eletrônica corporativa (PJ)' : undefined,
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

      const created = await createOrder(orderData);
      clearCart();
      navigate(`/pedido/confirmado/${created.order_number}`);
    } catch (err: any) {
      console.error('Erro ao finalizar pedido:', err);
      setErrorMessage('Houve uma falha ao processar o seu pedido. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Compra 100% Segura
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Finalização do Pedido
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Criptografia SSL Ativa</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: STEPS */}
            <div className="lg:col-span-8 space-y-6">
              {/* ETAPA 1: IDENTIFICAÇÃO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Identificação do Comprador
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCompany(!isCompany)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        isCompany
                          ? 'bg-blue-100 text-[#003893] font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompany ? 'Pessoa Jurídica (PJ)' : 'Comprar como PJ / Empresa'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {isCompany ? 'Razão Social ou Nome Fantasia *' : 'Nome Completo *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isCompany ? 'Ex: Condomínio Edifício Paulista' : 'Ex: Carlos Silva'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      E-mail para Confirmação e Nota Fiscal *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seuemail@empresa.com.br"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Telefone / WhatsApp para Entrega *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {isCompany ? 'CNPJ da Empresa *' : 'CPF do Titular *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isCompany ? '00.000.000/0000-00' : '000.000.000-00'}
                      value={customerDoc}
                      onChange={(e) => setCustomerDoc(formatDocument(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                </div>
              </div>

              {/* ETAPA 2: ENDEREÇO DE ENTREGA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Endereço de Entrega
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      CEP (Preenchimento Automático) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="00000-000"
                      maxLength={9}
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                    {isSearchingCep && (
                      <span className="text-[10px] text-sky-600 block mt-1">
                        Buscando endereço via CEP...
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Logradouro / Rua *</label>
                    <input
                      type="text"
                      required
                      placeholder="Av. Paulista, Rua dos Pinheiros..."
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 1200"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Complemento / Bloco</label>
                    <input
                      type="text"
                      placeholder="Apto 42, Galpão 3..."
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Bairro"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="Cidade"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Estado (UF) *</label>
                    <input
                      type="text"
                      required
                      placeholder="SP"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ponto de Referência</label>
                    <input
                      type="text"
                      placeholder="Próximo à portaria social..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                </div>
              </div>

              {/* ETAPA 3: MODALIDADE DE ENTREGA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Opção de Entrega
                  </h2>
                </div>

                {shippingOptions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Informe seu CEP no passo anterior para calcular as opções de frete disponíveis para o seu endereço.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedShipping?.id === opt.id
                            ? 'border-[#003893] bg-blue-50/60 font-bold'
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
                            <span className="text-emerald-600 uppercase">Grátis</span>
                          ) : (
                            formatCurrency(opt.price)
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* ETAPA 4: PAGAMENTO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Forma de Pagamento
                  </h2>
                </div>

                {/* Method selector pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* PIX */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">Pix</span>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          5% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Aprovação imediata</p>
                    </div>
                  </button>

                  {/* CARTÃO DE CRÉDITO */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-[#003893] bg-blue-50/70 ring-2 ring-[#003893]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#003893] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Cartão de Crédito</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Em até 12x (3x sem juros)</p>
                    </div>
                  </button>

                  {/* BOLETO FATURADO PJ */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === 'boleto'
                        ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Boleto PJ Faturado</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Até 30 dias para empresas</p>
                    </div>
                  </button>
                </div>

                {/* Sub-form based on method */}
                {paymentMethod === 'pix' && (
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Desconto de 5% aplicado no Pix!
                    </p>
                    <p>
                      Valor final com desconto:{' '}
                      <strong className="text-emerald-950 text-sm">
                        {formatCurrency(finalPixPrice)}
                      </strong>
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Ao clicar em "Confirmar Pedido", geraremos o QR Code oficial do Pix e a chave Copia e Cola para pagamento imediato pelo aplicativo do seu banco.
                    </p>
                  </div>
                )}

                {paymentMethod === 'credit_card' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Número do Cartão *</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nome no Cartão *</label>
                      <input
                        type="text"
                        placeholder="Nome idêntico ao impresso no cartão"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Validade (MM/AA) *</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Código CVV *</label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Opções de Parcelamento *</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                      >
                        <option value={1}>1x de {formatCurrency(grandTotal)} (À vista sem juros)</option>
                        <option value={2}>2x de {formatCurrency(grandTotal / 2)} sem juros</option>
                        <option value={3}>3x de {formatCurrency(grandTotal / 3)} sem juros</option>
                        <option value={4}>4x de {formatCurrency((grandTotal * 1.05) / 4)}</option>
                        <option value={6}>6x de {formatCurrency((grandTotal * 1.08) / 6)}</option>
                        <option value={12}>12x de {formatCurrency((grandTotal * 1.15) / 12)}</option>
                      </select>
                    </div>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Building2 className="w-4 h-4 text-amber-700" />
                      Faturamento Corporativo para Empresas e Condomínios:
                    </p>
                    <p>
                      O boleto bancário será emitido com prazo de <strong>28 a 30 dias</strong> após a validação cadastral do CNPJ da sua empresa pelo nosso setor financeiro.
                    </p>
                    <p className="text-[11px] text-slate-600">
                      A Nota Fiscal Eletrônica (NF-e) acompanhará a mercadoria e será enviada ao e-mail informado.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Itens do Pedido ({items.length})
                </h3>

                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="py-2.5 flex items-center gap-3">
                      <img
                        src={it.product.images[0]}
                        alt={it.product.name}
                        className="w-12 h-12 object-contain rounded border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {it.product.name}
                        </p>
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

                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Cupom ({appliedCoupon?.code}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    <span className="font-bold text-slate-800">
                      {shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  {paymentMethod === 'pix' && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Desconto 5% Pix:</span>
                      <span>-{formatCurrency(grandTotal - finalPixPrice)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Final:</span>
                    <span className="text-2xl font-black text-[#003893]">
                      {formatCurrency(effectiveTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#003893] hover:bg-[#002766] text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <span>{isSubmitting ? 'Processando Pedido...' : 'Confirmar e Finalizar Pedido'}</span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Ao confirmar o pedido, você concorda com nossos Termos de Compra e Política de Privacidade.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
