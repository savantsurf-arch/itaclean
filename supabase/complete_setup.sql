-- ====================================================================
-- ITACLEAN - SCRIPT COMPLETO DE CONFIGURAÇÃO DO SUPABASE
-- TABELAS, ENUMS, RLS, STORAGE E DADOS INICIAIS
-- ====================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('customer', 'staff', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'pending_payment', 'payment_approved', 'processing',
        'ready_for_shipping', 'shipped', 'delivered', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'pending', 'authorized', 'paid', 'declined', 'refunded', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    document_type TEXT DEFAULT 'CPF',
    document_number TEXT,
    company_name TEXT,
    state_registration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon_name TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(10, 2) CHECK (sale_price >= 0),
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    low_stock_threshold INT DEFAULT 5 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_new BOOLEAN DEFAULT FALSE NOT NULL,
    weight NUMERIC(8, 3) DEFAULT 0.500 NOT NULL,
    width NUMERIC(6, 2) DEFAULT 10.00,
    height NUMERIC(6, 2) DEFAULT 10.00,
    length NUMERIC(6, 2) DEFAULT 10.00,
    short_description TEXT,
    description TEXT,
    dilution_instructions TEXT,
    dilution_ratio TEXT,
    fispq_url TEXT,
    technical_info JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(10, 2) CHECK (sale_price >= 0),
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_document TEXT NOT NULL,
    shipping_street TEXT NOT NULL,
    shipping_number TEXT NOT NULL,
    shipping_complement TEXT,
    shipping_neighborhood TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    shipping_method TEXT NOT NULL,
    shipping_cost NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    payment_method TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'pending_payment',
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type discount_type_enum NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    max_discount_amount NUMERIC(10, 2),
    usage_limit INT,
    times_used INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    button_text TEXT,
    link_url TEXT NOT NULL,
    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    badge_text TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_wishlist UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- 14. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PÚBLICAS DE LEITURA (Catálogo e Loja)
DO $$ BEGIN CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (is_active = TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (is_active = TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (is_active = TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read Product Variants" ON public.product_variants FOR SELECT USING (is_active = TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read Banners" ON public.banners FOR SELECT USING (is_active = TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read Store Settings" ON public.store_settings FOR SELECT USING (TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read Active Coupons" ON public.coupons FOR SELECT USING (is_active = TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- POLÍTICAS DE CLIENTES AUTENTICADOS (Perfis, Pedidos, Wishlist)
DO $$ BEGIN CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users create profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users view order items" ON public.order_items FOR SELECT USING (TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users manage wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users manage wishlist items" ON public.wishlist_items FOR ALL USING (TRUE); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- POLÍTICAS ADMINISTRATIVAS
DO $$ BEGIN CREATE POLICY "Admins full categories" ON public.categories FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins full brands" ON public.brands FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins full products" ON public.products FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins full variants" ON public.product_variants FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins full orders" ON public.orders FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins full coupons" ON public.coupons FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins full banners" ON public.banners FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admins full settings" ON public.store_settings FOR ALL USING (auth.role() = 'service_role' OR public.is_admin(auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 15. STORAGE BUCKETS (Imagens e Documentos)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('banners', 'banners', true),
    ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN CREATE POLICY "Public Read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/Auth Upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/Auth Upload banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/Auth Upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 16. DADOS INICIAIS DA ITACLEAN (Categorias, Marcas, Banners, Configurações)
INSERT INTO public.categories (name, slug, description, sort_order, icon_name) VALUES
('Ofertas Especiais', 'ofertas', 'Descontos imperdíveis e promoções em lote para empresas', 1, 'Percent'),
('Produtos Químicos', 'produtos-quimicos', 'Desengraxantes, desinfetantes, detergentes concentrados e cloros industriais', 2, 'FlaskConical'),
('Higiene Profissional', 'higiene-profissional', 'Sabonetes líquidos, dispensers, álcool em gel e odorizadores de ambiente', 3, 'Sparkles'),
('Papéis e Descartáveis', 'papeis-e-descartaveis', 'Papel toalha interfolhado, papel higiênico rolão, copos, sacos para lixo e luvas', 4, 'ScrollText'),
('Acessórios de Limpeza', 'acessorios-de-limpeza', 'Mops industriais, panos de microfibra, baldes espremedores e carrinhos funcionais', 5, 'Brush'),
('Utensílios', 'utensilios', 'Vassouras industriais, rodos de alumínio, pás articuladas e escovas profissionais', 6, 'Wrench'),
('Máquinas e Equipamentos', 'maquinas-e-equipamentos', 'Lavadoras de alta pressão, enceradeiras, aspiradores pó e água industriais', 7, 'Zap'),
('Limpeza Automotiva', 'limpeza-automotiva', 'Shampoos automotivos concentrados, silicones, desengraxantes de chassi e ceras', 8, 'Car'),
('Tratamento de Pisos', 'tratamento-de-pisos', 'Seladores, ceras acrílicas alto brilho, removedores de cera e restauradores', 9, 'Layers'),
('Kits e Combos', 'kits-e-combos', 'Combos econômicos para condomínios, restaurantes, clínicas e escritórios', 10, 'PackageCheck')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.brands (name, slug) VALUES
('Itaclean Pro', 'itaclean-pro'),
('Spartan Chemical', 'spartan'),
('Renko Químicos', 'renko'),
('Bralimpia', 'bralimpia'),
('Kimberly-Clark Professional', 'kimberly-clark'),
('Santher Professional', 'santher'),
('Bellinzoni', 'bellinzoni'),
('Nobre Descartáveis', 'nobre')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.store_settings (key, value, description) VALUES
('store_info', '{
    "name": "Itaclean Produtos de Limpeza e Descartáveis",
    "cnpj": "38.452.190/0001-44",
    "phone": "(73) 4141-9517",
    "whatsapp": "557341419517",
    "instagram": "https://www.instagram.com/itacleanlimpeza/",
    "email": "contato@itaclean.com.br",
    "address": "Av. Cinquentenário, 187",
    "neighborhood": "Centro",
    "city": "Itabuna",
    "state": "BA",
    "postal_code": "45600-077",
    "business_hours": "Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00"
}'::jsonb, 'Informações cadastrais e institucionais da loja'),
('shipping_rules', '{
    "free_shipping_threshold": 299.00,
    "express_delivery_regions": ["BA", "SE", "AL", "PE", "ES", "MG", "SP"],
    "pickup_enabled": true,
    "pickup_address": "Loja Itaclean Itabuna: Av. Cinquentenário, 187 - Centro, Itabuna/BA"
}'::jsonb, 'Regras de frete grátis e retirada no centro de distribuição'),
('payment_rules', '{
    "pix_discount_percentage": 5.0,
    "max_installments": 12,
    "interest_free_installments": 3,
    "b2b_boleto_enabled": true
}'::jsonb, 'Configurações de formas de pagamento e descontos')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.banners (title, subtitle, button_text, link_url, desktop_image_url, mobile_image_url, badge_text, sort_order, is_active)
VALUES
(
    'Linha Completa de Limpeza Profissional e Descartáveis',
    'Soluções químicas de alto rendimento, papéis institucionais e equipamentos com faturamento em até 30 dias para empresas e condomínios.',
    'Ver Catálogo Completo',
    '/produtos',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    'Condições Especiais B2B',
    1,
    true
),
(
    'Tratamento de Pisos e Ceras Acrílicas Alto Brilho',
    'Máxima durabilidade, brilho espelhado e resistência ao tráfego pesado em comércios, clínicas e indústrias.',
    'Explorar Linha Pisos',
    '/produtos?categoria=tratamento-de-pisos',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
    'Alta Performance',
    2,
    true
),
(
    'Papéis e Descartáveis com Entrega Rápida',
    'Toalhas interfolhadas folha dupla, higiênico rolão institucional e sacos para lixo reforçados.',
    'Comprar Descartáveis',
    '/produtos?categoria=papeis-e-descartaveis',
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
    'Economia Comprovada',
    3,
    true
)
ON CONFLICT DO NOTHING;

INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, usage_limit, is_active)
VALUES
('BEMVINDO10', 'percentage', 10.0, 100.0, 500, true),
('ITACLEAN5', 'percentage', 5.0, 50.0, 1000, true),
('EMPRESA50', 'fixed', 50.0, 499.0, 200, true)
ON CONFLICT (code) DO NOTHING;
