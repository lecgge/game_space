import { useState } from 'react';

const games = [
  { id: 1, title: 'Project Nebula', publisher: 'Velocity Games', tags: ['Strategy', 'Space'], category: 'Strategy' },
  { id: 2, title: 'Shadow Realm Chronicles', publisher: 'Eclipse Studios', tags: ['RPG', 'Fantasy'], category: 'Role-Playing' },
  { id: 3, title: 'Cyber Velocity', publisher: 'Neon Forge', tags: ['Racing', 'Sci-Fi'], category: 'Sports' },
  { id: 4, title: 'Tactical Squad', publisher: 'Ironclad Games', tags: ['Shooter', 'Multiplayer'], category: 'Action' },
];

export const MainContent = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0c15]/95 p-6 lg:p-10">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-6">Your Library</h2>
        
        {games.length > 0 ? (
          games.map((game, idx) => {
            console.log('Rendering game:', { id: game.id, title: game.title });
            return (
              <button
                key={game.id}
                onClick={() => console.log('Game opened', { id: game.id, title: game.title })}
                className="group relative w-full flex items-center gap-5 py-5 px-6 bg-[#1f2937]/40 hover:bg-[#1f2937]/60 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 ease-out will-change-transform"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="w-[128px] h-[70px] bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={`https://picsum.photos/seed/${game.id}/280/155`}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white leading-tight group-hover:text-blue-400 transition-colors duration-200">{game.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-[40ch]">{game.publisher}</p>

                  <div className="flex items-center gap-3 mt-3">
                    {game.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-700/40 text-zinc-300 border border-zinc-700/50 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all duration-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="ml-auto w-[36px] h-[36px] flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-200">
                  <svg 
                    className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              </button>
            );
          })
        ) : (
          // Empty state - showing when no games are available
          <div className="w-full py-20 px-6 bg-[#1f2937]/20 rounded-xl border border-zinc-800/50 text-center mt-8">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
              <svg 
                className="w-8 h-8 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-300">No games found</p>
            <p className="text-sm text-zinc-500 mt-2 max-w-[65ch] mx-auto leading-relaxed">
              Add new titles to your library and start playing them instantly.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between px-4">
          <p className="text-sm text-zinc-500 leading-relaxed max-w-[65ch]">
            Displaying {games.length} game{games.length > 1 ? 's' : ''}. Organized by category and tags.
          </p>

          <div className="flex items-center gap-3">
            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-lg text-zinc-400 border border-zinc-800/50 hover:bg-zinc-700/30 hover:text-white transition-all duration-150">
              <svg 
                className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-lg text-zinc-400 border border-zinc-800/50 hover:bg-zinc-700/30 hover:text-white transition-all duration-150">
              <svg 
                className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
