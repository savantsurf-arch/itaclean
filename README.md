# ITACLEAN — Loja Virtual de Produtos de Limpeza Profissional & Descartáveis

E-commerce completo, responsivo e funcional inspirado na estrutura de referência da distribuidora [Loja Unilimp](https://lojaunilimp.com.br/), construído com a identidade visual da **Itaclean** (azul royal `#003893`, azul escuro `#00225d`, azul ciano `#009fe3` e branco).

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript + Vite 8
- **Estilização**: Tailwind CSS v4 + Design System com variáveis CSS
- **Ícones**: Lucide React
- **Gerenciamento de Estado Remoto**: TanStack Query (React Query)
- **Formulários e Validação**: React Hook Form + Zod
- **Backend & Banco de Dados**: Supabase (PostgreSQL, Supabase Auth, Storage e Row Level Security)
- **Deploy & Serverless**: Vercel (`vercel.json` com rewrites SPA)
- **Pagamentos**: Pix com QR Code dinâmico + Chave Copia e Cola, Cartão de Crédito até 12x, Boleto Faturado PJ
- **Frete**: Integração com ViaCEP para auto-preenchimento e cálculo por faixas de peso/região

---

## 📁 Estrutura do Projeto

```
itaclean/
├── public/
│   ├── itaclean-logo.jpg           # Logotipo oficial da Itaclean
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx       # Gaveta lateral rápida do carrinho
│   │   ├── common/
│   │   │   ├── CookieConsent.tsx    # Banner de cookies compatível com a LGPD
│   │   │   └── ProductCard.tsx      # Card padronizado de produtos com descontos e estoque
│   │   ├── home/
│   │   │   ├── B2BSolutions.tsx     # Soluções por segmento (Condomínios, Indústrias, Clínicas)
│   │   │   ├── BenefitsBar.tsx      # Faixa de vantagens comerciais (Frete, Pix, Faturamento PJ)
│   │   │   ├── BrandsSection.tsx    # Marcas parceiras (Spartan, Renko, Bralimpia, etc.)
│   │   │   ├── CorporateBanner.tsx  # Chamada para cotações e compras no atacado
│   │   │   ├── FeaturedCategories.tsx # Grid de categorias em destaque
│   │   │   ├── HeroSlider.tsx       # Carrossel de banners administráveis
│   │   │   ├── Newsletter.tsx       # Cadastro de e-mails para ofertas
│   │   │   └── ProductSection.tsx   # Vitrines (Ofertas, Mais Vendidos, Lançamentos, Combos)
│   │   └── layout/
│   │       ├── Footer.tsx           # Rodapé completo institucional com CNPJ e selos
│   │       ├── Header.tsx           # Cabeçalho com busca instantânea e menu de conta
│   │       ├── Navbar.tsx           # Menu horizontal de 10 categorias + gaveta mobile
│   │       ├── TopBar.tsx           # Barra superior com telefones, WhatsApp e horários
│   │       └── WhatsAppFloating.tsx # Botão flutuante de atendimento WhatsApp
│   ├── context/
│   │   ├── AuthContext.tsx          # Autenticação de clientes e administradores
│   │   ├── CartContext.tsx          # Carrinho persistente, cupons e estoque
│   │   └── WishlistContext.tsx      # Lista de favoritos com persistência
│   ├── lib/
│   │   ├── data-service.ts          # Camada CRUD unificada (Supabase + Fallback resiliente)
│   │   ├── mock-data.ts             # Catálogo inicial com 15+ produtos, químicas e marcas
│   │   ├── supabase.ts              # Cliente Supabase e detecção de credenciais
│   │   └── utils.ts                 # Utilitários (BRL, CPF/CNPJ, CEP, ViaCEP, frete)
│   ├── pages/
│   │   ├── admin/                   # Painel Administrativo Protegido (/admin)
│   │   │   ├── AdminBanners.tsx     # Gestão de banners e vitrines
│   │   │   ├── AdminCategories.tsx  # CRUD de categorias
│   │   │   ├── AdminCoupons.tsx     # Gestão de cupons de desconto
│   │   │   ├── AdminDashboard.tsx   # Métricas reais, ticket médio, alertas de estoque
│   │   │   ├── AdminLayout.tsx      # Layout e proteção por role de administrador
│   │   │   ├── AdminOrders.tsx      # Rastreamento, status operacional e pedidos
│   │   │   ├── AdminProducts.tsx    # Gestão completa de produtos, preços e estoque
│   │   │   └── AdminSettings.tsx    # Configurações de frete, Pix e dados da loja
│   │   ├── AboutPage.tsx            # Quem Somos institucional
│   │   ├── CartPage.tsx             # Carrinho completo com frete e cupons
│   │   ├── CatalogPage.tsx          # Catálogo com filtros de marca, preço, categoria e busca
│   │   ├── CheckoutPage.tsx         # Checkout em 4 etapas (Pix, Cartão, Boleto PJ)
│   │   ├── ContactPage.tsx          # Fale Conosco e formulário de cotação corporativa
│   │   ├── HomePage.tsx             # Página inicial estruturada conforme prompt mestre
│   │   ├── LoginPage.tsx            # Login de clientes e administradores
│   │   ├── MyAccountPage.tsx        # Área do cliente (Perfil, Pedidos, Rastreio, Favoritos)
│   │   ├── NotFoundPage.tsx         # Página 404 personalizada
│   │   ├── OrderSuccessPage.tsx     # Confirmação com QR Code Pix e comprovante
│   │   ├── PrivacyPage.tsx          # Política de privacidade LGPD
│   │   ├── ProductDetailPage.tsx    # Ficha técnica, diluição de químicos, FISPQ e frete
│   │   ├── RegisterPage.tsx         # Cadastro de clientes
│   │   ├── ReturnsPolicyPage.tsx    # Política de trocas e devoluções
│   │   ├── ShippingPolicyPage.tsx   # Política de entrega e frete grátis
│   │   └── TermsPage.tsx            # Termos e condições gerais
│   ├── tests/
│   │   └── test-runner.js           # Suíte de testes automatizados de regras de negócio
│   ├── types/
│   │   └── index.ts                 # Definições TypeScript completas do modelo de dados
│   ├── App.tsx                      # Rotas e provedores
│   ├── index.css                    # Estilos globais e tokens de cor Itaclean
│   └── main.tsx                     # Ponto de entrada
├── supabase/
│   ├── migrations/
│   │   └── 20261028000000_initial_schema.sql  # Schema SQL completo com RLS e índices
│   └── seed.sql                     # Dados iniciais para o banco de dados
├── .env.example                     # Modelo de variáveis de ambiente
├── vercel.json                      # Configuração de SPA rewrites para a Vercel
├── package.json
└── vite.config.ts
```

---

## ⚙️ Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` a partir do modelo `.env.example`:

```env
# Conexão com Supabase (Frontend)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica

# Servidor / Edge Functions (Opcional - Nunca expor no frontend)
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_PROVIDER_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=

# Configurações da Loja
VITE_STORE_NAME=Itaclean Limpeza e Descartável
VITE_STORE_WHATSAPP=5511987654321
VITE_STORE_PHONE=(11) 4004-2020
VITE_STORE_EMAIL=comercial@itaclean.com.br
```

> **Modo Resiliente / Demonstração:** Caso as chaves do Supabase ainda não tenham sido configuradas, o sistema opera automaticamente com o seu motor local de persistência, permitindo testar 100% da navegação, catálogo, carrinho, checkout e painel administrativo imediatamente.

---

## 🗄️ Banco de Dados Supabase (Migrations & RLS)

O arquivo `supabase/migrations/20261028000000_initial_schema.sql` contém a estrutura completa para execução no SQL Editor do Supabase:

1. **Tabelas criadas com UUID e integridade referencial**:
   - `profiles`, `user_roles`, `categories`, `brands`, `products`, `product_images`, `product_variants`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `coupons`, `coupon_redemptions`, `banners`, `store_settings`, `order_status_history`, `audit_logs`.
2. **Políticas Row Level Security (RLS)**:
   - Produtos e categorias ativos: leitura pública.
   - Pedidos e endereços: restritos ao próprio usuário e aos administradores.
   - Snapshot de integridade: `order_items` preserva o nome, preço e SKU no exato momento da compra.
   - Separação de privilégios com a função `is_admin(user_id)`.

---

## 🧪 Testes Automatizados

Para executar os testes de regras de negócio (cálculo de descontos no Pix, frete grátis, cupons percentuais e fixos, formatações de CPF/CNPJ e snapshots de pedidos):

```bash
npm test
```

---

## 📦 Como Executar Localmente

1. Instalar as dependências:
   ```bash
   npm install
   ```
2. Iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Compilar para produção:
   ```bash
   npm run build
   ```
4. Testar a versão compilada:
   ```bash
   npm run preview
   ```

---

## 🌐 Deploy na Vercel

O projeto está pronto para deploy imediato na Vercel:
1. Conecte o repositório no dashboard da Vercel.
2. Defina o Framework Preset como **Vite**.
3. Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. O arquivo `vercel.json` já inclui o rewrite para roteamento SPA sem erros 404 em rotas diretas.
