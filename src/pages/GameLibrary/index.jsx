import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon } from "@phosphor-icons/react";

const gamesData = [
  { id: 1, title: "Eternal Horizon", genre: "RPG Action", year: "2023", rating: 48, image: "https://picsum.photos/seed/horizon/300/200" },
  { id: 2, title: "Neon Protocol", genre: "Cyberpunk RPG", year: "2024", rating: 72, image: "https://picsum.photos/seed/protocol/300/200" },
  { id: 3, title: "Stellar Vanguard", genre: "Space Strategy", year: "2023", rating: 61, image: "https://picsum.photos/seed/stellar/300/200" }
];

const GameLibrary = () => (
  <div className="flex-1 flex flex-col h-full overflow-hidden">
    {/* Search Bar */}
    <motion.div 
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="relative mb-4"
    >
      <SearchIcon size={18} className="absolute left-3 top-[calc(50%-6px)] text-gray-500" />
      <input 
        type="text" placeholder="Search games, genres, or titles..." 
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 focus:border-cyan-500/30 outline-none transition-all placeholder:text-xs text-sm"
      />
    </motion.div>

    {/* Library Grid */}
    <div className="flex-1 overflow-y-auto">
      <Grid content={gamesData} />
    </div>
  </div>
);

const GameCard = ({ item }) => (
  <motion.button onClick={() => {}} className="group flex-shrink-0 w-[14rem] p-[2px] relative rounded-xl overflow-hidden">
    <motion.div className="relative h-full bg-white/[0.03] rounded-xl border border-white/5" whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
      <div className="aspect-[3/2] overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      </div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
      
      {/* Title & Details */}
      <div className="absolute bottom-0 left-0 right-4 p-3">
        <p className="font-semibold text-sm tracking-wide leading-snug">{item.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 uppercase font-medium">{item.genre.split(" ")[0]}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">{item.year}</span>
        </div>
        
        {/* Rating Bar */}
        <motion.div layoutId={`rating-${item.id}`} initial={false} animate={{ scaleX: item.rating / 100 }} className="h-[0.25rem] mt-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
        </motion.div>
      </div>
    </motion.div>
  </motion.button>
);

const Grid = ({ content }) => (
  <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] auto-rows-[min-content] gap-3 items-start p-2">
    <AnimatePresence initial={false}>
      {content.map((item) => (
        <GameCard key={item.id} item={item} />
      ))}
    </AnimatePresence>
  </motion.div>
);

export default GameLibrary;
