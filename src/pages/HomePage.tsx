import React, { useEffect, useState } from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { BenefitsBar } from '../components/home/BenefitsBar';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { ProductSection } from '../components/home/ProductSection';
import { B2BSolutions } from '../components/home/B2BSolutions';
import { BrandsSection } from '../components/home/BrandsSection';
import { CorporateBanner } from '../components/home/CorporateBanner';
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
        const [saleRes, featuredRes, newRes, comboRes] = await Promise.all([
          getProducts({ onSaleOnly: true, pageSize: 4 }),
          getProducts({ featuredOnly: true, pageSize: 4 }),
          getProducts({ sortBy: 'newest', pageSize: 4 }),
          getProducts({ categorySlug: 'kits-e-combos', pageSize: 4 }),
        ]);

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
      {/* 2. Banner principal promocional */}
      <HeroSlider />

      {/* 3. Faixa de benefícios comerciais */}
      <BenefitsBar />

      {/* 4. Categorias em destaque */}
      <FeaturedCategories />

      {/* 5. Produtos em promoção */}
      <ProductSection
        badge="Super Ofertas"
        title="Produtos em Promoção"
        subtitle="Descontos especiais para pedidos no atacado e varejo"
        products={saleProducts}
        viewAllLink="/produtos?categoria=ofertas"
      />

      {/* 6. Produtos mais vendidos / Destaques reais */}
      <ProductSection
        badge="Mais Vendidos"
        title="Os Favoritos das Empresas"
        subtitle="Os químicos e equipamentos mais solicitados por condomínios e indústrias"
        products={featuredProducts}
        viewAllLink="/produtos?destaque=true"
      />

      {/* 7. Produtos recém-cadastrados */}
      <ProductSection
        badge="Lançamentos"
        title="Novidades no Catálogo"
        subtitle="Novos produtos para maximizar a higiene e conservação do seu ambiente"
        products={newProducts}
        viewAllLink="/produtos?ordenar=newest"
      />

      {/* 8. Kits e combos */}
      {comboProducts.length > 0 && (
        <ProductSection
          badge="Economia em Lote"
          title="Kits e Combos Econômicos"
          subtitle="Conjuntos completos com até 25% de desconto para início de operação"
          products={comboProducts}
          viewAllLink="/produtos?categoria=kits-e-combos"
        />
      )}

      {/* 9. Marcas disponíveis */}
      <BrandsSection />

      {/* 10. Seção de soluções para empresas */}
      <B2BSolutions />

      {/* 11 & 12. Benefícios da loja e chamada para compras em quantidade */}
      <CorporateBanner />

      {/* 13. Newsletter */}
      <Newsletter />
    </div>
  );
};
