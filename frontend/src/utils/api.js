const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body && typeof options.body === 'object' && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Bottles
  getBottles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bottles${qs ? '?' + qs : ''}`);
  },
  getBottle: (id) => request(`/bottles/${id}`),
  createBottle: (data) => request('/bottles', { method: 'POST', body: data }),
  updateBottle: (id, data) => request(`/bottles/${id}`, { method: 'PUT', body: data }),
  deleteBottle: (id) => request(`/bottles/${id}`, { method: 'DELETE' }),
  uploadPhoto: (id, file) => {
    const form = new FormData();
    form.append('photo', file);
    return request(`/bottles/${id}/photo`, {
      method: 'POST',
      body: form,
      headers: {},
    });
  },
  getRecommendations: (id) => request(`/bottles/${id}/recommendations`),

  // Tastings
  getTastings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tastings${qs ? '?' + qs : ''}`);
  },
  createTasting: (data) => request('/tastings', { method: 'POST', body: data }),
  updateTasting: (id, data) => request(`/tastings/${id}`, { method: 'PUT', body: data }),
  deleteTasting: (id) => request(`/tastings/${id}`, { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  createWishlistItem: (data) => request('/wishlist', { method: 'POST', body: data }),
  updateWishlistItem: (id, data) => request(`/wishlist/${id}`, { method: 'PUT', body: data }),
  deleteWishlistItem: (id) => request(`/wishlist/${id}`, { method: 'DELETE' }),

  // Stats
  getStats: () => request('/stats'),
  exportCsv: () => window.open(`${BASE}/stats/export/csv`, '_blank'),
};
