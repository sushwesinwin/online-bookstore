import { create } from 'zustand';

interface AuthModalState {
  isOpen: boolean;
  view: 'login' | 'register';
  message: string | null;
  openModal: (view?: 'login' | 'register', message?: string | null) => void;
  closeModal: () => void;
  setView: (view: 'login' | 'register') => void;
}

export const useAuthModalStore = create<AuthModalState>(set => ({
  isOpen: false,
  view: 'register',
  message: null,
  openModal: (view = 'register', message = null) =>
    set({ isOpen: true, view, message }),
  closeModal: () => set({ isOpen: false, message: null }),
  setView: view => set({ view }),
}));
