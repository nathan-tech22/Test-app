export const formatCurrency = (val) => {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatProof = (proof) => {
  if (proof == null) return '—';
  return `${proof} proof`;
};

export const formatAbv = (abv) => {
  if (abv == null) return '—';
  return `${abv}% ABV`;
};

export const formatAge = (age) => {
  if (age == null) return 'NAS';
  return `${age} Year${age !== 1 ? 's' : ''}`;
};

export const formatBottleSize = (ml) => {
  if (!ml) return '—';
  if (ml >= 1000) return `${ml / 1000}L`;
  return `${ml}ml`;
};

export const statusLabel = (status) => {
  const map = {
    sealed: 'Sealed',
    open: 'Open',
    finished: 'Finished',
    traded: 'Traded/Sold',
    gifted: 'Gifted',
  };
  return map[status] || status;
};

export const statusColor = (status) => {
  const map = {
    sealed: '#4CAF50',
    open: '#F0A832',
    finished: '#7A6040',
    traded: '#2196F3',
    gifted: '#9C27B0',
  };
  return map[status] || '#7A6040';
};

export const regionEmoji = (region) => {
  const map = {
    'Kentucky': '🥃',
    'Tennessee': '🎸',
    'Japanese': '🗾',
    'Scotch': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Irish': '☘️',
    'Canadian': '🍁',
    'Other': '🌍',
  };
  return map[region] || '🥃';
};

export const scoreColor = (score) => {
  if (!score) return '#7A6040';
  if (score >= 95) return '#FFD700';
  if (score >= 90) return '#F0A832';
  if (score >= 85) return '#C8860A';
  if (score >= 80) return '#8B6914';
  return '#7A6040';
};

export const scoreLabel = (score) => {
  if (!score) return '';
  if (score >= 95) return 'Legendary';
  if (score >= 90) return 'Exceptional';
  if (score >= 85) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 75) return 'Good';
  if (score >= 70) return 'Decent';
  return 'Average';
};
