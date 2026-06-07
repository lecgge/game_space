import { motion } from "framer-motion";
import { MagnifyingGlass as SearchIcon, BellSquare } from "@phosphor-icons/react";

const HEADER_HEIGHT = 44;

export const HeaderBar = ({ onClose }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <motion.div 
      className="h-14 px-6 flex-shrink-0 flex items-center gap-2 justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl select-none overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search Section */}
      <motion.div className="flex items-center gap-2 min-w-fit" variants={containerVariants.children}>
        <div className="w-[1px] h-6 bg-white/10 mr-2" />

        <div 
          className="relative group rounded-lg overflow-hidden transition-all duration-300 hover:bg-white/[0.04]"
          style={{ animation: "fadeInUp 0.5s ease-out backwards" }}
        >
          <SearchIcon 
            size={12} 
            strokeWidth={1.5} 
            className="text-white/40 absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 group-hover:text-white/20 group-hover:scale-110"
          />
          <input 
            type="text"
            placeholder="Search games, settings, profiles..."
            className="!w-[260px] bg-transparent border-none outline-none text-[11px] text-white/70 ml-8 placeholder:text-white/30 transition-all duration-200 focus:placeholder:text-white/40 group-hover:w-[290px]"
          />
        </div>
      </motion.div>

      {/* Right Actions */}
      <motion.div className="flex items-center gap-1" variants={containerVariants.children}>
        {/* Notification Bell */}
        <motion.button 
          className="w-[28px] h-[28px] flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/60 transition-all duration-200"
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.97 }}
        >
          <BellSquare size={14} strokeWidth={1.5} />
        </motion.button>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {/* Close Button */}
        <motion.button 
          onClick={onClose}
          className="group relative w-[28px] h-[28px] flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-white/[0.07] hover:via-white/[0.15] hover:to-white/[0.05]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-[-1px] rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <motion.svg 
            width={16} 
            height={16} 
            viewBox="0 0 24 24" 
            fill="none"
            className="text-white/50 group-hover:text-white transition-all duration-200"
          >
            <path 
              d="M6 18L18 6M6 6H13V9M18 18L15 15V18M18 6V12L21 9M6 6V12L9 9" 
              stroke="currentColor" 
              strokeWidth={1.5} 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </motion.div>
  );
};
