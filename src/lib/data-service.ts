import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from './mock-data';
import {
  Product,
  Category,
  Brand,
  Banner,
  Coupon,
  StoreSettings,
  Order,
  OrderStatus,
  PaymentStatus,
} from '../types';

// Local storage keys for persistent offline/fallback data
const STORAGE_KEYS = {
  PRODUCTS: 'itaclean_products_v1',
  CATEGORIES: 'itaclean_categories_v1',
  BRANDS: 'itaclean_brands_v1',
  BANNERS: 'itaclean_banners_v1',
  COUPONS: 'itaclean_coupons_v1',
  SETTINGS: 'itaclean_settings_v1',
  ORDERS: 'itaclean_orders_v1',
};

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Falha ao persistir no localStorage:', e);
  }
}

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'store_info')
        .maybeSingle();

      if (!error && data?.value) {
        return { ...INITIAL_SETTINGS, ...data.value };
      }
    } catch (e) {
      console.warn('Erro ao carregar store_settings do Supabase, usando local:', e);
    }
  }
  return getLocalData<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('store_settings')
        .upsert({ key: 'store_info', value: settings, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error('Erro ao salvar settings no Supabase:', e);
    }
  }
  setLocalData(STORAGE_KEYS.SETTINGS, settings);
  return settings;
}

// ----------------------------------------------------
// CATEGORIES
// ----------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch (e) {
      console.warn('Supabase categories error, fallback to local:', e);
    }
  }
  return getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export async function saveCategory(category: Category): Promise<Category> {
  const current = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const index = current.findIndex((c) => c.id === category.id);
  let updated: Category[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = category;
  } else {
    updated = [category, ...current];
  }
  setLocalData(STORAGE_KEYS.CATEGORIES, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').upsert(category);
    } catch (e) {
      console.error('Erro ao sincronizar categoria no Supabase:', e);
    }
  }
  return category;
}

// ----------------------------------------------------
// BRANDS
// ----------------------------------------------------
export async function getBrands(): Promise<Brand[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (!error && data && data.length > 0) return data as Brand[];
    } catch (e) {
      console.warn('Supabase brands error, fallback to local:', e);
    }
  }
  return getLocalData<Brand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
}

// ----------------------------------------------------
// BANNERS
// ----------------------------------------------------
export async function getBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as Banner[];
    } catch (e) {
      console.warn('Supabase banners error, fallback to local:', e);
    }
  }
  return getLocalData<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
}

export async function saveBanner(banner: Banner): Promise<Banner> {
  const current = getLocalData<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  const index = current.findIndex((b) => b.id === banner.id);
  const updated = index >= 0 ? [...current] : [banner, ...current];
  if (index >= 0) updated[index] = banner;
  setLocalData(STORAGE_KEYS.BANNERS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('banners').upsert(banner);
    } catch (e) {
      console.error('Supabase banner save error:', e);
    }
  }
  return banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const current = getLocalData<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  const updated = current.filter((b) => b.id !== id);
  setLocalData(STORAGE_KEYS.BANNERS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('banners').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase banner delete error:', e);
    }
  }
}

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------
export interface ProductFilterParams {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  onSaleOnly?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getProducts(params: ProductFilterParams = {}): Promise<ProductsResponse> {
  let products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const categories = await getCategories();
  const brands = await getBrands();

  // Populate references
  products = products.map((p) => ({
    ...p,
    category: categories.find((c) => c.id === p.category_id),
    brand: brands.find((b) => b.id === p.brand_id),
  }));

  // Filtering
  if (params.categorySlug && params.categorySlug !== 'todos') {
    const targetCat = categories.find((c) => c.slug === params.categorySlug);
    if (targetCat) {
      products = products.filter((p) => p.category_id === targetCat.id);
    }
  }

  if (params.brandSlug) {
    const targetBrand = brands.find((b) => b.slug === params.brandSlug);
    if (targetBrand) {
      products = products.filter((p) => p.brand_id === targetBrand.id);
    }
  }

  if (params.search && params.search.trim() !== '') {
    const q = params.search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        (p.brand && p.brand.name.toLowerCase().includes(q))
    );
  }

  if (params.minPrice !== undefined && params.minPrice > 0) {
    products = products.filter((p) => (p.sale_price ?? p.price) >= params.minPrice!);
  }

  if (params.maxPrice !== undefined && params.maxPrice > 0) {
    products = products.filter((p) => (p.sale_price ?? p.price) <= params.maxPrice!);
  }

  if (params.inStockOnly) {
    products = products.filter((p) => p.stock_quantity > 0);
  }

  if (params.featuredOnly) {
    products = products.filter((p) => p.is_featured);
  }

  if (params.onSaleOnly) {
    products = products.filter((p) => p.sale_price && p.sale_price < p.price);
  }

  // Sorting
  switch (params.sortBy) {
    case 'price_asc':
      products.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
      break;
    case 'price_desc':
      products.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
      break;
    case 'name_asc':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      products.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
    case 'relevance':
    default:
      // Keep featured first, then newest
      products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      break;
  }

  const total = products.length;
  const pageSize = params.pageSize || 12;
  const currentPage = params.page || 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paginated = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    products: paginated,
    total,
    totalPages,
    currentPage,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const found = products.find((p) => p.slug === slug);
  if (!found) return null;

  const categories = await getCategories();
  const brands = await getBrands();

  return {
    ...found,
    category: categories.find((c) => c.id === found.category_id),
    brand: brands.find((b) => b.id === found.brand_id),
  };
}

export async function saveProduct(product: Product): Promise<Product> {
  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const index = current.findIndex((p) => p.id === product.id);
  const updated = index >= 0 ? [...current] : [product, ...current];
  if (index >= 0) updated[index] = product;
  setLocalData(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category_id: product.category_id,
        brand_id: product.brand_id,
        price: product.price,
        sale_price: product.sale_price,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
        description: product.description,
        short_description: product.short_description,
        dilution_info: product.dilution_info,
        safety_info: product.safety_info,
        technical_info: product.technical_info,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_new: product.is_new,
        weight: product.weight,
      });
    } catch (e) {
      console.error('Supabase product save error:', e);
    }
  }

  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => p.id !== id);
  setLocalData(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase product delete error:', e);
    }
  }
}

// ----------------------------------------------------
// COUPONS
// ----------------------------------------------------
export async function getCoupons(): Promise<Coupon[]> {
  return getLocalData<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discountAmount: number; coupon?: Coupon; message: string }> {
  const coupons = await getCoupons();
  const found = coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active
  );

  if (!found) {
    return { valid: false, discountAmount: 0, message: 'Cupom inválido ou expirado.' };
  }

  if (found.min_order_amount && subtotal < found.min_order_amount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Este cupom exige pedido mínimo de R$ ${found.min_order_amount.toFixed(2)}.`,
    };
  }

  if (found.usage_limit && found.times_used >= found.usage_limit) {
    return { valid: false, discountAmount: 0, message: 'Este cupom atingiu o limite de usos.' };
  }

  let discount = 0;
  if (found.discount_type === 'percentage') {
    discount = (subtotal * found.discount_value) / 100;
    if (found.max_discount_amount && discount > found.max_discount_amount) {
      discount = found.max_discount_amount;
    }
  } else {
    discount = found.discount_value;
  }

  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    discountAmount: Math.round(discount * 100) / 100,
    coupon: found,
    message: `Cupom ${found.code} aplicado com sucesso!`,
  };
}

export async function saveCoupon(coupon: Coupon): Promise<Coupon> {
  const current = getLocalData<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  const index = current.findIndex((c) => c.id === coupon.id);
  const updated = index >= 0 ? [...current] : [coupon, ...current];
  if (index >= 0) updated[index] = coupon;
  setLocalData(STORAGE_KEYS.COUPONS, updated);
  return coupon;
}

export async function deleteCoupon(id: string): Promise<void> {
  const current = getLocalData<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  const updated = current.filter((c) => c.id !== id);
  setLocalData(STORAGE_KEYS.COUPONS, updated);
}

// ----------------------------------------------------
// ORDERS
// ----------------------------------------------------
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Order[];
      }
    } catch (e) {
      console.warn('Supabase orders fetch error, fallback to local:', e);
    }
  }
  return getLocalData<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.order_number === orderNumber) || null;
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>
): Promise<Order> {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ITA-${new Date().getFullYear()}-${randomSuffix}`;

  const newOrder: Order = {
    ...orderData,
    id: `ord-${timestamp}`,
    order_number: orderNumber,
    created_at: new Date().toISOString(),
  };

  const current = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  setLocalData(STORAGE_KEYS.ORDERS, [newOrder, ...current]);

  // Decrement stock for purchased products
  const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  newOrder.items.forEach((item) => {
    const prod = products.find((p) => p.sku === item.sku_snapshot || p.id === item.product_id);
    if (prod) {
      prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
    }
  });
  setLocalData(STORAGE_KEYS.PRODUCTS, products);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').insert({
        id: newOrder.id,
        order_number: newOrder.order_number,
        user_id: newOrder.user_id,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        customer_phone: newOrder.customer_phone,
        customer_document: newOrder.customer_document,
        shipping_address: newOrder.shipping_address,
        subtotal: newOrder.subtotal,
        discount_amount: newOrder.discount_amount,
        shipping_amount: newOrder.shipping_amount,
        total_amount: newOrder.total_amount,
        payment_status: newOrder.payment_status,
        order_status: newOrder.order_status,
        shipping_method: newOrder.shipping_method,
        notes: newOrder.notes,
      });

      // Insert order items snapshot
      const orderItemsToInsert = newOrder.items.map((i) => ({
        order_id: newOrder.id,
        product_id: i.product_id,
        product_name_snapshot: i.product_name_snapshot,
        sku_snapshot: i.sku_snapshot,
        unit_price: i.unit_price,
        quantity: i.quantity,
        line_total: i.line_total,
      }));
      await supabase.from('order_items').insert(orderItemsToInsert);
    } catch (e) {
      console.error('Erro ao persistir pedido no Supabase:', e);
    }
  }

  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  updates: {
    order_status?: OrderStatus;
    payment_status?: PaymentStatus;
    tracking_code?: string;
    notes?: string;
  }
): Promise<Order | null> {
  const current = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const index = current.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const updatedOrder = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedOrder;
  setLocalData(STORAGE_KEYS.ORDERS, current);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').update(updates).eq('id', orderId);
    } catch (e) {
      console.error('Supabase update order error:', e);
    }
  }

  return updatedOrder;
}
