import { createContext, useContext, useState, useEffect } from 'react';
const ElectronContext = createContext();

export function useElectron() {
  const context = useContext(ElectronContext);
  if (!context) {
    throw new Error('useElectron must be used within an ElectronProvider');
  }
  return context;
}

export function ElectronProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [platform, setPlatform] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (typeof window.electronAPI === 'undefined') {
      console.log('Electron API not available - running in browser');
      return;
    }

    window.electronAPI.getPlatform().then(setPlatform);
    window.electronAPI.getUserInfo().then(setUserInfo);
    setIsReady(true);
  }, []);

  const theme = 'dark';

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    } else {
      document.querySelector('body')?.blur();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <ElectronContext.Provider value={{ theme, handleMinimize, handleMaximize, handleClose }}>
      {isReady ? children : null}
    </ElectronContext.Provider>
  );
}
