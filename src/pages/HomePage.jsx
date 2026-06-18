import React, { useEffect } from 'react';
import { useStore } from '@/store';
import {
  GameController, Clock, HardDrive, Lightning,
  ArrowRight,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fmt = {
  hours: (m) => !m ? '0h' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h`,
  size: (b) => !b ? '0 GB' : b < 1073741824 ? `${Math.round(b/1048576)} MB` : `${(b/1073741824).toFixed(1)} GB`,
};

const getSafeCoverUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('file://')) return url;
  const normalizedPath = url.replace(/\\/g, '/');
  return `file://${normalizedPath}`;
};

const fade = { hidden: { opacity: 0, y: 16 }, show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.22,1,0.36,1] } }) };

export default function HomePage() {
  const { stats, games, fetchStats, fetchRecentGames } = useStore();
  const navigate = useNavigate();

  // Re-fetch stats and recent games when page becomes visible
  useEffect(() => {
    fetchStats();
    fetchRecentGames();
  }, [fetchStats, fetchRecentGames]);

  const statsData = [
    { label: '游戏总数', value: stats.totalGames || 0, icon: GameController, gradient: 'from-violet-500 to-purple-600' },
    { label: '已安装', value: stats.installed || 0, icon: Lightning, gradient: 'from-emerald-500 to-green-600' },
    { label: '游戏时长', value: `${fmt.hours(stats.totalPlaytime)}`, icon: Clock, gradient: 'from-blue-500 to-cyan-600' },
    { label: '存储占用', value: fmt.size(stats.totalSize), icon: HardDrive, gradient: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="text-center"
        >
          <h1 className="section-title text-[36px] text-text-primary leading-tight">
            欢迎回来
          </h1>
          <p className="text-[15px] text-text-secondary" style={{ marginTop: '20px' }}>
            管理你的游戏库，随时开始畅玩。
          </p>
          <div className="flex justify-center" style={{ marginTop: '40px', gap: '16px' }}>
            <button onClick={() => navigate('/library')} className="btn btn-primary">
              <GameController size={16} weight="fill" /> 浏览游戏库
            </button>
            <button onClick={() => navigate('/import')} className="btn btn-ghost">
              <HardDrive size={16} /> 导入游戏
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4" style={{ width: '100%', marginTop: '60px', marginBottom: '60px', gap: '24px' }}>
          {statsData.map((card, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="show"
              className="ps5-card text-left" style={{ padding: '24px' }}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
                style={{ marginBottom: '20px' }}>
                <card.icon size={22} weight="fill" className="text-white" />
              </div>
              <p className="text-[28px] font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {card.value}
              </p>
              <p className="text-[12px] text-text-muted" style={{ marginTop: '8px' }}>{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
            <h2 className="section-title text-[18px] text-text-primary">最近添加</h2>
            {games.length > 0 && (
              <button onClick={() => navigate('/library')}
                className="flex items-center gap-1 text-[13px] text-accent hover:text-accent-hover transition-colors">
                查看全部 <ArrowRight size={14} />
              </button>
            )}
          </div>

          {games.length === 0 ? (
            <div className="ps5-card flex flex-col items-center justify-center text-center" style={{ width: '100%', padding: '80px 40px' }}>
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center" style={{ marginBottom: '24px' }}>
                <GameController size={32} weight="light" className="text-accent" />
              </div>
              <p className="text-[16px] text-text-secondary" style={{ marginBottom: '8px' }}>游戏库为空</p>
              <p className="text-[13px] text-text-muted" style={{ marginBottom: '24px' }}>扫描本地平台或手动添加游戏来开始</p>
              <button onClick={() => navigate('/import')} className="btn btn-primary">导入游戏</button>
            </div>
          ) : (
            <div className="scroll-row scrollbar-hide justify-center">
              {games.slice(0, 8).map((game, i) => (
                <motion.div key={game.id} custom={i} variants={fade} initial="hidden" animate="show"
                  onClick={() => navigate('/library')}
                  className="ps5-card" style={{ width: '220px' }}>
                  <div className="aspect-[3/4] relative overflow-hidden bg-bg-surface">
                    {getSafeCoverUrl(game.cover_image) ? (
                      <img src={getSafeCoverUrl(game.cover_image)} alt={game.title} className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-bg-card to-bg-surface" style={{ gap: '12px' }}>
                        <GameController size={40} weight="light" className="text-accent/30" />
                        <span className="text-[12px] text-text-muted text-center" style={{ padding: '0 12px' }}>{game.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-[13px] font-semibold text-text-primary truncate">{game.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-text-muted">{game.platform || '未知'}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${game.status === 'installed' ? 'bg-success' : 'bg-text-muted'}`} />
                        <span className="text-[10px] text-text-muted">{game.status === 'installed' ? '已安装' : '未安装'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  );
}