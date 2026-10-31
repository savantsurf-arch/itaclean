import React, { useEffect, useState } from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { BenefitsBar } from '../components/home/BenefitsBar';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { ProductSection } from '../components/home/ProductSection';
import { B2BSolutions } from '../components/home/B2BSolutions';
import { BrandsSection } from '../components/home/BrandsSection';
import { CorporateBanner } from '../components/home/CorporateBanner';
import { InstagramBanner } from '../components/home/InstagramBanner';
import { Newsletter } from '../components/home/Newsletter';
import { getProducts } from '../lib/data-service';
import { Product } from '../types';

export const HomePage: React.FC = () => {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeProducts() {
      setIsLoading(true);
      try {
        // 1. Super Ofertas: produtos com maior desconto real
        const saleRes = await getProducts({
          onSaleOnly: true,
          sortBy: 'discount_desc',
          pageSize: 4,
        });
        const saleIds = saleRes.products.map((p) => p.id);

        // 2. Mais Vendidos: produtos de alto giro institucional sem repetir as ofertas
        const featuredRes = await getProducts({
          featuredOnly: true,
          excludeIds: saleIds,
          pageSize: 4,
        });
        const featuredIds = featuredRes.products.map((p) => p.id);
        const displayedIds = [...saleIds, ...featuredIds];

        // 3. Lançamentos: novidades do catálogo sem repetir ofertas nem mais vendidos
        let newRes = await getProducts({
          isNewOnly: true,
          excludeIds: displayedIds,
          sortBy: 'newest',
          pageSize: 4,
        });

        // Caso haja menos de 4 marcados como novos após exclusões, completa com itens mais recentes não exibidos
        if (newRes.products.length < 4) {
          const fallbackNew = await getProducts({
            sortBy: 'newest',
            excludeIds: displayedIds,
            pageSize: 4,
          });
          newRes = fallbackNew;
        }

        // 4. Kits e Combos
        const comboRes = await getProducts({
          categorySlug: 'kits-e-combos',
          pageSize: 4,
        });

        setSaleProducts(saleRes.products);
        setFeaturedProducts(featuredRes.products);
        setNewProducts(newRes.products);
        setComboProducts(comboRes.products);
      } catch (err) {
        console.error('Erro ao carregar vitrine:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Banner principal promocional */}
      <HeroSlider />

      {/* 2. Faixa de benefícios comerciais */}
      <BenefitsBar />

      {/* 3. Categorias em destaque */}
      <FeaturedCategories />

      {/* 4. Produtos em promoção (Super Ofertas reais por maior desconto) */}
      <ProductSection
        badge="Super Ofertas"
        title="Produtos em Promoção"
        subtitle="Descontos especiais para pedidos no atacado e varejo"
        products={saleProducts}
        viewAllLink="/produtos?categoria=ofertas"
      />

      {/* 5. Produtos mais vendidos / Destaques reais corporativos */}
      <ProductSection
        badge="Mais Vendidos"
        title="Os Favoritos das Empresas"
        subtitle="Os químicos e equipamentos mais solicitados por condomínios e indústrias"
        products={featuredProducts}
        viewAllLink="/produtos?destaque=true"
      />

      {/* 6. NEWSLETTER ESTRATÉGICA (Posição otimizada para máxima conversão no meio do fluxo) */}
      <Newsletter />

      {/* 7. Produtos recém-cadastrados / Lançamentos distintos */}
      <ProductSection
        badge="Lançamentos"
        title="Novidades no Catálogo"
        subtitle="Novos produtos para maximizar a higiene e conservação do seu ambiente"
        products={newProducts}
        viewAllLink="/produtos?ordenar=newest"
      />

      {/* 8. Kits e combos econômicos */}
      {comboProducts.length > 0 && (
        <ProductSection
          badge="Economia em Lote"
          title="Kits e Combos Econômicos"
          subtitle="Conjuntos completos com até 25% de desconto para início de operação"
          products={comboProducts}
          viewAllLink="/produtos?categoria=kits-e-combos"
        />
      )}

      {/* 9. Marcas oficiais disponíveis */}
      <BrandsSection />

      {/* 10. Seção de soluções para empresas por segmento */}
      <B2BSolutions />

      {/* 11. Benefícios da loja e chamada para faturamento PJ */}
      <CorporateBanner />

      {/* 12. Instagram Oficial */}
      <InstagramBanner />
    </div>
  );
};
