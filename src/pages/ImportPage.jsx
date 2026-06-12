import React, { useState, useEffect } from 'react';
import { useStore } from '@/store';
import {
  FolderOpen, GameController, MagnifyingGlass, CheckCircle, Spinner,
  Plus, X, HardDrive, ArrowRight,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const fade = { hidden: { opacity: 0, y: 12 }, show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }) };

const PLATFORM_ICONS = { steam: 'S', epic: 'E', xbox: 'X', standalone: '独' };

function PlatformCard({ platform, onScan, isScanning }) {
  const iconColors = { steam: 'from-blue-500 to-blue-700', epic: 'from-gray-500 to-gray-700', xbox: 'from-green-500 to-green-700', standalone: 'from-amber-500 to-orange-700' };
  const gradient = iconColors[platform.id] || 'from-accent to-purple-700';
  return (
    <motion.div variants={fade} className="ps5-card p-5">
      <div className="flex items-center justify-center mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
          <span className="text-[16px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{PLATFORM_ICONS[platform.id] || '?'}</span>
        </div>
        <div style={{ marginLeft: '12px' }}>
          <p className="text-[15px] font-semibold text-text-primary">{platform.name}</p>
          <div className="flex items-center" style={{ marginTop: '4px', gap: '6px' }}>
            <span className={`w-2.5 h-2.5 rounded-full ${platform.installed ? 'bg-success shadow-sm shadow-success/40' : 'bg-text-muted/30'}`} />
            <p className="text-[11px] text-text-muted">
              {platform.installed ? `已检测到` : '未检测到'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full">
        <button onClick={() => onScan(platform.id)} disabled={!platform.installed || isScanning}
          className={`btn ${platform.installed ? 'btn-ghost' : 'btn-ghost opacity-30 cursor-not-allowed'}`}>
          {isScanning ? <><Spinner size={14} className="animate-spin" /> 扫描中...</> : <><MagnifyingGlass size={14} /> {platform.installed ? '扫描游戏' : '未安装'}</>}
        </button>
      </div>
    </motion.div>
  );
}

function ScannedItem({ game, onImport, isImporting, imported }) {
  const isInstalled = game.status !== 'missing';
  const confidenceColors = { high: 'text-success', medium: 'text-warning', low: 'text-text-muted' };
  const confidenceLabels = { high: '高', medium: '中', low: '低' };
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center shrink-0">
        <GameController size={18} className={isInstalled ? 'text-text-muted' : 'text-text-muted/40'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center" style={{ gap: '8px' }}>
          <p className="text-[13px] font-medium text-text-primary truncate">{game.title}</p>
          {game.engine && (
            <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">{game.engine}</span>
          )}
          {game.confidence && (
            <span className={`text-[10px] ${confidenceColors[game.confidence] || 'text-text-muted'} bg-white/5 px-1.5 py-0.5 rounded shrink-0`}>
              {confidenceLabels[game.confidence] || ''}
            </span>
          )}
        </div>
        <div className="flex items-center" style={{ marginTop: '2px', gap: '6px' }}>
          <span className={`w-1.5 h-1.5 rounded-full ${isInstalled ? 'bg-success' : 'bg-warning'}`} />
          <p className="text-[11px] text-text-muted truncate">
            {game.platform} · {isInstalled ? '已安装' : '未找到安装目录'}
            {game.install_path && ` · ${game.install_path}`}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        {imported ? (
          <span className="flex items-center gap-1 text-[12px] text-success font-medium">
            <CheckCircle size={14} weight="fill" /> 已导入
          </span>
        ) : (
          <button onClick={() => onImport(game)} disabled={isImporting} className="btn btn-primary text-[12px] py-1.5 px-4">
            {isImporting ? <Spinner size={12} className="animate-spin" /> : <Plus size={12} weight="bold" />} 添加
          </button>
        )}
      </div>
    </div>
  );
}

export default function ImportPage() {
  const { saveGame } = useStore();
  const [platforms, setPlatforms] = useState([]);
  const [scanningPlatform, setScanningPlatform] = useState(null);
  const [scannedGames, setScannedGames] = useState([]);
  const [importingId, setImportingId] = useState(null);
  const [importedIds, setImportedIds] = useState(new Set());
  const [scanDirs, setScanDirs] = useState([]);
  const [dirResults, setDirResults] = useState([]);
  const [scanningDir, setScanningDir] = useState(null);

  useEffect(() => { loadPlatforms(); }, []);

  const loadPlatforms = async () => {
    const result = await window.electronAPI?.scanPlatforms();
    if (result) setPlatforms(result);
  };

  const handleScan = async (platformId) => {
    setScanningPlatform(platformId);
    setScannedGames([]);
    setImportedIds(new Set());
    try {
      const games = await window.electronAPI?.scanPlatformGames(platformId);
      setScannedGames(games || []);
    } catch (e) { console.error(e); }
    finally { setScanningPlatform(null); }
  };

  const handleImport = async (game) => {
    setImportingId(game.title);
    try {
      await saveGame({ title: game.title, platform: game.platform, app_id: game.app_id || null, install_path: game.install_path || null, exe_path: game.exe_path || null, status: game.status || (game.install_path ? 'installed' : 'missing'), genres: [], playtime: 0, size: 0 });
      setImportedIds((prev) => new Set([...prev, game.title]));
    } catch (e) { console.error(e); }
    finally { setImportingId(null); }
  };

  const handleAddDir = async () => {
    const dir = await window.electronAPI?.openDirectoryDialog();
    if (dir) {
      setScanDirs((p) => [...p, dir]);
      setScanningDir(dir);
      try {
        const games = await window.electronAPI?.scanDirectory(dir);
        if (games?.length) setDirResults((p) => [...p, ...games.map((g) => ({ ...g, source_dir: dir }))]);
      } catch (e) { console.error('Scan directory error:', e); }
      finally { setScanningDir(null); }
    }
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      initial="hidden" animate="show" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <motion.div variants={fade} style={{ marginBottom: '32px' }}>
        <h1 className="section-title text-[28px] text-text-primary">导入游戏</h1>
        <p className="text-[14px] text-text-secondary" style={{ marginTop: '8px' }}>自动扫描游戏平台或手动指定目录</p>
      </motion.div>

      {/* Platform scanning */}
      <motion.div variants={fade} style={{ marginBottom: '40px' }}>
        <h2 className="section-title text-[16px] text-text-primary" style={{ marginBottom: '16px' }}>平台扫描</h2>
        <div className="grid grid-cols-4" style={{ gap: '20px' }}>
          {platforms.map((p) => <PlatformCard key={p.id} platform={p} onScan={handleScan} isScanning={scanningPlatform === p.id} />)}
        </div>
      </motion.div>

      {/* Platform scan results */}
      <AnimatePresence>
        {scannedGames.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '40px' }}>
            <h2 className="section-title text-[16px] text-text-primary" style={{ marginBottom: '16px' }}>扫描结果 ({scannedGames.length})</h2>
            <div className="ps5-card divide-y divide-border" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {scannedGames.map((g, i) => <ScannedItem key={`${g.title}-${i}`} game={g} onImport={handleImport} isImporting={importingId === g.title} imported={importedIds.has(g.title)} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual directory */}
      <motion.div variants={fade} style={{ marginBottom: '40px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h2 className="section-title text-[16px] text-text-primary">手动添加目录</h2>
          <button onClick={handleAddDir} className="btn btn-ghost text-[13px]">
            <FolderOpen size={14} /> 选择文件夹
          </button>
        </div>

        {scanDirs.length === 0 ? (
          <div onClick={handleAddDir}
            className="ps5-card flex flex-col items-center justify-center text-center cursor-pointer" style={{ padding: '48px', border: '2px dashed var(--color-border)' }}>
            <FolderOpen size={40} weight="light" className="text-text-muted/40" style={{ marginBottom: '16px' }} />
            <p className="text-[14px] text-text-secondary" style={{ marginBottom: '8px' }}>点击选择游戏目录</p>
            <p className="text-[12px] text-text-muted">自动扫描目录中的游戏文件</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scanDirs.map((dir) => (
              <div key={dir}>
                <div className="ps5-card flex items-center" style={{ padding: '12px', gap: '12px' }}>
                  <FolderOpen size={16} className="text-accent shrink-0" />
                  <span className="flex-1 text-[13px] text-text-primary truncate">{dir}</span>
                  <button disabled={scanningDir === dir}
                    onClick={async () => {
                      setScanningDir(dir);
                      try {
                        const g = await window.electronAPI?.scanDirectory(dir);
                        if (g?.length) setDirResults((p) => [...p.filter((r) => r.source_dir !== dir), ...g.map((x) => ({ ...x, source_dir: dir }))]);
                      } catch (e) { console.error('Scan directory error:', e); }
                      finally { setScanningDir(null); }
                    }}
                    className="btn btn-subtle text-[12px]" style={{ padding: '4px 12px' }}>
                    {scanningDir === dir ? <><Spinner size={12} className="animate-spin" /> 扫描中...</> : <><MagnifyingGlass size={12} /> 扫描</>}
                  </button>
                  <button onClick={() => { setScanDirs((p) => p.filter((d) => d !== dir)); setDirResults((p) => p.filter((r) => r.source_dir !== dir)); }}
                    className="btn btn-subtle text-[12px] text-error" style={{ padding: '4px 12px' }}><X size={12} /></button>
                </div>
                {scanningDir !== dir && !dirResults.some((r) => r.source_dir === dir) && (
                  <p className="text-[11px] text-text-muted" style={{ padding: '4px 0 0 32px' }}>未在该目录中找到游戏</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Dir scan results */}
      <AnimatePresence>
        {dirResults.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <h2 className="section-title text-[16px] text-text-primary" style={{ marginBottom: '16px' }}>目录扫描结果 ({dirResults.length})</h2>
            <div className="ps5-card divide-y divide-border" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {dirResults.map((g, i) => <ScannedItem key={`dir-${g.title}-${i}`} game={{ ...g, platform: 'manual' }} onImport={handleImport} isImporting={importingId === g.title} imported={importedIds.has(g.title)} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
