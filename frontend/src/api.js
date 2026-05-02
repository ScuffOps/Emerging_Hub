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

export const fetchBrandAssets = async (token) => {
  const res = await fetch(`${API_URL}/api/brand`, { headers: { ...authHeaders(token) } });
  if (!res.ok) throw new Error('Failed to fetch brand assets');
  return res.json();
};

export const createBrandAsset = async (token, data) => {
  const res = await fetch(`${API_URL}/api/brand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Create asset failed');
  return res.json();
};
export const updateBrandAsset = async (token, id, data) => {
  const res = await fetch(`${API_URL}/api/brand/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update asset failed');
  return res.json();
};
export const deleteBrandAsset = async (token, id) => {
  const res = await fetch(`${API_URL}/api/brand/${id}`, {
    method: 'DELETE', headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error('Delete asset failed');
  return res.json();
};

export const fetchLicenses = async (token) => {
  const res = await fetch(`${API_URL}/api/licenses`, { headers: { ...authHeaders(token) } });
  if (!res.ok) throw new Error('Failed to fetch licenses');
  return res.json();
};

export const createLicense = async (token, data) => {
  const res = await fetch(`${API_URL}/api/licenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Create license failed');
  return res.json();
};
export const updateLicense = async (token, id, data) => {
  const res = await fetch(`${API_URL}/api/licenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update license failed');
  return res.json();
};
export const deleteLicense = async (token, id) => {
  const res = await fetch(`${API_URL}/api/licenses/${id}`, {
    method: 'DELETE', headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error('Delete license failed');
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

export const fetchArtistCredit = async (slug) => {
  const res = await fetch(`${API_URL}/api/credits/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Failed to fetch artist (${res.status})`);
  return res.json();
};

export const bulkRenameArtist = async (token, payload) => {
  const res = await fetch(`${API_URL}/api/commissions/bulk-rename-artist`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Bulk rename failed');
  return res.json();
};

/** Upload a single File via the chunked /api/upload/* pipeline; returns { url } */
export const uploadFile = async (file, onProgress) => {
  const initFd = new FormData();
  initFd.append('filename', file.name);
  initFd.append('content_type', file.type || 'application/octet-stream');
  const initRes = await fetch(`${API_URL}/api/upload/init`, { method: 'POST', body: initFd });
  if (!initRes.ok) throw new Error('Upload init failed');
  const { upload_id } = await initRes.json();

  // single-chunk for simplicity
  const chunkFd = new FormData();
  chunkFd.append('chunk_index', '0');
  chunkFd.append('file', file);
  const chunkRes = await fetch(`${API_URL}/api/upload/${upload_id}/chunk`, { method: 'POST', body: chunkFd });
  if (!chunkRes.ok) throw new Error('Chunk upload failed');
  if (onProgress) onProgress(0.7);

  const completeFd = new FormData();
  completeFd.append('filename', file.name);
  completeFd.append('content_type', file.type || 'application/octet-stream');
  const completeRes = await fetch(`${API_URL}/api/upload/${upload_id}/complete`, { method: 'POST', body: completeFd });
  if (!completeRes.ok) throw new Error('Upload complete failed');
  if (onProgress) onProgress(1);
  return completeRes.json(); // { id, url }
};

// -------- Design --------
export const fetchDesign = async () => {
  const res = await fetch(`${API_URL}/api/design`);
  if (!res.ok) throw new Error('Failed to fetch design');
  return res.json();
};
export const createDesignElement = async (token, data) => {
  const res = await fetch(`${API_URL}/api/design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Create design element failed');
  return res.json();
};
export const updateDesignElement = async (token, id, data) => {
  const res = await fetch(`${API_URL}/api/design/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update design element failed');
  return res.json();
};
export const deleteDesignElement = async (token, id) => {
  const res = await fetch(`${API_URL}/api/design/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error('Delete design element failed');
  return res.json();
};
export const reorderDesignElements = async (token, ids) => {
  const res = await fetch(`${API_URL}/api/design/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Reorder failed');
  return res.json();
};
export const updateDesignCanvas = async (token, full_body_url) => {
  const res = await fetch(`${API_URL}/api/design/canvas`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ full_body_url }),
  });
  if (!res.ok) throw new Error('Update canvas failed');
  return res.json();
};

// -------- Site Settings --------
export const fetchSiteSettings = async () => {
  const res = await fetch(`${API_URL}/api/site-settings`);
  if (!res.ok) throw new Error('Failed to fetch site settings');
  return res.json();
};
export const updateSiteSettings = async (token, data) => {
  const res = await fetch(`${API_URL}/api/site-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update site settings failed');
  return res.json();
};

// -------- Fan Art --------
export const submitFanart = async (data) => {
  const res = await fetch(`${API_URL}/api/fanart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Submission failed');
  }
  return res.json();
};
export const fetchFanart = async (token, status = 'approved') => {
  const params = new URLSearchParams({ status });
  const res = await fetch(`${API_URL}/api/fanart?${params}`, { headers: { ...authHeaders(token) } });
  if (!res.ok) throw new Error('Failed to fetch fan art');
  return res.json();
};
export const reviewFanart = async (token, id, status) => {
  const res = await fetch(`${API_URL}/api/fanart/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Review failed');
  return res.json();
};
export const deleteFanart = async (token, id) => {
  const res = await fetch(`${API_URL}/api/fanart/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
};
