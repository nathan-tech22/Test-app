import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Plus, Trash2, Edit, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';
import {
  formatCurrency, formatProof, formatAge, formatBottleSize,
  statusLabel, statusColor, formatDate
} from '../utils/formatters';
import { Button, Badge, FillLevelBar, EmptyState, Card, Tabs } from '../components/ui';
import toast from 'react-hot-toast';

const REGIONS = ['All', 'Kentucky', 'Tennessee', 'Japanese', 'Scotch', 'Irish', 'Canadian', 'Other'];
const STATUSES = ['All', 'sealed', 'open', 'finished', 'traded', 'gifted'];
const TYPES = ['All', 'Bourbon', 'Rye', 'Single Malt Scotch', 'Blended Scotch', 'Japanese Whisky', 'Irish Whiskey', 'Tennessee Whiskey', 'Other'];
const SHELVES = ['All', 'Main Collection', 'Daily Drinkers', 'Allocated', 'For Trading', 'Special Occasions'];

export default function Collection() {
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'All', region: 'All', type: 'All', shelf: 'All' });
  const [sort, setSort] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const loadBottles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sort,
        order: sortOrder,
        ...(search && { search }),
        ...(filters.status !== 'All' && { status: filters.status }),
        ...(filters.region !== 'All' && { region: filters.region }),
        ...(filters.type !== 'All' && { type: filters.type }),
        ...(filters.shelf !== 'All' && { shelf: filters.shelf }),
      };
      const data = await api.getBottles(params);
      setBottles(data);
    } catch (e) {
      toast.error('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [search, filters, sort, sortOrder]);

  useEffect(() => {
    const t = setTimeout(loadBottles, 250);
    return () => clearTimeout(t);
  }, [loadBottles]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from your collection?`)) return;
    try {
      await api.deleteBottle(id);
      toast.success('Bottle removed');
      loadBottles();
    } catch (e) {
      toast.error('Failed to remove bottle');
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'All').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px' }}>My Collection</h1>
        <Button onClick={() => navigate('/collection/add')}>
          <Plus size={16} /> Add Bottle
        </Button>
      </div>

      {/* Search + filters bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, distillery..."
            style={{
              width: '100%', padding: '8px 12px 8px 34px',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px',
            }}
          />
        </div>

        <Button variant="secondary" size="md" onClick={() => setShowFilters(!showFilters)} style={{ gap: '6px' }}>
          <Filter size={14} />
          Filters
          {activeFiltersCount > 0 && (
            <span style={{
              background: 'var(--amber)', color: '#000',
              borderRadius: '99px', padding: '0 6px', fontSize: '11px', fontWeight: '700',
            }}>
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
        </Button>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text-primary)', padding: '8px 12px', fontSize: '14px',
          }}
        >
          <option value="created_at">Sort: Date Added</option>
          <option value="name">Sort: Name</option>
          <option value="distillery">Sort: Distillery</option>
          <option value="purchase_price">Sort: Price</option>
          <option value="proof">Sort: Proof</option>
          <option value="age_statement">Sort: Age</option>
        </select>

        <button
          onClick={() => setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text-secondary)', padding: '8px 12px',
            fontSize: '13px',
          }}
        >
          {sortOrder === 'DESC' ? '↓' : '↑'}
        </button>

        <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '8px 10px', background: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent', color: viewMode === 'grid' ? 'var(--amber)' : 'var(--text-muted)', border: 'none' }}>
            <Grid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} style={{ padding: '8px 10px', background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent', color: viewMode === 'list' ? 'var(--amber)' : 'var(--text-muted)', border: 'none' }}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="fade-in" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px', marginBottom: '16px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px',
        }}>
          {[
            { key: 'status', label: 'Status', options: STATUSES },
            { key: 'region', label: 'Region', options: REGIONS },
            { key: 'type', label: 'Type', options: TYPES },
            { key: 'shelf', label: 'Shelf', options: SHELVES },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
              <select
                value={filters[key]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                style={{
                  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-primary)', padding: '7px 10px', fontSize: '13px',
                }}
              >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => setFilters({ status: 'All', region: 'All', type: 'All', shelf: 'All' })}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Count */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {loading ? 'Loading...' : `${bottles.length} bottle${bottles.length !== 1 ? 's' : ''}`}
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : bottles.length === 0 ? (
        <EmptyState
          icon="🥃"
          title="No bottles found"
          description="Add your first bottle to start your collection"
          action={<Button onClick={() => navigate('/collection/add')}>Add Bottle</Button>}
        />
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {bottles.map(bottle => (
            <BottleCard
              key={bottle.id}
              bottle={bottle}
              onView={() => navigate(`/collection/${bottle.id}`)}
              onEdit={() => navigate(`/collection/${bottle.id}/edit`)}
              onDelete={() => handleDelete(bottle.id, bottle.name)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {bottles.map(bottle => (
            <BottleRow
              key={bottle.id}
              bottle={bottle}
              onView={() => navigate(`/collection/${bottle.id}`)}
              onEdit={() => navigate(`/collection/${bottle.id}/edit`)}
              onDelete={() => handleDelete(bottle.id, bottle.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BottleCard({ bottle, onView, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onView}
      style={{
        background: hover ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* Photo or placeholder */}
      <div style={{
        height: '160px',
        background: bottle.photo_url
          ? `url(${bottle.photo_url}) center/cover no-repeat`
          : `linear-gradient(135deg, #1e1710 0%, #2a1e0f 50%, #1e1710 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {!bottle.photo_url && (
          <span style={{ fontSize: '48px', opacity: 0.6 }}>🥃</span>
        )}
        {/* Status badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span style={{
            padding: '3px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '700',
            background: `${statusColor(bottle.status)}25`,
            color: statusColor(bottle.status),
            border: `1px solid ${statusColor(bottle.status)}50`,
            backdropFilter: 'blur(8px)',
          }}>
            {statusLabel(bottle.status)}
          </span>
        </div>
        {/* Region */}
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span style={{ fontSize: '16px' }}>
            {bottle.region === 'Kentucky' ? '🥃' : bottle.region === 'Japanese' ? '🗾' :
             bottle.region === 'Scotch' ? '🏴' : bottle.region === 'Tennessee' ? '🎸' : '🌍'}
          </span>
        </div>
        {/* Actions on hover */}
        {hover && (
          <div style={{
            position: 'absolute', bottom: '10px', right: '10px',
            display: 'flex', gap: '6px',
          }} onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'rgba(200,134,10,0.9)', border: 'none',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Edit size={12} />
            </button>
            <button onClick={onDelete} style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'rgba(244,67,54,0.9)', border: 'none',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '14px' }}>
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)',
            marginBottom: '2px', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {bottle.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bottle.distillery}</div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {bottle.age_statement && (
            <span style={{ fontSize: '11px', color: 'var(--amber)', background: 'var(--amber-glow)', padding: '2px 7px', borderRadius: '99px', border: '1px solid var(--border)' }}>
              {formatAge(bottle.age_statement)}
            </span>
          )}
          {bottle.proof && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '2px 7px', borderRadius: '99px', border: '1px solid var(--border)' }}>
              {bottle.proof}°
            </span>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 7px', borderRadius: '99px', border: '1px solid var(--border)' }}>
            {formatBottleSize(bottle.bottle_size)}
          </span>
        </div>

        {bottle.status === 'open' && (
          <div style={{ marginBottom: '8px' }}>
            <FillLevelBar level={bottle.fill_level} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--amber)' }}>
            {formatCurrency(bottle.purchase_price)}
          </span>
          {bottle.secondary_market_value && bottle.secondary_market_value > bottle.purchase_price && (
            <span style={{ fontSize: '11px', color: '#4CAF50' }}>
              +{formatCurrency(bottle.secondary_market_value - (bottle.purchase_price || 0))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BottleRow({ bottle, onView, onEdit, onDelete }) {
  return (
    <div
      onClick={onView}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '12px 16px',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '8px',
        background: bottle.photo_url ? `url(${bottle.photo_url}) center/cover` : 'var(--bg-input)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {!bottle.photo_url && <span style={{ fontSize: '20px' }}>🥃</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
          {bottle.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {bottle.distillery} · {bottle.region} · {formatAge(bottle.age_statement)} · {formatProof(bottle.proof)}
        </div>
      </div>

      {bottle.status === 'open' && (
        <div style={{ width: '80px' }}>
          <FillLevelBar level={bottle.fill_level} />
        </div>
      )}

      <span style={{
        padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600',
        color: statusColor(bottle.status), background: `${statusColor(bottle.status)}20`,
        flexShrink: 0,
      }}>
        {statusLabel(bottle.status)}
      </span>

      <span style={{ fontWeight: '600', color: 'var(--amber)', fontSize: '14px', flexShrink: 0 }}>
        {formatCurrency(bottle.purchase_price)}
      </span>

      <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onEdit} style={{ padding: '5px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--amber)', cursor: 'pointer' }}>
          <Edit size={13} />
        </button>
        <button onClick={onDelete} style={{ padding: '5px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--error)', cursor: 'pointer' }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
