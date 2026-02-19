import React, { useState, useEffect } from 'react';
import { Plus, Star, Trash2, Edit, Check } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { Button, Card, Modal, Input, Textarea, Select, EmptyState, Badge } from '../components/ui';
import toast from 'react-hot-toast';

const REGIONS = ['Kentucky', 'Tennessee', 'Japanese', 'Scotch', 'Irish', 'Canadian', 'Other'];
const TYPES = ['Bourbon', 'Rye', 'Single Malt Scotch', 'Blended Scotch', 'Japanese Whisky', 'Irish Whiskey', 'Tennessee Whiskey', 'Other'];

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    try {
      const data = await api.getWishlist();
      setItems(data);
    } catch (e) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from wishlist?`)) return;
    try {
      await api.deleteWishlistItem(id);
      toast.success('Removed from wishlist');
      load();
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const handleMarkAcquired = async (id) => {
    try {
      await api.updateWishlistItem(id, { acquired: 1 });
      toast.success('Marked as acquired! Time to add it to your collection 🥃');
      load();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const pending = items.filter(i => !i.acquired);
  const acquired = items.filter(i => i.acquired);

  const priorityStars = (p) => '★'.repeat(p) + '☆'.repeat(5 - p);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Wishlist</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {pending.length} bottle{pending.length !== 1 ? 's' : ''} on your radar
          </p>
        </div>
        <Button onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus size={16} /> Add to Wishlist
        </Button>
      </div>

      {pending.length === 0 && acquired.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="Your wishlist is empty"
          description="Add bottles you're hunting for to keep track of them"
          action={<Button onClick={() => setShowModal(true)}>Add First Item</Button>}
        />
      ) : (
        <>
          {/* Pending items */}
          {pending.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
                Hunting ({pending.length})
              </h2>
              <div style={{ display: 'grid', gap: '10px' }}>
                {pending.map(item => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    priorityStars={priorityStars}
                    onEdit={() => { setEditItem(item); setShowModal(true); }}
                    onDelete={() => handleDelete(item.id, item.name)}
                    onAcquired={() => handleMarkAcquired(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Acquired items */}
          {acquired.length > 0 && (
            <div>
              <h2 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--text-muted)' }}>
                Acquired ({acquired.length})
              </h2>
              <div style={{ display: 'grid', gap: '10px', opacity: 0.7 }}>
                {acquired.map(item => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    priorityStars={priorityStars}
                    onEdit={() => { setEditItem(item); setShowModal(true); }}
                    onDelete={() => handleDelete(item.id, item.name)}
                    acquired
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <WishlistModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        existing={editItem}
        onSave={() => { setShowModal(false); load(); }}
      />
    </div>
  );
}

function WishlistItem({ item, priorityStars, onEdit, onDelete, onAcquired, acquired }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '14px 16px',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px',
        background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', flexShrink: 0,
      }}>
        {item.region === 'Japanese' ? '🗾' : item.region === 'Scotch' ? '🏴' : '🥃'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: acquired ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            {item.name}
          </span>
          {acquired && <span style={{ fontSize: '12px', color: 'var(--success)' }}>✓ Acquired</span>}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {item.distillery && `${item.distillery} · `}{item.region} · {item.type}
        </div>
        {item.notes && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {item.notes}
          </div>
        )}
        {item.where_to_find && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            📍 {item.where_to_find}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', color: 'var(--amber)', fontWeight: '600' }}>
          {formatCurrency(item.estimated_price) || '—'}
        </div>
        <div style={{ fontSize: '13px', color: '#FFD700', letterSpacing: '-1px' }}>
          {priorityStars(item.priority)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {!acquired && (
          <button
            onClick={onAcquired}
            title="Mark as acquired"
            style={{
              width: '30px', height: '30px', borderRadius: '6px',
              background: '#14532d', border: '1px solid #166534',
              color: '#86efac', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Check size={14} />
          </button>
        )}
        <button
          onClick={onEdit}
          style={{
            width: '30px', height: '30px', borderRadius: '6px',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            color: 'var(--amber)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Edit size={13} />
        </button>
        <button
          onClick={onDelete}
          style={{
            width: '30px', height: '30px', borderRadius: '6px',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            color: 'var(--error)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function WishlistModal({ isOpen, onClose, existing, onSave }) {
  const [form, setForm] = useState({
    name: '', distillery: '', region: 'Kentucky', type: 'Bourbon',
    estimated_price: '', priority: 3, notes: '', where_to_find: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        distillery: existing.distillery || '',
        region: existing.region || 'Kentucky',
        type: existing.type || 'Bourbon',
        estimated_price: existing.estimated_price ?? '',
        priority: existing.priority || 3,
        notes: existing.notes || '',
        where_to_find: existing.where_to_find || '',
      });
    } else {
      setForm({ name: '', distillery: '', region: 'Kentucky', type: 'Bourbon', estimated_price: '', priority: 3, notes: '', where_to_find: '' });
    }
  }, [existing, isOpen]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, estimated_price: form.estimated_price !== '' ? Number(form.estimated_price) : null, priority: Number(form.priority) };
      if (existing) {
        await api.updateWishlistItem(existing.id, payload);
        toast.success('Wishlist item updated!');
      } else {
        await api.createWishlistItem(payload);
        toast.success('Added to wishlist!');
      }
      onSave();
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? 'Edit Wishlist Item' : 'Add to Wishlist'}>
      <div style={{ display: 'grid', gap: '14px' }}>
        <Input label="Bottle Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. George T. Stagg" />
        <Input label="Distillery" value={form.distillery} onChange={e => setForm(f => ({ ...f, distillery: e.target.value }))} placeholder="e.g. Buffalo Trace" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Select label="Region" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </Select>
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Input label="Estimated Price ($)" type="number" step="0.01" value={form.estimated_price} onChange={e => setForm(f => ({ ...f, estimated_price: e.target.value }))} placeholder="0.00" />
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Priority: {'★'.repeat(form.priority)}{'☆'.repeat(5 - form.priority)}
            </label>
            <input
              type="range" min="1" max="5" value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: '#FFD700' }}
            />
          </div>
        </div>
        <Input label="Where to Find" value={form.where_to_find} onChange={e => setForm(f => ({ ...f, where_to_find: e.target.value }))} placeholder="e.g. Total Wine lottery, secondary market" />
        <Textarea label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Why you want it, any relevant info..." />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : existing ? 'Update' : 'Add to Wishlist'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
