import { motion } from "framer-motion";
import { Bell, ChevronDown, CreditCard, ShieldCheck, Mail } from "@phosphor-icons/react";

export const ProfilePage = ({ sidebarVisible, setSidebarVisible }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0c15]">
      {/* Navigation Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="h-[48px] px-8 flex items-center gap-4 justify-end border-b border-white/10 relative"
      >
        {/* Right Actions */}
        <motion.div 
          className="flex items-center gap-2 pr-2"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15, staggerChildren: 0.08 }}
        >
          {/* Notification Button */}
          <motion.button
            className="relative w-[36px] h-[36px] flex items-center justify-center rounded-lg hover:bg-white/[0.04] text-white/60 transition-all duration-200"
            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
            whileTap={{ scale: 0.98 }}
          >
            <Bell size={16} strokeWidth={1.5} />
            {/* Badge */}
            <motion.div 
              className="absolute top-0 right-0 w-[10px] h-[10px] rounded-full bg-gradient-to-r from-red-500 to-orange-500 border-2 border-black"
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* Divider */}
          <div className="w-[1px] h-5 bg-white/10 mx-1" />

          {/* Profile Dropdown Trigger */}
          <button 
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="group w-[32px] h-[32px] flex items-center justify-center rounded-lg hover:bg-gradient-to-br hover:from-white/[0.05] hover:via-white/[0.1] hover:to-white/[0.03] transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 24 24" 
              fill="none"
              className="text-white/50 group-hover:text-white transition-all duration-300"
            >
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 21v-2a6 6 0 0 1 12 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>

        {/* Decorative Background Element */}
        <div 
          className="absolute inset-0 -z-1 overflow-hidden rounded-t-[2rem]"
          style={{ opacity: 0.7 }}
        >
          <motion.div 
            className="w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-t-full -top-1/2 -left-1/4 absolute blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <main className="p-8 max-w-[1920px] mx-auto">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-end justify-between mb-8">
            <motion.div 
              className="relative pt-[34px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Avatar with Glow */}
              <div className="relative z-10">
                <motion.div 
                  className="w-[200px] h-[200px] rounded-[3rem] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 border-4 border-[#0a0c15] shadow-[0_0_60px_rgba(59,130,246,0.15)] overflow-hidden relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* Inner Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  
                  {/* Avatar Content Placeholder */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div 
                      className="text-[8rem] font-light text-white/20 select-none"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      GS
                    </motion.div>
                  </div>
                </motion.div>

                {/* Shadow Glow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[180px] h-8 bg-black blur-2xl opacity-70" />
              </div>

              {/* Name & Status */}
              <motion.div 
                className="mt-6 pl-4 border-l-[3px] border-white/20 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-4xl font-light tracking-tight text-white mb-2">
                  <motion.span 
                    className="bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Alex Chen
                  </motion.span>
                </h1>
                <motion.div 
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="w-[9px] h-[9px] rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                  <span className="text-white/60">Online in GameSpace Beta</span>
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex gap-3 mt-8"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.85, staggerChildren: 0.05 }}
              >
                <motion.button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium hover:shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-shadow duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Profile
                </motion.button>

                <motion.button
                  className="w-14 h-14 rounded-xl border-2 border-white/20 flex items-center justify-center hover:border-white/50 hover:bg-white/[0.03] transition-all duration-200 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M12 5v14M5 12h14" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Account Status Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 group cursor-pointer"
            >
              <motion.div 
                className="flex items-center gap-4 mb-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck size={24} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Account Status</p>
                  <h3 className="text-lg font-light tracking-tight text-white">Premium Active</h3>
                </div>
              </motion.div>

              <motion.p 
                className="text-xs text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Expires Dec 24, 2025 • Renewal pending
              </motion.p>
            </motion.div>

            {/* Payment Method Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 group cursor-pointer"
            >
              <motion.div 
                className="flex items-center gap-4 mb-3"
                whileHover={{ scale: 1.02 }}
              >
                <CreditCard size={28} className="text-white/90 mr-[-4px]" />
                <div>
                  <p className="text-sm text-white/50 mb-1">Payment Method</p>
                  <h3 className="text-lg font-light tracking-tight text-white">****4582</h3>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                <ShieldCheck size={14} className="text-white/30" />
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Verified</span>
              </motion.div>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-5 rounded-2xl border border-white/10 backdrop-blur-sm bg-gradient-to-br from-white/[0.01] via-white/[0.02] to-transparent hover:border-white/20 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <MotionAvatar />
                  <div>
                    <p className="text-sm text-white/50 mb-1">Email Address</p>
                    <h3 className="text-lg font-light tracking-tight text-white max-w-[130px] truncate">
                      alex.chen@game.dev
                    </h3>
                  </div>
                </motion.div>

                <span className="w-[26px] h-[26px] bg-gradient-to-r from-blue-500/20 to-blue-600/10 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-blue-500/30 transition-colors duration-200">
                  <Mail size={18} className="text-white/40 group-hover:text-white transition-all duration-300" />
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Games Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl tracking-tight text-white font-medium">Recent Games</h2>
            <motion.button 
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">View All</span>
              <motion.span animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ChevronDown size={14} />
              </motion.span>
            </motion.button>
          </div>

          {/* Game List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Cyber Odyssey", "Stellar Frontiers", "Shadow Realms"].map((game, index) => (
              <motion.div 
                key={game}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-5 rounded-xl bg-[#0f121d] border border-white/10 hover:border-blue-500/40 hover:bg-gradient-to-br hover:from-blue-900/5 hover:via-purple-900/5 hover:to-blue-900/5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Background Gradient Orb */}
                <div 
                  className="absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:via-purple-500/20"
                  style={{ mixBlendMode: 'screen' }}
                />

                {/* Game Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-medium tracking-tight text-white mb-1 group-hover:text-blue-400 transition-colors duration-200">
                    {game}
                  </h3>
                  <p className="text-sm text-white/50">{index === 0 ? 'Last played 2h ago' : index === 1 ? 'Last played yesterday' : 'Last played 3 days ago'}</p>

                  {/* Action Line */}
                  <motion.div 
                    className="mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  />

                  {/* Play Button */}
                  <motion.button 
                    className="mt-4 w-full py-3 rounded-xl border border-white/10 bg-white/[0.02] group-hover:bg-gradient-to-r group-hover:from-blue-600/30 group-hover:to-purple-600/30 group-hover:border-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span 
                      className="text-sm text-white/60 group-hover:text-blue-400 transition-colors duration-300"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Play Game
                    </motion.span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Decorative Bottom Element */}
        <motion.div 
          className="mt-12 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div 
            className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
          />
        </motion.div>
      </main>

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

const MotionAvatar = () => (
  <motion.div 
    className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center"
    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
    transition={{ repeat: Infinity, duration: 40 }}
  >
    <div className="w-full h-full rounded-full overflow-hidden">
      <div className="text-[0.6rem] text-white/80 font-medium select-none uppercase">
        AC
      </div>
    </div>

    {/* Avatar Ring */}
    <div 
      className="absolute inset-0 rounded-full border border-blue-500/20 group-hover:border-blue-500/50 transition-colors duration-300"
      style={{ animation: "pulse-rim 6s ease-in-out infinite" }}
    />

    {/* Ring Shadow */}
    <motion.div 
      className="absolute -inset-1 rounded-full bg-blue-500/10 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300"
      whileHover={{ scale: 1.1 }}
    />

    {/* Ring Gradient */}
    <div className="absolute -inset-[2px] rounded-full w-[58%] h-[56%] bg-gradient-to-tr from-black via-transparent to-black opacity-30" />
  </motion.div>
);
