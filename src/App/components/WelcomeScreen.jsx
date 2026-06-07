'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [storageUsage, setStorageUsage] = useState(0);
  const [gamesOwned, setGamesOwned] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);

    // Simulate fetching data from parent component
    fetchActivityData();

    return () => clearTimeout(timer);
  }, []);

  const fetchActivityData = () => {
    setActivityData([
      { game: 'Cyberpunk 2077', timeAgo: '2h ago', status: 'Completed' },
      { game: 'Elden Ring', timeAgo: '5h ago', status: 'Saved' },
      { game: 'Hogwarts Legacy', timeAgo: '1d ago', status: 'Paused' }
    ]);

    setGamesOwned(247);
    setStorageUsage(85.3);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='w-full h-[calc(100vh-64px)] flex items-center justify-center bg-[#181926]'
      >
        <div className='relative text-center'>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className='mb-6'
          >
            <i className="ph-duotone ph-controller text-7xl text-blue-400"/>
          </motion.div>
          <h2 className='text-2xl font-semibold text-gray-100 tracking-tight'>Game Space</h2>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className='relative min-h-[85vh] flex items-center px-6 md:px-10 pt-20'>
        {/* Background accent */}
        <div className='absolute top-0 right-0 w-[80vw] h-[80vw] bg-blue-500/[0.03] rounded-full blur-3xl -translate-y-[20%] translate-x-[10%]'/>

        <div className='max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center'>
          {/* Left Content */}
          <div className='space-y-8 order-2 lg:order-1'>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className='inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.1] mb-[28px]'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'/>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'/>
                </span>
                <span className='text-sm font-medium text-gray-300'>Everything is ready</span>
              </div>

              <h1 className='text-6xl md:text-7xl lg:text-[84px] tracking-tighter leading-[1.1] mb-[28px]'>
                <span className='block text-gray-100 drop-shadow-[0_0_30px_rgba(139,186,250,0.3)]'>Your Digital</span>
                <span className='block bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent font-bold tracking-tight'>
                  Game Sanctuary
                </span>
              </h1>

              <p className='text-base text-gray-400 leading-relaxed max-w-[60ch] mb-[72px]'>
                Discover and manage your local game library seamlessly. Track progress, organize collections, and relive gaming memories with precision analytics.
              </p>

              <div className='flex flex-wrap items-center gap-5'>
                <button className="group relative px-8 py-4 rounded-[1rem] bg-white text-gray-900 font-semibold text-sm overflow-hidden transition-all hover:scale-105">
                  <span className='relative z-10'>Start Your Journey</span>
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-400/20 to-violet-400/20 opacity-0 group-hover:opacity-100 transition-opacity'/>
                </button>

                <button className="px-8 py-4 rounded-[1rem] bg-white/[0.03] border border-white/[0.15] hover:bg-white/[0.06] transition-all font-medium text-sm text-gray-300 group">
                  <span className='flex items-center gap-2'>
                    Explore Library
                    <i className="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform"/>
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Stats Panel */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className='order-1 lg:order-2 space-y-7'>
            
            {/* Games Count Card */}
            <div className='p-[3px] rounded-2xl bg-gradient-to-b from-blue-400/30 to-violet-400/30'>
              <div className='bg-[#181926]/80 backdrop-blur-xl rounded-2xl p-7 border border-white/[0.1]'>
                <div className='flex items-start justify-between mb-6'>
                  <div>
                    <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-2'>Total Games</h3>
                    <p className='text-[5rem] md:text-[7rem] leading-none tracking-tighter text-white font-bold tabular-nums drop-shadow-[0_0_50px_rgba(139,186,250,0.4)]'>{gamesOwned}</p>
                  </div>
                  <i className="ph-duotone ph-game-controller text-[5rem] md:text-[7rem] text-blue-400/40"/>
                </div>

                <div className='grid grid-cols-3 divide-x divide-white/[0.1]'>
                  <div className='text-center'>
                    <p className='text-xs font-medium text-emerald-400'>Active</p>
                    <p className='text-xl font-bold text-gray-200'>3</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-xs font-medium text-blue-400'>Completed</p>
                    <p className='text-xl font-bold text-gray-200'>{Math.floor(gamesOwned * 0.35)}</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-xs font-medium text-violet-400'>Wishlist</p>
                    <p className='text-xl font-bold text-gray-200'>{Math.floor(gamesOwned * 0.15)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Meter */}
            <div className='bg-[#181926]/70 backdrop-blur-xl rounded-2xl p-7 border border-white/[0.1]'>
              <div className='flex items-center justify-between mb-5'>
                <span className='text-sm font-medium text-gray-300 uppercase tracking-wider'>Storage</span>
                <i className="ph-duotone ph-hard-drive text-emerald-400 text-2xl"/>
              </div>

              <p className='text-[5rem] md:text-[7rem] leading-none tracking-tighter text-white font-bold tabular-nums drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]'>
                {storageUsage.toFixed(1)}GB
              </p>

              <div className='mt-7'>
                <div className='flex justify-between text-xs font-medium mb-2'>
                  <span className='text-gray-400'>850GB used</span>
                  <span className='text-emerald-400'>92% efficient</span>
                </div>
                <div className='w-full h-[1px] bg-white/[0.1]'/>
              </div>
            </div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
              <h3 className='text-sm font-medium text-gray-400 uppercase tracking-wider mb-5 pl-2'>Recent Activity</h3>
              
              <div className='space-y-4'>
                {(activityData || []).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className='group flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.1] transition-all cursor-pointer'
                  >
                    <div className='flex items-center justify-center w-[68px] h-[68px] rounded-xl bg-white/[0.03] border border-white/[0.15] group-hover:scale-105 transition-transform'>
                      <i className="ph-duotone ph-gamepad text-3xl text-blue-400"/>
                    </div>

                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors'>{item.game}</h4>
                      <p className='text-xs text-gray-500 mt-1'>{item.status} • {item.timeAgo}</p>
                    </div>

                    <i className="ph-bold ph-caret-right text-gray-600 group-hover:text-blue-400 transition-colors"/>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className='relative p-[2px] bg-gradient-to-b from-blue-400/[0.15] via-violet-400/[0.15] to-transparent'>
        <div className='bg-[#181926]/70 backdrop-blur-xl rounded-3xl px-6 py-16 max-w-7xl mx-auto border border-white/[0.1]'>
          <div className='text-center space-y-6'>
            <h2 className='text-4xl md:text-5xl tracking-tight text-gray-100 font-semibold'>Ready to dive in?</h2>
            <p className='text-base text-gray-400 max-w-[70ch] leading-relaxed mx-auto'>
              Organize your collection, track achievements, and unlock insights about your gaming habits.
            </p>

            <div className='flex flex-wrap items-center justify-center gap-5 pt-6'>
              <button className="group px-8 py-4 rounded-[1rem] bg-white text-gray-900 font-semibold text-sm transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                <span className='flex items-center gap-2'>
                  Browse Games
                  <i className="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform"/>
                </span>
              </button>

              <button className="px-8 py-4 rounded-[1rem] bg-white/[0.03] border border-white/[0.15] hover:bg-white/[0.06] transition-all font-medium text-sm text-gray-300">
                View Tutorial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Background Elements */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden -z-10'>
        <div className='absolute top-[12%] left-[5%] w-[40vw] h-[40vw] bg-violet-500/[0.02] rounded-full blur-[80px]'/>
        <div className='absolute bottom-0 right-[8%] w-[35vw] h-[35vw] bg-blue-500/[0.015] rounded-full blur-[100px]'/>
      </div>

      <style>{`
        ::selection {
          background-color: rgba(139, 186, 250, 0.4);
        }
        button:active {
          transform: scale(0.97);
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 186, 250, 0.2) transparent;
        }
        
        @media (max-width: 640px) {
          h1 {
            font-size: 2.2rem !important;
          }
          
          .p-[3px], p-7, px-[38px] {
            padding: 1rem !important;
          }
          
          :where(.grid-cols-3) > * {
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}

export default WelcomeScreen;
