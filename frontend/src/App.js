import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import BottleDetail from './pages/BottleDetail';
import BottleForm from './pages/BottleForm';
import TastingLog from './pages/TastingLog';
import Wishlist from './pages/Wishlist';
import Analytics from './pages/Analytics';

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#4CAF50', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f44336', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/collection" element={<Layout><Collection /></Layout>} />
        <Route path="/collection/add" element={<Layout><BottleForm /></Layout>} />
        <Route path="/collection/:id" element={<Layout><BottleDetail /></Layout>} />
        <Route path="/collection/:id/edit" element={<Layout><BottleForm /></Layout>} />
        <Route path="/tastings" element={<Layout><TastingLog /></Layout>} />
        <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
