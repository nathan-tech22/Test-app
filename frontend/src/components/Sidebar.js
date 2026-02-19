import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Wine, Star, BarChart2, BookOpen,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/collection', label: 'Collection', icon: Package },
  { to: '/tastings', label: 'Tasting Log', icon: BookOpen },
  { to: '/wishlist', label: 'Wishlist', icon: Star },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          position: 'fixed', top: 12, left: 12, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--amber)', padding: '8px', borderRadius: '8px',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150,
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        width: collapsed ? '64px' : '220px',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '24px 20px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--amber), var(--amber-dark))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}>
            🥃
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '16px', fontWeight: '700',
                color: 'var(--amber-light)',
                lineHeight: 1.1,
              }}>Bourbon</div>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '13px', fontWeight: '400',
                color: 'var(--text-secondary)',
                lineHeight: 1.1,
              }}>Vault</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '10px 0' : '10px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? 'var(--amber-light)' : 'var(--text-secondary)',
                background: isActive ? 'var(--amber-glow)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--amber)' : '3px solid transparent',
                transition: 'all 0.15s',
                fontWeight: isActive ? '600' : '400',
                textDecoration: 'none',
              })}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span style={{ fontSize: '14px' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            margin: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
          aside {
            position: fixed !important;
            left: ${mobileOpen ? '0' : '-240px'} !important;
            height: 100vh !important;
            top: 0 !important;
            width: 220px !important;
            transition: left 0.25s ease !important;
            z-index: 160 !important;
          }
        }
      `}</style>
    </>
  );
}
