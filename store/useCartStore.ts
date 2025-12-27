// useCartStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  id_bodega: number; // 👈 NUEVO (obligatorio)
  title: string;
  price: number;
  images: string[];
  quantity: number;
  inStock?: number;
};

type CartState = {
  // key = `${id_bodega}:${id}`
  items: Record<string, CartItem>;

  // Selectores
  totalItems: () => number;
  totalLines: () => number;
  totalPrice: () => number;

  // Acciones
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (idKey: number | string, qty: number) => void;
  remove: (idKey: number | string) => void;
  clear: () => void;

  // Actualiza precios locales con los dbPrice del server
  // Si el server manda id_bodega, se aplica match exacto; si no, por id.
  // AJUSTE: ahora también puede actualizar id_bodega y re-key si cambia.
  applyServerPrices: (
    server: Array<{
      id: number;
      id_bodega?: number;
      dbPrice?: number;
      availableQty?: number;
      requestedQty?: number;
    }>
  ) => void;
};

// key helpers
const itemKeyOf = (id: number | string, id_bodega: number | string) =>
  `${String(id_bodega)}:${String(id)}`;

const isCompositeKey = (k: string) => k.includes(":");

const resolveKey = (items: Record<string, CartItem>, idKey: number | string) => {
  const raw = String(idKey);

  // Si ya viene como `${id_bodega}:${id}`, úsalo directo
  if (isCompositeKey(raw)) return raw;

  // Si viene como id (número/string), buscamos coincidencias por id
  const matches = Object.keys(items).filter((k) => {
    const it = items[k];
    return String(it.id) === raw;
  });

  // Si es ambiguo (mismo id en varias bodegas), no adivinamos
  if (matches.length !== 1) return null;

  return matches[0];
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      // =====================
      // Selectores
      // =====================
      totalItems: () =>
        Object.values(get().items).reduce((acc, it) => acc + it.quantity, 0),

      totalLines: () => Object.keys(get().items).length,

      totalPrice: () =>
        Object.values(get().items).reduce(
          (acc, it) => acc + it.price * it.quantity,
          0
        ),

      // =====================
      // Acciones
      // =====================
      add: (item, qty = 1) => {
        set((state) => {
          const key = itemKeyOf(item.id, item.id_bodega);
          const current = state.items[key];
          const nextQtyRaw = (current?.quantity ?? 0) + qty;

          const max =
            typeof item.inStock === "number"
              ? item.inStock
              : typeof current?.inStock === "number"
              ? current.inStock
              : Infinity;

          const nextQty = Math.max(1, Math.min(nextQtyRaw, max));

          return {
            items: {
              ...state.items,
              [key]: {
                id: item.id,
                id_bodega: item.id_bodega,
                title: item.title,
                price: item.price,
                images: item.images?.length ? item.images : current?.images ?? [],
                inStock:
                  typeof item.inStock === "number" ? item.inStock : current?.inStock,
                quantity: nextQty,
              },
            },
          };
        });
      },

      setQty: (idKey, qty) => {
        set((state) => {
          const resolved = resolveKey(state.items, idKey);
          if (!resolved) return state;

          const it = state.items[resolved];
          if (!it) return state;

          const max = typeof it.inStock === "number" ? it.inStock : Infinity;
          const nextQty = Math.max(1, Math.min(qty, max));

          return {
            items: { ...state.items, [resolved]: { ...it, quantity: nextQty } },
          };
        });
      },

      remove: (idKey) => {
        set((state) => {
          const resolved = resolveKey(state.items, idKey);
          if (!resolved) return state;

          const copy = { ...state.items };
          delete copy[resolved];
          return { items: copy };
        });
      },

      clear: () => set({ items: {} }),

      // =====================
      // Sync de precios desde backend
      // =====================
      applyServerPrices: (server) => {
        set((state) => {
          // Permitimos updates aunque solo venga id_bodega / qty / stock.
          const valid = server.filter(
            (s) =>
              typeof s.id === "number" &&
              (typeof s.dbPrice === "number" ||
                typeof s.id_bodega === "number" ||
                typeof s.availableQty === "number" ||
                typeof s.requestedQty === "number")
          );
          if (valid.length === 0) return state;

          /**
           * Indexación:
           * - Si viene id_bodega: match exacto por `${id_bodega}:${id}`
           * - Si no viene id_bodega: fallback por id (siempre que no sea ambiguo)
           */
          const byExactKey = new Map<
            string,
            { price?: number; id_bodega?: number; inStock?: number; quantity?: number }
          >();
          const byId = new Map<
            string,
            { price?: number; id_bodega?: number; inStock?: number; quantity?: number }
          >();

          for (const s of valid) {
            const patch = {
              price: typeof s.dbPrice === "number" ? Number(s.dbPrice) : undefined,
              id_bodega:
                typeof s.id_bodega === "number" ? Number(s.id_bodega) : undefined,
              inStock:
                typeof s.availableQty === "number"
                  ? Number(s.availableQty)
                  : undefined,
              quantity:
                typeof s.requestedQty === "number"
                  ? Number(s.requestedQty)
                  : undefined,
            };

            if (typeof s.id_bodega === "number") {
              byExactKey.set(itemKeyOf(s.id, s.id_bodega), patch);
            } else {
              byId.set(String(s.id), patch);
            }
          }

          /**
           * Recorremos los items y aplicamos patch.
           * Si cambia id_bodega, hay que:
           * 1) cambiar it.id_bodega
           * 2) mover el registro a un nuevo key `${newBodega}:${id}`
           * 3) resolver colisión si ya existe ese key (sumar qty, conservar imágenes/título, etc.)
           */
          const next: Record<string, CartItem> = { ...state.items };

          for (const [key, it] of Object.entries(state.items)) {
            const exactPatch = byExactKey.get(key);
            const fallbackPatch = byId.get(String(it.id));
            const patch = exactPatch ?? fallbackPatch;

            if (!patch) continue;

            const newPrice = patch.price ?? it.price;
            const newInStock = patch.inStock ?? it.inStock;

            // qty: si viene requestedQty, aplicarlo pero respetando stock si existe
            let newQty =
              typeof patch.quantity === "number" ? patch.quantity : it.quantity;

            const max = typeof newInStock === "number" ? newInStock : Infinity;
            newQty = Math.max(1, Math.min(newQty, max));

            const incomingBodega =
              typeof patch.id_bodega === "number" ? patch.id_bodega : it.id_bodega;

            // Si id_bodega no cambia, actualizamos en el mismo key
            if (incomingBodega === it.id_bodega) {
              next[key] = {
                ...it,
                price: newPrice,
                inStock: newInStock,
                quantity: newQty,
                id_bodega: incomingBodega,
              };
              continue;
            }

            // Si cambia id_bodega => mover a nuevo key
            const newKey = itemKeyOf(it.id, incomingBodega);

            const movedItem: CartItem = {
              ...it,
              price: newPrice,
              inStock: newInStock,
              quantity: newQty,
              id_bodega: incomingBodega,
            };

            // Borramos el viejo
            delete next[key];

            // Si ya existe el newKey, merge para no perder nada
            const existing = next[newKey];
            if (existing) {
              const mergedQtyRaw = (existing.quantity ?? 0) + movedItem.quantity;
              const mergedMax =
                typeof movedItem.inStock === "number" ? movedItem.inStock : Infinity;
              const mergedQty = Math.max(1, Math.min(mergedQtyRaw, mergedMax));

              next[newKey] = {
                ...existing,
                // Preferimos mantener title/images existentes si ya estaban,
                // pero si están vacíos, usamos los del moved.
                title: existing.title || movedItem.title,
                images:
                  existing.images?.length ? existing.images : movedItem.images ?? [],
                // Precio: prioriza lo que viene del patch (movedItem)
                price: movedItem.price,
                inStock: movedItem.inStock ?? existing.inStock,
                quantity: mergedQty,
                id_bodega: incomingBodega,
              };
            } else {
              next[newKey] = movedItem;
            }
          }

          return { items: next };
        });
      },
    }),
    {
      name: "bisneando-cart-v2",
      storage: createJSONStorage(() => AsyncStorage),
      version: 6,
      migrate: async (persisted: any, fromVersion: number) => {
        // Deja compatibilidad con tu v5 (sin id_bodega). Si no existe, se setea 0.
        // Ajusta DEFAULT_BODEGA si tienes una bodega por defecto.
        const DEFAULT_BODEGA = 0;

        if (fromVersion < 6 && persisted?.state?.items) {
          const oldItems: Record<string, any> = persisted.state.items;
          const newItems: Record<string, CartItem> = {};

          for (const [, it] of Object.entries(oldItems)) {
            const id = Number((it as any).id);
            const id_bodega =
              typeof (it as any).id_bodega === "number"
                ? Number((it as any).id_bodega)
                : DEFAULT_BODEGA;

            const key = itemKeyOf(id, id_bodega);

            const images = Array.isArray((it as any).images)
              ? (it as any).images
              : (it as any).image
              ? [(it as any).image]
              : [];

            const inStock =
              typeof (it as any).inStock === "number"
                ? (it as any).inStock
                : typeof (it as any).maxQty === "number"
                ? (it as any).maxQty
                : undefined;

            newItems[key] = {
              id,
              id_bodega,
              title: String((it as any).title),
              price: Number((it as any).price),
              images,
              quantity: Number((it as any).quantity ?? 1),
              inStock,
            };
          }

          return {
            ...persisted,
            state: { ...persisted.state, items: newItems },
            version: 6,
          };
        }

        return persisted;
      },
    }
  )
);
