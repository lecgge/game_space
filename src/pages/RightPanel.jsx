import React from "react";
import { motion } from "framer-motion";
import { GameController, TimerPlayTape, Award, Info as InfoCircle } from "@phosphor-icons/react";

const RightPanel = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
    className="w-[28rem] flex-shrink-0 bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-6 overflow-y-auto max-h-[calc(100dvh-8rem)]"
  >
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-[2rem] border border-white/5">
        <h3 className="text-sm font-medium tracking-wide mb-3 text-gray-300">Library Overview</h3>
        
        <div className="flex items-center justify-between mb-3">
          <Icons.GameController size={16} className="text-gray-500" />
          <span className="text-[12px] font-semibold tracking-wide">127 Games</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <Icons.ClockPlay size={16} className="text-gray-500" />
          <span className="text-[12px] font-semibold tracking-wide">342 Hours</span>
        </div>
        
        <div className="flex items-center justify-between">
          <Icons.Award size={16} className="text-gray-500" />
          <span className="text-[12px] font-semibold tracking-wide">89 Achievements</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-medium tracking-wide mb-3 text-gray-300 uppercase border-b border-white/5 pb-2">Recent</h3>
        <div className="space-y-1">
          {[
            { title: "Neon Protocol", type: "Playing Now" },
            { title: "Stellar Vanguard", type: "Paused Yesterday" },
            { title: "Eternal Horizon", type: "Played 3 days ago" }
          ].map((activity, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-pointer"
            >
              <span className="text-sm">{activity.title}</span>
              <Icons.Info size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div>
        <h3 className="text-sm font-medium tracking-wide mb-3 text-gray-300 uppercase border-b border-white/5 pb-2">Top Genres</h3>
        <div className="space-y-1.5">
          {["RPG", "Strategy", "Action", "Sci-Fi"].map((genre, i) => (
            <motion.div 
              key={genre} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg text-sm bg-white/[0.03] border border-white/5"
            >
              <span>{genre}</span>
              <div className="flex items-center gap-1">
                <div className="w-[3rem] h-[0.25rem] rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" 
                    style={{ width: `${100 - i * 15}%` }} 
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Storage */}
      <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/5 text-center">
        <p className="text-xs text-gray-600 mb-1">Storage Used</p>
        <motion.div 
          layoutId="storage" className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden"
        >
          <div className="h-full w-[2/3] rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
        </motion.div>
      </div>
    </div>
  </motion.div>
);

export default RightPanel;
