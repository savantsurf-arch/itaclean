-- ====================================================================
-- ITACLEAN - SISTEMA DE E-COMMERCE DE LIMPEZA PROFISSIONAL
-- MIGRATION: 20261028000000_initial_schema.sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('customer', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'pending_payment',
        'payment_approved',
        'processing',
        'ready_for_shipping',
        'shipped',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'pending',
        'authorized',
        'paid',
        'declined',
        'refunded',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (relacionado ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    document_type TEXT DEFAULT 'CPF', -- CPF ou CNPJ
    document_number TEXT,
    company_name TEXT,
    state_registration TEXT, -- Inscrição Estadual para empresas
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. USER ROLES (Segurança: separado do perfil comum)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Helper function to verify admin rights
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
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    sku TEXT NOT NULL UNIQUE,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= price)),
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    low_stock_threshold INT DEFAULT 5 NOT NULL,
    weight NUMERIC(8, 3) DEFAULT 0.500, -- em kg
    length NUMERIC(8, 2) DEFAULT 10.0, -- cm
    width NUMERIC(8, 2) DEFAULT 10.0, -- cm
    height NUMERIC(8, 2) DEFAULT 10.0, -- cm
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_new BOOLEAN DEFAULT FALSE NOT NULL,
    dilution_info TEXT, -- Instruções de diluição para químicos profissionais
    safety_info TEXT, -- Informações de segurança / FISPQ
    technical_info JSONB DEFAULT '{}'::jsonb, -- Características técnicas (pH, rendimento, fragrância, etc.)
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL
);

-- 9. PRODUCT VARIANTS (Variações: Ex: 1L, 5L, 20L, Fragrância)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL, -- Ex: "Galão 5 Litros"
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"volume": "5L", "fragrance": "Lavanda"}
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price <= price),
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    postal_code TEXT NOT NULL, -- CEP
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    reference TEXT,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_cart_product_variant UNIQUE (cart_id, product_id, variant_id)
);

-- 12. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type discount_type_enum NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
    max_discount_amount NUMERIC(10, 2),
    usage_limit INT,
    times_used INT DEFAULT 0 NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_document TEXT, -- CPF ou CNPJ
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (discount_amount >= 0),
    shipping_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (shipping_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    payment_status payment_status_enum DEFAULT 'pending' NOT NULL,
    order_status order_status_enum DEFAULT 'pending_payment' NOT NULL,
    shipping_method TEXT NOT NULL,
    tracking_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. ORDER ITEMS (Snapshots de integridade)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    sku_snapshot TEXT NOT NULL,
    variant_snapshot JSONB,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0)
);

-- 15. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'mercadopago',
    provider_payment_id TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status payment_status_enum NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL, -- pix, credit_card, boleto
    idempotency_key TEXT UNIQUE,
    qr_code TEXT,
    qr_code_base64 TEXT,
    ticket_url TEXT,
    installments INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    button_text TEXT DEFAULT 'Confira as Ofertas',
    link_url TEXT DEFAULT '/produtos',
    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    badge_text TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- 18. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 19. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active, sort_order);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Customers can read and update their own profile; Admins full access
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. User Roles: Only admins can manage or view all roles; users can view their own
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Only admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin(auth.uid()));

-- 3. Public read for Catalog (Products, Categories, Brands, Variants, Images, Banners)
CREATE POLICY "Public read active categories" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage categories" ON public.categories
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public read active brands" ON public.brands
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage brands" ON public.brands
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public read active products" ON public.products
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage products" ON public.products
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public read product images" ON public.product_images
    FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public read product variants" ON public.product_variants
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage product variants" ON public.product_variants
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public read active banners" ON public.banners
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage banners" ON public.banners
    FOR ALL USING (public.is_admin(auth.uid()));

-- 4. Store settings
CREATE POLICY "Public read store settings" ON public.store_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins manage store settings" ON public.store_settings
    FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Addresses
CREATE POLICY "Users manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- 6. Orders & Items
CREATE POLICY "Users read own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins update orders" ON public.orders
    FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Users read own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );
CREATE POLICY "Insert order items on purchase" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- 7. Coupons
CREATE POLICY "Public read active coupons" ON public.coupons
    FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage coupons" ON public.coupons
    FOR ALL USING (public.is_admin(auth.uid()));

-- 8. Wishlists
CREATE POLICY "Users manage own wishlist" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wishlist items" ON public.wishlist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.wishlists
            WHERE wishlists.id = wishlist_items.wishlist_id
            AND wishlists.user_id = auth.uid()
        )
    );

-- ====================================================================
-- SEED DATA (Categorias profissionais, marcas, produtos e banners)
-- ====================================================================

-- Categorias Iniciais
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

-- Marcas Renomadas
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

-- Configurações Iniciais da Loja
INSERT INTO public.store_settings (key, value, description) VALUES
('store_info', '{
    "name": "Itaclean Limpeza e Descartável",
    "cnpj": "12.345.678/0001-90",
    "phone": "(11) 4004-2020",
    "whatsapp": "5511987654321",
    "email": "comercial@itaclean.com.br",
    "address": "Av. Industrial das Nações, 1500 - Galpão 04",
    "neighborhood": "Distrito Industrial",
    "city": "São Paulo",
    "state": "SP",
    "postal_code": "04567-000",
    "business_hours": "Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00"
}'::jsonb, 'Informações cadastrais e institucionais da loja'),

('shipping_rules', '{
    "free_shipping_threshold": 299.00,
    "express_delivery_regions": ["SP", "RJ", "MG", "PR"],
    "pickup_enabled": true,
    "pickup_address": "Centro de Distribuição Itaclean - Balcão de Retirada Expressa"
}'::jsonb, 'Regras de frete grátis e retirada no centro de distribuição'),

('payment_rules', '{
    "pix_discount_percentage": 5.0,
    "max_installments": 12,
    "interest_free_installments": 3,
    "b2b_boleto_enabled": true
}'::jsonb, 'Configurações de formas de pagamento e descontos')
ON CONFLICT (key) DO NOTHING;
