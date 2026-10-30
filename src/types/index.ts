// ====================================================================
// ITACLEAN - TYPE DEFINITIONS
// ====================================================================

export type UserRole = 'customer' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  document_type?: 'CPF' | 'CNPJ';
  document_number?: string;
  company_name?: string;
  state_registration?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon_name?: string;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>; // e.g. { volume: "5L", fragrance: "Floral" }
  price: number;
  sale_price?: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  brand_id?: string;
  brand?: Brand;
  category_id?: string;
  category?: Category;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight?: number; // kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  dilution_info?: string; // e.g. "1:10 até 1:50 para sujidades pesadas"
  safety_info?: string; // Informações de FISPQ / EPIs
  technical_info?: Record<string, string>; // { "pH": "9.5 - 10.5", "Rendimento": "Até 250 Litros", "Validade": "24 meses" }
  images: string[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  user_id?: string;
  recipient_name: string;
  postal_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string;
  is_default?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  times_used: number;
  expires_at?: string;
  is_active: boolean;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_approved'
  | 'processing'
  | 'ready_for_shipping'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'declined'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto' | 'whatsapp';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  variant_snapshot?: Record<string, string>;
  image_url?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document?: string;
  shipping_address: Address;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  coupon_code?: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_method: PaymentMethod;
  shipping_method: string;
  tracking_code?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  button_text?: string;
  link_url: string;
  desktop_image_url: string;
  mobile_image_url?: string;
  badge_text?: string;
  sort_order: number;
  is_active: boolean;
}

export interface StoreSettings {
  name: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  email: string;
  logo_url?: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  business_hours: string;
  free_shipping_threshold: number;
  pix_discount_percentage: number;
  max_installments: number;
  interest_free_installments: number;
}

export interface CustomerOrderBrief {
  id: string;
  order_number: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  created_at: string;
  items_count: number;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  company_name?: string;
  address: Address;
  total_orders: number;
  total_spent: number;
  first_order_at: string;
  last_order_at: string;
  is_recurrent: boolean;
  orders: CustomerOrderBrief[];
}
