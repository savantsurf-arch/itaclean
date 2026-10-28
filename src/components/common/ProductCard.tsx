import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Check, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency, calculatePixPrice } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const currentPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const pixPrice = calculatePixPrice(currentPrice, 5);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-sky-300 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image Container & Badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-4 flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-xs">
              -{discountPercentage}%
            </span>
          )}
          {product.is_new && (
            <span className="bg-[#009fe3] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
              Novo
            </span>
          )}
          {product.is_featured && !hasDiscount && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              Destaque
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all z-10 ${
            isFavorited
              ? 'bg-rose-50 text-rose-500 shadow-xs'
              : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-2xs'
          }`}
          title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <Link to={`/produto/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.images[0] || '/itaclean-logo.jpg'}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-sky-700 truncate">
              {product.brand?.name || 'Itaclean'}
            </span>
            <span className="text-slate-400">SKU: {product.sku}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/produto/${product.slug}`}
            className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#003893] transition-colors line-clamp-2 leading-snug mb-2"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing & Stock */}
        <div className="pt-2 border-t border-slate-100">
          {/* Stock state */}
          <div className="mb-2">
            {isOutOfStock ? (
              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Indisponível
              </span>
            ) : isLowStock ? (
              <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Poucas unidades no estoque
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Em estoque (Pronta entrega)
              </span>
            )}
          </div>

          {/* Price display */}
          <div className="mb-3">
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through mr-1.5">
                {formatCurrency(product.price)}
              </span>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#003893]">
                {formatCurrency(currentPrice)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold">
              {formatCurrency(pixPrice)} no Pix (5% off)
            </p>
            <p className="text-[10px] text-slate-500">ou até 3x de {formatCurrency(currentPrice / 3)} sem juros</p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Link
              to={`/produto/${product.slug}`}
              className="col-span-1 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition-colors"
              title="Ver detalhes técnicos"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className={`col-span-3 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#003893] hover:bg-[#002766] text-white shadow-xs hover:shadow-md'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
