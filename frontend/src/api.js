const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchCharacter = async () => {
  const res = await fetch(`${API_URL}/api/character`);
  if (!res.ok) throw new Error('Failed to fetch character');
  return res.json();
};

export const fetchGallery = async (category = 'All', folder = '') => {
  let url = `${API_URL}/api/gallery?`;
  if (category && category !== 'All') url += `category=${encodeURIComponent(category)}&`;
  if (folder && folder !== 'All') url += `folder=${encodeURIComponent(folder)}&`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
};

export const updateGalleryItem = async (id, data) => {
  const res = await fetch(`${API_URL}/api/gallery/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update gallery item');
  return res.json();
};

export const deleteGalleryItem = async (id) => {
  const res = await fetch(`${API_URL}/api/gallery/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete gallery item');
  return res.json();
};

export const fetchBrandAssets = async () => {
  const res = await fetch(`${API_URL}/api/brand`);
  if (!res.ok) throw new Error('Failed to fetch brand assets');
  return res.json();
};

export const fetchLicenses = async () => {
  const res = await fetch(`${API_URL}/api/licenses`);
  if (!res.ok) throw new Error('Failed to fetch licenses');
  return res.json();
};

export const verifyDebutPassword = async (password) => {
  const res = await fetch(`${API_URL}/api/auth/verify-debut`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error('Invalid password');
  return res.json();
};

export const fetchDebutAssets = async (token) => {
  const res = await fetch(`${API_URL}/api/debut`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch debut assets');
  return res.json();
};

// -------- Commissions --------
const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};

export const fetchCommissions = async (token, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined && v !== 'All') params.append(k, v);
  });
  const res = await fetch(`${API_URL}/api/commissions?${params.toString()}`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error('Failed to fetch commissions');
  return res.json();
};

export const fetchCommissionStats = async (token) => {
  const res = await fetch(`${API_URL}/api/commissions/stats`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error('Failed to fetch commission stats');
  return res.json();
};

export const createCommission = async (token, data) => {
  const res = await fetch(`${API_URL}/api/commissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create commission');
  return res.json();
};

export const updateCommission = async (token, id, data) => {
  const res = await fetch(`${API_URL}/api/commissions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update commission');
  return res.json();
};

export const deleteCommission = async (token, id) => {
  const res = await fetch(`${API_URL}/api/commissions/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error('Failed to delete commission');
  return res.json();
};

export const fetchCredits = async () => {
  const res = await fetch(`${API_URL}/api/credits`);
  if (!res.ok) throw new Error('Failed to fetch credits');
  return res.json();
};
