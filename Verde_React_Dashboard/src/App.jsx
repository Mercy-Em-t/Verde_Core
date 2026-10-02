import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DocumentView from './pages/DocumentView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Verde SDLC Control Center</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:id/:type" element={<DocumentView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
