import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, DollarSign, Star, BookOpen, TrendingUp, TrendingDown, Download
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, scoreColor } from '../utils/formatters';
import { Card, StatCard, Button, Badge, ScoreBadge } from '../components/ui';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );

  if (!stats) return null;

  const { summary, by_status, by_region, top_rated, recent_tastings, top_flavors, gain_loss } = stats;
  const gainPct = summary.total_cost > 0
    ? ((summary.unrealized_gain / summary.total_cost) * 100).toFixed(1)
    : 0;

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Bourbon Vault</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Your premium spirits collection</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={() => api.exportCsv()}>
            <Download size={14} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => navigate('/collection/add')}>
            + Add Bottle
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Active Bottles"
          value={summary.total_bottles}
          sub="In collection"
          icon={<Package size={18} />}
          color="var(--amber)"
        />
        <StatCard
          label="Collection Value"
          value={formatCurrency(summary.total_value)}
          sub={`Cost: ${formatCurrency(summary.total_cost)}`}
          icon={<DollarSign size={18} />}
          color="#4CAF50"
        />
        <StatCard
          label="Unrealized Gain"
          value={formatCurrency(summary.unrealized_gain)}
          sub={`${gainPct > 0 ? '+' : ''}${gainPct}% vs cost`}
          icon={summary.unrealized_gain >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          color={summary.unrealized_gain >= 0 ? '#4CAF50' : 'var(--error)'}
        />
        <StatCard
          label="Avg Score"
          value={summary.avg_score ? `${summary.avg_score}/100` : '—'}
          sub={`${summary.total_tastings} tasting sessions`}
          icon={<Star size={18} />}
          color="#FFD700"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Collection status breakdown */}
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Collection Status</h3>
          {by_status.map(({ status, count }) => {
            const colors = { sealed: '#4CAF50', open: '#F0A832', finished: '#7A6040', traded: '#2196F3', gifted: '#9C27B0' };
            const color = colors[status] || '#7A6040';
            const pct = summary.total_bottles > 0 ? Math.round((count / (summary.total_bottles + (by_status.find(s => s.status === 'finished')?.count || 0))) * 100) : 0;
            return (
              <div key={status} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{status}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color }}>{count}</span>
                </div>
                <div style={{ height: '5px', background: 'var(--bg-input)', borderRadius: '3px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* By region */}
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>By Region</h3>
          {by_region.map(({ region, count, value }) => (
            <div key={region} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>
                  {region === 'Kentucky' ? '🥃' : region === 'Japanese' ? '🗾' :
                   region === 'Scotch' ? '🏴󠁢󠁳󠁣󠁴󠁿' : region === 'Tennessee' ? '🎸' : '🌍'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{region}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{count} btl</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--amber)' }}>
                  {formatCurrency(value)}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Top rated */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px' }}>Top Rated Bottles</h3>
            <Star size={16} style={{ color: '#FFD700' }} />
          </div>
          {top_rated.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No rated bottles yet. Add tasting notes!</p>
          ) : top_rated.map((bottle, i) => (
            <div key={bottle.name} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', width: '16px' }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{bottle.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bottle.distillery}</div>
              </div>
              <div style={{
                padding: '2px 10px', borderRadius: '99px',
                background: `${scoreColor(bottle.avg_score)}20`,
                border: `1px solid ${scoreColor(bottle.avg_score)}40`,
                fontSize: '13px', fontWeight: '700',
                color: scoreColor(bottle.avg_score),
              }}>
                {Math.round(bottle.avg_score)}
              </div>
            </div>
          ))}
        </Card>

        {/* Top flavors */}
        <Card>
          <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Flavor Profile</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {top_flavors.map(({ tag, count }) => (
              <div key={tag} style={{
                padding: '4px 10px', borderRadius: '99px',
                background: `rgba(200,134,10,${Math.min(0.15 + count * 0.04, 0.5)})`,
                border: '1px solid var(--border)',
                fontSize: '12px', color: 'var(--amber-light)',
                fontWeight: count > 2 ? '600' : '400',
              }}>
                {tag} <span style={{ color: 'var(--text-muted)' }}>×{count}</span>
              </div>
            ))}
            {top_flavors.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add tasting notes to see your flavor profile</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent tastings */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px' }}>Recent Tastings</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tastings')}>View all</Button>
        </div>
        {recent_tastings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No tasting sessions logged yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {recent_tastings.map(tasting => (
              <div key={tasting.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px', background: 'var(--bg-input)', borderRadius: '10px',
              }}>
                <ScoreBadge score={tasting.score} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {tasting.bottle_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {tasting.distillery} · {formatDate(tasting.tasting_date)}
                    {tasting.occasion && ` · ${tasting.occasion}`}
                  </div>
                  {tasting.overall_notes && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      "{tasting.overall_notes.slice(0, 80)}{tasting.overall_notes.length > 80 ? '…' : ''}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
