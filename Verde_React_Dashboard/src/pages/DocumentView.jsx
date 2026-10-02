import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function DocumentView() {
  const { id, type } = useParams();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/projects/${id}/${type}`)
      .then(response => {
        setHtmlContent(response.data.html);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setHtmlContent('<div style="color: red; padding: 20px;">Failed to load document. Make sure the API is running.</div>');
        setLoading(false);
      });
  }, [id, type]);

  const handlePrint = () => {
    // 1. Open all details for print
    document.querySelectorAll('details').forEach(d => d.setAttribute('open', 'true'));
    // 2. Temporarily set title
    document.title = `Verde_Project_${id}_${type.toUpperCase()}`;
    // 3. Print
    window.print();
    // 4. Restore title
    document.title = "Verde SDLC Dashboard";
  };

  return (
    <div className="document-view">
      <div className="doc-nav" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" className="back-btn">⬅ Return to Dashboard</Link>
          <span className="doc-title" style={{ marginLeft: '15px' }}>{id} - {type === 'binder' ? 'Master Project Binder' : 'Audit Trail'}</span>
        </div>
        <button className="btn primary" onClick={handlePrint} style={{ padding: '8px 15px', background: '#2980b9' }}>📥 Export to PDF</button>
      </div>
      
      {loading ? (
        <div className="loading">Decrypting Passport...</div>
      ) : (
        <div 
          className="doc-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      )}
    </div>
  );
}
