import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [editSponsor, setEditSponsor] = useState('');
  const [editNeed, setEditNeed] = useState('');

  const fetchProjects = () => {
    axios.get('http://localhost:3000/api/projects')
      .then(res => setProjects(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    axios.post('http://localhost:3000/api/auth/login', { email: 'pm@verde.com', password: 'pm123' })
      .then(authRes => {
        setToken(authRes.data.token);
        return axios.get('http://localhost:3000/api/projects');
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

  const handleCreateProject = () => {
    const newId = `PRJ-NEW-${Math.floor(Math.random() * 10000)}`;
    axios.post('http://localhost:3000/api/projects', { id: newId, name: 'New Interactive Project' }, { headers: { Authorization: `Bearer ${token}` } })
      .then(fetchProjects).catch(err => alert("Failed: " + err.message));
  };

  const openEditModal = (project) => {
    setEditTargetId(project.id);
    setEditSponsor('');
    setEditNeed('');
    setShowEditModal(true);
  };

  const submitEdit = () => {
    if (!editSponsor || !editNeed) return alert("Please fill in both fields.");
    axios.put(`http://localhost:3000/api/projects/${editTargetId}`, { sponsor: editSponsor, need: editNeed }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        fetchProjects();
        setShowEditModal(false);
      })
      .catch(err => alert("Failed: " + err.message));
  };

  const handleAction = (id, action) => {
    axios.post(`http://localhost:3000/api/projects/${id}/action`, { action }, { headers: { Authorization: `Bearer ${token}` } })
      .then(fetchProjects).catch(err => alert("Failed: " + err.message));
  };

  if (loading) return <div className="loading">Initializing Secure Pipeline...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Active SDLC Projects</h2>
          <p>Real-time telemetry and cryptographic binder tracking across all enterprise environments.</p>
        </div>
        <button className="btn primary" onClick={handleCreateProject} style={{ padding: '15px 30px', fontSize: '1.1em' }}>
          ➕ Create New Project
        </button>
      </div>

      <div className="project-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="card-header">
              <span className="project-id">{project.id}</span>
              <h3>{project.name}</h3>
            </div>
            <div className="card-body">
              <p><strong>Project Manager:</strong> {project.pm}</p>
              <div className="status-badges" style={{ marginTop: '10px' }}>
                <span className={`badge ${project.status === 'TERMINATED' ? 'error' : 'success'}`}>
                  {project.status || 'Phase 5 (Support)'}
                </span>
                <span className="badge secure">Cryptographically Locked</span>
              </div>
            </div>
            <div className="card-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button className="btn secondary" onClick={() => openEditModal(project)}>✏️ Edit Data</button>
              <button className="btn success" onClick={() => handleAction(project.id, 'APPROVE')} style={{background: '#27ae60', color: 'white'}}>✅ Approve</button>
              <button className="btn" onClick={() => handleAction(project.id, 'TERMINATE')} style={{background: '#c0392b', color: 'white'}}>🛑 Halt</button>
              <Link to={`/project/${project.id}/binder`} className="btn primary" style={{ width: '100%', marginTop: '5px' }}>📄 Master Binder</Link>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Project Data</h3>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9em' }}>Project ID: <strong>{editTargetId}</strong></p>
            
            <label>Project Sponsor</label>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="e.g. John Doe, HR Director"
              value={editSponsor} 
              onChange={e => setEditSponsor(e.target.value)} 
            />

            <label>Business Need</label>
            <textarea 
              className="modal-input" 
              rows="4" 
              placeholder="Explain why this project is necessary..."
              value={editNeed} 
              onChange={e => setEditNeed(e.target.value)} 
            />

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn primary" onClick={submitEdit} style={{ background: '#3b82f6' }}>Save Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
