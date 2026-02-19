import React from 'react';

// Button
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, style, type = 'button', ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    borderRadius: '8px', fontWeight: '500', transition: 'all 0.15s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none', fontFamily: 'inherit',
  };
  const sizes = {
    sm: { padding: '5px 10px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '11px 22px', fontSize: '15px' },
  };
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--amber), var(--amber-dark))',
      color: '#fff',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: '#7f1d1d',
      color: '#fca5a5',
      border: '1px solid #991b1b',
    },
    success: {
      background: '#14532d',
      color: '#86efac',
      border: '1px solid #166534',
    },
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

// Card
export function Card({ children, style, onClick, hover = false }) {
  const [isHover, setIsHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={hover ? () => setIsHover(true) : undefined}
      onMouseLeave={hover ? () => setIsHover(false) : undefined}
      style={{
        background: isHover ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
        transform: isHover && hover ? 'translateY(-2px)' : 'none',
        boxShadow: isHover && hover ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Input
export function Input({ label, error, style, containerStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {label}
        </label>
      )}
      <input
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          padding: '8px 12px',
          fontSize: '14px',
          width: '100%',
          transition: 'border-color 0.15s',
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '11px', color: 'var(--error)' }}>{error}</span>}
    </div>
  );
}

// Textarea
export function Textarea({ label, error, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          padding: '8px 12px',
          fontSize: '14px',
          resize: 'vertical',
          minHeight: '80px',
          width: '100%',
          ...style,
        }}
        {...props}
      />
    </div>
  );
}

// Select
export function Select({ label, error, children, style, containerStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {label}
        </label>
      )}
      <select
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          padding: '8px 12px',
          fontSize: '14px',
          width: '100%',
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children, width = '560px' }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Badge
export function Badge({ children, color = 'var(--amber)', bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '99px',
      fontSize: '11px', fontWeight: '600',
      color: color,
      background: bg || `${color}20`,
      border: `1px solid ${color}40`,
    }}>
      {children}
    </span>
  );
}

// Score display
export function ScoreBadge({ score }) {
  if (!score) return <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Not rated</span>;
  const color = score >= 95 ? '#FFD700' : score >= 90 ? '#F0A832' : score >= 85 ? '#C8860A' : score >= 80 ? '#8B6914' : '#7A6040';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '44px', height: '44px', borderRadius: '50%',
      border: `2px solid ${color}`,
      color: color, fontWeight: '700', fontSize: '14px',
      background: `${color}15`,
    }}>
      {score}
    </div>
  );
}

// Fill Level Bar
export function FillLevelBar({ level = 100, showLabel = true }) {
  const color = level > 60 ? 'var(--amber)' : level > 30 ? 'var(--warning)' : 'var(--error)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '100%', height: '6px',
        background: 'var(--bg-input)',
        borderRadius: '3px', overflow: 'hidden',
      }}>
        <div style={{
          width: `${level}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
          borderRadius: '3px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {level}%
        </span>
      )}
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', gap: '16px',
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: '48px' }}>{icon || '🥃'}</div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{title}</h3>
        {description && <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

// Stat card
export function StatCard({ label, value, sub, icon, color = 'var(--amber)' }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color, lineHeight: 1.2 }}>{value}</div>
          {sub && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width: '40px', height: '40px',
            background: `${color}18`,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Tabs
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: '4px',
      background: 'var(--bg-input)',
      borderRadius: '10px', padding: '4px',
      width: 'fit-content',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          style={{
            padding: '6px 16px', borderRadius: '7px',
            background: active === tab.value ? 'var(--bg-card)' : 'transparent',
            color: active === tab.value ? 'var(--amber-light)' : 'var(--text-muted)',
            fontWeight: active === tab.value ? '600' : '400',
            border: active === tab.value ? '1px solid var(--border)' : '1px solid transparent',
            fontSize: '13px',
            transition: 'all 0.15s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
