const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
