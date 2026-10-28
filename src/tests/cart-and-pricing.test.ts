import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculatePixPrice,
  formatDocument,
  formatCEP,
  formatPhone,
  calculateShippingEstimate,
} from '../lib/utils';
import { validateCoupon } from '../lib/data-service';

describe('Regras de Preços, Formatações e Cupons (Itaclean)', () => {
  it('deve calcular corretamente o desconto de 5% no Pix', () => {
    const originalPrice = 100.0;
    const pixPrice = calculatePixPrice(originalPrice, 5);
    expect(pixPrice).toBe(95.0);
  });

  it('deve formatar valores monetários em padrão BRL', () => {
    const formatted = formatCurrency(59.9);
    expect(formatted).toContain('59,90');
    expect(formatted).toContain('R$');
  });

  it('deve aplicar máscara correta de CPF e CNPJ', () => {
    expect(formatDocument('12345678900')).toBe('123.456.789-00');
    expect(formatDocument('38452190000144')).toBe('38.452.190/0001-44');
  });

  it('deve formatar CEP e telefone com máscara correta', () => {
    expect(formatCEP('04567000')).toBe('04567-000');
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('1140042020')).toBe('(11) 4004-2020');
  });

  it('deve conceder frete grátis quando o pedido atingir o valor mínimo de R$ 299', () => {
    const belowThreshold = calculateShippingEstimate('04567-000', 150.0, 299.0);
    const expressBelow = belowThreshold.find((o) => o.id === 'express');
    expect(expressBelow?.price).toBeGreaterThan(0);
    expect(expressBelow?.isFree).toBe(false);

    const aboveThreshold = calculateShippingEstimate('04567-000', 350.0, 299.0);
    const expressAbove = aboveThreshold.find((o) => o.id === 'express');
    expect(expressAbove?.price).toBe(0);
    expect(expressAbove?.isFree).toBe(true);
  });

  it('deve validar cupom percentual de 10% (BEMVINDO10)', async () => {
    const subtotal = 200.0;
    const result = await validateCoupon('BEMVINDO10', subtotal);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20.0);
  });

  it('deve rejeitar cupom quando o pedido não atinge o valor mínimo exigido', async () => {
    const subtotal = 50.0;
    const result = await validateCoupon('BEMVINDO10', subtotal); // Minimo 100
    expect(result.valid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.message).toContain('pedido mínimo');
  });

  it('deve rejeitar cupom inválido ou inexistente', async () => {
    const result = await validateCoupon('CUPOM_FALSO_123', 200.0);
    expect(result.valid).toBe(false);
    expect(result.discountAmount).toBe(0);
  });
});
