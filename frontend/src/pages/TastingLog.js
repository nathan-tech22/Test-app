import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { api } from '../utils/api';
import { formatDate, scoreColor, scoreLabel } from '../utils/formatters';
import { Card, EmptyState, ScoreBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function TastingLog() {
  const [tastings, setTastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getTastings()
      .then(setTastings)
      .catch(() => toast.error('Failed to load tasting log'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Tasting Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{tastings.length} session{tastings.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <BookOpen size={28} style={{ color: 'var(--amber)' }} />
      </div>

      {tastings.length === 0 ? (
        <EmptyState
          icon="📓"
          title="No tasting sessions yet"
          description="Open a bottle in your collection and log your first tasting notes"
          action={<button onClick={() => navigate('/collection')} style={{
            background: 'linear-gradient(135deg, var(--amber), var(--amber-dark))',
            color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          }}>Browse Collection</button>}
        />
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {tastings.map(tasting => {
            const tags = tasting.flavor_tags ? JSON.parse(tasting.flavor_tags) : [];
            return (
              <div
                key={tasting.id}
                className="fade-in"
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '14px', overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-input)',
                }}>
                  <ScoreBadge score={tasting.score} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: '15px', fontWeight: '600', color: 'var(--amber-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => navigate(`/collection/${tasting.bottle_id}`)}
                    >
                      {tasting.bottle_name}
                      <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {tasting.distillery} · {formatDate(tasting.tasting_date)}
                      {tasting.occasion && ` · ${tasting.occasion}`}
                      {tasting.shared_with && ` · With ${tasting.shared_with}`}
                    </div>
                  </div>
                  {tasting.score && (
                    <span style={{
                      fontSize: '12px', color: scoreColor(tasting.score),
                      fontWeight: '600', flexShrink: 0,
                    }}>
                      {scoreLabel(tasting.score)}
                    </span>
                  )}
                </div>

                <div style={{ padding: '16px 20px', display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {tasting.nose && (
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Nose</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tasting.nose}</p>
                      </div>
                    )}
                    {tasting.palate && (
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Palate</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tasting.palate}</p>
                      </div>
                    )}
                    {tasting.finish && (
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Finish</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tasting.finish}</p>
                      </div>
                    )}
                  </div>

                  {tasting.overall_notes && (
                    <div style={{
                      padding: '10px 14px', background: 'var(--bg-input)',
                      borderRadius: '8px', borderLeft: '3px solid var(--amber)',
                    }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{tasting.overall_notes}"
                      </p>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {tags.map(tag => (
                        <span key={tag} style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '11px',
                          background: 'var(--amber-glow)', border: '1px solid var(--border)',
                          color: 'var(--amber-light)',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
