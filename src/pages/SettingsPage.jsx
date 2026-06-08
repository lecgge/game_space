import React, { useState } from 'react';
import { useStore } from '@/store';
import {
  GearSix, Palette, Info, FolderOpen, Plus, X,
  Moon, Sun, Monitor, GameController,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'general', label: '通用', icon: GearSix },
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'about', label: '关于', icon: Info },
];

const fade = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function Toggle({ checked, onChange, label, desc }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group py-2">
      <div>
        <span className="text-[14px] text-text-primary block">{label}</span>
        {desc && <span className="text-[12px] text-text-muted block mt-0.5">{desc}</span>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-[44px] h-[24px] rounded-full transition-all duration-200 ${checked ? 'bg-accent shadow-sm shadow-accent-glow' : 'bg-bg-elevated'}`}>
        <motion.div animate={{ x: checked ? 22 : 3 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md" />
      </button>
    </label>
  );
}

function GeneralTab({ settings, updateSetting }) {
  const [scanDirs, setScanDirs] = useState(settings.scan_dirs || []);

  const addDir = async () => {
    const dir = await window.electronAPI?.openDirectoryDialog();
    if (dir && !scanDirs.includes(dir)) {
      const u = [...scanDirs, dir]; setScanDirs(u); updateSetting('scan_dirs', u);
    }
  };

  const removeDir = (dir) => {
    const u = scanDirs.filter((d) => d !== dir); setScanDirs(u); updateSetting('scan_dirs', u);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="ps5-card" style={{ padding: '28px 32px' }}>
        <h3 className="text-[15px] font-semibold text-text-primary section-title" style={{ marginBottom: '16px' }}>扫描设置</h3>
        <Toggle checked={settings.auto_scan !== false} onChange={(v) => updateSetting('auto_scan', v)}
          label="启动时自动扫描" desc="应用启动后自动扫描已配置的游戏平台" />
      </div>

      <div className="ps5-card" style={{ padding: '28px 32px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h3 className="text-[15px] font-semibold text-text-primary section-title">扫描目录</h3>
          <button onClick={addDir} className="btn btn-ghost text-[12px] py-1.5 px-3"><Plus size={12} weight="bold" /> 添加</button>
        </div>
        {scanDirs.length === 0 ? (
          <p className="text-[13px] text-text-muted">未添加自定义扫描目录</p>
        ) : (
          <div className="space-y-2">
            {scanDirs.map((dir) => (
              <div key={dir} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-bg-surface/50">
                <FolderOpen size={14} className="text-accent shrink-0" />
                <span className="flex-1 text-[12px] text-text-primary truncate">{dir}</span>
                <button onClick={() => removeDir(dir)} className="text-text-muted hover:text-error transition-colors"><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppearanceTab({ settings, updateSetting }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="ps5-card p-6 space-y-5">
        <h3 className="text-[15px] font-semibold text-text-primary section-title">主题</h3>
        <div className="grid grid-cols-2 gap-4">
          {[{ id: 'light', label: '浅色', icon: Sun, note: settings.theme === 'light' ? '当前主题' : '' }, { id: 'dark', label: '深色', icon: Moon, note: settings.theme === 'dark' ? '当前主题' : '' }].map((t) => (
            <button key={t.id} onClick={() => updateSetting('theme', t.id)}
              className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                settings.theme === t.id ? 'border-accent bg-accent-light' : 'border-border hover:border-border-glow'
              }`}>
              <t.icon size={28} weight={settings.theme === t.id ? 'fill' : 'regular'}
                className={settings.theme === t.id ? 'text-accent' : 'text-text-muted'} />
              <span className="text-[13px] font-semibold text-text-primary">{t.label}</span>
              {t.note && <span className="text-[11px] text-accent font-medium">{t.note}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="ps5-card p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-text-primary section-title">窗口</h3>
        <Toggle checked={settings.compact_mode || false} onChange={(v) => updateSetting('compact_mode', v)}
          label="紧凑模式" desc="减少界面元素间距，显示更多内容" />
      </div>
    </div>
  );
}

function AboutTab() {
  const { platform } = useStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="ps5-card p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-cta mx-auto mb-5 flex items-center justify-center shadow-xl shadow-accent-glow">
          <GameController size={36} weight="fill" className="text-white" />
        </div>
        <h2 className="text-[24px] font-bold text-text-primary section-title">Game Space</h2>
        <p className="text-[13px] text-text-muted mt-1">版本 1.0.0</p>
        <p className="text-[13px] text-text-secondary mt-4 max-w-sm mx-auto leading-relaxed">
          本地 PC 游戏库管理器。扫描、整理、启动你的游戏收藏。
        </p>
      </div>

      <div className="ps5-card p-6 space-y-3">
        <h3 className="text-[15px] font-semibold text-text-primary section-title">系统信息</h3>
        <div className="grid grid-cols-2 gap-y-2.5 text-[13px]">
          {[['平台', platform?.platform || '—'], ['架构', platform?.arch || '—'], ['版本', platform?.version || '1.0.0']].map(([k, v], i) => (
            <React.Fragment key={i}>
              <span className="text-text-muted">{k}</span>
              <span className="text-text-primary font-medium">{v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="ps5-card p-5 text-center">
        <p className="text-[11px] text-text-muted">Built with Electron + React + Tailwind CSS</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSetting } = useStore();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      initial="hidden" animate="show" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <motion.div variants={fade} style={{ marginBottom: '32px' }}>
        <h1 className="section-title text-[28px] text-text-primary">设置</h1>
        <p className="text-[14px] text-text-secondary" style={{ marginTop: '8px' }}>自定义应用行为和外观</p>
      </motion.div>

      <motion.div variants={fade} className="flex p-1 bg-bg-surface/60 rounded-xl w-fit border border-border" style={{ marginBottom: '32px', gap: '4px' }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center rounded-lg text-[13px] font-medium transition-all ${
              activeTab === tab.id ? 'bg-bg-card text-text-primary shadow-md' : 'text-text-muted hover:text-text-secondary'
            }`} style={{ padding: '10px 20px', gap: '8px' }}>
            <tab.icon size={15} weight={activeTab === tab.id ? 'fill' : 'regular'} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fade}>
        {activeTab === 'general' && <GeneralTab settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'appearance' && <AppearanceTab settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'about' && <AboutTab />}
      </motion.div>
    </motion.div>
  );
}
