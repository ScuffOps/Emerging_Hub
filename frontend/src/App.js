import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import BrandLibrary from './pages/BrandLibrary';
import DebutAssets from './pages/DebutAssets';
import Commissions from './pages/Commissions';
import { CharacterProvider } from './context/CharacterContext';
import './App.css';
import './styles/theme.css';

function App() {
  return (
    <div className="App">
      <CharacterProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/dashboard/:section" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
            <Route path="/brand" element={<MainLayout><BrandLibrary /></MainLayout>} />
            <Route path="/commissions" element={<MainLayout><Commissions /></MainLayout>} />
            <Route path="/debut" element={<MainLayout><DebutAssets /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </CharacterProvider>
    </div>
  );
}

export default App;