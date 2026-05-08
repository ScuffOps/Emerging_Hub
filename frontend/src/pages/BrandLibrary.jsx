import React, { useState, useEffect, useCallback } from 'react';
import { Package, FileText, Plus, Edit, Inbox } from 'lucide-react';
import { fetchBrandAssets, fetchLicenses } from '../api';
import { useAuth } from '../context/AuthContext';
import BrandAssetModal from '../components/BrandAssetModal';
import LicenseModal from '../components/LicenseModal';
import '../styles/theme.css';

const BrandLibrary = () => {
  const { token, isAuthed } = useAuth();
  const [activeTab, setActiveTab] = useState('assets');
  const [isLoaded, setIsLoaded] = useState(false);
  const [brandAssets, setBrandAssets] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [editingAsset, setEditingAsset] = useState(null); // 'new' | object
  const [editingLicense, setEditingLicense] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [assetsData, licensesData] = await Promise.all([
        fetchBrandAssets(token),
        fetchLicenses(token),
      ]);
      setBrandAssets(assetsData);
      setLicenses(licensesData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="p-8 lg:p-12 pb-32">
      <div className={`mb-10 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Brand Library
        </h1>
        <p className="text-xl text-[#B1EDE8] tracking-wide">Centralized repository for brand assets and licenses</p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-4 mb-10 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <button
          onClick={() => setActiveTab('assets')}
          data-testid="brand-tab-assets"
          className="flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-300 rounded-[55px]"
          style={{
            background: activeTab === 'assets' ? 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' : 'rgba(23, 23, 24, 0.4)',
            border: activeTab === 'assets' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            color: activeTab === 'assets' ? 'white' : '#7E88B7',
            transform: activeTab === 'assets' ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: activeTab === 'assets' ? '0 8px 30px rgba(6, 109, 247, 0.4)' : 'none',
          }}>
          <Package className="w-5 h-5" />Asset Library
        </button>
        <button
          onClick={() => setActiveTab('licenses')}
          data-testid="brand-tab-licenses"
          className="flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-300 rounded-[55px]"
          style={{
            background: activeTab === 'licenses' ? 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' : 'rgba(23, 23, 24, 0.4)',
            border: activeTab === 'licenses' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            color: activeTab === 'licenses' ? 'white' : '#7E88B7',
            transform: activeTab === 'licenses' ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: activeTab === 'licenses' ? '0 8px 30px rgba(6, 109, 247, 0.4)' : 'none',
          }}>
          <FileText className="w-5 h-5" />License Log
        </button>
      </div>

      {/* Content */}
      <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {activeTab === 'assets' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Asset Library</h2>
              {isAuthed && (
                <button
                  onClick={() => setEditingAsset('new')}
                  data-testid="brand-add-asset"
                  className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                  style={{ borderRadius: '55px', background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)', boxShadow: '0 8px 25px rgba(6, 109, 247, 0.4)' }}>
                  <Plus className="w-5 h-5" />Add Asset
                </button>
              )}
            </div>

            {brandAssets.length === 0 ? (
              <EmptyState label="No brand assets yet" hint={isAuthed ? 'Click "Add Asset" to create the first one.' : 'Sign in as admin to add assets.'} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
                {brandAssets.map((asset) => (
                  <div key={asset.id} className="glass-card p-7 rounded-[35px] transition-all duration-500 group relative" data-testid={`brand-asset-${asset.id}`}>
                    {isAuthed && (
                      <button onClick={() => setEditingAsset(asset)} data-testid={`brand-asset-edit-${asset.id}`}
                        title="Edit asset"
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[#B1EDE8] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-inner" style={{ background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' }}>
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <span className="chip bg-white/10 border-white/20 text-white shadow-sm px-3 py-1.5 text-xs">{asset.category}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#E1DBC2]">{asset.title}</h3>
                    <div className="space-y-2 mb-4 bg-black/20 p-4 rounded-[20px] border border-white/5 shadow-inner">
                      <Row k="Board" v={asset.board || '—'} />
                      <Row k="Artist" v={asset.artist || '—'} />
                      <Row k="Platform" v={asset.platform || '—'} accent />
                    </div>
                    {asset.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {asset.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#7E88B7]">#{tag}</span>
                        ))}
                      </div>
                    )}
                    {asset.urls?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {asset.urls.slice(0, 3).map((u, idx) => (
                          <a key={idx} href={u} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] px-3 py-1 rounded-full bg-[#066DF7]/15 border border-[#066DF7]/30 text-[#B1EDE8] hover:bg-[#066DF7]/30 transition-colors">
                            link {idx + 1}
                          </a>
                        ))}
                        {asset.urls.length > 3 && <span className="text-[10px] text-[#7E88B7] px-2 py-1">+{asset.urls.length - 3}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'licenses' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>License Log</h2>
              {isAuthed && (
                <button
                  onClick={() => setEditingLicense('new')}
                  data-testid="brand-add-license"
                  className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                  style={{ borderRadius: '55px', background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)', boxShadow: '0 8px 25px rgba(6, 109, 247, 0.4)' }}>
                  <Plus className="w-5 h-5" />Add License
                </button>
              )}
            </div>

            {licenses.length === 0 ? (
              <EmptyState label="No licenses tracked yet" hint={isAuthed ? 'Click "Add License" to log the first one.' : 'Sign in as admin to add licenses.'} />
            ) : (
              <div className="space-y-6 max-w-5xl">
                {licenses.map((license) => (
                  <div key={license.id} className="glass-card p-7 rounded-[35px] transition-all duration-500 group relative" data-testid={`license-${license.id}`}>
                    {isAuthed && (
                      <button onClick={() => setEditingLicense(license)} data-testid={`license-edit-${license.id}`}
                        title="Edit license"
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[#B1EDE8] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex flex-col md:flex-row items-start justify-between mb-5 gap-4 pr-8">
                      <div>
                        <h3 className="text-xl font-bold mb-1.5 text-[#E1DBC2]">{license.item}</h3>
                        {license.scope && <p className="text-sm text-[#B1EDE8]">{license.scope}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`chip shadow-sm px-3 py-1 text-xs ${license.ownership === 'Full Rights' ? 'bg-[#3086AE]/20 text-[#3086AE] border-[#3086AE]/50' : 'bg-[#F5DBAE]/20 text-[#F5DBAE] border-[#F5DBAE]/50'}`}>
                          {license.ownership}
                        </span>
                        {license.expiryDate && (
                          <span className="text-xs font-medium text-[#ff8095] flex items-center gap-2 bg-[#600612]/20 px-3 py-1 rounded-full border border-[#600612]/30">
                            Expires: {license.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {license.notes && (
                      <div className="p-4 rounded-[20px] mb-4 border border-white/5 bg-black/20 shadow-inner">
                        <p className="text-sm text-[#7E88B7] leading-relaxed"><span className="text-white font-medium">Notes:</span> {license.notes}</p>
                      </div>
                    )}
                    {license.proofLinks?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {license.proofLinks.map((link, idx) => (
                          <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-4 py-1.5 rounded-[20px] hover:opacity-80 transition-all font-medium flex items-center gap-2"
                            style={{ background: 'linear-gradient(135deg, rgba(6, 109, 247, 0.2) 0%, rgba(48, 134, 174, 0.1) 100%)', border: '1px solid rgba(6, 109, 247, 0.3)', color: '#B1EDE8' }}>
                            View Proof →
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editingAsset && (
        <BrandAssetModal
          token={token}
          initial={editingAsset === 'new' ? null : editingAsset}
          onClose={() => setEditingAsset(null)}
          onSaved={() => { setEditingAsset(null); loadData(); }}
          onDeleted={() => { setEditingAsset(null); loadData(); }}
        />
      )}
      {editingLicense && (
        <LicenseModal
          token={token}
          initial={editingLicense === 'new' ? null : editingLicense}
          onClose={() => setEditingLicense(null)}
          onSaved={() => { setEditingLicense(null); loadData(); }}
          onDeleted={() => { setEditingLicense(null); loadData(); }}
        />
      )}
    </div>
  );
};

const Row = ({ k, v, accent }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[#7E88B7] font-medium">{k}</span>
    <span className={`font-bold ${accent ? 'text-[#066DF7]' : 'text-white'}`}>{v}</span>
  </div>
);

const EmptyState = ({ label, hint }) => (
  <div className="glass-card rounded-[28px] p-10 max-w-xl text-center" data-testid="brand-empty">
    <Inbox className="w-8 h-8 text-[#7E88B7] mx-auto mb-3" />
    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>{label}</h3>
    <p className="text-sm text-[#7E88B7]">{hint}</p>
  </div>
);

export default BrandLibrary;
