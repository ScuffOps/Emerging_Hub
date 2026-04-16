import React, { useState, useEffect } from 'react';
import { Package, FileText, Plus } from 'lucide-react';
import { brandAssets, licenses } from '../mock';
import '../styles/theme.css';

const BrandLibrary = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
          className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-300 rounded-[55px]`}
          style={{
            background: activeTab === 'assets' ? 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' : 'rgba(23, 23, 24, 0.4)',
            border: activeTab === 'assets' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            color: activeTab === 'assets' ? 'white' : '#7E88B7',
            transform: activeTab === 'assets' ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: activeTab === 'assets' ? '0 8px 30px rgba(6, 109, 247, 0.4)' : 'none'
          }}
        >
          <Package className="w-5 h-5" />
          Asset Library
        </button>
        <button
          onClick={() => setActiveTab('licenses')}
          className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-300 rounded-[55px]`}
          style={{
            background: activeTab === 'licenses' ? 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' : 'rgba(23, 23, 24, 0.4)',
            border: activeTab === 'licenses' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            color: activeTab === 'licenses' ? 'white' : '#7E88B7',
            transform: activeTab === 'licenses' ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: activeTab === 'licenses' ? '0 8px 30px rgba(6, 109, 247, 0.4)' : 'none'
          }}
        >
          <FileText className="w-5 h-5" />
          License Log
        </button>
      </div>

      {/* Content */}
      <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {activeTab === 'assets' && (
          <div>
            {/* Header with add button */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                Asset Library
              </h2>
              <button
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                style={{
                  borderRadius: '55px',
                  background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)',
                  boxShadow: '0 8px 25px rgba(6, 109, 247, 0.4)'
                }}
              >
                <Plus className="w-5 h-5" />
                Add Asset
              </button>
            </div>

            {/* Assets grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              {brandAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  className={`glass-card p-8 rounded-[35px] transition-all duration-500`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-inner" style={{ background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' }}>
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <span className="chip bg-white/10 border-white/20 text-white shadow-sm px-3 py-1.5 text-xs">{asset.category}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#E1DBC2]">{asset.title}</h3>
                  <div className="space-y-3 mb-6 bg-black/20 p-5 rounded-[20px] border border-white/5 shadow-inner">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#7E88B7] font-medium">Board</span>
                      <span className="text-white font-bold">{asset.board}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#7E88B7] font-medium">Artist</span>
                      <span className="text-white font-bold">{asset.artist}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#7E88B7] font-medium">Platform</span>
                      <span className="text-[#066DF7] font-bold">{asset.platform}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#7E88B7]">
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                License Log
              </h2>
              <button
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                style={{
                  borderRadius: '55px',
                  background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)',
                  boxShadow: '0 8px 25px rgba(6, 109, 247, 0.4)'
                }}
              >
                <Plus className="w-5 h-5" />
                Add License
              </button>
            </div>

            {/* Licenses list */}
            <div className="space-y-6 max-w-5xl">
              {licenses.map((license, index) => (
                <div
                  key={license.id}
                  className={`glass-card p-8 rounded-[35px] transition-all duration-500`}
                >
                  <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-[#E1DBC2]">{license.item}</h3>
                      <p className="text-base text-[#B1EDE8]">{license.scope}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`chip shadow-sm px-4 py-2 ${license.ownership === 'Full Rights' ? 'bg-[#3086AE]/20 text-[#3086AE] border-[#3086AE]/50' : 'bg-[#F5DBAE]/20 text-[#F5DBAE] border-[#F5DBAE]/50'}`}>
                        {license.ownership}
                      </span>
                      {license.expiryDate && (
                        <span className="text-sm font-medium text-[#ff8095] flex items-center gap-2 bg-[#600612]/20 px-3 py-1 rounded-full border border-[#600612]/30">
                          Expires: {license.expiryDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {license.notes && (
                    <div className="p-5 rounded-[20px] mb-5 border border-white/5 bg-black/20 shadow-inner">
                      <p className="text-sm text-[#7E88B7] leading-relaxed"><span className="text-white font-medium">Notes:</span> {license.notes}</p>
                    </div>
                  )}

                  {license.proofLinks && license.proofLinks.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {license.proofLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-4 py-2 rounded-[20px] hover:opacity-80 transition-all font-medium flex items-center gap-2"
                          style={{ background: 'linear-gradient(135deg, rgba(6, 109, 247, 0.2) 0%, rgba(48, 134, 174, 0.1) 100%)', border: '1px solid rgba(6, 109, 247, 0.3)', color: '#B1EDE8' }}
                        >
                          View License Proof →
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
    </div>
  );
};

export default BrandLibrary;
