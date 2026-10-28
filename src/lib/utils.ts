import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calculatePixPrice(price: number, discountPercentage = 5): number {
  return price * (1 - discountPercentage / 100);
}

export function formatDocument(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  // CNPJ: 00.000.000/0000-00
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCEP(cep: string): Promise<ViaCepResponse | null> {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    if (!res.ok) return null;
    const data: ViaCepResponse = await res.json();
    if (data.erro) return null;
    return data;
  } catch (error) {
    console.error('Erro ao consultar ViaCEP:', error);
    return null;
  }
}

export function calculateShippingEstimate(
  cep: string,
  subtotal: number,
  freeShippingThreshold = 299
): Array<{ id: string; name: string; price: number; deadline: string; isFree?: boolean }> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length < 5) return [];

  // Regional simulated shipping based on realistic distributor delivery methods
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
