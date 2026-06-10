import { create } from 'zustand';

const api = () => window.electronAPI;

export const useStore = create((set, get) => ({
  // ─── App State ────────────────────────────────────────────
  platform: null,
  isMaximized: false,
  isLoading: true,

  setPlatform: (platform) => set({ platform }),
  setMaximized: (val) => set({ isMaximized: val }),
  setLoading: (val) => set({ isLoading: val }),

  // ─── Games ────────────────────────────────────────────────
  games: [],
  totalGames: 0,
  platforms: [],
  genres: [],
  searchQuery: '',
  activeFilter: 'all',
  activePlatform: 'all',
  sortBy: 'title',

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveFilter: (f) => set({ activeFilter: f }),
  setActivePlatform: (p) => set({ activePlatform: p }),
  setSortBy: (s) => set({ sortBy: s }),

  fetchGames: async (filters = {}) => {
    const electronAPI = api();
    if (!electronAPI) return;
    try {
      const merged = {
        search: get().searchQuery,
        platform: get().activePlatform,
        status: get().activeFilter,
        sortBy: get().sortBy,
        ...filters,
      };
      const result = await electronAPI.getAllGames(merged);
      set({
        games: result.games,
        totalGames: result.total,
        platforms: result.platforms,
        genres: result.genres,
      });
    } catch (e) {
      console.error('fetchGames error:', e);
    }
  },

  saveGame: async (game) => {
    const electronAPI = api();
    if (!electronAPI) return null;
    try {
      const saved = await electronAPI.saveGame(game);
      await Promise.all([get().fetchGames(), get().fetchStats()]);
      return saved;
    } catch (e) {
      console.error('saveGame error:', e);
      return null;
    }
  },

  deleteGame: async (id) => {
    const electronAPI = api();
    if (!electronAPI) return false;
    try {
      await electronAPI.deleteGame(id);
      await Promise.all([get().fetchGames(), get().fetchStats()]);
      return true;
    } catch (e) {
      console.error('deleteGame error:', e);
      return false;
    }
  },

  // ─── Auto-Import ──────────────────────────────────────────
  autoImportGames: async () => {
    const electronAPI = api();
    if (!electronAPI) return { imported: 0 };
    try {
      const result = await electronAPI.autoImportGames();
      if (result.imported > 0) {
        await Promise.all([get().fetchGames(), get().fetchStats()]);
      }
      return result;
    } catch (e) {
      console.error('autoImportGames error:', e);
      return { imported: 0 };
    }
  },

  // ─── Stats ────────────────────────────────────────────────
  stats: { totalGames: 0, installed: 0, totalPlaytime: 0, totalSize: 0, platforms: [], genres: [] },
  recentGames: [],

  fetchStats: async () => {
    const electronAPI = api();
    if (!electronAPI) return;
    try {
      const stats = await electronAPI.getStats();
      set({ stats });
    } catch (e) {
      console.error('fetchStats error:', e);
    }
  },

  fetchRecentGames: async (limit = 10) => {
    const electronAPI = api();
    if (!electronAPI) return;
    try {
      const recent = await electronAPI.getRecentGames(limit);
      set({ recentGames: recent });
    } catch (e) {
      console.error('fetchRecentGames error:', e);
    }
  },

  // ─── Settings ─────────────────────────────────────────────
  settings: { theme: 'dark', scan_dirs: [], auto_scan: true },

  fetchSettings: async () => {
    const electronAPI = api();
    if (!electronAPI) return;
    try {
      const settings = await electronAPI.getAllSettings();
      set({ settings });
    } catch (e) {
      console.error('fetchSettings error:', e);
    }
  },

  updateSetting: async (key, value) => {
    const electronAPI = api();
    if (!electronAPI) return;
    try {
      await electronAPI.setSetting(key, value);
      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }));
    } catch (e) {
      console.error('updateSetting error:', e);
    }
  },

  // ─── Initialization ──────────────────────────────────────
  initialize: async () => {
    const electronAPI = api();
    if (!electronAPI) {
      console.warn('[GameSpace] electronAPI not available (running in browser?)');
      set({ isLoading: false });
      return;
    }
    try {
      console.log('[GameSpace] Initializing...');
      const platform = await electronAPI.getPlatform();
      set({ platform });

      // Auto-import games from detected platforms first
      try {
        const importResult = await get().autoImportGames();
        if (importResult.imported > 0) {
          console.log(`[GameSpace] Auto-imported ${importResult.imported} games`);
        }
      } catch (e) {
        console.warn('[GameSpace] Auto-import skipped:', e.message);
      }

      await Promise.all([
        get().fetchGames(),
        get().fetchStats(),
        get().fetchRecentGames(),
        get().fetchSettings(),
      ]);
      console.log('[GameSpace] Initialization complete');
    } catch (e) {
      console.error('[GameSpace] Initialize error:', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
