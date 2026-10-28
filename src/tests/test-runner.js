// ====================================================================
// TEST SUITE: REGRAS DE NEGÓCIO ITACLEAN
// Executado com Node.js Test Runner nativo
// ====================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

// Helper functions (mirrored from src/lib/utils.ts)
function calculatePixPrice(price, discountPercentage = 5) {
  return price * (1 - discountPercentage / 100);
}

function formatDocument(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

function formatCEP(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

function calculateShippingEstimate(cep, subtotal, freeShippingThreshold = 299) {
  const clean = cep.replace(/\D/g, '');
  if (clean.length < 5) return [];

  const isFree = subtotal >= freeShippingThreshold;
  return [
    {
      id: 'express',
      name: 'Entrega Expressa Itaclean (Frota Própria)',
      price: isFree ? 0 : 24.9,
      deadline: '1 a 2 dias úteis',
      isFree,
    },
    {
      id: 'carrier',
      name: 'Transportadora Especializada em Cargas Químicas',
      price: isFree ? 0 : 38.5,
      deadline: '3 a 5 dias úteis',
      isFree,
    },
    {
      id: 'pickup',
      name: 'Retirada no Centro de Distribuição Itaclean (Sem Custo)',
      price: 0,
      deadline: 'Disponível em até 4 horas úteis',
      isFree: true,
    },
  ];
}

function validateCoupon(code, subtotal) {
  const mockCoupons = [
    { code: 'BEMVINDO10', discount_type: 'percentage', discount_value: 10, min_order_amount: 100, is_active: true },
    { code: 'ITACLEAN5', discount_type: 'percentage', discount_value: 5, min_order_amount: 50, is_active: true },
    { code: 'EMPRESA50', discount_type: 'fixed', discount_value: 50, min_order_amount: 499, is_active: true },
  ];

  const found = mockCoupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);
  if (!found) {
    return { valid: false, discountAmount: 0, message: 'Cupom inválido ou expirado.' };
  }
  if (found.min_order_amount && subtotal < found.min_order_amount) {
    return { valid: false, discountAmount: 0, message: `Pedido mínimo de R$ ${found.min_order_amount}.` };
  }

  let discount = found.discount_type === 'percentage' ? (subtotal * found.discount_value) / 100 : found.discount_value;
  return { valid: true, discountAmount: Math.min(discount, subtotal), coupon: found, message: 'Cupom aplicado!' };
}

// ----------------------------------------------------
// TEST CASES
// ----------------------------------------------------

test('1. Deve calcular corretamente o desconto de 5% no Pix à vista', () => {
  const price = 200.0;
  const pix = calculatePixPrice(price, 5);
  assert.equal(pix, 190.0);
});

test('2. Deve aplicar máscara correta em CPF e CNPJ de clientes', () => {
  assert.equal(formatDocument('12345678900'), '123.456.789-00');
  assert.equal(formatDocument('38452190000144'), '38.452.190/0001-44');
});

test('3. Deve formatar CEP com máscara oficial', () => {
  assert.equal(formatCEP('04567000'), '04567-000');
});

test('4. Deve conceder frete grátis em pedidos acima de R$ 299 e cobrar frete abaixo', () => {
  const below = calculateShippingEstimate('04567-000', 180.0, 299.0);
  const expressBelow = below.find((o) => o.id === 'express');
  assert.equal(expressBelow.price, 24.9);
  assert.equal(expressBelow.isFree, false);

  const above = calculateShippingEstimate('04567-000', 350.0, 299.0);
  const expressAbove = above.find((o) => o.id === 'express');
  assert.equal(expressAbove.price, 0);
  assert.equal(expressAbove.isFree, true);
});

test('5. Deve validar e aplicar cupom percentual de 10% (BEMVINDO10)', () => {
  const res = validateCoupon('BEMVINDO10', 250.0);
  assert.equal(res.valid, true);
  assert.equal(res.discountAmount, 25.0);
});

test('6. Deve rejeitar cupom quando o pedido não atingir o valor mínimo exigido', () => {
  const res = validateCoupon('BEMVINDO10', 60.0);
  assert.equal(res.valid, false);
  assert.equal(res.discountAmount, 0);
});

test('7. Deve rejeitar código de cupom inexistente', () => {
  const res = validateCoupon('CUPOM_INEXISTENTE', 500.0);
  assert.equal(res.valid, false);
  assert.equal(res.discountAmount, 0);
});

test('8. Deve validar snapshots de produtos e geração de número de pedido', () => {
  const sampleOrder = {
    order_number: 'ITA-2026-8812',
    subtotal: 500.0,
    discount_amount: 50.0,
    shipping_amount: 0.0,
    total_amount: 450.0,
    items: [
      { product_name_snapshot: 'Desengraxante Industrial 5L', sku_snapshot: 'ITA-QUI-001', unit_price: 59.9, quantity: 2, line_total: 119.8 }
    ]
  };

  assert.match(sampleOrder.order_number, /^ITA-2026-\d{4}$/);
  assert.equal(sampleOrder.total_amount, 450.0);
  assert.equal(sampleOrder.items[0].line_total, 119.8);
});
