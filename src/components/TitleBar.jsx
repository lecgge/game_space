import React from 'react';
import { useStore } from '@/store';
import { Minus, Square, Copy, X } from '@phosphor-icons/react';

export default function TitleBar() {
  const { platform, isMaximized, setMaximized } = useStore();
  const os = platform?.platform || 'win32';

  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => {
    window.electronAPI?.maximize();
    setMaximized(!isMaximized);
  };
  const handleClose = () => window.electronAPI?.close();

  if (os === 'darwin') {
    return <div className="titlebar-drag h-[var(--spacing-titlebar)]" />;
  }

  return (
    <div className="titlebar-drag h-[var(--spacing-titlebar)] flex items-center justify-between select-none bg-bg-deep/80 backdrop-blur-sm z-50">
      {/* Left: Logo */}
      <div className="titlebar-no-drag flex items-center gap-2.5 px-4">
        <img src="./favicon.png" alt="Game Space" className="w-5 h-5 rounded shadow-lg" />
        <span className="text-[11px] text-text-muted font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)' }}>
          Game Space
        </span>
      </div>

      {/* Right: Window controls */}
      <div className="titlebar-no-drag flex items-center h-full">
        <button onClick={handleMinimize}
          className="w-[46px] h-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
          aria-label="最小化">
          <Minus size={13} weight="bold" />
        </button>
        <button onClick={handleMaximize}
          className="w-[46px] h-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
          aria-label="最大化">
          {isMaximized ? <Copy size={11} weight="bold" /> : <Square size={10} weight="regular" />}
        </button>
        <button onClick={handleClose}
          className="w-[46px] h-full flex items-center justify-center text-text-muted hover:bg-cta hover:text-white transition-all"
          aria-label="关闭">
          <X size={13} weight="bold" />
        </button>
      </div>
    </div>
  );
}
