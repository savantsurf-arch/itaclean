-- ====================================================================
-- SEED DATA - ITACLEAN CATÁLOGO INICIAL
-- ====================================================================

-- Banners Iniciais da Loja
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
);

-- Cupons de Desconto
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, usage_limit, is_active)
VALUES
('BEMVINDO10', 'percentage', 10.0, 100.0, 500, true),
('ITACLEAN5', 'percentage', 5.0, 50.0, 1000, true),
('EMPRESA50', 'fixed', 50.0, 499.0, 200, true);
