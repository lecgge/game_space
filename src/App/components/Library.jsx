import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function Library() {
  const featuredGames = [
    { id: 1, title: 'Cyberpunk 2077', developer: 'CD Projekt RED', image: 'https://picsum.photos/seed/cyberpunk/600/400' },
    { id: 2, title: 'Elden Ring', developer: 'FromSoftware', image: 'https://picsum.photos/seed/elden/600/400' }
  ];

  const recentGames = [
    { id: 3, title: 'Stardew Valley', image: 'https://picsum.photos/seed/stardew/320/320' },
    { id: 4, title: 'Hades', image: 'https://picsum.photos/seed/hades/320/320' },
    { id: 5, title: 'Terraria', image: 'https://picsum.photos/seed/terraria/320/320' }
  ];

  return (
    <>
      {/* Featured Games - Split Layout */}
      <section className='py-[60px] px-6 md:px-10 max-w-[1800px] mx-auto'>
        <div className='flex items-end justify-between mb-[50px] gap-4'>
          <div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className='text-sm font-medium text-blue-400 uppercase tracking-wider'>Discover</span>
            </motion.h2>
            <h3 className='text-3xl md:text-5xl font-semibold tracking-tight text-gray-100 mt-2 leading-none'>Featured Games</h3>
          </div>

          <div className='flex gap-2'>
            {['Sorted by popularity', 'Newest added'].map((label, i) => (
              <motion.span key={i} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                {label}
              </motion.span>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[1fr_600px] gap-[50px] min-h-[70vh]'>
          {/* Left - Main Feature */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className='relative group overflow-hidden rounded-[2.5rem] border border-white/[0.1]'>
              <div className='absolute inset-0 bg-gradient-to-t from-[#181926] via-transparent to-transparent z-10' />

              <img 
                src={featuredGames[0].image}
                alt={featuredGames[0].title}
                className='w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700'
              />

              <div className='absolute bottom-0 left-0 right-0 p-[68px] z-20'>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className='flex flex-wrap items-center gap-4 mb-[28px]'>
                    <span className='inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/95 text-gray-900 font-semibold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.4)]'>
                      <motion.span animate={{ opacity: [0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        Recommended
                      </motion.span>
                    </span>

                    <span className='px-[16px] py-2 rounded-full bg-white/[0.1] border border-white/[0.2] text-gray-300 font-medium text-xs'>
                      {featuredGames[0].developer}
                    </span>
                  </div>

                  <h4 className='text-5xl md:text-7xl font-bold tracking-tight text-white leading-none mb-[24px]'>
                    {featuredGames[0].title}
                  </h4>

                  <p className='text-base text-gray-300 max-w-lg mb-[48px] leading-relaxed'>
                    Dive into a world where cyberpunk meets soul. Experience an open-world action-adventure RPG set in the dark future of Night City.
                  </p>

                  <div className='flex items-center gap-4'>
                    <button className="group relative px-[32px] py-[14px] rounded-xl bg-white text-gray-900 font-bold text-sm overflow-hidden transition-all hover:scale-105">
                      <span className='relative z-10 flex items-center gap-2'>
                        Launch Game
                        <i className="ph-bold ph-caret-right group-hover:translate-x-1 transition-transform"/>
                      </span>
                    </button>

                    <button className="px-[32px] py-[14px] rounded-xl bg-white/[0.08] border border-white/[0.2] hover:bg-white/[0.15] transition-all font-medium text-sm text-gray-300 group">
                      <span className='flex items-center gap-2'>
                        Details
                        <svg className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><path d='M6 9l6 6 6-6'/></svg>
                      </span>
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className='grid grid-cols-3 divide-x divide-white/[0.2] mt-[48px]'>
                    <div className='text-center p-4'>
                      <p className='text-3xl font-bold text-white mb-1'>97</p>
                      <p className='text-xs text-gray-500 uppercase tracking-wider'>Rating</p>
                    </div>
                    <div className='text-center p-4'>
                      <p className='text-3xl font-bold text-white mb-1'>85h</p>
                      <p className='text-xs text-gray-500 uppercase tracking-wider'>Time Played</p>
                    </div>
                    <div className='text-center p-4'>
                      <p className='text-3xl font-bold text-white mb-1'>4.2TB</p>
                      <p className='text-xs text-gray-500 uppercase tracking-wider'>Storage Used</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right - Related List */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className='bg-white/[0.02] rounded-[2rem] border border-white/[0.08] divide-y divide-white/[0.1]'>
              {featuredGames.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className='group p-6 flex items-center gap-[4px] hover:bg-white/[0.04] transition-all cursor-pointer'
                >
                  <div className='relative h-[180px] w-[140px] shrink-0 rounded-xl overflow-hidden border border-white/[0.2]'>
                    <img src={game.image} alt={game.title} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'/>
                  </div>

                  <div className='flex-1 min-w-0 ml-[8px]'>
                    <h4 className='text-xl font-semibold text-gray-100 group-hover:text-white transition-colors truncate'>{game.title}</h4>
                    <p className='text-sm text-gray-500 mt-1'>{game.developer}</p>
                  </div>

                  <div className='flex items-center gap-[32px] text-sm'>
                    <span className='px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-gray-400 group-hover:text-blue-400 transition-colors'>
                      RPG Action
                    </span>
                    <span className='text-gray-400'>2020</span>
                  </div>

                  <i className="ph-bold ph-caret-right text-xl text-gray-600 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1 transition-transform"/>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Games Row */}
      <section className='py-[80px] px-6 md:px-10 max-w-[1800px] mx-auto'>
        <div className='flex items-end justify-between mb-[40px]'>
          <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3 className='text-4xl md:text-6xl font-semibold tracking-tight text-gray-100 leading-none'>Recent Additions</h3>
          </motion.h3>

          <button className="px-[28px] py-3 rounded-xl bg-white/[0.05] border border-white/[0.15] hover:bg-white/[0.1] transition-all font-medium text-sm text-gray-300 group">
            Show All Games
            <i className="ph-bold ph-parentheses-left group-hover:rotate-[20deg] inline-block ml-2 transition-transform"/>
          </button>
        </div>

        <motion.div layout className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'>
          {recentGames.map((game, i) => (
            <motion.div
              key={game.id}
              layoutId={`game-${game.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: (i + 3) * 0.08 }}
              whileHover={{ scale: 1.02, y: -8 }}
              className='group relative rounded-2xl overflow-hidden cursor-pointer border border-white/[0.1] hover:border-white/[0.25] transition-all hover:bg-white/[0.02]'
            >
              <div className='h-[420px] w-full overflow-hidden'>
                <img 
                  src={game.image}
                  alt={game.title}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                />
              </div>

              <div className='absolute inset-0 bg-gradient-to-t from-[#181926] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

              {/* Hover overlay - Bottom actions */}
              <div className='absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
                <h4 className='text-lg font-semibold text-white mb-2 line-clamp-1'>{game.title}</h4>
                
                <div className='flex items-center gap-3 mb-3 justify-center'>
                  <span className='px-3 py-1 rounded-full bg-emerald-500/95 text-gray-900 font-medium text-[11px] uppercase'>Installed</span>
                  <span className='text-xs text-gray-400 flex items-center px-2 py-1 rounded-lg bg-black/[0.6] backdrop-blur-sm'>
                    <span className='w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 animate-pulse'/>
                    Playing now
                  </span>
                </div>

                <button className="w-full px-[35px] py-[10px] rounded-xl bg-white text-gray-900 font-bold text-xs transition-all hover:scale-105">
                  Launch Now
                </button>
              </div>

              {/* Progress bar */}
              <div className='absolute bottom-0 left-0 right-0 h-[4px] bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity'/>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
