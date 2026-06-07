import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeSimple, GameRoom, UsersCircle, Trophy, Settings, UserCircle, HelpCircle, PlusSquare, ChevronDown } from '@phosphor-icons/react';

const PAGE_CONFIG = [
  { icon: HomeSimple, label: 'Home', page: 'home', shortcut: 'Cmd+H' },
  { icon: GameRoom, label: 'Game Library', page: 'library', shortcut: 'Cmd+L' },
  { icon: UsersCircle, label: 'Community', page: 'social', shortcut: 'Cmd+S' },
  { icon: Trophy, label: 'Achievements', page: 'stats', shortcut: 'Cmd+A' },
];

const SETTINGS_CONFIG = [
  { icon: Settings, label: 'Preferences', page: 'settings-preferences' },
  { icon: UserCircle, label: 'Account', page: 'settings-account' },
  { icon: HelpCircle, label: 'Support', page: 'settings-support' },
];

export const Sidebar = () => {
  const [activePage, setActivePage] = useState('home');
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);

  const containerVariants = {
    collapsed: { width: 64 },
    expanded: { width: 260 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    isExpanded && setTimeout(() => setIsExpanded(false), 250);
  };

  return (
    <motion.aside
      className="flex-shrink-0 bg-[#0a0c15]/95 backdrop-blur-xl border-r border-white/10 overflow-hidden flex flex-col"
      variants={containerVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Logo Area */}
      <motion.div 
        className="flex items-center gap-3 px-4 py-6 px-6 border-b border-white/10"
        animate={isExpanded ? 'expanded' : 'collapsed'}
      >
        <div 
          className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_8px_32px_-12px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_40px_-16px_rgba(59,130,246,0.4)] transition-shadow duration-300 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-white/80" />
            <path d="m9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/60" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/90" />
          </svg>
          <motion.span 
            className="text-sm font-semibold bg-gradient-to-r from-white via-white to-white/0 bg-clip-text text-transparent"
            animate={isExpanded ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: 0.15 }}
          >
            GameSpace
          </motion.span>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence>
          {isExpanded && (
            <motion.div className="space-y-2 mb-8" variants={itemVariants}>{PAGE_CONFIG.map((page, idx) => (
              <SidebarNavItem 
                key={page.page}
                pageConfig={page}
                activePage={activePage}
                isActive={activePage === page.page}
                isExpanded={isExpanded}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => handleNavClick(page.page)}
              />
            ))}</motion.div>
          )}
        </AnimatePresence>

        {/* Section Label */}
        <AnimatePresence>
          {isExpanded && (
            <motion.p 
              className="px-6 mb-4 mt-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Preferences</span>
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isExpanded && (
            <div variants={itemVariants}>
              {SETTINGS_CONFIG.map((setting, idx) => (
                <SidebarNavItem 
                  key={setting.page}
                  pageConfig={setting}
                  activePage={activePage}
                  isActive={activePage === setting.page}
                  isExpanded={isExpanded}
                  onClick={() => handleNavClick(setting.page)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </nav>

      {/* Footer Info */}
      <motion.div 
        className="px-4 py-4 mt-auto"
        animate={isExpanded ? 'expanded' : 'collapsed'}
      >
        <AnimatedFooterInfo />
      </motion.div>

      {/* Collapse/Expand Toggle */}
      <motion.button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute top-16 ${isExpanded ? '-right-12 bg-black/50' : 'right-4'} px-3 py-2 rounded-lg border border-white/10 backdrop-blur-md text-white/50 hover:text-white transition-all duration-200 flex items-center justify-center`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
          <ChevronDown size={14} />
        </motion.div>
      </motion.button>

      {/* Expanded Button Hint */}
      {!isExpanded && (
        <motion.div 
          className="absolute left-3 bottom-32 w-[calc(50px+12px)] h-[38px] hidden md:hidden"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="w-full h-full rounded-lg bg-gradient-to-r from-blue-500/20 via-indigo-500/30 to-blue-500/20 border border-white/10 backdrop-blur-sm" />
        </motion.div>
      )}
    </motion.aside>
  );
};

const SidebarNavItem = ({ pageConfig, activePage, isActive, isExpanded, onMouseEnter, onMouseLeave, onClick }) => {
  const Icon = pageConfig.icon;
  
  const getActiveStyles = () => `
    text-sm font-medium bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 border-l-[3px] border-white/0 hover:border-white/20
    ${isActive ? 'text-white' : 'text-white/60'}
  `.trim();

  return (
    <motion.button
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 group relative overflow-hidden will-change-transform ${getActiveStyles()}`}
      variants={itemVariants}
      custom={index: 0, pageConfig.page}
      whileHover="{{ transform: 'translateY(-1px)' }}"
      whileTap={{ scale: 0.98 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Active Border Line */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="active-line"
            className="absolute left-0 w-[3px] h-8 bg-gradient-to-b from-white/60 to-white/40 rounded-r-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <Icon 
        size={isExpanded ? 20 : undefined} 
        strokeWidth={isActive ? 2.5 : 1.8}
        className="flex-shrink-0 transition-all duration-200"
      />
      
      {/* Label */}
      <AnimatePresence>
        {isExpanded && (
          <motion.span 
            className="whitespace-nowrap truncate max-w-[160px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {pageConfig.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut */}
      <AnimatePresence>
        {isExpanded && isActive && (
          <motion.span 
            className="ml-auto text-xs whitespace-nowrap bg-white/5 px-2 py-1 rounded font-mono"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {pageConfig.shortcut}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const AnimatedFooterInfo = () => {
  const [textIndex, setTextIndex] = useState(0);
  const messages = ['v1.0.0', 'Built with Electron & React', 'Ready to play'];

  return (
    <motion.div className="px-3 py-2">
      <div className="flex items-center justify-between text-[10px]">
        {messages.map((message, index) => (
          <motion.p 
            key={index}
            className={`text-zinc-400 leading-tight whitespace-normal transition-all duration-300 ${index === textIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ 
              opacity: index === textIndex ? 1 : 0,
              y: index === textIndex ? 0 : 5
            }}
            transition={{ duration: 2, delay: 1000 + index * 2000 }}
          >
            {message}
          </motion.p>
        ))}
      </div>

      <motion.div 
        className="flex gap-1 mt-1 items-center"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-[2px] h-[3px] bg-white/40 rounded-full" />
        <span className="font-mono text-zinc-500">System Ready</span>
      </motion.div>
    </motion.div>
  );
};


