const path = require('path');
const fs = require('fs');

/**
 * Simple JSON-file database for local game data storage.
 * No native module dependencies — works everywhere.
 */
class Database {
  constructor(userDataPath) {
    this.dataDir = userDataPath;
    this.dbFile = path.join(userDataPath, 'gamespace-db.json');
    this.data = null;
  }

  init() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dbFile)) {
        const raw = fs.readFileSync(this.dbFile, 'utf-8');
        this.data = JSON.parse(raw);
      }

      // Ensure schema
      if (!this.data || !this.data.games) {
        this.data = {
          games: [],
          settings: {
            theme: 'light',
            scan_dirs: [],
            auto_scan: true,
            window_state: {},
          },
          recent_activity: [],
          next_id: 1,
        };
        this._save();
      }

      // Migrate missing fields
      if (!this.data.recent_activity) this.data.recent_activity = [];
      if (!this.data.settings) this.data.settings = { theme: 'light', scan_dirs: [], auto_scan: true };
      if (!this.data.next_id) this.data.next_id = (this.data.games?.length || 0) + 1;

      return true;
    } catch (e) {
      console.error('Database init error:', e);
      return false;
    }
  }

  _save() {
    try {
      fs.writeFileSync(this.dbFile, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Database save error:', e);
    }
  }

  // ─── Games ──────────────────────────────────────────────────
  getAllGames(filters = {}) {
    let games = [...this.data.games];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      games = games.filter(
        (g) =>
          g.title?.toLowerCase().includes(q) ||
          g.publisher?.toLowerCase().includes(q) ||
          g.genres?.some((genre) => genre.toLowerCase().includes(q))
      );
    }

    if (filters.platform && filters.platform !== 'all') {
      games = games.filter((g) => g.platform === filters.platform);
    }

    if (filters.status && filters.status !== 'all') {
      games = games.filter((g) => g.status === filters.status);
    }

    if (filters.genre && filters.genre !== 'all') {
      games = games.filter((g) => g.genres?.includes(filters.genre));
    }

    // Sort
    const sortBy = filters.sortBy || 'title';
    if (sortBy === 'title') {
      games.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'recent') {
      games.sort((a, b) => (b.last_played || 0) - (a.last_played || 0));
    } else if (sortBy === 'playtime') {
      games.sort((a, b) => (b.playtime || 0) - (a.playtime || 0));
    }

    return {
      games,
      total: this.data.games.length,
      platforms: [...new Set(this.data.games.map((g) => g.platform).filter(Boolean))],
      genres: [...new Set(this.data.games.flatMap((g) => g.genres || []))],
    };
  }

  getGame(id) {
    return this.data.games.find((g) => g.id === id) || null;
  }

  saveGame(game) {
    try {
      if (game.id) {
        // Update existing
        const idx = this.data.games.findIndex((g) => g.id === game.id);
        if (idx !== -1) {
          this.data.games[idx] = { ...this.data.games[idx], ...game, updated_at: Date.now() };
        }
      } else {
        // Insert new
        game.id = this.data.next_id++;
        game.created_at = Date.now();
        game.updated_at = Date.now();
        this.data.games.push(game);
      }
      this._save();
      return game;
    } catch (e) {
      console.error('Save game error:', e);
      return null;
    }
  }

  deleteGame(id) {
    try {
      this.data.games = this.data.games.filter((g) => g.id !== id);
      this._save();
      return true;
    } catch (e) {
      console.error('Delete game error:', e);
      return false;
    }
  }

  getStats() {
    const games = this.data.games;
    const totalGames = games.length;
    const installed = games.filter((g) => g.status === 'installed').length;
    const totalPlaytime = games.reduce((sum, g) => sum + (g.playtime || 0), 0);
    const totalSize = games.reduce((sum, g) => sum + (g.size || 0), 0);
    const platforms = [...new Set(games.map((g) => g.platform).filter(Boolean))];
    const genres = [...new Set(games.flatMap((g) => g.genres || []))];

    return { totalGames, installed, totalPlaytime, totalSize, platforms, genres };
  }

  getRecentGames(limit = 10) {
    return this.data.recent_activity.slice(0, limit);
  }

  addRecentActivity(entry) {
    this.data.recent_activity.unshift({
      ...entry,
      timestamp: Date.now(),
    });
    // Keep only last 50
    if (this.data.recent_activity.length > 50) {
      this.data.recent_activity = this.data.recent_activity.slice(0, 50);
    }
    this._save();
  }

  // ─── Settings ──────────────────────────────────────────────
  getSetting(key) {
    return this.data.settings?.[key] ?? null;
  }

  setSetting(key, value) {
    if (!this.data.settings) this.data.settings = {};
    this.data.settings[key] = value;
    this._save();
  }

  getAllSettings() {
    return { ...this.data.settings };
  }
}

module.exports = Database;
