import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import BrandLibrary from './pages/BrandLibrary';
import DebutAssets from './pages/DebutAssets';
import './App.css';
import './styles/theme.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:section" element={<Dashboard />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/brand" element={<BrandLibrary />} />
          <Route path="/debut" element={<DebutAssets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;