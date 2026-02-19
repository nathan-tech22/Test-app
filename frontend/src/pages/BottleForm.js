import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { api } from '../utils/api';
import { Button, Input, Textarea, Select, Card } from '../components/ui';
import toast from 'react-hot-toast';

const REGIONS = ['Kentucky', 'Tennessee', 'Japanese', 'Scotch', 'Irish', 'Canadian', 'Other'];
const TYPES = ['Bourbon', 'Rye', 'Single Malt Scotch', 'Blended Scotch', 'Japanese Whisky', 'Irish Whiskey', 'Tennessee Whiskey', 'Other'];
const SHELVES = ['Main Collection', 'Daily Drinkers', 'Allocated', 'For Trading', 'Special Occasions'];

const EMPTY = {
  name: '', distillery: '', region: 'Kentucky', type: 'Bourbon',
  mashbill: '', grain_bill: '', age_statement: '', proof: '', abv: '',
  bottle_size: 750, vintage: '', batch_number: '',
  status: 'sealed', fill_level: 100,
  purchase_price: '', purchase_date: '', retailer: '',
  msrp: '', secondary_market_value: '',
  notes: '', custom_shelf: 'Main Collection',
  is_gift: false, gift_from: '', gift_to: '',
};

export default function BottleForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    api.getBottle(id)
      .then(data => {
        setForm({
          name: data.name || '',
          distillery: data.distillery || '',
          region: data.region || 'Kentucky',
          type: data.type || 'Bourbon',
          mashbill: data.mashbill || '',
          grain_bill: data.grain_bill || '',
          age_statement: data.age_statement ?? '',
          proof: data.proof ?? '',
          abv: data.abv ?? '',
          bottle_size: data.bottle_size || 750,
          vintage: data.vintage || '',
          batch_number: data.batch_number || '',
          status: data.status || 'sealed',
          fill_level: data.fill_level ?? 100,
          purchase_price: data.purchase_price ?? '',
          purchase_date: data.purchase_date || '',
          retailer: data.retailer || '',
          msrp: data.msrp ?? '',
          secondary_market_value: data.secondary_market_value ?? '',
          notes: data.notes || '',
          custom_shelf: data.custom_shelf || 'Main Collection',
          is_gift: !!data.is_gift,
          gift_from: data.gift_from || '',
          gift_to: data.gift_to || '',
        });
        if (data.photo_url) setPhotoPreview(data.photo_url);
      })
      .catch(() => toast.error('Failed to load bottle'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.distillery.trim()) errs.distillery = 'Distillery is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        age_statement: form.age_statement !== '' ? Number(form.age_statement) : null,
        proof: form.proof !== '' ? Number(form.proof) : null,
        abv: form.abv !== '' ? Number(form.abv) : null,
        bottle_size: Number(form.bottle_size),
        fill_level: Number(form.fill_level),
        purchase_price: form.purchase_price !== '' ? Number(form.purchase_price) : null,
        msrp: form.msrp !== '' ? Number(form.msrp) : null,
        secondary_market_value: form.secondary_market_value !== '' ? Number(form.secondary_market_value) : null,
        is_gift: form.is_gift ? 1 : 0,
      };

      let result;
      if (isEdit) {
        result = await api.updateBottle(id, payload);
      } else {
        result = await api.createBottle(payload);
      }

      if (photoFile) {
        await api.uploadPhoto(result.id, photoFile);
      }

      toast.success(isEdit ? 'Bottle updated!' : 'Bottle added to collection!');
      navigate(`/collection/${result.id}`);
    } catch (e) {
      toast.error(e.message || 'Failed to save bottle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const section = (title) => (
    <div style={{ padding: '16px 0 8px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '14px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</h3>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 style={{ fontSize: '24px' }}>{isEdit ? 'Edit Bottle' : 'Add New Bottle'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left column */}
          <div>
            <Card>
              {section('Basic Info')}
              <div style={{ display: 'grid', gap: '14px' }}>
                <Input
                  label="Bottle Name *"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Pappy Van Winkle 15 Year"
                  error={errors.name}
                />
                <Input
                  label="Distillery *"
                  value={form.distillery}
                  onChange={e => set('distillery', e.target.value)}
                  placeholder="e.g. Buffalo Trace"
                  error={errors.distillery}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Select label="Region" value={form.region} onChange={e => set('region', e.target.value)}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </Select>
                  <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </Select>
                </div>
                <Input
                  label="Mashbill / Grain Bill"
                  value={form.mashbill}
                  onChange={e => set('mashbill', e.target.value)}
                  placeholder="e.g. Mash Bill #1, Wheated Bourbon"
                />
                <Input
                  label="Grain Breakdown"
                  value={form.grain_bill}
                  onChange={e => set('grain_bill', e.target.value)}
                  placeholder="e.g. 70% Corn, 20% Rye, 10% Barley"
                />
              </div>
            </Card>

            <Card style={{ marginTop: '16px' }}>
              {section('Specifications')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input label="Age Statement (years)" type="number" min="0" value={form.age_statement} onChange={e => set('age_statement', e.target.value)} placeholder="NAS if blank" />
                <Input label="Proof" type="number" step="0.1" value={form.proof} onChange={e => set('proof', e.target.value)} placeholder="e.g. 90" />
                <Input label="ABV %" type="number" step="0.1" value={form.abv} onChange={e => set('abv', e.target.value)} placeholder="e.g. 45" />
                <Select label="Bottle Size (ml)" value={form.bottle_size} onChange={e => set('bottle_size', e.target.value)}>
                  {[50, 200, 375, 500, 700, 750, 1000, 1750].map(s => <option key={s} value={s}>{s === 1000 ? '1L' : s === 1750 ? '1.75L' : `${s}ml`}</option>)}
                </Select>
                <Input label="Vintage / Year" value={form.vintage} onChange={e => set('vintage', e.target.value)} placeholder="e.g. 2023" />
                <Input label="Batch / Barrel #" value={form.batch_number} onChange={e => set('batch_number', e.target.value)} placeholder="e.g. B524, 47-7L" />
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div>
            {/* Photo upload */}
            <Card>
              {section('Bottle Photo')}
              <div
                onClick={() => document.getElementById('photo-input').click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: '10px',
                  padding: '24px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '10px', cursor: 'pointer',
                  background: photoPreview ? 'none' : 'var(--bg-input)',
                  minHeight: '160px', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'contain', borderRadius: '8px' }} />
                ) : (
                  <>
                    <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click to upload photo</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG up to 10MB</span>
                  </>
                )}
              </div>
              <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </Card>

            <Card style={{ marginTop: '16px' }}>
              {section('Status & Shelf')}
              <div style={{ display: 'grid', gap: '12px' }}>
                <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="sealed">Sealed</option>
                  <option value="open">Open</option>
                  <option value="finished">Finished</option>
                  <option value="traded">Traded / Sold</option>
                  <option value="gifted">Gifted</option>
                </Select>

                {form.status === 'open' && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Fill Level: {form.fill_level}%
                    </label>
                    <input
                      type="range" min="0" max="100" value={form.fill_level}
                      onChange={e => set('fill_level', e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--amber)' }}
                    />
                  </div>
                )}

                <Select label="Shelf / Collection" value={form.custom_shelf} onChange={e => set('custom_shelf', e.target.value)}>
                  {SHELVES.map(s => <option key={s}>{s}</option>)}
                </Select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="is-gift" checked={form.is_gift} onChange={e => set('is_gift', e.target.checked)} style={{ accentColor: 'var(--amber)' }} />
                  <label htmlFor="is-gift" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>This is a gift</label>
                </div>

                {form.is_gift && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <Input label="Gift From" value={form.gift_from} onChange={e => set('gift_from', e.target.value)} placeholder="Who gifted it?" />
                    <Input label="Gift To" value={form.gift_to} onChange={e => set('gift_to', e.target.value)} placeholder="If given as gift..." />
                  </div>
                )}
              </div>
            </Card>

            <Card style={{ marginTop: '16px' }}>
              {section('Purchase Info')}
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Input label="Purchase Price ($)" type="number" step="0.01" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} placeholder="0.00" />
                  <Input label="MSRP ($)" type="number" step="0.01" value={form.msrp} onChange={e => set('msrp', e.target.value)} placeholder="0.00" />
                </div>
                <Input label="Secondary Market Value ($)" type="number" step="0.01" value={form.secondary_market_value} onChange={e => set('secondary_market_value', e.target.value)} placeholder="0.00" />
                <Input label="Purchase Date" type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
                <Input label="Retailer" value={form.retailer} onChange={e => set('retailer', e.target.value)} placeholder="e.g. Total Wine, Spec's" />
              </div>
            </Card>
          </div>
        </div>

        {/* Notes - full width */}
        <Card style={{ marginTop: '16px' }}>
          {section('Notes')}
          <Textarea
            label="Personal Notes"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Anything you want to remember about this bottle..."
            style={{ minHeight: '100px' }}
          />
        </Card>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button variant="secondary" onClick={() => navigate(-1)} type="button">Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add to Collection'}
          </Button>
        </div>
      </form>
    </div>
  );
}
