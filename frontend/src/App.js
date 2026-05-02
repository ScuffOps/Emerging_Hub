import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import BrandLibrary from './pages/BrandLibrary';
import DebutAssets from './pages/DebutAssets';
import Commissions from './pages/Commissions';
import Credits from './pages/Credits';
import ArtistCredit from './pages/ArtistCredit';
import Merch from './pages/Merch';
import Links from './pages/Links';
import Design from './pages/Design';
import FanArt from './pages/FanArt';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import RequireAuth from './components/RequireAuth';
import { CharacterProvider } from './context/CharacterContext';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import './App.css';
import './styles/theme.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <SiteSettingsProvider>
          <CharacterProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
                <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                <Route path="/dashboard/:section" element={<MainLayout><Dashboard /></MainLayout>} />
                <Route path="/design" element={<MainLayout><Design /></MainLayout>} />
                <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
                <Route path="/brand" element={<MainLayout><RequireAuth label="The Brand Library"><BrandLibrary /></RequireAuth></MainLayout>} />
                <Route path="/commissions" element={<MainLayout><RequireAuth label="Commissions"><Commissions /></RequireAuth></MainLayout>} />
                <Route path="/credits" element={<MainLayout><Credits /></MainLayout>} />
                <Route path="/credits/:slug" element={<MainLayout><ArtistCredit /></MainLayout>} />
                <Route path="/fanart" element={<MainLayout><FanArt /></MainLayout>} />
                <Route path="/merch" element={<MainLayout><Merch /></MainLayout>} />
                <Route path="/links" element={<MainLayout><Links /></MainLayout>} />
                <Route path="/debut" element={<MainLayout><DebutAssets /></MainLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </CharacterProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
