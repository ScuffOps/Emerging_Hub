const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const fetchCharacter = async () => {
  const res = await fetch(`${API_URL}/api/character`);
  if (!res.ok) throw new Error('Failed to fetch character');
  return res.json();
};

export const fetchGallery = async (category = 'All', folder = '') => {
  let url = `${API_URL}/api/gallery?`;
  if (category && category !== 'All') url += `category=${encodeURIComponent(category)}&`;
  if (folder) url += `folder=${encodeURIComponent(folder)}&`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch gallery');
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
