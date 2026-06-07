import React, { useState } from "react";
import { useHotkeys } from "react-hot-keys";
import * as Icons from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  
  const tabs = [
    { id: "general", label: "General", icon: <Icons.Cog size={16} /> },
    { id: "appearance", label: "Appearance", icon: <Icons.PaintBucket size={16} /> },
    { id: "hotkeys", label: "Hotkeys", icon: <Icons.Keyboard size={16} /> },
    { id: "about", label: "About", icon: <Icons.Info size={16} /> }
  ];

  useHotkeys("ctrl+k,escape", () => window.send("window-focus-request"), {}, [activeTab]);
  useHotkeys("cmd+.,control+.", () => window.send("app-restart"), false, { enabled: activeTab === "general" });
  
  const handleChange = (key, value) => {
    window.send("settings-change", { key, value });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
          <p className="text-gray-400">Configure application preferences and options</p>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
          onClick={() => window.send("open-settings-panel", {})}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2 text-sm"
        >
          <Icons.RefreshCcw size={16} /> Reset Default
        </motion.button>
      </div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
              activeTab === tab.id 
                ? "bg-white/10 text-white border border-white/20" 
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={tab.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
              >
                {tab.icon}
              </motion.span>
            </AnimatePresence>
            <span className="font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <div className="grid grid-cols-[1fr_200px] gap-8 items-start">
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <div key="general" className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-400">App Window Title</label>
                  <span className="text-xs text-cyan-500"><Icons.Keyboard size={12} /> Press Ctrl+K to restore focus</span>
                </div>
                <input 
                  type="text" value="GameSpace - Game Library" onChange={(e) => handleChange("appTitle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/20 focus:border-cyan-500/50 outline-none transition-all text-white"
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              >
                <label className="block mb-3 text-sm font-medium text-gray-400">Notifications</label>
                <div 
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-full h-[2.5rem] rounded-xl cursor-pointer select-none flex items-center p-1 transition-colors ${notifications ? "bg-white/10" : "bg-transparent hover:bg-white/3"}`}
                >
                  <div 
                    onClick={e => e.stopPropagation()} style={{ width: `${notifications ? '100%' : '0%'}` }} className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
                  <motion.div 
                    animate={{ x: notifications ? 36 : 4, width: `${notifications ? '100%' : '50%'}` }} className="absolute bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[0.9rem] shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  />
                  <div className="relative z-10 flex justify-between w-full px-3">
                    <span style={{ opacity: notifications ? 1 : 0.5 }}>Enable</span>
                    <span style={{ opacity: !notifications ? 1 : 0.5 }}>
                      <Icons.X size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div>
                  <p className="font-medium">Auto-start on boot</p>
                  <p className="text-xs text-gray-500 mt-1">Launch GameSpace when Windows starts</p>
                </div>
                <button 
                  onClick={() => setAutoStart(!autoStart)}
                  style={{ width: '4rem', height: '2.5rem' }}
                  className={`relative rounded-lg transition-colors ${autoStart ? "bg-gradient-to-r from-cyan-500 to-purple-600" : "bg-white/[0.1] hover:bg-white/[0.2]"}`}
                >
                  <div style={{ width: `${autoStart ? '4rem' : '0rem'}`, height: '2.5rem', background: `linear-gradient(to right, ${autoStart ? '#6366f1' : 'rgba(99,102,241,0.1)'} left, rgba(99,102,241,0.1) right)` }} className="absolute inset-0 rounded-lg" />
                  <motion.div 
                    animate={{ x: autoStart ? '50%' : 0, width: `${autoStart ? '1rem' : '0rem'}` }} className="absolute top-1 left-1 w-[1.5rem] h-[1.75rem] bg-white rounded-md shadow-xl z-10"
                  />
                </button>
              </motion.div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div key="appearance" className="space-y-6">
              {/* Appearance settings would go here */}
              <p className="text-gray-500 p-4 rounded-xl text-center border border-white/10 bg-white/[0.05]">Theme options coming soon</p>
            </div>
          )}

          {activeTab === "hotkeys" && (
            <div key="hotkeys" className="space-y-6">
              {/* Hotkey settings would go here */}
            </div>
          )}

          {activeTab === "about" && (
            <div key="about" className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/5">
              <h3 className="text-lg font-semibold mb-2">GameSpace</h3>
              <p className="text-gray-500 text-sm leading-relaxed">An intelligent game launch manager with a beautiful, distraction-free interface.</p>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                <span className="text-xs text-gray-600">Version 1.0.0-alpha</span>
                <button onClick={() => alert("About dialog")} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all">
                  Check for Updates
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Sidebar Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <button onClick={() => window.send("restart-app", {})} className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2">
            <Icons.RefreshCcw size={18} /> Restart App
          </button>
          <button onClick={() => window.send("open-preferences-folder", {})} className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm">
            <Icons.Folder size={18} /> Open Preferences
          </button>
        </motion.div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <Icons.Info size={12} /> Built with Electron React · Press Ctrl+K to restore app focus
        </p>
      </div>
    </div>
  );
};

export default Settings;
