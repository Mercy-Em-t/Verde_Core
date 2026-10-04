import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createId, setCreateId] = useState('');
  const [createName, setCreateName] = useState('');
  const [editTargetId, setEditTargetId] = useState(null);
  const [editSponsor, setEditSponsor] = useState('');
  const [editNeed, setEditNeed] = useState('');

  const fetchProjects = (currentToken) => {
    axios.get(`${API_BASE_URL}/projects`, { headers: { Authorization: `Bearer ${currentToken || token}` } })
      .then(res => setProjects(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    axios.post(`${API_BASE_URL}/auth/login`, { email: 'pm@verde.com', password: 'pm123' })
      .then(authRes => {
        setToken(authRes.data.token);
        return axios.get(`${API_BASE_URL}/projects`, { headers: { Authorization: `Bearer ${authRes.data.token}` } });
      })
      .then(response => {
        setProjects(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to connect to the Verde Engine API.");
        setLoading(false);
      });
  }, []);

  const openCreateModal = () => {
    setCreateId(`PRJ-SEC-${Math.floor(Math.random() * 10000)}`);
    setCreateName('');
    setShowCreateModal(true);
  };

  const submitCreate = () => {
    if (!createId || !createName) return alert('ID and Name are required');
    setIsSubmitting(true);
    axios.post(`${API_BASE_URL}/projects`, { id: createId, name: createName }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setShowCreateModal(false);
        fetchProjects();
      }).catch(err => alert("Failed: " + err.message))
      .finally(() => setIsSubmitting(false));
  };

  const openEditModal = (project) => {
    setEditTargetId(project.id);
    setEditSponsor('');
    setEditNeed('');
    setShowEditModal(true);
  };

  const submitEdit = () => {
    if (!editSponsor || !editNeed) return alert("Please fill in both fields.");
    setIsSubmitting(true);
    axios.put(`${API_BASE_URL}/projects/${editTargetId}`, { sponsor: editSponsor, need: editNeed }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        fetchProjects();
        setShowEditModal(false);
      })
      .catch(err => alert("Failed: " + err.message))
      .finally(() => setIsSubmitting(false));
  };

  const handleAction = (id, action) => {
    setIsSubmitting(true);
    axios.post(`${API_BASE_URL}/projects/${id}/action`, { action }, { headers: { Authorization: `Bearer ${token}` } })
      .then(fetchProjects).catch(err => alert("Failed: " + err.message))
      .finally(() => setIsSubmitting(false));
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-600">Initializing Secure Pipeline...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-xl font-semibold text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Active SDLC Projects</h2>
          <p className="text-slate-400">Real-time telemetry and cryptographic binder tracking across all enterprise environments.</p>
        </div>
        <button 
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-md"
          onClick={openCreateModal}
        >
          ➕ Create New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-slate-800 rounded-xl border border-slate-700 shadow-md hover:shadow-xl transition-shadow flex flex-col">
            <div className="p-5 border-b border-slate-700 flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">{project.id}</span>
                <h3 className="text-xl font-semibold text-white mt-3 leading-tight">{project.name}</h3>
              </div>
            </div>
            <div className="p-5 flex-grow">
              <p className="text-sm text-slate-300 mb-4"><strong className="text-slate-500">Project Manager:</strong> {project.pm}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${project.status === 'TERMINATED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {project.status || 'Phase 5 (Support)'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  🔒 Cryptographically Locked
                </span>
              </div>
            </div>
            <div className="p-5 bg-slate-800/50 border-t border-slate-700 grid grid-cols-2 gap-3">
              <button 
                className="col-span-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition-colors text-sm font-medium" 
                onClick={() => openEditModal(project)}
              >
                ✏️ Edit Data
              </button>
              <button 
                className="col-span-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded transition-colors text-sm font-medium" 
                onClick={() => handleAction(project.id, 'APPROVE')}
              >
                ✅ Approve
              </button>
              <button 
                className="col-span-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors text-sm font-medium" 
                onClick={() => handleAction(project.id, 'TERMINATE')}
              >
                🛑 Halt
              </button>
              <Link 
                to={`/project/${project.id}/binder`} 
                className="col-span-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors text-sm font-medium flex justify-center items-center"
              >
                📄 Binder
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white mb-1">Initiate New SDLC Project</h3>
              <p className="text-sm text-slate-400">Fill out the details below to start a new project workflow.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project ID (Auto-generated)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                  value={createId} 
                  onChange={e => setCreateId(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500" 
                  placeholder="e.g. Enterprise Firewall Upgrade"
                  value={createName} 
                  onChange={e => setCreateName(e.target.value)} 
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium text-sm" 
                disabled={isSubmitting} 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors ${isSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`} 
                disabled={isSubmitting} 
                onClick={submitCreate}
              >
                {isSubmitting ? '⌛ Processing...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white mb-1">Edit Project Data</h3>
              <p className="text-sm text-slate-400">Project ID: <strong className="text-emerald-400">{editTargetId}</strong></p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Sponsor</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500" 
                  placeholder="e.g. John Doe, HR Director"
                  value={editSponsor} 
                  onChange={e => setEditSponsor(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Business Need</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 resize-none" 
                  rows="4" 
                  placeholder="Explain why this project is necessary..."
                  value={editNeed} 
                  onChange={e => setEditNeed(e.target.value)} 
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium text-sm" 
                disabled={isSubmitting} 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors ${isSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`} 
                disabled={isSubmitting} 
                onClick={submitEdit}
              >
                {isSubmitting ? '⌛ Saving...' : 'Save Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
