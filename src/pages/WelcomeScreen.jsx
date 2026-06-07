import React from "react";
import { motion } from "framer-motion";
import * as Icons from "@radix-ui/react-icons";

const WelcomeScreen = ({ featuresData }) => {
  const handleNavigation = (route, path) => {
    if (path) window.send("set-page", path);
    else window.send(`navigate-to-${route}`, {});
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex-1 flex flex-col justify-center items-center gap-8 p-6 overflow-hidden"
    >
      <div className="flex flex-col gap-4 w-full max-w-xl text-center">
        <motion.div 
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 80, damping: 18 }}
          className="flex items-center justify-center gap-4"
        >
          <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center shadow-[0_32px_80px_rgba(99,102,241,0.15)] border border-white/5">
            <Icons.ZapBallLightning size={64} className="text-gradient to-purple-500" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' }} />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold tracking-tight"
        >
          Your Game Library Awaits
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-lg text-gray-500 leading-relaxed max-w-md mx-auto"
        >
          Select an option to get started or continue exploring your collection
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 mt-4"
        >
          {featuresData.map((feature, index) => (
            <motion.button
              key={feature.id} onClick={() => handleNavigation(feature.id)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ transitionDelay: `${index * 50 + 0.2}s` }}
              className="relative p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/5 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  {React.cloneElement(feature.icon, { size: 18 })}
                </span>
                <div>
                  <p className="font-medium text-gray-200">{feature.label}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.main>
  );
};

export default WelcomeScreen;
