import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "@radix-ui/react-icons";
import { Routes, Route } from "react-router-dom";
import WelcomeScreen from "./pages/WelcomeScreen.jsx";
import GameLibrary from "./pages/GameLibrary";
import RightPanel from "./pages/RightPanel.jsx";
import Settings from "./pages/Settings.jsx";

const App = () => {
  const location = useLocation();
  const isLibraryRoute = location.pathname === "/library";
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading) {
      window.send("state-changed", {});
    }
  }, [isLoading, location.pathname]);

  const featuresData = [
    { id: "dashboard", icon: <Icons.Hexagon size={16} />, label: "Dashboard", desc: "Overview & stats" },
    { id: "games", icon: <Icons.FilmStrip size={16} />, label: "My Games", desc: "Your game collection" },
    { id: "library", icon: <Icons.Library size={16} />, label: "Library", desc: "Browse all games" },
    { id: "settings", icon: <Icons.Cog size={16} />, label: "Settings", desc: "Configure app" }
  ];

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[2.5rem] max-w-sm text-center border border-rose-500/20 bg-[#1a1b26]/90 shadow-[0_32px_72px_rgba(0,0,0,0.3)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
            <Icons.WarningCircle size={28} className="text-rose-400" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-gray-100 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error.message || "An unexpected error occurred"}</p>
          <button onClick={() => setError(null)} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all border border-white/10 text-sm font-medium">
            Dismiss
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white relative overflow-hidden">
      {/* Ambient Background Effects */}
      <motion.div 
        className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ zIndex: -1 }}
      />
      <motion.div 
        className="fixed top-1/3 right-[5%] w-[350px] h-[350px] bg-gradient-to-tr from-purple-500/8 to-pink-500/6 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], x: [20, -20, 20] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ zIndex: -1 }}
      />

      {/* Window Controls */}
      <nav className="fixed top-4 left-4 right-4 z-[9999]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 p-1.5 bg-white/[0.06] rounded-xl backdrop-blur-lg"
        >
          <button onClick={() => window.send("minimize", {})} className="p-2 rounded-xl hover:bg-white/[0.06] active:scale-[0.98] transition-all text-gray-400 hover:text-gray-200">
            <Icons.Minus size={16} />
          </button>
          <button onClick={() => window.send("request-maximize", {})} className="p-2 rounded-xl hover:bg-white/[0.06] active:scale-[0.98] transition-all text-gray-400 hover:text-gray-200">
            <Icons.SquareExpand size={16} />
          </button>
          <button onClick={() => window.send("request-close", {})} className="p-2 rounded-xl hover:bg-rose-500/80 active:scale-[0.98] transition-all text-gray-400 hover:text-white group">
            <Icons.XCircle size={16} className="text-rose-400" />
          </button>
        </motion.div>
      </nav>

      {/* Main Content */}
      <main className={`flex p-6 pt-[89px] ${isLibraryRoute ? '' : 'flex-col gap-5'} transition-all duration-500`} style={{ minHeight: 'calc(100dvh - 7rem)' }}>
        <AnimatePresence mode="wait">
          <Routes key={location.pathname} location={location}>
            <Route path="/" element={<WelcomeScreen featuresData={featuresData}/>} />
            <Route path="/library" element={<div className="flex-1 flex gap-6 overflow-hidden h-full min-h-[500px]"><GameLibrary /><RightPanel /></div>} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-[#181926]/60 backdrop-blur-sm z-[9998]"
          >
            <motion.div 
              animate={{ scale: [0.5, 1, 1] }} transition={{ duration: 0.3 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_32px_64px_rgba(99,102,241,0.25)]"
            >
              <motion.div 
                animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 text-white rounded-full border-2 border-cyan-400/50 border-t-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        ::selection { background-color: #6366f1; color: white; }
        button:active { transform: translateY(1px); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default App;
