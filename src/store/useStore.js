import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const getLocalStorage = () => 
  typeof window !== 'undefined' && window.localStorage ? 
    localStorage.getItem : null;

const setLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
  } catch (e) {
    console.error('localStorage error:', e);
  }
};

export const useStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      activePage: 'home',
      searchQuery: '',
      gameFilter: 'all',
      onlineFriends: 12,
      notifications: [],
      user: null,

      // Game management state
      games: [],
      totalGames: 0,
      categories: ['All'],
      librarySize: 0,
      isSaving: false,
      saveSuccess: true,
      
      setTheme: (theme) => 
        set({ theme }),
      
      setActivePage: (page) => 
        set({ activePage: page }),
      
      setSearchQuery: (query) => 
        set({ searchQuery: query.toLowerCase() }),
      
      setGameFilter: (filter) => 
        set({ gameFilter: filter }),
      
      // Electron IPC integration
      fetchAllGames: async () => {
        if (typeof window !== 'undefined' && window.electronAPI) {
          try {
            get().setIsSaving(true);
            const games = await window.electronAPI.getAllGames();
            if (games) {
              set({ 
                games: games.games, 
                totalGames: games.totalGames || 0,
                categories: Array.isArray(games.categories) ? games.categories : ['All'],
                librarySize: games.librarySize || 0,
                saveSuccess: true,
              });
            } else {
              get().setIsSaving(false);
            }
          } catch (error) {
            console.error('Fetch error:', error);
            get().setIsSaving(false);
          }
        }
      },
      
      saveGame: async (data) => {
        if (typeof window !== 'undefined' && window.electronAPI) {
          try {
            const success = await window.electronAPI.saveGame(data);
            if (success) {
              get().setSaveSuccess(true);
              get().fetchAllGames();
            } else {
              get().setSaveSuccess(false);
            }
          } catch (error) {
            console.error('Save error:', error);
            get().setSaveSuccess(false);
            get().setIsSaving(false);
          }
        }
      },

      deleteGames: async () => {
        if (typeof window !== 'undefined' && window.electronAPI) {
          const success = await window.electronAPI.deleteGames();
          if (success) {
            set({ 
              games: [],
              totalGames: 0,
              categories: ['All'],
              librarySize: 0,
            });
          }
        }
      },

      addNotification: (notification) =>
        set((state) => ({ 
          notifications: [...state.notifications, { id: Date.now(), ...notification }] 
        })),
      
      removeNotification: (id) =>
        set((state) => ({ 
          notifications: state.notifications.filter((n) => n.id !== id) 
        })),
      
      setUser: (user) => set({ user }),
    }),
    { name: 'game-space-storage', storage: createJSONStorage() }
  )
);
