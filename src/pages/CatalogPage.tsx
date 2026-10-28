import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  X,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Search,
  PackageX,
} from 'lucide-react';
import { getProducts, getCategories, getBrands } from '../lib/data-service';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/common/ProductCard';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query state
  const categoryParam = searchParams.get('categoria') || '';
  const brandParam = searchParams.get('marca') || '';
  const searchParam = searchParams.get('busca') || '';
  const sortParam = (searchParams.get('ordenar') as any) || 'relevance';
  const pageParam = parseInt(searchParams.get('pagina') || '1', 10);
  const minPriceParam = searchParams.get('preco_min') ? Number(searchParams.get('preco_min')) : undefined;
  const maxPriceParam = searchParams.get('preco_max') ? Number(searchParams.get('preco_max')) : undefined;
  const inStockParam = searchParams.get('em_estoque') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Mobile drawer filter state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Local filter inputs for price
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam?.toString() || '');

  // Load categories and brands
  useEffect(() => {
    getCategories().then(setCategories);
    getBrands().then(setBrands);
  }, []);

  // Fetch products when params change
  useEffect(() => {
    async function fetchCatalog() {
      setIsLoading(true);
      try {
        const res = await getProducts({
          categorySlug: categoryParam,
          brandSlug: brandParam,
          search: searchParam,
          sortBy: sortParam,
          page: pageParam,
          pageSize: 12,
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
          inStockOnly: inStockParam,
          onSaleOnly: categoryParam === 'ofertas',
        });
        setProducts(res.products);
        setTotalCount(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Erro ao carregar catálogo:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCatalog();
  }, [categoryParam, brandParam, searchParam, sortParam, pageParam, minPriceParam, maxPriceParam, inStockParam]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Reset to page 1 on filter change
    if (key !== 'pagina') {
      newParams.delete('pagina');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localMinPrice) newParams.set('preco_min', localMinPrice);
    else newParams.delete('preco_min');

    if (localMaxPrice) newParams.set('preco_max', localMaxPrice);
    else newParams.delete('preco_max');

    newParams.delete('pagina');
    setSearchParams(newParams);
  };

  const currentCategory = categories.find((c) => c.slug === categoryParam);

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-[#003893] transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/produtos" className="hover:text-[#003893] transition-colors">
            Catálogo
          </Link>
          {currentCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{currentCategory.name}</span>
            </>
          )}
          {searchParam && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">Busca: "{searchParam}"</span>
            </>
          )}
        </nav>

        {/* HEADER BAR: TITLE, SEARCH RECAP & SORT */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentCategory ? currentCategory.name : 'Catálogo de Produtos'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isLoading
                ? 'Carregando produtos...'
                : `Exibindo ${products.length} de ${totalCount} produtos encontrados`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 text-[#003893]" />
              <span>Filtros</span>
            </button>

            {/* Ordenação */}
            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline text-slate-500 font-medium">Ordenar por:</span>
              <select
                value={sortParam}
                onChange={(e) => updateParam('ordenar', e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003893]"
              >
                <option value="relevance">Mais Relevantes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="name_asc">Nome (A - Z)</option>
                <option value="newest">Mais Recentes</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT: SIDEBAR FILTERS + PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden lg:block bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <SlidersHorizontal className="w-4 h-4 text-[#003893]" />
                <span>Filtrar Resultados</span>
              </div>
              {(categoryParam || brandParam || searchParam || minPriceParam || maxPriceParam || inStockParam) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            {/* Categoria Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Categorias
              </h3>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('categoria', null)}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    !categoryParam
                      ? 'bg-blue-50 text-[#003893] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas as Categorias
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('categoria', c.slug)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                      categoryParam === c.slug
                        ? 'bg-blue-50 text-[#003893] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Marcas Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Marcas
              </h3>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('marca', null)}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    !brandParam
                      ? 'bg-blue-50 text-[#003893] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas as Marcas
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateParam('marca', b.slug)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
                      brandParam === b.slug
                        ? 'bg-blue-50 text-[#003893] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Faixa de Preço */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Faixa de Preço (R$)
              </h3>
              <form onSubmit={handleApplyPriceFilter} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-[#003893]"
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-[#003893]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded transition-colors"
                >
                  Filtrar Preço
                </button>
              </form>
            </div>

            {/* Disponibilidade */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateParam('em_estoque', e.target.checked ? 'true' : null)}
                  className="rounded border-slate-300 text-[#003893] focus:ring-[#003893] w-4 h-4"
                />
                <span className="font-medium">Somente itens em estoque</span>
              </label>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-xl h-80 border border-slate-200 p-4" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Nenhum produto encontrado</h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Não encontramos nenhum item correspondente aos filtros selecionados. Tente ajustar a
                  sua busca ou limpar os filtros.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-[#003893] text-white text-xs font-bold rounded-lg hover:bg-[#002766] transition-colors"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateParam('pagina', String(Math.max(1, pageParam - 1)))}
                      disabled={pageParam <= 1}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateParam('pagina', String(p))}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          pageParam === p
                            ? 'bg-[#003893] text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        updateParam('pagina', String(Math.min(totalPages, pageParam + 1)))
                      }
                      disabled={pageParam >= totalPages}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900">Filtros</span>
                <button onClick={() => setIsMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Categorias */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">Categorias</h4>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateParam('categoria', c.slug);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left py-1 text-xs ${
                        categoryParam === c.slug ? 'font-bold text-[#003893]' : 'text-slate-600'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marcas */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">Marcas</h4>
                <div className="space-y-1">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        updateParam('marca', b.slug);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left py-1 text-xs ${
                        brandParam === b.slug ? 'font-bold text-[#003893]' : 'text-slate-600'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFiltersOpen(false);
                }}
                className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg mb-2"
              >
                Limpar Filtros
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-[#003893] text-white text-xs font-bold rounded-lg"
              >
                Ver Resultados ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
