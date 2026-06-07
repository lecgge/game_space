import React from "react";
import * as Icons from "@radix-ui/react-icons";

const HomePage = () => {
  const stats = [
    { label: "Total Games", value: 127, icon: <Icons.GameController size={16} />, color: "from-cyan-500/20 to-purple-500/20" },
    { label: "Hours Played", value: "342", icon: <Icons.ClockPlay size={16} />, color: "from-cyan-500/20 to-blue-500/20" },
    { label: "Achievements", value: 89, icon: <Icons.Award size={16} />, color: "from-yellow-500/20 to-orange-500/20" },
    { label: "Recent Updates", value: 12, icon: <Icons.GlobeSimple size={16} />, color: "from-purple-500/20 to-pink-500/20" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group cursor-default"
          >
            <div className="flex items-center gap-3">
              <span className={`w-[2.5rem] h-[2.5rem] rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                {React.cloneElement(stat.icon, { size: 14, className: "" })}
              </span>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="font-bold tracking-wide text-lg">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold tracking-tight">Welcome Back</h3>
          <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all">View All</button>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-gray-500 px-2 leading-relaxed pb-6"
        >
          Your game collection is ready to browse. Select the library icon from the left panel and choose a title to begin playing. Use the search bar or quick filters at the top to find your favorite games in moments.
        </motion.p>

        {/* Empty state placeholder - waiting for library content */}
        <div className="p-8 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-dashed border-white/10">
          <Icons.Library size={32} className="mx-auto text-gray-600 mb-4" />
          <p className="text-center text-sm text-gray-600">Your game library will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;