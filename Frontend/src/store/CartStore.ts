import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types/product";
import type { CartItem } from "../types/cart";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, rentalDays?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateRentalDays: (productId: string, rentalDays: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  totalDeposit: () => number;
  totalItems: () => number;
}

const MIN_QTY = 1;
const MIN_DAYS = 1;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, rentalDays = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity, rentalDays }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? {
                  ...i,
                  quantity: Math.max(
                    MIN_QTY,
                    Math.min(quantity, i.product.stock),
                  ),
                }
              : i,
          ),
        }));
      },

      updateRentalDays: (productId, rentalDays) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, rentalDays: Math.max(MIN_DAYS, rentalDays) }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.pricePerDay * i.quantity * i.rentalDays,
          0,
        ),

      totalDeposit: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.securityDeposit * i.quantity,
          0,
        ),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "cart-storage" },
  ),
);
