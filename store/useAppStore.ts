// store/useAppStore.ts
import { fetchCategorias, fetchProductosDestacados } from "@/services/api";
import { create } from "zustand";

export interface Category {
  id_categoria: number;
  nombre_categoria: string;
  activa: boolean;
  icono?: string;
}

export interface Product {
  id: number; 
  slug: string;
  title: string;
  price: number;
  images: string[];
  brand?: string;
}

interface AppStore {
  categories: Category[];
  loadingCategories: boolean;
  products: Product[];
  loadingProducts: boolean;

  loadCategories: () => Promise<void>;
  loadProducts: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  categories: [],
  loadingCategories: false,
  products: [],
  loadingProducts: false,

  // 🚀 Cargar categorías desde la API
  loadCategories: async () => {
    try {
      set({ loadingCategories: true });
      const data = await fetchCategorias(); // ← ya devuelve el shape correcto
      set({ categories: data, loadingCategories: false });
    } catch (error) {
      console.error("Error cargando categorías:", error);
      set({ loadingCategories: false });
    }
  },

  // 🚀 Cargar productos destacados desde la API
  loadProducts: async () => {
    try {
      set({ loadingProducts: true });
      const data = await fetchProductosDestacados();
      
      const mapped = data.map((prod: any) => ({
        id: prod.id_producto, 
        slug: prod.slug,
        title: prod.nombre_producto,
        price: prod.precio,
        images: prod.imagenes.map((img: any) => img.url_imagen),
        brand: prod.nombre_marca || undefined,
      }));
      set({ products: mapped, loadingProducts: false });
    } catch (error) {
      console.error("Error cargando productos destacados:", error);
      set({ loadingProducts: false });
    }
  },
}));
