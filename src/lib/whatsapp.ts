import { formatCurrency } from './utils';

// Número centralizado oficial da ItaClean (Itabuna/BA: (73) 4141-9517)
// DDI 55 + DDD 73 + Telefone sem espaços, traços ou caracteres especiais
export const ITACLEAN_WHATSAPP_NUMBER =
  (import.meta.env.VITE_STORE_WHATSAPP as string)?.replace(/\D/g, '') || '557341419517';

export function formatWhatsAppPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface WhatsAppCustomerData {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city?: string;
  state?: string;
  complement?: string;
  reference?: string;
  notes?: string;
}

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  variantName?: string;
}

export interface BuildWhatsAppOrderMessageParams {
  customer: WhatsAppCustomerData;
  items: WhatsAppOrderItem[];
  subtotal: number;
  total: number;
  discountAmount?: number;
  couponCode?: string;
  shippingAmount?: number;
  shippingMethod?: string;
}

/**
 * Monta automaticamente a mensagem organizada de pedido para o WhatsApp da ItaClean
 * seguindo rigorosamente o modelo do prompt.
 */
export function buildWhatsAppOrderMessage(params: BuildWhatsAppOrderMessageParams): string {
  const {
    customer,
    items,
    subtotal,
    total,
    discountAmount = 0,
    couponCode,
    shippingAmount,
    shippingMethod,
  } = params;

  // Lista de produtos formatada
  const itemsLines = items
    .map((item) => {
      const nameWithVariant = item.variantName ? `${item.name} (${item.variantName})` : item.name;
      return `${item.quantity}x ${nameWithVariant} — R$ ${formatWhatsAppPrice(item.unitPrice)}`;
    })
    .join('\n');

  // Linhas de subtotal e financeiros
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

/**
 * Gera o link oficial do WhatsApp no formato:
 * https://wa.me/NUMERO?text=MENSAGEM_URL_ENCODED
 */
export function generateWhatsAppOrderUrl(
  message: string,
  whatsappNumber: string = ITACLEAN_WHATSAPP_NUMBER
): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
