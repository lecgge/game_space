import React, { useState, useEffect } from 'react';
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
const fmtS = (mb) => !mb ? '—' : mb < 1024 ? `${mb} MB` : `${(mb/1024).toFixed(1)} GB`;

const gridItem = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

function GameCard({ game, onSelect, isSelected }) {
  return (
    <motion.div variants={gridItem} layout onClick={() => onSelect(game)}
      className={`ps5-card ${isSelected ? 'ring-2 ring-accent shadow-lg shadow-accent-glow' : ''}`}>
      <div className="aspect-[16/10] relative overflow-hidden bg-bg-surface">
        {game.cover_image ? (
          <img src={game.cover_image} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-card to-bg-surface">
            <GameController size={36} weight="light" className="text-accent/25" />
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
  if (!game) return null;

  return (
    <motion.div initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-[340px] shrink-0 glass-heavy border-l border-border overflow-y-auto">
      <div className="aspect-[16/9] relative bg-bg-surface">
        {game.cover_image ? (
          <img src={game.cover_image} alt={game.title} className="w-full h-full object-cover" />
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
            <button onClick={async () => {
              setLaunchError(null);
              const err = await window.electronAPI?.openPath(game.exe_path);
              if (err) setLaunchError(err || '启动失败，请检查游戏路径是否正确');
            }} className="btn btn-cta flex-1">
              <Play size={14} weight="fill" /> 启动游戏
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

  useEffect(() => { fetchGames(); }, [searchQuery, activePlatform, sortBy, fetchGames]);

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
              {games.map((g) => <GameCard key={g.id} game={g} onSelect={setSelectedGame} isSelected={selectedGame?.id === g.id} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>{selectedGame && <DetailPanel game={selectedGame} onClose={() => setSelectedGame(null)} />}</AnimatePresence>
    </div>
  );
}
