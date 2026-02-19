import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, Star, Droplets, BookOpen, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';
import {
  formatCurrency, formatDate, formatProof, formatAbv, formatAge, formatBottleSize,
  statusLabel, statusColor, scoreColor, scoreLabel
} from '../utils/formatters';
import { Button, Card, Badge, FillLevelBar, ScoreBadge, Modal, Input, Select, Textarea, Tabs } from '../components/ui';
import toast from 'react-hot-toast';

const FLAVOR_OPTIONS = [
  'vanilla', 'caramel', 'oak', 'cherry', 'dried fruit', 'honey',
  'chocolate', 'espresso', 'tobacco', 'leather', 'char', 'corn',
  'rye spice', 'pepper', 'cinnamon', 'nutmeg', 'baking spices',
  'citrus', 'orange', 'apple', 'peach', 'tropical', 'floral',
  'peat', 'smoke', 'sea salt', 'sherry', 'port', 'maple syrup',
  'butterscotch', 'toffee', 'brown sugar', 'white chocolate', 'mint',
];

export default function BottleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bottle, setBottle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showTastingModal, setShowTastingModal] = useState(false);
  const [editTasting, setEditTasting] = useState(null);

  const load = async () => {
    try {
      const data = await api.getBottle(id);
      setBottle(data);
    } catch (e) {
      toast.error('Bottle not found');
      navigate('/collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${bottle.name}" from your collection? This cannot be undone.`)) return;
    try {
      await api.deleteBottle(id);
      toast.success('Bottle removed');
      navigate('/collection');
    } catch (e) {
      toast.error('Failed to remove bottle');
    }
  };

  const handleFillUpdate = async (newLevel) => {
    try {
      await api.updateBottle(id, { fill_level: newLevel });
      setBottle(b => ({ ...b, fill_level: newLevel }));
    } catch {}
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!bottle) return null;

  const avgScore = bottle.tastings?.length > 0
    ? Math.round(bottle.tastings.reduce((s, t) => s + (t.score || 0), 0) / bottle.tastings.filter(t => t.score).length)
    : null;

  const gain = (bottle.secondary_market_value || bottle.msrp || 0) - (bottle.purchase_price || 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/collection')}>
          <ArrowLeft size={16} />
        </Button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', margin: 0 }}>{bottle.name}</h1>
            <span style={{
              padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
              color: statusColor(bottle.status), background: `${statusColor(bottle.status)}20`,
              border: `1px solid ${statusColor(bottle.status)}40`,
            }}>
              {statusLabel(bottle.status)}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {bottle.distillery} · {bottle.region} · {bottle.type}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/collection/${id}/edit`)}>
            <Edit size={14} /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Top info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Photo */}
        <div style={{
          width: '180px', height: '220px',
          background: bottle.photo_url
            ? `url(${bottle.photo_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1e1710, #2a1e0f)',
          borderRadius: '14px', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {!bottle.photo_url && <span style={{ fontSize: '60px' }}>🥃</span>}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', alignContent: 'start' }}>
          {[
            { label: 'Age', value: formatAge(bottle.age_statement) },
            { label: 'Proof', value: formatProof(bottle.proof) },
            { label: 'ABV', value: formatAbv(bottle.abv) },
            { label: 'Size', value: formatBottleSize(bottle.bottle_size) },
            { label: 'Purchase Price', value: formatCurrency(bottle.purchase_price), color: 'var(--amber)' },
            { label: 'Market Value', value: formatCurrency(bottle.secondary_market_value || bottle.msrp), color: '#4CAF50' },
            { label: 'Unrealized Gain', value: gain >= 0 ? `+${formatCurrency(gain)}` : formatCurrency(gain), color: gain >= 0 ? '#4CAF50' : 'var(--error)' },
            { label: 'Shelf', value: bottle.custom_shelf || '—' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '12px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: color || 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fill level control */}
      {bottle.status === 'open' && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Droplets size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Fill Level</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--amber)' }}>{bottle.fill_level}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={bottle.fill_level}
                onChange={e => setBottle(b => ({ ...b, fill_level: Number(e.target.value) }))}
                onMouseUp={e => handleFillUpdate(Number(e.target.value))}
                onTouchEnd={e => handleFillUpdate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--amber)' }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { value: 'info', label: 'Details' },
          { value: 'tastings', label: `Tastings (${bottle.tastings?.length || 0})` },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />
      <div style={{ height: '16px' }} />

      {activeTab === 'info' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Mashbill */}
          {(bottle.mashbill || bottle.grain_bill || bottle.vintage || bottle.batch_number) && (
            <Card>
              <h3 style={{ fontSize: '15px', marginBottom: '14px' }}>Mash & Production</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {bottle.mashbill && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>MASHBILL</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{bottle.mashbill}</div>
                  </div>
                )}
                {bottle.grain_bill && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>GRAIN BILL</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{bottle.grain_bill}</div>
                  </div>
                )}
                {bottle.vintage && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>VINTAGE</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{bottle.vintage}</div>
                  </div>
                )}
                {bottle.batch_number && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>BATCH / BARREL</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{bottle.batch_number}</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Purchase */}
          <Card>
            <h3 style={{ fontSize: '15px', marginBottom: '14px' }}>Purchase Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {bottle.purchase_date && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>DATE</div>
                  <div style={{ fontSize: '13px' }}>{formatDate(bottle.purchase_date)}</div>
                </div>
              )}
              {bottle.retailer && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>RETAILER</div>
                  <div style={{ fontSize: '13px' }}>{bottle.retailer}</div>
                </div>
              )}
              {bottle.msrp && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>MSRP</div>
                  <div style={{ fontSize: '13px' }}>{formatCurrency(bottle.msrp)}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {bottle.notes && (
            <Card>
              <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>Notes</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{bottle.notes}</p>
            </Card>
          )}

          {/* Gift info */}
          {bottle.is_gift && (
            <Card>
              <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>Gift Info</h3>
              {bottle.gift_from && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Received from: <strong>{bottle.gift_from}</strong></p>}
              {bottle.gift_to && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Given to: <strong>{bottle.gift_to}</strong></p>}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'tastings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            {avgScore && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ScoreBadge score={avgScore} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: scoreColor(avgScore) }}>{scoreLabel(avgScore)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Average of {bottle.tastings.filter(t => t.score).length} ratings</div>
                </div>
              </div>
            )}
            <Button size="sm" onClick={() => { setEditTasting(null); setShowTastingModal(true); }}>
              <Plus size={14} /> Log Tasting
            </Button>
          </div>

          {bottle.tastings?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <BookOpen size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>No tasting sessions logged yet.</p>
              <Button style={{ marginTop: '12px' }} onClick={() => setShowTastingModal(true)}>
                Log First Tasting
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {bottle.tastings.map(tasting => (
                <TastingCard
                  key={tasting.id}
                  tasting={tasting}
                  onEdit={() => { setEditTasting(tasting); setShowTastingModal(true); }}
                  onDelete={async () => {
                    if (!window.confirm('Delete this tasting session?')) return;
                    await api.deleteTasting(tasting.id);
                    load();
                    toast.success('Tasting removed');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <TastingModal
        isOpen={showTastingModal}
        onClose={() => setShowTastingModal(false)}
        bottleId={id}
        existing={editTasting}
        onSave={() => { setShowTastingModal(false); load(); }}
      />
    </div>
  );
}

function TastingCard({ tasting, onEdit, onDelete }) {
  const tags = tasting.flavor_tags ? JSON.parse(tasting.flavor_tags) : [];
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
        <ScoreBadge score={tasting.score} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {formatDate(tasting.tasting_date)}
                {tasting.occasion && ` — ${tasting.occasion}`}
              </div>
              {tasting.shared_with && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>With: {tasting.shared_with}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', padding: '4px' }}>
                <Edit size={14} />
              </button>
              <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {tasting.nose && (
          <div>
            <div style={{ fontSize: '11px', color: 'var(--amber)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nose</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tasting.nose}</p>
          </div>
        )}
        {tasting.palate && (
          <div>
            <div style={{ fontSize: '11px', color: 'var(--amber)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Palate</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tasting.palate}</p>
          </div>
        )}
        {tasting.finish && (
          <div>
            <div style={{ fontSize: '11px', color: 'var(--amber)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Finish</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tasting.finish}</p>
          </div>
        )}
        {tasting.overall_notes && (
          <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', borderLeft: '3px solid var(--amber)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>"{tasting.overall_notes}"</p>
          </div>
        )}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map(tag => (
              <span key={tag} style={{
                padding: '2px 8px', borderRadius: '99px',
                background: 'var(--amber-glow)', border: '1px solid var(--border)',
                fontSize: '11px', color: 'var(--amber-light)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function TastingModal({ isOpen, onClose, bottleId, existing, onSave }) {
  const [form, setForm] = useState({
    tasting_date: new Date().toISOString().split('T')[0],
    occasion: '', score: '', nose: '', palate: '', finish: '',
    overall_notes: '', flavor_tags: [], pour_amount: 1.5, shared_with: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        tasting_date: existing.tasting_date || '',
        occasion: existing.occasion || '',
        score: existing.score ?? '',
        nose: existing.nose || '',
        palate: existing.palate || '',
        finish: existing.finish || '',
        overall_notes: existing.overall_notes || '',
        flavor_tags: existing.flavor_tags ? JSON.parse(existing.flavor_tags) : [],
        pour_amount: existing.pour_amount || 1.5,
        shared_with: existing.shared_with || '',
      });
    } else {
      setForm({
        tasting_date: new Date().toISOString().split('T')[0],
        occasion: '', score: '', nose: '', palate: '', finish: '',
        overall_notes: '', flavor_tags: [], pour_amount: 1.5, shared_with: '',
      });
    }
  }, [existing, isOpen]);

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      flavor_tags: f.flavor_tags.includes(tag)
        ? f.flavor_tags.filter(t => t !== tag)
        : [...f.flavor_tags, tag],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        bottle_id: bottleId,
        score: form.score !== '' ? Number(form.score) : null,
        pour_amount: Number(form.pour_amount),
      };
      if (existing) {
        await api.updateTasting(existing.id, payload);
      } else {
        await api.createTasting(payload);
      }
      toast.success(existing ? 'Tasting updated!' : 'Tasting logged!');
      onSave();
    } catch (e) {
      toast.error('Failed to save tasting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? 'Edit Tasting' : 'Log Tasting Session'} width="640px">
      <div style={{ display: 'grid', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Input label="Date" type="date" value={form.tasting_date} onChange={e => setForm(f => ({ ...f, tasting_date: e.target.value }))} />
          <Input label="Occasion" value={form.occasion} onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))} placeholder="e.g. Birthday, Casual" />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Score: {form.score || 'Not rated'} {form.score >= 95 ? '🌟 Legendary' : form.score >= 90 ? '⭐ Exceptional' : form.score >= 85 ? '✨ Excellent' : ''}
          </label>
          <input
            type="range" min="60" max="100" value={form.score || 75}
            onChange={e => setForm(f => ({ ...f, score: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--amber)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>60 - Average</span>
            <span>100 - Perfect</span>
          </div>
        </div>

        <Textarea label="Nose" value={form.nose} onChange={e => setForm(f => ({ ...f, nose: e.target.value }))} placeholder="What do you smell? Vanilla, caramel, oak..." />
        <Textarea label="Palate" value={form.palate} onChange={e => setForm(f => ({ ...f, palate: e.target.value }))} placeholder="What do you taste? Sweet, spicy, fruity..." />
        <Textarea label="Finish" value={form.finish} onChange={e => setForm(f => ({ ...f, finish: e.target.value }))} placeholder="How does it end? Long, short, warming..." />
        <Textarea label="Overall Notes" value={form.overall_notes} onChange={e => setForm(f => ({ ...f, overall_notes: e.target.value }))} placeholder="Your overall impressions..." />

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Flavor Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {FLAVOR_OPTIONS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '4px 10px', borderRadius: '99px', fontSize: '12px',
                  background: form.flavor_tags.includes(tag) ? 'var(--amber)' : 'var(--bg-input)',
                  color: form.flavor_tags.includes(tag) ? '#000' : 'var(--text-secondary)',
                  border: `1px solid ${form.flavor_tags.includes(tag) ? 'var(--amber)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Input label="Pour Amount (oz)" type="number" step="0.5" min="0.5" value={form.pour_amount} onChange={e => setForm(f => ({ ...f, pour_amount: e.target.value }))} />
          <Input label="Shared With" value={form.shared_with} onChange={e => setForm(f => ({ ...f, shared_with: e.target.value }))} placeholder="Who were you with?" />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : existing ? 'Update Tasting' : 'Log Tasting'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
