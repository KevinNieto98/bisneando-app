import { create } from "zustand";

type Draft = {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  password: string;
};

type State = {
  draft: Draft | null;
  setDraft: (d: Draft) => void;
  clearDraft: () => void;
};

export const useSignupDraft = create<State>((set) => ({
  draft: null,
  setDraft: (d) => set({ draft: d }),
  clearDraft: () => set({ draft: null }),
}));
