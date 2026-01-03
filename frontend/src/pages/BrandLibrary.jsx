import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, FileText, Plus } from 'lucide-react';
import { brandAssets, licenses } from '../mock';
import '../styles/theme.css';

const BrandLibrary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assets');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#171718] via-[#263542] to-[#352D39]" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6" style={{ backdropFilter: 'blur(20px)', background: 'rgba(23, 23, 24, 0.6)', borderBottom: '1px solid rgba(177, 237, 232, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-[#B1EDE8] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Brand Library
          </h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300`}
              style={{
                borderRadius: '55px',
                background: activeTab === 'assets' ? 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' : 'transparent',
                border: activeTab === 'assets' ? 'none' : '2px solid rgba(6, 109, 247, 0.3)',
                color: activeTab === 'assets' ? 'white' : '#066DF7',
                transform: activeTab === 'assets' ? 'translateY(-2px)' : 'translateY(0)'
              }}
            >
              <Package className="w-5 h-5" />
              Asset Library
            </button>
            <button
              onClick={() => setActiveTab('licenses')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300`}
              style={{
                borderRadius: '55px',
                background: activeTab === 'licenses' ? 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' : 'transparent',
                border: activeTab === 'licenses' ? 'none' : '2px solid rgba(6, 109, 247, 0.3)',
                color: activeTab === 'licenses' ? 'white' : '#066DF7',
                transform: activeTab === 'licenses' ? 'translateY(-2px)' : 'translateY(0)'
              }}
            >
              <FileText className="w-5 h-5" />
              License Log
            </button>
          </div>

          {/* Content */}
          {activeTab === 'assets' && (
            <div>
              {/* Header with add button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Asset Library
                  </h2>
                  <p className="text-[#7E88B7]">Centralized repository for brand assets</p>
                </div>
                <button
                  className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all"
                  style={{
                    borderRadius: '55px',
                    background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add Asset
                </button>
              </div>

              {/* Assets grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brandAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className={`glass-card p-6 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl" style={{ background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' }}>
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <span className="chip chip-primary">{asset.category}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-[#E1DBC2]">{asset.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7E88B7]">Board:</span>
                        <span className="text-[#E1DBC2]">{asset.board}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7E88B7]">Artist:</span>
                        <span className="text-[#E1DBC2]">{asset.artist}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#7E88B7]">Platform:</span>
                        <span className="text-[#E1DBC2]">{asset.platform}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(6, 109, 247, 0.1)', color: '#7E88B7' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'licenses' && (
            <div>
              {/* Header with add button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    License Log
                  </h2>
                  <p className="text-[#7E88B7]">Track licensing information and rights</p>
                </div>
                <button
                  className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all"
                  style={{
                    borderRadius: '55px',
                    background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add License
                </button>
              </div>

              {/* Licenses list */}
              <div className="space-y-4">
                {licenses.map((license, index) => (
                  <div
                    key={license.id}
                    className={`glass-card p-6 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1 text-[#E1DBC2]">{license.item}</h3>
                        <p className="text-sm text-[#7E88B7]">{license.scope}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`chip ${license.ownership === 'Full Rights' ? 'chip-success' : 'chip-warning'}`}>
                          {license.ownership}
                        </span>
                        {license.expiryDate && (
                          <span className="text-xs text-[#7E88B7]">
                            Expires: {license.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {license.notes && (
                      <div className="p-3 rounded-2xl mb-3" style={{ background: 'rgba(6, 109, 247, 0.05)' }}>
                        <p className="text-sm text-[#7E88B7]">{license.notes}</p>
                      </div>
                    )}

                    {license.proofLinks && license.proofLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {license.proofLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-2 rounded-2xl hover:opacity-80 transition-opacity"
                            style={{ background: 'rgba(6, 109, 247, 0.15)', color: '#066DF7' }}
                          >
                            Proof Link {idx + 1} →
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrandLibrary;