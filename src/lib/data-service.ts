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
  CustomerSummary,
  CustomerOrderBrief,
  Address,
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
    const { error } = await supabase
      .from('store_settings')
      .upsert(
        { key: 'store_info', value: settings, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) {
      console.error('Erro ao salvar settings no Supabase:', error);
      throw new Error(`Falha ao salvar configurações no Supabase: ${error.message}`);
    }
  }
  setLocalData(STORAGE_KEYS.SETTINGS, settings);
  return settings;
}

// ----------------------------------------------------
// CATEGORIES
// ----------------------------------------------------
export async function getCategories(activeOnly = false): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch (e) {
      console.warn('Supabase categories error, fallback to local:', e);
    }
  }
  const local = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  return activeOnly ? local.filter((c) => c.is_active) : local;
}

export async function saveCategory(category: Category): Promise<Category> {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sort_order: Number(category.sort_order) || 0,
      is_active: category.is_active ?? true,
      image_url: category.image_url || null,
      icon_name: category.icon_name || null,
      parent_id: category.parent_id || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Erro ao salvar categoria no Supabase:', error);
      throw new Error(`Falha ao salvar categoria no Supabase: ${error.message}`);
    }
  }

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
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir categoria no Supabase:', error);
      throw new Error(`Falha ao excluir categoria no Supabase: ${error.message}`);
    }
  }

  const current = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = current.filter((c) => c.id !== id);
  setLocalData(STORAGE_KEYS.CATEGORIES, updated);
}

export async function toggleCategoryActive(id: string, is_active: boolean): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Erro ao alternar status da categoria no Supabase:', error);
      throw new Error(`Falha ao alterar status da categoria: ${error.message}`);
    }
  }

  const current = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const index = current.findIndex((c) => c.id === id);
  if (index >= 0) {
    current[index] = { ...current[index], is_active };
    setLocalData(STORAGE_KEYS.CATEGORIES, current);
  }
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
export async function getBanners(activeOnly = false): Promise<Banner[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Banner[];
    } catch (e) {
      console.warn('Supabase banners error, fallback to local:', e);
    }
  }
  const local = getLocalData<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  return activeOnly ? local.filter((b) => b.is_active) : local;
}

export async function saveBanner(banner: Banner): Promise<Banner> {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || '',
      link_url: banner.link_url,
      desktop_image_url: banner.desktop_image_url,
      mobile_image_url: banner.mobile_image_url || null,
      badge_text: banner.badge_text || null,
      sort_order: Number(banner.sort_order) || 0,
      is_active: banner.is_active ?? true,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('banners').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Supabase banner save error:', error);
      throw new Error(`Falha ao salvar banner no Supabase: ${error.message}`);
    }
  }

  const current = getLocalData<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  const index = current.findIndex((b) => b.id === banner.id);
  const updated = index >= 0 ? [...current] : [banner, ...current];
  if (index >= 0) updated[index] = banner;
  setLocalData(STORAGE_KEYS.BANNERS, updated);
  return banner;
}

export async function deleteBanner(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) {
      console.error('Supabase banner delete error:', error);
      throw new Error(`Falha ao excluir banner no Supabase: ${error.message}`);
    }
  }

  const current = getLocalData<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  const updated = current.filter((b) => b.id !== id);
  setLocalData(STORAGE_KEYS.BANNERS, updated);
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
  isNewOnly?: boolean;
  excludeIds?: string[];
  activeOnly?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'newest' | 'discount_desc';
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

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('products').select('*');
      if (params.activeOnly !== false) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        products = data as Product[];
      }
    } catch (e) {
      console.warn('Supabase products error, fallback to local:', e);
    }
  }

  if (params.activeOnly !== false) {
    products = products.filter((p) => p.is_active);
  }

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

  if (params.isNewOnly) {
    products = products.filter((p) => p.is_new);
  }

  if (params.excludeIds && params.excludeIds.length > 0) {
    products = products.filter((p) => !params.excludeIds!.includes(p.id));
  }

  // Sorting
  switch (params.sortBy) {
    case 'discount_desc':
      products.sort((a, b) => {
        const discA = a.sale_price ? (a.price - a.sale_price) : 0;
        const discB = b.sale_price ? (b.price - b.sale_price) : 0;
        return discB - discA;
      });
      break;
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
      products.sort((a, b) => {
        const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (diff !== 0) return diff;
        if (b.is_new !== a.is_new) return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0);
        return b.id.localeCompare(a.id);
      });
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
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        const categories = await getCategories();
        const brands = await getBrands();
        return {
          ...data,
          category: categories.find((c) => c.id === data.category_id),
          brand: brands.find((b) => b.id === data.brand_id),
        } as Product;
      }
    } catch (e) {
      console.warn('Supabase product slug error, fallback to local:', e);
    }
  }

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
  if (isSupabaseConfigured && supabase) {
    const payload: any = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category_id: product.category_id || null,
      brand_id: product.brand_id || null,
      price: Number(product.price) || 0,
      sale_price:
        product.sale_price !== undefined && product.sale_price !== null && String(product.sale_price) !== ''
          ? Number(product.sale_price)
          : null,
      stock_quantity: Number(product.stock_quantity) || 0,
      low_stock_threshold: Number(product.low_stock_threshold) || 5,
      description: product.description || '',
      short_description: product.short_description || '',
      dilution_info: product.dilution_info || '',
      safety_info: product.safety_info || '',
      technical_info: product.technical_info || {},
      images: product.images && product.images.length > 0 ? product.images : ['/itaclean-logo.png'],
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      is_new: product.is_new ?? false,
      weight: product.weight ? Number(product.weight) : 0.5,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Supabase product save error:', error);
      throw new Error(`Falha ao salvar produto no Supabase: ${error.message}`);
    }
  }

  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const index = current.findIndex((p) => p.id === product.id);
  const updated = index >= 0 ? [...current] : [product, ...current];
  if (index >= 0) updated[index] = product;
  setLocalData(STORAGE_KEYS.PRODUCTS, updated);

  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase product delete error:', error);
      throw new Error(`Falha ao excluir produto no Supabase: ${error.message}`);
    }
  }

  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => p.id !== id);
  setLocalData(STORAGE_KEYS.PRODUCTS, updated);
}

export async function toggleProductActive(id: string, is_active: boolean): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('products')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Erro ao alternar status do produto no Supabase:', error);
      throw new Error(`Falha ao alterar status do produto: ${error.message}`);
    }
  }

  const current = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const index = current.findIndex((p) => p.id === id);
  if (index >= 0) {
    current[index] = { ...current[index], is_active };
    setLocalData(STORAGE_KEYS.PRODUCTS, current);
  }
}

// ----------------------------------------------------
// COUPONS
// ----------------------------------------------------
export async function getCoupons(activeOnly = false): Promise<Coupon[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('coupons').select('*');
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Coupon[];
      }
    } catch (e) {
      console.warn('Supabase coupons error, fallback to local:', e);
    }
  }
  const local = getLocalData<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  return activeOnly ? local.filter((c) => c.is_active) : local;
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
  if (isSupabaseConfigured && supabase) {
    const payload = {
      id: coupon.id,
      code: coupon.code.toUpperCase().trim(),
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      min_order_amount: coupon.min_order_amount ? Number(coupon.min_order_amount) : 0,
      max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
      usage_limit: coupon.usage_limit ? Number(coupon.usage_limit) : null,
      times_used: Number(coupon.times_used) || 0,
      expires_at: coupon.expires_at || null,
      is_active: coupon.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('coupons').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Supabase coupon save error:', error);
      throw new Error(`Falha ao salvar cupom no Supabase: ${error.message}`);
    }
  }

  const current = getLocalData<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  const index = current.findIndex((c) => c.id === coupon.id);
  const updated = index >= 0 ? [...current] : [coupon, ...current];
  if (index >= 0) updated[index] = coupon;
  setLocalData(STORAGE_KEYS.COUPONS, updated);
  return coupon;
}

export async function deleteCoupon(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      console.error('Supabase coupon delete error:', error);
      throw new Error(`Falha ao excluir cupom no Supabase: ${error.message}`);
    }
  }

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
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((o: any) => ({
          ...o,
          order_status: o.status || o.order_status,
          shipping_amount: o.shipping_cost ?? o.shipping_amount ?? 0,
          shipping_address: o.shipping_address || {
            id: `addr-${o.id}`,
            recipient_name: o.customer_name,
            postal_code: o.shipping_postal_code || '',
            street: o.shipping_street || '',
            number: o.shipping_number || '',
            complement: o.shipping_complement || '',
            neighborhood: o.shipping_neighborhood || '',
            city: o.shipping_city || 'Itabuna',
            state: o.shipping_state || 'BA',
          },
          items: (o.order_items || []).map((it: any) => ({
            id: it.id,
            order_id: it.order_id,
            product_id: it.product_id,
            product_name_snapshot: it.product_name_snapshot || it.name,
            sku_snapshot: it.sku_snapshot || it.sku,
            unit_price: it.unit_price,
            quantity: it.quantity,
            line_total: it.line_total || it.total_price || it.unit_price * it.quantity,
            image_url: it.image_url,
          })),
        })) as Order[];
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
      const orderPayload: any = {
        order_number: newOrder.order_number,
        user_id: newOrder.user_id || null,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        customer_phone: newOrder.customer_phone,
        customer_document: newOrder.customer_document || 'Não informado',
        shipping_street: newOrder.shipping_address.street,
        shipping_number: newOrder.shipping_address.number,
        shipping_complement: newOrder.shipping_address.complement || '',
        shipping_neighborhood: newOrder.shipping_address.neighborhood,
        shipping_city: newOrder.shipping_address.city,
        shipping_state: newOrder.shipping_address.state,
        shipping_postal_code: newOrder.shipping_address.postal_code,
        shipping_method: newOrder.shipping_method,
        shipping_cost: newOrder.shipping_amount,
        payment_method: newOrder.payment_method,
        subtotal: newOrder.subtotal,
        discount_amount: newOrder.discount_amount,
        total_amount: newOrder.total_amount,
        status: newOrder.order_status,
        payment_status: newOrder.payment_status,
        notes: newOrder.notes,
      };

      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (!orderErr && insertedOrder) {
        const orderId = insertedOrder.id;
        const orderItemsToInsert = newOrder.items.map((i) => ({
          order_id: orderId,
          name: i.product_name_snapshot,
          sku: i.sku_snapshot,
          product_name_snapshot: i.product_name_snapshot,
          sku_snapshot: i.sku_snapshot,
          unit_price: i.unit_price,
          quantity: i.quantity,
          total_price: i.line_total,
          line_total: i.line_total,
          image_url: i.image_url,
        }));
        await supabase.from('order_items').insert(orderItemsToInsert);
      } else if (orderErr) {
        console.warn('Erro ao inserir pedido no Supabase:', orderErr.message);
      }
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
  if (isSupabaseConfigured && supabase) {
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.order_status) dbUpdates.status = updates.order_status;
    if (updates.payment_status) dbUpdates.payment_status = updates.payment_status;
    if (updates.tracking_code !== undefined) dbUpdates.tracking_code = updates.tracking_code;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from('orders').update(dbUpdates).eq('id', orderId);
    if (error) {
      console.error('Supabase update order error:', error);
      throw new Error(`Falha ao atualizar pedido no Supabase: ${error.message}`);
    }
  }

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

  return updatedOrder;
}

// ----------------------------------------------------
// CUSTOMERS (AGREGADO CENTRALIZADO)
// ----------------------------------------------------
export async function getCustomers(): Promise<CustomerSummary[]> {
  const orders = await getOrders();
  const customerMap = new Map<string, CustomerSummary>();

  for (const ord of orders) {
    const cleanDoc = ord.customer_document?.replace(/\D/g, '') || '';
    const cleanPhone = ord.customer_phone?.replace(/\D/g, '') || '';
    const cleanEmail = ord.customer_email?.toLowerCase().trim() || '';

    // Agrupa preferencialmente por documento ou telefone limpo
    const key = cleanDoc
      ? `doc_${cleanDoc}`
      : cleanPhone.length >= 8
      ? `tel_${cleanPhone.slice(-8)}`
      : `email_${cleanEmail}`;

    if (!key || key === 'email_') continue;

    const orderBrief: CustomerOrderBrief = {
      id: ord.id,
      order_number: ord.order_number,
      total_amount: ord.total_amount,
      order_status: ord.order_status,
      payment_status: ord.payment_status,
      payment_method: ord.payment_method,
      created_at: ord.created_at,
      items_count: ord.items?.length || 1,
    };

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: `cust-${key.replace(/[^a-zA-Z0-9]/g, '-')}`,
        name: ord.customer_name,
        email: ord.customer_email,
        phone: ord.customer_phone,
        document:
          ord.customer_document && ord.customer_document !== 'Não informado'
            ? ord.customer_document
            : undefined,
        address: ord.shipping_address,
        total_orders: 1,
        total_spent: ord.total_amount,
        first_order_at: ord.created_at,
        last_order_at: ord.created_at,
        is_recurrent: false,
        orders: [orderBrief],
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.total_orders += 1;
      existing.total_spent += ord.total_amount;
      existing.orders.push(orderBrief);

      if (new Date(ord.created_at) > new Date(existing.last_order_at)) {
        existing.last_order_at = ord.created_at;
        existing.address = ord.shipping_address;
        if (ord.customer_name) existing.name = ord.customer_name;
        if (ord.customer_phone) existing.phone = ord.customer_phone;
      }
      if (new Date(ord.created_at) < new Date(existing.first_order_at)) {
        existing.first_order_at = ord.created_at;
      }
      existing.is_recurrent = existing.total_orders > 1;
    }
  }

  // Mesclar com cadastros de perfis do Supabase se existirem
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles && profiles.length > 0) {
        for (const prof of profiles) {
          const cleanDoc = prof.document_number?.replace(/\D/g, '') || '';
          const cleanPhone = prof.phone?.replace(/\D/g, '') || '';
          const key = cleanDoc
            ? `doc_${cleanDoc}`
            : cleanPhone.length >= 8
            ? `tel_${cleanPhone.slice(-8)}`
            : `prof_${prof.id}`;

          if (customerMap.has(key)) {
            const existing = customerMap.get(key)!;
            if (prof.company_name) existing.company_name = prof.company_name;
            if (prof.full_name) existing.name = prof.full_name;
          } else {
            customerMap.set(key, {
              id: prof.id,
              name: prof.full_name,
              email: prof.email || 'Cadastrado no App',
              phone: prof.phone || '',
              document: prof.document_number,
              company_name: prof.company_name,
              address: {
                id: `addr-prof-${prof.id}`,
                recipient_name: prof.full_name,
                postal_code: '45600-077',
                street: 'Av. Cinquentenário',
                number: '',
                neighborhood: 'Centro',
                city: 'Itabuna',
                state: 'BA',
              },
              total_orders: 0,
              total_spent: 0,
              first_order_at: prof.created_at || new Date().toISOString(),
              last_order_at: prof.created_at || new Date().toISOString(),
              is_recurrent: false,
              orders: [],
            });
          }
        }
      }
    } catch (e) {
      console.warn('Supabase profiles fetch error:', e);
    }
  }

  return Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime()
  );
}

export async function updateCustomer(
  customerId: string,
  updatedData: {
    name?: string;
    phone?: string;
    email?: string;
    document?: string;
    address?: Partial<Address>;
  }
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const dbUpdates: any = {};
    if (updatedData.name) dbUpdates.customer_name = updatedData.name;
    if (updatedData.phone) dbUpdates.customer_phone = updatedData.phone;
    if (updatedData.email) dbUpdates.customer_email = updatedData.email;
    if (updatedData.document) dbUpdates.customer_document = updatedData.document;
    if (updatedData.address) {
      if (updatedData.address.street) dbUpdates.shipping_street = updatedData.address.street;
      if (updatedData.address.number) dbUpdates.shipping_number = updatedData.address.number;
      if (updatedData.address.neighborhood)
        dbUpdates.shipping_neighborhood = updatedData.address.neighborhood;
      if (updatedData.address.city) dbUpdates.shipping_city = updatedData.address.city;
      if (updatedData.address.state) dbUpdates.shipping_state = updatedData.address.state;
      if (updatedData.address.postal_code)
        dbUpdates.shipping_postal_code = updatedData.address.postal_code;
    }

    if (Object.keys(dbUpdates).length > 0) {
      const cleanPhone = updatedData.phone?.replace(/\D/g, '') || '';
      if (cleanPhone.length >= 8) {
        await supabase
          .from('orders')
          .update(dbUpdates)
          .ilike('customer_phone', `%${cleanPhone.slice(-8)}%`);
      }
    }
  }

  // Atualiza também em cache local
  const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updatedOrders = orders.map((o) => {
    const isMatch =
      (updatedData.phone &&
        o.customer_phone.replace(/\D/g, '').slice(-8) ===
          updatedData.phone.replace(/\D/g, '').slice(-8)) ||
      (updatedData.document &&
        o.customer_document?.replace(/\D/g, '') ===
          updatedData.document.replace(/\D/g, '')) ||
      (updatedData.email &&
        o.customer_email.toLowerCase() === updatedData.email.toLowerCase());

    if (isMatch) {
      return {
        ...o,
        customer_name: updatedData.name || o.customer_name,
        customer_phone: updatedData.phone || o.customer_phone,
        customer_email: updatedData.email || o.customer_email,
        customer_document: updatedData.document || o.customer_document,
        shipping_address: updatedData.address
          ? { ...o.shipping_address, ...updatedData.address }
          : o.shipping_address,
      };
    }
    return o;
  });
  setLocalData(STORAGE_KEYS.ORDERS, updatedOrders);
}
