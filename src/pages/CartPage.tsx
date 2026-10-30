import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  CheckCircle2,
  AlertCircle,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  formatCurrency,
  calculatePixPrice,
  formatCEP,
  fetchAddressByCEP,
  calculateShippingEstimate,
} from '../lib/utils';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingAmount,
    total,
    appliedCoupon,
    couponMessage,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCouponCode,
    removeCoupon,
    setShippingCost,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Shipping
  const [cepInput, setCepInput] = useState('');
  const [cepFeedback, setCepFeedback] = useState('');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCouponCode(couponInput.trim());
    setIsApplyingCoupon(false);
    setCouponInput('');
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cepInput.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepFeedback('Digite um CEP válido.');
      return;
    }

    setIsCalculatingShipping(true);
    setCepFeedback('');
    try {
      const addr = await fetchAddressByCEP(clean);
      if (!addr) {
        setCepFeedback('CEP não localizado.');
      } else {
        setCepFeedback(`${addr.localidade}/${addr.uf} - ${addr.bairro}`);
        const estimates = calculateShippingEstimate(clean, subtotal);
        setShippingOptions(estimates);
        if (estimates.length > 0) {
          setSelectedShippingId(estimates[0].id);
          setShippingCost(estimates[0].price);
        }
      }
    } catch {
      setCepFeedback('Erro ao consultar CEP.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleSelectShipping = (opt: any) => {
    setSelectedShippingId(opt.id);
    setShippingCost(opt.price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-2xs space-y-4">
            <div className="w-20 h-20 bg-sky-50 text-[#003893] rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Seu carrinho de compras está vazio</h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Navegue pelas nossas categorias profissionais e aproveite as melhores condições de químicos, descartáveis e mops industriais.
            </p>
            <div className="pt-4">
              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <span>Ver Produtos Disponíveis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pixPrice = calculatePixPrice(total, 5);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Carrinho de Compras ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </h1>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Esvaziar Carrinho</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: CART ITEMS LIST */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Photo & Name */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border border-slate-100 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-sky-700 uppercase">
                        {item.product.brand?.name || 'Itaclean'}
                      </span>
                      <Link
                        to={`/produto/${item.product.slug}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#003893] transition-colors line-clamp-2 block"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        SKU: {item.variant?.sku || item.product.sku}
                      </p>
                      {item.variant && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                          {item.variant.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-slate-400 block">Unitário:</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatCurrency(item.unit_price)}
                      </span>
                    </div>

                    <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-800 min-w-7 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total & Trash */}
                    <div className="text-right min-w-20">
                      <span className="text-sm font-black text-[#003893]">
                        {formatCurrency(item.total_price)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remover produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/produtos"
                className="text-xs font-bold text-[#003893] hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continuar Comprando</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-4 space-y-6">
            {/* COUPON BOX */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#003893]" />
                <span>Cupom de Desconto</span>
              </h3>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">Cupom: {appliedCoupon.code}</span>
                    <p className="text-[11px] text-emerald-700">
                      -{formatCurrency(discountAmount)} aplicado
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: BEMVINDO10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003893]"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponMessage && !appliedCoupon && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponMessage}</span>
                </p>
              )}
            </div>

            {/* SHIPPING ESTIMATOR BOX */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#003893]" />
                <span>Calcular Frete</span>
              </h3>

              <form onSubmit={handleCalculateShipping} className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  maxLength={9}
                  value={cepInput}
                  onChange={(e) => setCepInput(formatCEP(e.target.value))}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003893]"
                />
                <button
                  type="submit"
                  disabled={isCalculatingShipping}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCalculatingShipping ? 'Calculando...' : 'Calcular'}
                </button>
              </form>

              {cepFeedback && (
                <p className="text-[11px] text-slate-600 font-medium">{cepFeedback}</p>
              )}

              {shippingOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                        selectedShippingId === opt.id
                          ? 'border-[#003893] bg-blue-50/50 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping_opt"
                          checked={selectedShippingId === opt.id}
                          onChange={() => handleSelectShipping(opt)}
                          className="text-[#003893] focus:ring-[#003893]"
                        />
                        <div>
                          <span className="text-slate-800">{opt.name}</span>
                          <p className="text-[10px] text-slate-500 font-normal">{opt.deadline}</p>
                        </div>
                      </div>
                      <span className="text-[#003893]">
                        {opt.price === 0 ? 'Grátis' : formatCurrency(opt.price)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* TOTALS & CHECKOUT BUTTON */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                Resumo do Pedido
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal dos itens:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Desconto ({appliedCoupon?.code}):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete estimado:</span>
                  <span className="font-semibold text-slate-800">
                    {shippingAmount === 0 ? 'Grátis / A calcular' : formatCurrency(shippingAmount)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total do Pedido:</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#003893]">
                      {formatCurrency(total)}
                    </span>
                    <p className="text-[11px] text-emerald-600 font-bold">
                      ou {formatCurrency(pixPrice)} no Pix (5% off)
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Finalizar Pedido pelo WhatsApp</span>
              </button>

              <div className="text-center pt-2 space-y-1">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                  💬 Pagamento e entrega combinados no WhatsApp
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Sem necessidade de digitar dados de cartão no site.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
