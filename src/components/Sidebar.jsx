import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  House,
  GameController,
  DownloadSimple,
  GearSix,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: House },
  { path: '/library', label: '游戏库', icon: GameController },
  { path: '/import', label: '导入', icon: DownloadSimple },
  { path: '/settings', label: '设置', icon: GearSix },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="shrink-0 flex flex-col h-full glass-heavy border-r border-border z-10" style={{ width: '200px' }}>
      {/* Logo Area */}
      <div style={{ padding: '24px 20px 20px 20px' }}>
        <div className="rounded-lg bg-gradient-to-br from-accent to-cta flex items-center justify-center shadow-lg shadow-accent-glow" style={{ width: '36px', height: '36px' }}>
          <GameController size={20} weight="fill" className="text-white" />
        </div>
        <p className="text-text-primary leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', marginTop: '12px' }}>
          GAME SPACE
        </p>
        <p className="text-text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
          Library Manager
        </p>
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 20px' }} />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col" style={{ padding: '24px 12px' }}>
        <p className="text-text-muted uppercase" style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', padding: '0 12px', marginBottom: '16px' }}>
          导航
        </p>
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="no-underline"
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    gap: '12px',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    background: isActive ? 'var(--color-nav-active)' : 'transparent',
                  }}
                >
                  <item.icon
                    size={19}
                    weight={isActive ? 'fill' : 'regular'}
                    className="shrink-0"
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="ml-auto rounded-full bg-accent"
                      style={{ width: '3px', height: '20px' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Separator */}
      <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 20px' }} />

      {/* Footer Status */}
      <div style={{ padding: '16px 20px 20px 20px' }}>
        <div className="flex items-center" style={{ gap: '8px' }}>
          <div className="rounded-full bg-success animate-pulse" style={{ width: '6px', height: '6px' }} />
          <span className="text-text-muted" style={{ fontSize: '11px' }}>系统就绪</span>
        </div>
        <p className="text-text-muted" style={{ fontSize: '10px', marginTop: '4px', opacity: '0.5' }}>v1.0.0</p>
      </div>
    </aside>
  );
}