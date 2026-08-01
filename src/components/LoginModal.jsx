import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, LogIn, ShieldCheck, User } from 'lucide-react';

export const LoginModal = ({ targetUserId, onClose }) => {
  const { users, loginUser } = useApp();

  const selectedUser = users.find(u => u.id === targetUserId) || users[0];
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const success = loginUser(selectedUser.id, password.trim());
    if (success) {
      onClose();
    } else {
      setErrorMsg('Password errata! Riprova.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="avatar-badge" style={{ backgroundColor: selectedUser.color, width: 64, height: 64, fontSize: '1.5rem', margin: '0 auto 0.75rem auto', boxShadow: 'var(--shadow-md)' }}>
            {selectedUser.avatar}
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedUser.name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Inserisci la tua password per accedere
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} /> Password di Accesso
            </label>
            <input
              type="password"
              className="input"
              placeholder="Inserisci la password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <LogIn size={16} />
              <span>Accedi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
