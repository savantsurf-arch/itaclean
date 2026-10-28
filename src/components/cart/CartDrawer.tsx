import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency, calculatePixPrice } from '../../lib/utils';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    total,
    appliedCoupon,
    couponMessage,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCouponCode(couponInput.trim());
    setIsApplyingCoupon(false);
    setCouponInput('');
  };

  const handleGoToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleGoToCart = () => {
    closeCart();
    navigate('/carrinho');
  };

  const pixPrice = calculatePixPrice(total, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 bg-[#003893] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">
                Meu Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Seu carrinho está vazio</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Explore nosso catálogo profissional e adicione os melhores produtos para a sua
                    empresa.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/produtos');
                  }}
                  className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-3.5 flex gap-3 items-start">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 line-clamp-2">
                      {item.product.name}
                    </p>
                    {item.variant && (
                      <span className="inline-block mt-0.5 text-[11px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-medium">
                        {item.variant.name}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-slate-300 rounded-md bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#003893]">
                          {formatCurrency(item.total_price)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Cupom de desconto */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Cupom: {appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-600">
                        -{formatCurrency(discountAmount)} de desconto aplicado
                      </p>
                    </div>
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
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Possui cupom? (Ex: BEMVINDO10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponMessage && !appliedCoupon && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponMessage}</span>
                </div>
              )}

              {/* Subtotal e totais */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Desconto ({appliedCoupon?.code}):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-300">
                  <span className="text-sm font-bold text-slate-900">Total:</span>
                  <div className="text-right">
                    <span className="text-base font-black text-[#003893]">
                      {formatCurrency(total)}
                    </span>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      ou {formatCurrency(pixPrice)} no Pix (5% off)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleGoToCheckout}
                  className="w-full py-3 bg-[#003893] hover:bg-[#002766] text-white font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer"
                >
                  <span>Finalizar Compra</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGoToCart}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition-colors"
                >
                  Ver Carrinho Completo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
