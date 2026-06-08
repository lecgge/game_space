import React from 'react';
import { Outlet } from 'react-router-dom';
import TitleBar from './TitleBar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-bg-deep overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="ambient-glow absolute w-[500px] h-[500px] top-[-100px] left-[-100px] bg-accent/[0.04]" />
      <div className="ambient-glow absolute w-[400px] h-[400px] bottom-[-50px] right-[-50px] bg-cta/[0.03]" />

      <TitleBar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '48px 56px 56px 56px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}