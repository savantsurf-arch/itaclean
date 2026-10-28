import { describe, it, expect } from 'vitest';
import {
  getProducts,
  getCategories,
  getBrands,
  createOrder,
  getOrderByNumber,
  updateOrderStatus,
} from '../lib/data-service';

describe('Catálogo, Filtros e Pedidos com Snapshots (Itaclean)', () => {
  it('deve listar categorias iniciais e marcas oficiais', async () => {
    const cats = await getCategories();
    expect(cats.length).toBeGreaterThanOrEqual(10);
    const quimicos = cats.find((c) => c.slug === 'produtos-quimicos');
    expect(quimicos).toBeDefined();

    const brands = await getBrands();
    expect(brands.length).toBeGreaterThanOrEqual(5);
  });

  it('deve filtrar produtos pela categoria selecionada', async () => {
    const res = await getProducts({ categorySlug: 'produtos-quimicos' });
    expect(res.products.length).toBeGreaterThan(0);
    res.products.forEach((p) => {
      expect(p.category?.slug).toBe('produtos-quimicos');
    });
  });

  it('deve pesquisar produtos por termo de busca no nome ou descrição', async () => {
    const res = await getProducts({ search: 'desengraxante' });
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.products[0].name.toLowerCase()).toContain('desengraxante');
  });

  it('deve ordenar produtos por menor e maior preço', async () => {
    const asc = await getProducts({ sortBy: 'price_asc' });
    for (let i = 0; i < asc.products.length - 1; i++) {
      const p1 = asc.products[i].sale_price ?? asc.products[i].price;
      const p2 = asc.products[i + 1].sale_price ?? asc.products[i + 1].price;
      expect(p1).toBeLessThanOrEqual(p2);
    }

    const desc = await getProducts({ sortBy: 'price_desc' });
    for (let i = 0; i < desc.products.length - 1; i++) {
      const p1 = desc.products[i].sale_price ?? desc.products[i].price;
      const p2 = desc.products[i + 1].sale_price ?? desc.products[i + 1].price;
      expect(p1).toBeGreaterThanOrEqual(p2);
    }
  });

  it('deve criar um novo pedido com snapshots dos itens e recuperar por número do pedido', async () => {
    const orderData = {
      user_id: 'usr-test-01',
      customer_name: 'Condomínio Teste Residencial',
      customer_email: 'financeiro@condominioteste.com.br',
      customer_phone: '(11) 98765-4321',
      customer_document: '12.345.678/0001-99',
      shipping_address: {
        id: 'addr-test',
        recipient_name: 'Portaria Social',
        postal_code: '04567-000',
        street: 'Av. Teste',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      },
      subtotal: 159.8,
      discount_amount: 10.0,
      shipping_amount: 0.0,
      total_amount: 149.8,
      payment_status: 'paid' as const,
      order_status: 'payment_approved' as const,
      payment_method: 'pix' as const,
      shipping_method: 'Entrega Expressa Itaclean',
      items: [
        {
          id: 'item-test-1',
          order_id: '',
          product_name_snapshot: 'Desengraxante Industrial 5L',
          sku_snapshot: 'ITA-QUI-001',
          unit_price: 59.9,
          quantity: 2,
          line_total: 119.8,
        },
      ],
    };

    const created = await createOrder(orderData);
    expect(created.order_number).toMatch(/^ITA-\d{4}-\d{4}$/);

    const found = await getOrderByNumber(created.order_number);
    expect(found).not.toBeNull();
    expect(found?.customer_name).toBe('Condomínio Teste Residencial');
    expect(found?.items[0].sku_snapshot).toBe('ITA-QUI-001');

    // Test updating operational status and tracking code
    const updated = await updateOrderStatus(created.id, {
      order_status: 'shipped',
      tracking_code: 'RASTREIO-TESTE-1234',
    });
    expect(updated?.order_status).toBe('shipped');
    expect(updated?.tracking_code).toBe('RASTREIO-TESTE-1234');
  });
});
