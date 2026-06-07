import React, { useState } from 'react';
import { createRenderer, render } from 'kysely/dist/cjs/test-utils';
import Layout from './Layout';
import Home from './pages/HomePage';
import Dashboard from './pages/DashboardPage';
import Socials from './pages/SocialsPage';
import Friends from './pages/FriendsPage';
import Profile from './pages/ProfilePage';
import Settings from './pages/SettingsPage';

const App = () => {
  const [activePage, setActivePage] = useState('home');
  const sidebarVisible = activePage !== 'settings';

  return (
    <Layout>
      {activePage === 'home' && <Home />}
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'socials' && <Socials />}
      {activePage === 'friends' && <Friends />}
      {activePage === 'profile' && <Profile />}
      {activePage === 'settings' && <Settings />}
    </Layout>
  );
};

export default App;
