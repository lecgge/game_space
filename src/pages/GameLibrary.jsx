import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store';
import {
  MagnifyingGlass, GameController, Play, Clock, HardDrive,
  X, CaretDown, ArrowsClockwise, FolderOpen, Trash, SlidersHorizontal,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORMS = [
  { value: 'all', label: '全部平台' },
  { value: 'steam', label: 'Steam' },
  { value: 'epic', label: 'Epic Games' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'manual', label: '手动添加' },
];

const SORTS = [
  { value: 'title', label: '按名称' },
  { value: 'recent', label: '按最近' },
  { value: 'playtime', label: '按时长' },
];

const fmtH = (m) => !m ? '—' : m < 60 ? `${m}分钟` : `${Math.floor(m/60)}小时`;
const fmtS = (b) => !b ? '—' : b < 1024 ? `${b} MB` : b < 1048576 ? `${(b/1024).toFixed(1)} GB` : `${(b/1048576).toFixed(2)} TB`;
const getSafeCoverUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('file://')) {
    return url;
  }
  const normalizedPath = url.replace(/\\/g, '/');
  return normalizedPath.startsWith(':') ? `file://${normalizedPath}` : `file://${normalizedPath}`;
};

const gridItem = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

// ─── Context Menu ─────────────────────────────────────────────
function ContextMenu({ x, y, game, onClose }) {
  const { deleteGame } = useStore();
  const menuRef = React.useRef(null);
  const [pos, setPos] = useState({ x, y });

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    let nx = x, ny = y;
    if (x + rect.width > window.innerWidth - 8) nx = window.innerWidth - rect.width - 8;
    if (y + rect.height > window.innerHeight - 8) ny = window.innerHeight - rect.height - 8;
    if (nx !== x || ny !== y) setPos({ x: nx, y: ny });
  }, [x, y]);

  // Close on click outside / scroll / escape
  useEffect(() => {
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    const handleScroll = () => onClose();
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  const handleLaunch = async () => {
    onClose();
    try { await window.electronAPI?.launchGame(game); } catch {}
  };

  const handleOpenFolder = () => {
    onClose();
    if (game.install_path) window.electronAPI?.showItemInFolder(game.install_path);
  };

  const handleDelete = async () => {
    onClose();
    if (confirm(`确定要从游戏库中移除「${game.title}」吗？`)) {
      await deleteGame(game.id);
    }
  };

  return (
    <div ref={menuRef}
      className="fixed z-[9999] min-w-[160px] py-1.5 rounded-xl shadow-2xl border border-white/10 backdrop-blur-xl"
      style={{
        left: pos.x, top: pos.y,
        background: 'rgba(18, 18, 28, 0.92)',
      }}>
      <div className="px-3 py-1.5 text-[11px] text-text-muted font-medium truncate border-b border-white/5" style={{ marginBottom: '4px' }}>
        {game.title}
      </div>
      {game.status === 'installed' && (
        <button onClick={handleLaunch}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-primary hover:bg-white/8 transition-colors text-left">
          <Play size={14} weight="fill" className="text-accent" /> 启动游戏
        </button>
      )}
      {game.install_path && (
        <button onClick={handleOpenFolder}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-primary hover:bg-white/8 transition-colors text-left">
          <FolderOpen size={14} className="text-text-muted" /> 打开文件夹
        </button>
      )}
      <div className="border-t border-white/5" style={{ margin: '4px 0' }} />
      <button onClick={handleDelete}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-error/90 hover:bg-error/10 transition-colors text-left">
        <Trash size={14} /> 从库中移除
      </button>
    </div>
  );
}

function GameCard({ game, onSelect, onContextMenu, isSelected }) {
  const [cover, setCover] = useState(getSafeCoverUrl(game.cover_image));
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // If DB already has a cover URL, use it
    const dbCover = getSafeCoverUrl(game.cover_image);
    if (dbCover) {
      setCover(dbCover);
      setImgError(false);
      return;
    }
    // Otherwise fetch from backend
    let cancelled = false;
    setLoading(true);
    window.electronAPI?.getGameCover(game)
      .then((url) => {
        if (!cancelled) {
          setCover(getSafeCoverUrl(url));
          setImgError(false);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [game.id, game.cover_image]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY, game);
  };

  return (
    <motion.div variants={gridItem} layout
      onClick={() => onSelect(game)}
      onContextMenu={handleContextMenu}
      className={`ps5-card cursor-default ${isSelected ? 'ring-2 ring-accent shadow-lg shadow-accent-glow' : ''}`}>
      <div className="aspect-[16/10] relative overflow-hidden bg-bg-surface">
        {cover && !imgError ? (
          <img
            src={cover}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-card to-bg-surface">
            <GameController size={36} weight="light" className={`text-accent/25 ${loading ? 'animate-pulse' : ''}`} />
          </div>
        )}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md ${
          game.status === 'installed' ? 'bg-success/80 text-white' :
          game.status === 'update-available' ? 'bg-warning/80 text-bg-deep' :
          'bg-white/15 text-text-secondary'
        }`}>
          {game.status === 'installed' ? '已安装' : game.status === 'update-available' ? '可更新' : '未安装'}
        </span>
      </div>
      <div className="p-3.5">
        <p className="text-[13px] font-semibold text-text-primary truncate">{game.title}</p>
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-text-muted">
          <span>{game.platform || '未知'}</span>
          {game.playtime > 0 && <><span className="opacity-30">|</span><span>{fmtH(game.playtime)}</span></>}
        </div>
      </div>
    </motion.div>
  );
}

function DetailPanel({ game, onClose }) {
  const { deleteGame } = useStore();
  const [launchError, setLaunchError] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [cover, setCover] = useState(getSafeCoverUrl(game.cover_image));
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const dbCover = getSafeCoverUrl(game.cover_image);
    setCover(dbCover);
    setImgError(false);
    if (!dbCover) {
      window.electronAPI?.getGameCover(game)
        .then((url) => {
          setCover(getSafeCoverUrl(url));
        })
        .catch(() => {});
    }
  }, [game.id, game.cover_image]);

  if (!game) return null;

  const handleLaunch = async () => {
    setLaunchError(null);
    setLaunching(true);
    try {
      const err = await window.electronAPI?.launchGame(game);
      if (err) setLaunchError(err);
    } catch (e) {
      setLaunchError('启动失败: ' + e.message);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <motion.div initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-[340px] shrink-0 glass-heavy border-l border-border overflow-y-auto">
      <div className="aspect-[16/9] relative bg-bg-surface">
        {cover && !imgError ? (
          <img src={cover} alt={game.title} className="w-full h-full object-cover"
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-card to-bg-surface">
            <GameController size={48} weight="light" className="text-accent/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/40 to-transparent" />
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all">
          <X size={14} weight="bold" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>{game.title}</h2>
          <p className="text-[13px] text-text-muted mt-1">{game.publisher || '未知发行商'}</p>
        </div>

        <div className="flex gap-2">
          {game.status === 'installed' ? (
            <button onClick={handleLaunch} disabled={launching}
              className="btn btn-cta flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <Play size={14} weight="fill" /> {launching ? '启动中...' : '启动游戏'}
            </button>
          ) : (
            <button disabled className="btn btn-ghost flex-1 opacity-40 cursor-not-allowed">未安装</button>
          )}
          <button onClick={() => game.install_path && window.electronAPI?.showItemInFolder(game.install_path)}
            className="btn btn-subtle" title="打开文件夹">
            <FolderOpen size={16} />
          </button>
        </div>
        {launchError && (
          <p className="text-[12px] text-error mt-2">{launchError}</p>
        )}

        <div className="space-y-3">
          {[
            { icon: GameController, label: '平台', value: game.platform || '—' },
            { icon: Clock, label: '游戏时长', value: fmtH(game.playtime) },
            { icon: HardDrive, label: '大小', value: fmtS(game.size) },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <row.icon size={15} className="text-text-muted shrink-0" />
              <span className="text-[11px] text-text-muted w-16">{row.label}</span>
              <span className="text-[13px] text-text-primary truncate">{row.value}</span>
            </div>
          ))}
        </div>

        {game.genres?.length > 0 && (
          <div>
            <p className="text-[11px] text-text-muted mb-2 font-medium uppercase tracking-wider">类型</p>
            <div className="flex flex-wrap gap-1.5">
              {game.genres.map((g, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-accent-light text-accent text-[11px] font-medium">{g}</span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <button onClick={async () => { if (confirm(`移除「${game.title}」？`)) { await deleteGame(game.id); onClose(); } }}
            className="btn btn-subtle text-error text-[13px]">
            <Trash size={14} /> 从库中移除
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function GameLibrary() {
  const { games, totalGames, searchQuery, setSearchQuery, activePlatform, setActivePlatform, sortBy, setSortBy, fetchGames } = useStore();
  const [selectedGame, setSelectedGame] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => { fetchGames(); }, [searchQuery, activePlatform, sortBy, fetchGames]);

  const handleContextMenu = useCallback((x, y, game) => {
    setContextMenu({ x, y, game });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <div className="flex" style={{ height: '100%', minHeight: '100%' }}>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
          <h1 className="section-title text-[24px] text-text-primary shrink-0">游戏库</h1>
          <div className="relative flex-1" style={{ maxWidth: '280px' }}>
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="搜索游戏..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full text-[13px]" style={{ paddingLeft: '36px', paddingRight: '12px', height: '36px' }} />
          </div>
          {[{ val: activePlatform, set: setActivePlatform, opts: PLATFORMS }, { val: sortBy, set: setSortBy, opts: SORTS }].map((sel, i) => (
            <div key={i} className="relative">
              <select value={sel.val} onChange={(e) => sel.set(e.target.value)}
                className="input appearance-none cursor-pointer text-[13px]" style={{ height: '36px', paddingRight: '28px', background: 'var(--color-bg-card)' }}>
                {sel.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <CaretDown size={11} className="absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" style={{ right: '10px' }} />
            </div>
          ))}
          <button onClick={() => fetchGames()} className="btn btn-subtle" style={{ height: '36px', width: '36px', padding: 0 }} title="刷新">
            <ArrowsClockwise size={16} />
          </button>
          <span className="text-[12px] text-text-muted whitespace-nowrap tabular-nums">
            {games.length} / {totalGames}
          </span>
        </div>

        {/* Grid or Empty State */}
        {games.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <GameController size={56} weight="light" className="text-accent/30" style={{ marginBottom: '16px' }} />
            <p className="text-[15px] text-text-secondary" style={{ marginBottom: '8px' }}>{searchQuery ? '没有找到匹配的游戏' : '游戏库为空'}</p>
            <p className="text-[13px] text-text-muted">{searchQuery ? '尝试其他关键词' : '前往导入页面添加游戏'}</p>
          </div>
        ) : (
          <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
            initial="hidden" animate="show"
            className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] overflow-y-auto" style={{ paddingBottom: '32px', gap: '16px' }}>
            <AnimatePresence mode="popLayout">
              {games.map((g) => <GameCard key={g.id} game={g} onSelect={setSelectedGame} onContextMenu={handleContextMenu} isSelected={selectedGame?.id === g.id} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>{selectedGame && <DetailPanel game={selectedGame} onClose={() => setSelectedGame(null)} />}</AnimatePresence>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          game={contextMenu.game}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
