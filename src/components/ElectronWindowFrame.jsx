import { useEffect, useRef } from 'react';

function ElectronWindowFrame() {
  const frameRef = useRef(null);

  useEffect(() => {
    if (!frameRef.current) return;

    window.addEventListener('message', (event) => {
      const { type, payload } = event.data;

      if (type === 'MINIMIZE_WINDOW') {
        frameRef.current.classList.add('minimized');
      } else if (type === 'MAXIMIZE_WINDOW') {
        frameRef.current.classList.add('maximized');
      } else if (type === 'WINDOW_CLOSE_REQUESTED') {
        window.close();
      }
    });

    return () => {
      window.removeEventListener('message', handleSend);
    };
  }, []);

  const handleSend = (channel, data) => {
    window.parent.postMessage({ type: channel, payload: data }, '*');
  };

  const send = (event, data) => {
    handleSend(event, data);
  };

  return (
    <div className="fixed inset-0 z-[9999] my-app-frame w-full h-full overflow-hidden relative bg-[#181926]" ref={frameRef}>
      {/* Ambient Background */}
      <div className="ambient-background" />
      
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      <main className="w-full h-full overflow-hidden relative">
        {/* Top Navigation Bar - Liquid Glass Style */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#181926]/70 backdrop-blur-xl border-b border-white/8 flex items-center justify-between">
          {/* Left: Window Controls */}
          <div className="flex items-center gap-3 group">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] status-dot" />
            <div className="flex gap-1.5">
              <button className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 shadow-[0_0_8px_rgba(234,179,8,0.3)] hover:bg-yellow-400 transition-colors" />
              <button className="w-2.5 h-2.5 rounded-full bg-green-500/70 shadow-[0_0_8px_rgba(34,197,94,0.3)] hover:bg-green-400 transition-colors" />
            </div>
          </div>

          {/* Center: App Title */}
          <h1 className="text-sm font-semibold tracking-wide text-gray-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_4px_16px_rgba(99,102,241,0.25)]">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </span>
            Game Space
          </h1>

          {/* Right: System Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => send('request-minimize')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all tooltip"
              data-tooltip="Minimize"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button 
              onClick={() => send('request-maximize')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all tooltip"
              data-tooltip={document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {document.fullscreenElement ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => send('request-close')}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all tooltip"
              data-tooltip="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="pt-14 px-6 lg:px-8 h-full flex flex-col">
          <div className="flex-1 overflow-auto no-scrollbar pb-20">
            {/* App Content will be mounted via main.js */}
            <iframe 
              id="app-frame"
              src=""
              className="w-full h-full rounded-2xl glass-card border-0"
            />
          </div>
        </div>

        {/* Bottom Status Bar */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 px-6 py-3 bg-[#181926]/80 backdrop-blur-xl border-t border-white/8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 text-gray-400">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/70 status-dot" />
              Ready
            </span>
            <span>v{document.readyState === 'complete' ? window.ELECTRON_VERSION : '1.0.0'}</span>
          </div>
          
          <div className="flex items-center gap-6 text-gray-400">
            <span className="hidden md:inline">Memory: {window.ELECTRON_MEMORY || '—'}</span>
            <span className="hidden lg:inline">Disk: {window.ELECTRON_DISK || '—'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => send('request-reload')}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-all tooltip"
              data-tooltip="Reload"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
          </div>
        </footer>

        {/* Corner Decorations */}
        <div className="fixed top-0 left-1/4 -translate-y-1/2 z-40">
          <div className="w-32 h-32 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>
        <div className="fixed top-0 right-1/4 -translate-y-1/2 z-40">
          <div className="w-40 h-40 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        {/* App Content Container */}
        <div id="app-mount" className="absolute inset-14 lg:inset-2 top-[68px] bottom-[48px]" />
      </main>
    </div>
  );
}

export default ElectronWindowFrame;
