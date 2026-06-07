import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowDown, Info, CheckCircle, Spinner } from '@phosphor-icons/react';

const statusMap = {
  installed: { label: 'Installed', color: 'status-install', icon: CheckCircle },
  'update-available': { label: 'Update Available', color: 'status-update', icon: ArrowDown },
  missing: { label: 'Not Installed', color: 'text-muted', icon: null },
};

export default function GameCard({ game }) {
  const addNotification = useStore((s) => s.addNotification);
  const [launching, setLaunching] = useState(false);
  const status = statusMap[game.status];

  const handleLaunch = () => {
    if (game.status === 'missing') return;
    setLaunching(true);
    setTimeout(() => {
      addNotification({ id: Date.now(), message: `Starting ${game.title}...`, duration: 3000 });
      setLaunching(false);
    }, 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-bg-card rounded-2xl overflow-hidden border border-white/[0.04] hover:border-white/[0.08] transition-colors duration-300"
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <motion.img
          src={game.image}
          alt={game.title}
          whileHover={{ scale: 1.04, brightness: 1.1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent"></div>

        {/* Status Badge */}
        {status.icon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-deep/80 backdrop-blur-md border border-white/[0.06]"
          >
            <status.icon size={12} weight="fill" className={status.color === 'text-muted' ? 'text-text-muted' : `text-${status.color}`} />
            <span className={`text-xs font-body ${status.color === 'text-muted' ? 'text-text-muted' : `text-${status.color}`}`}>
              {status.label}
            </span>
          </motion.div>
        )}

        {/* Launching Overlay */}
        <AnimatePresence>
          {launching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-deep/90 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center">
                <Spinner size={32} weight="regular" className="animate-spin mx-auto text-brand" />
                <p className="mt-4 text-sm font-body text-text-secondary">Starting {game.title}...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-text-primary truncate">{game.title}</h3>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-text-muted font-body">{game.playtime}</span>
          <span className="text-xs text-text-muted">Last: {game.lastPlayed}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {game.status === 'installed' && (
            <motion.button
              onClick={handleLaunch}
              disabled={launching}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97, y: -1 }}
              className="btn-primary flex items-center gap-2 px-5 py-2 text-sm"
            >
              <Play size={16} weight="fill" />
              Launch
            </motion.button>
          )}

          {game.status === 'update-available' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97, y: -1 }}
              className="btn-primary flex items-center gap-2 px-5 py-2 text-sm bg-warn hover:bg-warn/90"
            >
              <ArrowDown size={16} weight="regular" />
              Update
            </motion.button>
          )}

          {game.status === 'missing' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97, y: -1 }}
              className="btn-secondary flex items-center gap-2 px-5 py-2 text-sm"
            >
              <ArrowDown size={16} weight="regular" />
              Install
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-2 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
          >
            <Info size={18} weight="regular" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
