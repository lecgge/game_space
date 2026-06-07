import { motion } from 'framer-motion';

const ElectronWindowFrame = ({ children }) => {
  const handleMinimize = () => {
    window.electronAPI?.send('MINIMIZE_WINDOW');
  };

  const handleMaximize = () => {
    window.electronAPI?.send('MAXIMIZE_WINDOW');
  };

  const handleClose = () => {
    window.electronAPI?.send('CLOSE_APPLICATION', {});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='relative w-[800px] md:w-[90vw] h-[500px] md:h-[85vh]'
    >
      <div className="flex flex-col rounded-[2.5rem] overflow-hidden border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
        <div className="bg-black/20 px-4 py-3 flex items-center justify-between group cursor-default select-none">
          <div className='flex items-center gap-3'>
            <span className="text-sm font-medium text-gray-300">Game Space</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 transition-colors" onClick={handleMinimize}>─</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 transition-colors" onClick={handleMaximize}>✕</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-400 transition-colors" onClick={handleClose}>×</button>
          </div>
        </div>
        <div className="flex-1 relative bg-[#030518]/50">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default ElectronWindowFrame;
