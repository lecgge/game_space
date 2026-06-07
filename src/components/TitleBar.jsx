import { useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MinusSquareIcon as MinusIcon, SquareIcon } from '@phosphor-icons/react';
import { IconMinimize, IconMaximizeSolid, IconClose } from './icon.jsx';

const handleMinimize = () => window.electronAPI.minimizeWindow();
const handleMaximize = () => window.electronAPI.maximizeWindow();
const handleClose = () => window.electronAPI.closeWindow();

const isWin32 = window.electronAPI?.platform === 'win32' || process.platform === 'win32';
const isMacos = window.electronAPI?.platform === 'darwin' || process.platform === 'darwin';

export default function TitleBar() {
  const platform = useStore((s) => s.platform);
  
  return (
    <motion.div
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-8 flex items-center justify-between px-2 select-none bg-bg-deepest/95 backdrop-blur-xl border-b border-white/[0.03]"
    >
      <div className="flex items-center gap-3 pl-1">
        <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-brand to-brand-foreground/60 flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">GS</span>
        </div>
        <span className="text-xs font-medium text-text-muted">{useStore.getState().activePage}</span>
      </div>

      <AnimatePresence>
        {!isWin32 && !isMacos && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.08, translateX: -4 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleMinimize}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors duration-150"
            >
              <MinusSquareIcon size={12} weight="bold" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08, translateX: -4 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleMaximize}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors duration-150"
            >
              <SquareIcon size={12} weight="fill" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isWin32 || !isWin32 && !isMacos) && (
          <motion.div 
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="flex items-center gap-0.5 pr-2"
          >
          {isWin32 ? (
            <>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleMinimize}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors duration-150"
              >
                <IconMinimize />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleMaximize}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors duration-150"
              >
                <motion.svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3.75 3H8V2C8 1.44772 7.55229 1 7 1H6C5.44772 1 5 1.44772 5 2V3H4C3.44772 3 3 3.44772 3 4V5H2C1.44772 5 1 5.44772 1 6V7C1 7.55229 1.44772 8 2 8H3V9C3 9.55228 3.44772 10 4 10H5V11C5 11.5523 5.44772 12 6 12H7C7.55229 12 8 11.5523 8 11V10H9C9.55228 10 10 9.55228 10 9V8H11C11.5523 8 12 7.55229 12 7V6C12 5.44772 11.5523 5 11 5H10V4C10 3.44772 9.55228 3 9 3ZM6 3H7V5H5V4H6Z" stroke="currentColor" strokeWidth="1.35"/>
                </motion.svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/20 transition-colors duration-150 group"
              >
                <IconClose />
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleMinimize}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors duration-150"
              >
                <MinusIcon size={12} weight="bold" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleMaximize}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors duration-150"
              >
                <motion.svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="5" y="2" width="2" height="2" rx="0.5"/>
                  <rect x="3" y="9" width="2" height="2" rx="0.5"/>
                  <rect x="7" y="9" width="2" height="1" rx="0.5"/>
                  <rect x="3" y="3" width="2" height="1" rx="0.5"/>
                </motion.svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/20 transition-colors duration-150 group"
              >
                <IconClose />
              </motion.button>
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
