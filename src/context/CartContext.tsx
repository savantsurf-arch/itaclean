import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Coupon } from '../types';
import { validateCoupon } from '../lib/data-service';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponMessage: string | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setShippingCost: (cost: number) => void;
}

const CART_STORAGE_KEY = 'itaclean_cart_items_v1';
const COUPON_STORAGE_KEY = 'itaclean_cart_coupon_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const stored = localStorage.getItem(COUPON_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [shippingAmount, setShippingAmount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);

  // Recalculate discount based on applied coupon and subtotal
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount_amount && discountAmount > appliedCoupon.max_discount_amount) {
        discountAmount = appliedCoupon.max_discount_amount;
      }
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    const unitPrice = variant
      ? variant.sale_price ?? variant.price
      : product.sale_price ?? product.price;

    const itemId = `${product.id}-${variant?.id || 'default'}`;
    const maxStock = variant ? variant.stock_quantity : product.stock_quantity;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemId);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          total_price: newQty * unitPrice,
        };
        return updated;
      } else {
        const initialQty = Math.min(quantity, maxStock > 0 ? maxStock : 1);
        return [
          ...prev,
          {
            id: itemId,
            product,
            variant,
            quantity: initialQty,
            unit_price: unitPrice,
            total_price: initialQty * unitPrice,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const maxStock = item.variant
            ? item.variant.stock_quantity
            : item.product.stock_quantity;
          const clampedQty = Math.min(quantity, maxStock);
          return {
            ...item,
            quantity: clampedQty,
            total_price: clampedQty * item.unit_price,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setShippingAmount(0);
    setCouponMessage(null);
  };

  const applyCouponCode = async (
    code: string
  ): Promise<{ success: boolean; message: string }> => {
    const result = await validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponMessage(result.message);
      return { success: true, message: result.message };
    } else {
      setCouponMessage(result.message);
      return { success: false, message: result.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  const setShippingCost = (cost: number) => {
    setShippingAmount(cost);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        shippingAmount,
        total,
        appliedCoupon,
        couponMessage,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        setShippingCost,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
