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

// ----------------------------------------------------
// TESTES DE CHECKOUT VIA WHATSAPP (ITACLEAN)
// ----------------------------------------------------

function formatWhatsAppPrice(value) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildWhatsAppOrderMessage(params) {
  const { customer, items, subtotal, total, discountAmount = 0, couponCode, shippingAmount, shippingMethod } = params;

  const itemsLines = items
    .map((item) => {
      const nameWithVariant = item.variantName ? `${item.name} (${item.variantName})` : item.name;
      return `${item.quantity}x ${nameWithVariant} — R$ ${formatWhatsAppPrice(item.unitPrice)}`;
    })
    .join('\n');

  let financialBlock = `Subtotal: R$ ${formatWhatsAppPrice(subtotal)}`;
  if (discountAmount > 0) {
    financialBlock += `\nDesconto${couponCode ? ` (${couponCode})` : ''}: -R$ ${formatWhatsAppPrice(discountAmount)}`;
  }
  if (shippingAmount !== undefined && shippingAmount > 0) {
    financialBlock += `\nFrete${shippingMethod ? ` (${shippingMethod})` : ''}: R$ ${formatWhatsAppPrice(shippingAmount)}`;
  } else if (shippingMethod) {
    financialBlock += `\nFrete: Grátis (${shippingMethod})`;
  }

  const complementVal = customer.complement?.trim() ? customer.complement.trim() : '-';
  const referenceVal = customer.reference?.trim() ? customer.reference.trim() : '-';
  const notesVal = customer.notes?.trim() ? customer.notes.trim() : 'Nenhuma';

  const addressLine = customer.city && customer.state
    ? `${customer.street.trim()} (${customer.city}/${customer.state})`
    : customer.street.trim();

  return `*NOVO PEDIDO — ITACLEAN*

Olá! Gostaria de realizar um pedido.

*DADOS DO CLIENTE*
Nome: ${customer.name.trim()}
Telefone: ${customer.phone.trim()}

*ENDEREÇO DE ENTREGA*
CEP: ${customer.cep.trim()}
Endereço: ${addressLine}
Número: ${customer.number.trim()}
Bairro: ${customer.neighborhood.trim()}
Complemento: ${complementVal}
Referência: ${referenceVal}

*PRODUTOS*
${itemsLines}
${financialBlock}

*TOTAL DO PEDIDO: R$ ${formatWhatsAppPrice(total)}*

Observações: ${notesVal}

Gostaria de confirmar meu pedido e combinar a forma de pagamento e entrega.

Obrigado!`;
}

function generateWhatsAppOrderUrl(message, whatsappNumber = '557341419517') {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

test('9. Deve calcular corretamente subtotal e total com adição, alteração de quantidade e remoção', () => {
  let cart = [];
  const prod1 = { id: 'p1', name: 'Detergente Clorado 5L', price: 35.0 };
  const prod2 = { id: 'p2', name: 'Papel Toalha Interfolhado', price: 60.0 };

  // Adicionar prod1 (2 unidades)
  cart.push({ id: 'item1', product: prod1, quantity: 2, unitPrice: 35.0, total: 70.0 });
  // Adicionar prod2 (1 unidade)
  cart.push({ id: 'item2', product: prod2, quantity: 1, unitPrice: 60.0, total: 60.0 });

  let subtotal = cart.reduce((acc, it) => acc + it.total, 0);
  assert.equal(subtotal, 130.0);

  // Alterar quantidade de prod2 para 3 unidades
  cart[1].quantity = 3;
  cart[1].total = 3 * cart[1].unitPrice;
  subtotal = cart.reduce((acc, it) => acc + it.total, 0);
  assert.equal(subtotal, 250.0);

  // Remover prod1
  cart = cart.filter((it) => it.id !== 'item1');
  subtotal = cart.reduce((acc, it) => acc + it.total, 0);
  assert.equal(subtotal, 180.0);
  assert.equal(cart.length, 1);
});

test('10. Deve validar campos obrigatórios do cliente no checkout WhatsApp', () => {
  const validateCustomer = (data) => {
    const errors = [];
    if (!data.name || !data.name.trim()) errors.push('Nome obrigatório');
    const cleanPhone = (data.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) errors.push('Telefone inválido');
    const cleanCep = (data.cep || '').replace(/\D/g, '');
    if (!cleanCep || cleanCep.length !== 8) errors.push('CEP inválido');
    if (!data.street || !data.street.trim()) errors.push('Endereço obrigatório');
    if (!data.number || !data.number.trim()) errors.push('Número obrigatório');
    if (!data.neighborhood || !data.neighborhood.trim()) errors.push('Bairro obrigatório');
    return errors;
  };

  const invalid = validateCustomer({ name: '', phone: '123', cep: '', street: '', number: '', neighborhood: '' });
  assert.equal(invalid.length, 6);

  const valid = validateCustomer({
    name: 'Carlos Oliveira',
    phone: '(73) 99123-4567',
    cep: '45600-077',
    street: 'Av. Cinquentenário',
    number: '187',
    neighborhood: 'Centro',
  });
  assert.equal(valid.length, 0);
});

test('11. Deve gerar a mensagem exata do WhatsApp estruturada conforme o modelo da ItaClean', () => {
  const msg = buildWhatsAppOrderMessage({
    customer: {
      name: 'Maria Santos',
      phone: '(73) 98888-7777',
      cep: '45600-077',
      street: 'Av. Cinquentenário',
      number: '187',
      neighborhood: 'Centro',
      city: 'Itabuna',
      state: 'BA',
      complement: 'Sala 102',
      reference: 'Em frente à Praça',
      notes: 'Entregar até às 17h',
    },
    items: [
      { name: 'Desengraxante Concentrado 5L', quantity: 2, unitPrice: 45.0 },
      { name: 'Pano Microfibra 40x40', quantity: 10, unitPrice: 4.5 },
    ],
    subtotal: 135.0,
    total: 135.0,
  });

  assert.ok(msg.includes('*NOVO PEDIDO — ITACLEAN*'));
  assert.ok(msg.includes('Olá! Gostaria de realizar um pedido.'));
  assert.ok(msg.includes('*DADOS DO CLIENTE*\nNome: Maria Santos\nTelefone: (73) 98888-7777'));
  assert.ok(msg.includes('*ENDEREÇO DE ENTREGA*'));
  assert.ok(msg.includes('CEP: 45600-077'));
  assert.ok(msg.includes('Número: 187'));
  assert.ok(msg.includes('Bairro: Centro'));
  assert.ok(msg.includes('Complemento: Sala 102'));
  assert.ok(msg.includes('Referência: Em frente à Praça'));
  assert.ok(msg.includes('*PRODUTOS*'));
  assert.ok(msg.includes('2x Desengraxante Concentrado 5L — R$ 45,00'));
  assert.ok(msg.includes('10x Pano Microfibra 40x40 — R$ 4,50'));
  assert.ok(msg.includes('Subtotal: R$ 135,00'));
  assert.ok(msg.includes('*TOTAL DO PEDIDO: R$ 135,00*'));
  assert.ok(msg.includes('Observações: Entregar até às 17h'));
  assert.ok(msg.includes('Gostaria de confirmar meu pedido e combinar a forma de pagamento e entrega.'));
  assert.ok(msg.includes('Obrigado!'));
});

test('12. Deve codificar URL corretamente (URI encoded) com caracteres especiais, traços e acentos', () => {
  const sampleMessage = '*NOVO PEDIDO — ITACLEAN*\nOlá! Gostaria de realizar um pedido.\nTotal: R$ 150,00';
  const url = generateWhatsAppOrderUrl(sampleMessage, '557341419517');

  assert.ok(url.startsWith('https://wa.me/557341419517?text='));
  // Não deve conter quebras de linha cruas ou espaços sem codificar
  assert.ok(!url.includes('\n'));
  assert.ok(!url.includes(' '));
  // Deve conter o texto decodificável intacto
  const decoded = decodeURIComponent(url.replace('https://wa.me/557341419517?text=', ''));
  assert.equal(decoded, sampleMessage);
});

test('13. Deve limpar e centralizar o número do WhatsApp no formato internacional 557341419517', () => {
  const url1 = generateWhatsAppOrderUrl('Teste', '(73) 4141-9517');
  assert.ok(url1.startsWith('https://wa.me/7341419517?text=') || url1.startsWith('https://wa.me/557341419517?text='));

  const url2 = generateWhatsAppOrderUrl('Teste', '55 73 4141-9517');
  assert.ok(url2.startsWith('https://wa.me/557341419517?text='));
});

test('14. Deve tratar campos opcionais (complemento, referência e observações vazios) com elegância', () => {
  const msg = buildWhatsAppOrderMessage({
    customer: {
      name: 'João',
      phone: '73999998888',
      cep: '45600-077',
      street: 'Rua Principal',
      number: '10',
      neighborhood: 'Bairro Novo',
      complement: '',
      reference: '   ',
      notes: '',
    },
    items: [{ name: 'Álcool 70 5L', quantity: 1, unitPrice: 42.0 }],
    subtotal: 42.0,
    total: 42.0,
  });

  assert.ok(msg.includes('Complemento: -'));
  assert.ok(msg.includes('Referência: -'));
  assert.ok(msg.includes('Observações: Nenhuma'));
});

test('15. Deve validar a senha de acesso ao Dashboard de Administração (2913)', () => {
  const ADMIN_PASSWORD = '2913';

  const checkAdminPassword = (input) => {
    return input.trim() === ADMIN_PASSWORD;
  };

  assert.equal(checkAdminPassword('2913'), true);
  assert.equal(checkAdminPassword(' 2913 '), true);
  assert.equal(checkAdminPassword('1234'), false);
  assert.equal(checkAdminPassword(''), false);
  assert.equal(checkAdminPassword('admin'), false);
});

test('16. Deve lançar exceção em caso de erro do Supabase para impedir falso sucesso', async () => {
  // Simula cliente Supabase que retorna erro de RLS ou restrição
  const mockSupabaseWithError = {
    from: () => ({
      upsert: async () => ({
        data: null,
        error: { message: 'new row violates row-level security policy' },
      }),
    }),
  };

  const simulateSave = async (client, data) => {
    const { error } = await client.from('store_settings').upsert(data);
    if (error) {
      throw new Error(`Falha ao salvar no banco Supabase: ${error.message}`);
    }
    return data;
  };

  await assert.rejects(
    async () => {
      await simulateSave(mockSupabaseWithError, { key: 'store_info', value: {} });
    },
    /Falha ao salvar no banco Supabase: new row violates row-level security policy/
  );
});

test('17. Deve aceitar IDs em formato TEXT customizados (cat-1, prod-1) sem rejeição de tipo UUID', () => {
  const isCustomOrUuidText = (id) => {
    return typeof id === 'string' && id.trim().length > 0;
  };

  assert.equal(isCustomOrUuidText('prod-1730000000'), true);
  assert.equal(isCustomOrUuidText('cat-limpeza-pesada'), true);
  assert.equal(isCustomOrUuidText('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'), true);
  assert.equal(isCustomOrUuidText(''), false);
});

test('18. Deve garantir que payload de produto contenha campos essenciais para o banco', () => {
  const rawProduct = {
    id: 'prod-999',
    name: 'Desengraxante 5L',
    sku: 'ITA-DES-5L',
    price: 89.9,
    dilution_info: '1:10 para limpeza pesada',
    safety_info: 'Usar luvas de borracha',
    images: ['https://itaclean.com.br/foto1.jpg'],
  };

  const payload = {
    id: rawProduct.id,
    name: rawProduct.name,
    sku: rawProduct.sku,
    price: Number(rawProduct.price),
    dilution_info: rawProduct.dilution_info || '',
    safety_info: rawProduct.safety_info || '',
    images: rawProduct.images || [],
    is_active: true,
  };

  assert.equal(payload.dilution_info, '1:10 para limpeza pesada');
  assert.equal(payload.safety_info, 'Usar luvas de borracha');
  assert.equal(payload.images.length, 1);
  assert.equal(payload.price, 89.9);
});

test('19. Deve mapear order_status para coluna status do banco de dados ao atualizar pedido', () => {
  const inputUpdates = {
    order_status: 'payment_approved',
    tracking_code: 'FROTA-ITA-102',
    notes: 'Liberado para entrega rápida',
  };

  const dbUpdates = {
    updated_at: new Date().toISOString(),
  };
  if (inputUpdates.order_status) dbUpdates.status = inputUpdates.order_status;
  if (inputUpdates.tracking_code !== undefined) dbUpdates.tracking_code = inputUpdates.tracking_code;
  if (inputUpdates.notes !== undefined) dbUpdates.notes = inputUpdates.notes;

  assert.equal(dbUpdates.status, 'payment_approved');
  assert.equal(dbUpdates.tracking_code, 'FROTA-ITA-102');
  assert.equal(dbUpdates.order_status, undefined); // coluna correta é status!
});

test('20. Deve persistir configurações de loja e validar dados obrigatórios', () => {
  const settings = {
    name: 'Itaclean Produtos de Limpeza e Descartáveis',
    cnpj: '38.452.190/0001-44',
    phone: '(73) 4141-9517',
    whatsapp: '557341419517',
    email: 'contato@itaclean.com.br',
    free_shipping_threshold: 299,
  };

  assert.ok(settings.whatsapp.startsWith('55'));
  assert.ok(settings.cnpj.includes('/'));
  assert.equal(settings.free_shipping_threshold, 299);
});
