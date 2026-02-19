import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { Card, StatCard, Button } from '../components/ui';

const COLORS = ['#C8860A', '#F0A832', '#FFD700', '#8B4513', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || 'var(--amber)', fontWeight: '600' }}>
          {entry.name}: {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{suffix}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!stats) return null;

  const { summary, by_region, by_type, spend_by_month, cost_per_pour, gain_loss, top_flavors, by_status } = stats;

  const statusData = by_status.map(s => ({ name: s.status, value: s.count }));
  const regionData = by_region.map(r => ({ name: r.region, bottles: r.count, value: Math.round(r.value) }));
  const typeData = by_type.slice(0, 6);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Deep dive into your collection</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => api.exportCsv()}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard label="Total Bottles" value={summary.total_bottles} icon={<span>🍾</span>} color="var(--amber)" />
        <StatCard label="Collection Value" value={formatCurrency(summary.total_value)} icon={<TrendingUp size={18} />} color="#4CAF50" />
        <StatCard label="Total Spent" value={formatCurrency(summary.total_cost)} icon={<span>💰</span>} color="var(--amber)" />
        <StatCard
          label="Unrealized Gain"
          value={formatCurrency(summary.unrealized_gain)}
          sub={`${summary.total_cost > 0 ? ((summary.unrealized_gain / summary.total_cost) * 100).toFixed(1) : 0}% return`}
          icon={<span>{summary.unrealized_gain >= 0 ? '📈' : '📉'}</span>}
          color={summary.unrealized_gain >= 0 ? '#4CAF50' : 'var(--error)'}
        />
        <StatCard label="Avg Score" value={summary.avg_score ? `${summary.avg_score}/100` : '—'} icon={<span>⭐</span>} color="#FFD700" />
        <StatCard label="Tastings Logged" value={summary.total_tastings} icon={<span>📓</span>} color="var(--amber)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Collection by status - donut */}
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Collection Status</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={72}
                  dataKey="value" nameKey="name"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {statusData.map((entry, i) => (
                <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                    {entry.name}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS[i % COLORS.length] }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* By region bar */}
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Bottles by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bottles" name="Bottles" fill="var(--amber)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Spend over time */}
      {spend_by_month.length > 0 && (
        <Card style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Monthly Spend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={spend_by_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Line type="monotone" dataKey="spend" name="Spend" stroke="var(--amber)" strokeWidth={2} dot={{ fill: 'var(--amber)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Value by region */}
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Value by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData} barSize={24} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Bar dataKey="value" name="Value" fill="#4CAF50" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Type breakdown */}
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>By Spirit Type</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={60} dataKey="count" nameKey="type">
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {typeData.map((entry, i) => (
                <div key={entry.type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                    {entry.type}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS[i % COLORS.length] }}>{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Gain/Loss table */}
      {gain_loss.length > 0 && (
        <Card style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Top Value Bottles (Gain/Loss)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Bottle', 'Distillery', 'Paid', 'Current Value', 'Gain/Loss'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 12px', fontSize: '11px',
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                      borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gain_loss.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{row.name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>{row.distillery}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{formatCurrency(row.purchase_price)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{formatCurrency(row.current_value)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: row.gain_loss >= 0 ? '#4CAF50' : 'var(--error)' }}>
                      {row.gain_loss >= 0 ? '+' : ''}{formatCurrency(row.gain_loss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cost per pour */}
      {cost_per_pour.length > 0 && (
        <Card style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Cost Per Pour (Open Bottles)</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {cost_per_pour.map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', background: 'var(--bg-input)', borderRadius: '8px',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '20px' }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{row.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {row.distillery} · {row.pour_count} pour{row.pour_count !== 1 ? 's' : ''} logged
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--amber)' }}>
                    {row.cost_per_pour ? formatCurrency(row.cost_per_pour) : '—'}<span style={{ fontSize: '11px', fontWeight: 400 }}>/oz</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Flavor cloud */}
      {top_flavors.length > 0 && (
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Favorite Flavors</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {top_flavors.map(({ tag, count }) => {
              const size = 11 + count * 2;
              return (
                <div key={tag} style={{
                  padding: '5px 12px', borderRadius: '99px',
                  background: `rgba(200,134,10,${Math.min(0.1 + count * 0.06, 0.5)})`,
                  border: '1px solid var(--border)',
                  fontSize: `${Math.min(size, 18)}px`,
                  color: 'var(--amber-light)',
                  fontWeight: count > 3 ? '700' : count > 1 ? '600' : '400',
                }}>
                  {tag}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
