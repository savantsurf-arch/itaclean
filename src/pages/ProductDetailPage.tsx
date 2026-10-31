import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  Building2,
  Share2,
  AlertTriangle,
  Check,
  Plus,
  Minus,
  Sparkles,
  FlaskConical,
  FileText,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { getProductBySlug, getProducts } from '../lib/data-service';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  formatCurrency,
  calculatePixPrice,
  formatCEP,
  fetchAddressByCEP,
  calculateShippingEstimate,
} from '../lib/utils';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'desc' | 'dilution' | 'technical' | 'safety'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Shipping calculation state
  const [cepInput, setCepInput] = useState('');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [cepCityState, setCepCityState] = useState('');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      window.scrollTo(0, 0);

      try {
        const item = await getProductBySlug(slug);
        if (item) {
          setProduct(item);
          setSelectedImageIndex(0);
          setQuantity(1);
          if (item.variants && item.variants.length > 0) {
            setSelectedVariant(item.variants[0]);
          } else {
            setSelectedVariant(undefined);
          }

          // Fetch related products in the same category
          const related = await getProducts({
            categorySlug: item.category?.slug,
            pageSize: 4,
          });
          setRelatedProducts(related.products.filter((p) => p.id !== item.id));
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-slate-800">Produto não encontrado</h2>
        <p className="text-sm text-slate-500 mt-2">
          O produto que você procura pode ter sido descontinuado ou movido.
        </p>
        <Link
          to="/produtos"
          className="mt-4 inline-block px-5 py-2.5 bg-[#003893] text-white text-xs font-bold rounded-lg"
        >
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? selectedVariant.sale_price ?? selectedVariant.price
    : product.sale_price ?? product.price;

  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const pixPrice = calculatePixPrice(currentPrice, 5);
  const maxStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = maxStock <= 0;
  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cepInput.replace(/\D/g, '');
    if (clean.length !== 8) {
      setShippingError('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError('');
    try {
      const addr = await fetchAddressByCEP(clean);
      if (!addr) {
        setShippingError('CEP não encontrado. Verifique os números digitados.');
        setShippingOptions([]);
      } else {
        setCepCityState(`${addr.localidade}/${addr.uf} - ${addr.bairro}`);
        const estimates = calculateShippingEstimate(clean, currentPrice * quantity);
        setShippingOptions(estimates);
      }
    } catch {
      setShippingError('Erro ao consultar CEP. Tente novamente.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#003893] transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/produtos" className="hover:text-[#003893] transition-colors">
            Catálogo
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link
                to={`/produtos?categoria=${product.category.slug}`}
                className="hover:text-[#003893] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
        </nav>

        {/* MAIN PRODUCT ROW */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-96 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg border-2 p-1 bg-white shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#003893] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Foto ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-square bg-slate-50 rounded-xl border border-slate-100 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={product.images[selectedImageIndex] || '/itaclean-logo.png'}
                alt={product.name}
                className="max-h-full max-w-full object-contain hover:scale-110 transition-transform duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {hasDiscount && (
                  <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded shadow-sm">
                    -{discountPercentage}% OFF
                  </span>
                )}
                {product.is_new && (
                  <span className="bg-[#009fe3] text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-sm">
                    Lançamento
                  </span>
                )}
              </div>

              {/* Share & Wishlist quick buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-full transition-all shadow-sm ${
                    isFavorited
                      ? 'bg-rose-50 text-rose-500'
                      : 'bg-white text-slate-400 hover:text-rose-500 hover:bg-slate-50'
                  }`}
                  title="Favoritar"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white text-slate-400 hover:text-sky-600 hover:bg-slate-50 transition-all shadow-sm"
                  title="Compartilhar Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {copiedLink && (
                <div className="absolute bottom-4 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full">
                  Link copiado para a área de transferência!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS, PRICING & BUY ACTIONS */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand and SKU */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-[#003893] uppercase tracking-wider">
                  {product.brand?.name || 'Itaclean Profissional'}
                </span>
                <span>
                  SKU: <strong className="text-slate-700">{selectedVariant?.sku || product.sku}</strong>
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Stock Status Badge */}
              <div className="mt-3 flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-4 h-4" /> Esgotado no momento
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-4 h-4" /> Em estoque ({maxStock} unidades disponíveis)
                  </span>
                )}
              </div>

              {/* VARIANTS SELECTOR (e.g. 5L vs 20L, Voltagem, etc.) */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Selecione a Embalagem / Variação:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                          selectedVariant?.id === v.id
                            ? 'bg-[#003893] text-white border-[#003893] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {v.name} • {formatCurrency(v.sale_price ?? v.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRICE BOX */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-black text-[#003893]">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-extrabold text-emerald-600">
                    {formatCurrency(pixPrice)} no Pix
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    5% de desconto
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ou em até <strong>3x sem juros</strong> de {formatCurrency(currentPrice / 3)} no cartão
                </p>
              </div>

              {/* QUANTITY & BUY BUTTONS */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 uppercase">Qtd:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-2 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-bold text-slate-800 min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                      disabled={quantity >= maxStock || isOutOfStock}
                      className="p-2 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="w-full py-3.5 px-4 bg-sky-50 hover:bg-sky-100 text-[#003893] font-bold text-xs sm:text-sm rounded-xl border border-sky-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full py-3.5 px-4 bg-[#003893] hover:bg-[#002766] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>Comprar Agora</span>
                  </button>
                </div>
              </div>
            </div>

            {/* B2B QUICK QUOTE ON WHATSAPP */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#003893]" />
                <span className="text-slate-700">Compra corporativa em grande volume?</span>
              </div>
              <a
                href={`https://wa.me/557341419517?text=Ol%C3%A1!%20Gostaria%20de%20uma%20cota%C3%A7%C3%A3o%20especial%20do%20produto%20${encodeURIComponent(
                  product.name
                )}%20(SKU:%20${product.sku})`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Pedir Cotação PJ</span>
              </a>
            </div>

            {/* SHIPPING ESTIMATOR */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#003893]" />
                Calcular Frete e Prazo de Entrega:
              </span>
              <form onSubmit={handleCalculateShipping} className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  maxLength={9}
                  value={cepInput}
                  onChange={(e) => setCepInput(formatCEP(e.target.value))}
                  className="w-40 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003893]"
                />
                <button
                  type="submit"
                  disabled={isCalculatingShipping}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCalculatingShipping ? 'Consultando...' : 'Calcular'}
                </button>
              </form>

              {shippingError && (
                <p className="text-xs text-rose-600 mt-2 font-medium">{shippingError}</p>
              )}

              {cepCityState && (
                <p className="text-[11px] text-slate-600 font-medium mt-2">
                  Destino: <strong className="text-slate-800">{cepCityState}</strong>
                </p>
              )}

              {shippingOptions.length > 0 && (
                <div className="mt-3 space-y-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  {shippingOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/60 last:border-0"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{opt.name}</span>
                        <p className="text-[11px] text-slate-500">Prazo: {opt.deadline}</p>
                      </div>
                      <span className="font-bold text-[#003893]">
                        {opt.price === 0 ? (
                          <span className="text-emerald-600 uppercase font-black">Grátis</span>
                        ) : (
                          formatCurrency(opt.price)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TECHNICAL DETAILS & SAFETY TABS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 mb-12">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-200 gap-4 overflow-x-auto scrollbar-none pb-2">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 px-1 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                activeTab === 'desc'
                  ? 'border-[#003893] text-[#003893]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Descrição Completa</span>
            </button>

            {product.dilution_info && (
              <button
                onClick={() => setActiveTab('dilution')}
                className={`pb-2 px-1 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'dilution'
                    ? 'border-[#003893] text-[#003893]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-sky-600" />
                <span>Instruções de Diluição</span>
              </button>
            )}

            {product.technical_info && Object.keys(product.technical_info).length > 0 && (
              <button
                onClick={() => setActiveTab('technical')}
                className={`pb-2 px-1 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'technical'
                    ? 'border-[#003893] text-[#003893]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ficha Técnica</span>
              </button>
            )}

            {product.safety_info && (
              <button
                onClick={() => setActiveTab('safety')}
                className={`pb-2 px-1 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'safety'
                    ? 'border-[#003893] text-[#003893]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Segurança e FISPQ</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="pt-6">
            {activeTab === 'desc' && (
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4">
                <p>{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">
                      Principais Vantagens:
                    </h4>
                    <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600">
                      <li>Rendimento profissional comprovado</li>
                      <li>Economia na reposição periódica</li>
                      <li>Embalagem resistente com lacre de segurança</li>
                      <li>Ideal para empresas, condomínios e indústrias</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">
                      Fabricante e Garantia:
                    </h4>
                    <p className="text-xs text-slate-600">
                      Produzido por <strong>{product.brand?.name || 'Itaclean'}</strong> seguindo
                      rigorosos padrões de controle de qualidade e registros regulatórios.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dilution' && product.dilution_info && (
              <div className="space-y-4">
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex items-start gap-3">
                  <FlaskConical className="w-6 h-6 text-[#003893] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#003893]">
                      Instruções Oficiais de Diluição:
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {product.dilution_info}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 italic flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Dica: Utilize dosadores ou copos graduados para garantir a proporção correta e evitar desperdício de produto.</span>
                </div>
              </div>
            )}

            {activeTab === 'technical' && product.technical_info && (
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(product.technical_info).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 bg-slate-50/70">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{val}</td>
                      </tr>
                    ))}
                    {product.weight && (
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 bg-slate-50/70">
                          Peso Aproximado
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{product.weight} kg</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'safety' && product.safety_info && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Precauções de Uso & Segurança</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">{product.safety_info}</p>
                <p className="text-[11px] text-amber-700">
                  Em caso de dúvidas sobre FISPQ completa ou manuseio com EPIs específicos, consulte nosso setor técnico via WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Quem comprou este produto também comprou:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
