const relatedGames = [
  { id: 101, title: 'Galaxy Command', publisher: 'Velocity Games', category: 'Strategy' },
  { id: 102, title: 'Fantasy Odyssey', publisher: 'Eclipse Studios', category: 'Role-Playing' },
  { id: 103, title: 'Speed Demon', publisher: 'Neon Forge', category: 'Racing' },
];

export const RightPanel = () => {
  return (
    <div className="w-[380px] flex-shrink-0 pl-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(100dvh-172px)]">
      {/* Game Info Card */}
      <div className="p-5 bg-[#1f2937]/30 rounded-xl border border-zinc-800/50 space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white leading-none mb-2">Project Nebula</h3>
          <p className="text-xs text-zinc-500 mt-1">E-Sports League Championship Series • 2024</p>
        </div>

        <div className="space-y-3 pt-3 border-t border-zinc-800/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 leading-none">ESRB</span>
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-[#73a1ff]/10 border border-[#73a1ff]/20 text-[#bacefc] tracking-wide">T - TEEN</span>
          </div>

          <div className="flex items-center justify-between pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <svg 
                className="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="text-sm text-zinc-300">Multiplayer</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button className="w-full py-2 px-4 bg-[#2d8af0]/10 border border-[#2d8af0]/30 hover:bg-[#2d8af0]/20 text-[#9cc9ff] rounded-md transition-all duration-150 text-sm font-medium group">
              <svg 
                className="w-4 h-4 inline-block mr-2 group-hover:-translate-y-[1px] transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 13 12 18 17 13"/>
                <polyline points="7 6 12 11 17 6"/>
              </svg>
              Copy to Clipboard
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button 
                className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200"
                aria-label="Favorite this game"
              >
                <svg 
                  className="w-5 h-5 leading-none transform -translate-y-[1px] group-active:scale-[0.98] transition-transform duration-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              <button 
                className="w-[40px] h-[40px] flex items-center justify-center rounded-lg text-zinc-400 border border-zinc-800/50 hover:bg-zinc-700/30 hover:text-white transition-all duration-200"
                aria-label="Share this game"
              >
                <svg 
                  className="w-5 h-5 leading-none transform -translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 space-x-3">
            <div className="w-full">
              <button className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-150 font-medium group relative overflow-hidden">
                <span className="relative z-[1] flex items-center justify-center gap-3">
                  Play Now
                </span>
              </button>

              <button className="w-full py-2.5 px-4 mt-2 bg-zinc-700/40 hover:bg-zinc-600/50 text-white rounded-md transition-all duration-150 font-medium">
                Launch Offline Mode
              </button>

              <button className="w-full py-2.5 px-4 mt-2 border border-zinc-700/50 hover:bg-zinc-700/30 text-zinc-300 rounded-md transition-all duration-150 font-medium">
                Launch Tournament Mode
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-[65ch]">
            Available platforms include Windows PC, PlayStation®5, Xbox Series X/S, and Stadia.
          </p>
        </div>

        <div className="pt-4 space-y-3 border-t border-zinc-800/50" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 leading-none">Total Playing Time</p>
            <p className="text-lg font-semibold tracking-tight text-white tabular-nums leading-none">47h 23m</p>
          </div>

          <div className="space-y-2 space-x-2">
            <div className="bg-[#2d8af0]/5 rounded-md p-3 border border-[#2d8af0]/10 min-w-[60px] ml-auto">
              <p className="text-xs text-zinc-500 leading-none mb-1">Games Played</p>
              <p className="text-xl font-bold tracking-tight text-[#bacefc]" style={{ fontFamily: 'monospace' }}>284</p>
            </div>

            <div className="bg-emerald-500/5 rounded-md p-3 border border-emerald-500/10 min-w-[60px]">
              <p className="text-xs text-zinc-500 leading-none mb-1 avg-session</p>
              <p className="text-xl font-bold tracking-tight text-[#bacefc]" style={{ fontFamily: 'monospace' }}>974m</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="pt-3">
          <h4 className="text-xs font-semibold text-zinc-400 leading-none mb-3">Recent Achievements</h4>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((_, idx) => (
              <div key={idx} className="w-full flex items-center gap-[8px] p-2 rounded-lg bg-zinc-700/20 hover:bg-zinc-700/30 transition-colors duration-150 group cursor-pointer border border-transparent hover:border-zinc-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"/>
                <span className="text-sm text-zinc-300 leading-none group-hover:text-blue-300 transition-colors duration-200">Level Completed: Chapter {idx + 1}</span>
              </div>
            ))}

            {[5, 6].map((_, idx) => (
              <div key={idx + 4} className="w-full flex items-center gap-[8px] p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-700/30 transition-colors duration-150 group cursor-pointer border border-transparent hover:border-zinc-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"/>
                <span className="text-sm text-zinc-300 leading-none group-hover:text-yellow-300 transition-colors duration-200">Boss Defeated Tier {idx + 6}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-emerald-400 mt-4 leading-none font-medium">
            +3 achievements this month
          </p>
        </div>
      </div>

      {/* Related Games Section */}
      <div>
        <h4 className="text-sm font-semibold tracking-tight text-white mb-3">Related Games</h4>
        <div className="space-y-2">
          {relatedGames.map((game) => (
            <button 
              key={game.id}
              onClick={() => console.log('Related game clicked', game)}
              className="w-full flex items-center gap-[8px] p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-700/40 transition-all duration-150 border border-zinc-800/50 hover:border-zinc-700/50 group text-left"
            >
              <div className="w-[60px] h-[32px] bg-gradient-to-br from-zinc-700/40 to-zinc-800/40 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  src={`https://picsum.photos/seed/${game.id + 100}/152/88`}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="text-sm text-zinc-300 leading-tight truncate group-hover:text-white transition-colors duration-200">{game.title}</h5>
                <p className="text-xs text-zinc-500 mt-0.5">{game.publisher}</p>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); console.log('Add to library', game); }}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-lg border border-zinc-700/50 hover:border-blue-500/50 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 transition-all duration-200 group"
              >
                <svg 
                  className="w-4 h-4 transform -translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
