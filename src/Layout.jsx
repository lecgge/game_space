import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import TitleBar from './components/TitleBar';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[100dvh]">
      <TitleBar />
      <HeaderBar onNavigate={navigate} />
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}