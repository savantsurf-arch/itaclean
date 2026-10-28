import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  QrCode,
  Copy,
  Printer,
  Package,
  ArrowRight,
  MessageCircle,
  Truck,
  MapPin,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getOrderByNumber } from '../lib/data-service';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    setIsLoading(true);
    getOrderByNumber(orderNumber).then((data) => {
      setOrder(data);
      setIsLoading(false);
    });
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Pedido não encontrado</h2>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-[#003893] text-white text-xs font-bold rounded-lg"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  // Realistic mock Pix copy-paste key for demonstration
  const pixCopyPasteCode = `00020126580014br.gov.bcb.pix013638452190000144520400005303986540${order.total_amount.toFixed(
    2
  )}5802BR5925ITACLEAN PRO DISTRIBUID6009SAO PAULO62070503***6304${order.order_number.replace(
    /\D/g,
    ''
  )}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* SUCCESS BANNER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Pedido Registrado com Sucesso!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Obrigado pela sua compra, {order.customer_name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Seu pedido <strong className="text-slate-800 font-mono text-base">{order.order_number}</strong> foi gerado e os detalhes foram enviados para o e-mail{' '}
            <strong className="text-slate-700">{order.customer_email}</strong>.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Comprovante</span>
            </button>
            <a
              href={`https://wa.me/557341419517?text=Ol%C3%A1!%20Acabei%20de%20realizar%20o%20pedido%20${order.order_number}%20no%20site%20da%20Itaclean.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Dúvidas no WhatsApp</span>
            </a>
          </div>
        </div>

        {/* PIX PAYMENT INSTRUCTIONS BOX (WHEN PIX SELECTED) */}
        {order.payment_method === 'pix' && (
          <div className="bg-white rounded-2xl border-2 border-emerald-500/50 shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Pague com Pix para Confirmação Imediata
                </h3>
                <p className="text-xs text-slate-500">
                  Abra o aplicativo do seu banco, escolha Pix e aponte a câmera para o QR Code abaixo.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              {/* QR Code Container */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <QRCodeSVG value={pixCopyPasteCode} size={180} level="M" />
              </div>

              {/* Instructions and Copy-Paste */}
              <div className="space-y-3 flex-1 max-w-md">
                <div>
                  <span className="text-xs text-slate-400 block">Valor total a pagar:</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Código Pix Copia e Cola:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCopyPasteCode}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-600 truncate select-all"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Este QR Code expira em 15 minutos para garantir o seu estoque.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER DETAILS & ITEMS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#003893]" />
            <span>Detalhes dos Produtos Comprados</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {it.image_url && (
                    <img
                      src={it.image_url}
                      alt={it.product_name_snapshot}
                      className="w-12 h-12 object-contain rounded border border-slate-100"
                    />
                  )}
                  <div>
                    <p className="font-bold text-slate-800">{it.product_name_snapshot}</p>
                    <p className="text-[11px] text-slate-500">
                      SKU: {it.sku_snapshot} • Qtd: {it.quantity} un x {formatCurrency(it.unit_price)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(it.line_total)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            {/* Delivery address */}
            <div className="space-y-1 text-slate-600">
              <span className="font-bold text-slate-900 uppercase block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#003893]" /> Endereço de Entrega:
              </span>
              <p>
                {order.shipping_address.street}, {order.shipping_address.number}{' '}
                {order.shipping_address.complement && `(${order.shipping_address.complement})`}
              </p>
              <p>
                {order.shipping_address.neighborhood} — {order.shipping_address.city}/
                {order.shipping_address.state}
              </p>
              <p>CEP: {order.shipping_address.postal_code}</p>
              <p className="text-[11px] text-sky-700 font-semibold pt-1">
                Modalidade: {order.shipping_method}
              </p>
            </div>

            {/* Total financial recap */}
            <div className="space-y-1.5 text-right">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descontos:</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Frete:</span>
                <span className="font-semibold text-slate-800">
                  {order.shipping_amount === 0 ? 'Grátis' : formatCurrency(order.shipping_amount)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Total Pago / A Pagar:</span>
                <span className="font-black text-xl text-[#003893]">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="text-center pt-4">
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <span>Continuar Navegando na Loja</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
