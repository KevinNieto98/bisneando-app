import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  slug: string;
  title: string;
  price: number;
  image?: string | null;
  quantity: number;   // en el carrito
  maxQty?: number;    // stock (opcional)
};

type CartState = {
  items: Record<string, CartItem>; // key: slug
  // Selectores
  totalItems: () => number;        // número de ítems (sum quantities)
  totalLines: () => number;        // líneas distintas
  totalPrice: () => number;        // total HNL
  // Acciones
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      totalItems: () =>
        Object.values(get().items).reduce((acc, it) => acc + it.quantity, 0),

      totalLines: () => Object.keys(get().items).length,

      totalPrice: () =>
        Object.values(get().items).reduce((acc, it) => acc + it.price * it.quantity, 0),

      add: (item, qty = 1) => {
        set((state) => {
          const current = state.items[item.slug];
          const nextQtyRaw = (current?.quantity ?? 0) + qty;
          const max = typeof item.maxQty === "number" ? item.maxQty : Infinity;
          const nextQty = Math.max(1, Math.min(nextQtyRaw, max));

          return {
            items: {
              ...state.items,
              [item.slug]: {
                id: item.id,
                slug: item.slug,
                title: item.title,
                price: item.price,
                image: item.image ?? current?.image ?? null,
                maxQty: item.maxQty ?? current?.maxQty,
                quantity: nextQty,
              },
            },
          };
        });
      },

      setQty: (slug, qty) => {
        set((state) => {
          const it = state.items[slug];
          if (!it) return state;
          const max = typeof it.maxQty === "number" ? it.maxQty : Infinity;
          const nextQty = Math.max(1, Math.min(qty, max));
          return { items: { ...state.items, [slug]: { ...it, quantity: nextQty } } };
        });
      },

      remove: (slug) => {
        set((state) => {
          const copy = { ...state.items };
          delete copy[slug];
          return { items: copy };
        });
      },

      clear: () => set({ items: {} }),
    }),
    {
      name: "bisneando-cart-v1", // clave del storage
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // (Opcional) migraciones si cambias estructura en el futuro
      // migrate: async (persisted, version) => persisted,
      // partialize: (state) => ({ items: state.items }), // guardar solo items si quieres
    }
  )
);
