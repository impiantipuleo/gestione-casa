import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Home, Moon, Sun, ChevronDown, Download, Upload, RotateCcw, Bell, Database, Cloud, LogOut, Lock } from 'lucide-react';
import { CloudConfigModal } from './CloudConfigModal';
import { LoginModal } from './LoginModal';

export const Navbar = ({ deferredPrompt, onInstallPwa }) => {
  const {
    currentUser,
    users,
    theme,
    toggleTheme,
    resetDemoData,
    exportData,
    importData,
    notificationsAllowed,
    requestNotificationPermission,
    isCloudConnected,
    logoutUser
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [targetUserIdForLogin, setTargetUserIdForLogin] = useState(null);
  const fileInputRef = useRef(null);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-admin">Admin</span>;
      case 'member':
        return <span className="badge badge-member">Membro</span>;
      case 'kid':
        return <span className="badge badge-kid">Bambino</span>;
      default:
        return null;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-title">
        <Home size={26} color="#3b82f6" />
        <span>Gestione Casa PWA</span>
      </div>

      <div className="nav-actions">
        {deferredPrompt && (
          <button className="btn btn-primary" onClick={onInstallPwa} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Download size={16} />
            <span>Installa PWA</span>
          </button>
        )}

        {/* Cloud Sync Button */}
        <button
          className="btn btn-secondary"
          onClick={() => setShowCloudModal(true)}
          title="Configura Database Cloud Supabase"
          style={{
            padding: '0.4rem 0.7rem',
            borderColor: isCloudConnected ? '#10b981' : 'var(--border-color)',
            background: isCloudConnected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)'
          }}
        >
          {isCloudConnected ? <Cloud size={16} color="#10b981" /> : <Database size={16} color="var(--text-muted)" />}
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {isCloudConnected ? 'Cloud Attivo' : 'Cloud DB'}
          </span>
        </button>

        {/* Notifications Button */}
        {!notificationsAllowed && (
          <button
            className="btn btn-secondary"
            onClick={requestNotificationPermission}
            title="Attiva Notifiche Browser"
            style={{ padding: '0.4rem 0.7rem' }}
          >
            <Bell size={16} color="#f59e0b" />
          </button>
        )}

        {/* Backup & Restore */}
        <button
          className="btn btn-secondary"
          onClick={exportData}
          title="Esporta Backup JSON"
          style={{ padding: '0.4rem 0.7rem' }}
        >
          <Download size={16} />
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          title="Importa Backup JSON"
          style={{ padding: '0.4rem 0.7rem' }}
        >
          <Upload size={16} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          style={{ display: 'none' }}
        />

        <button 
          className="btn btn-secondary" 
          onClick={resetDemoData} 
          title="Ripristina Dati Demo Iniziali"
          style={{ padding: '0.4rem 0.7rem' }}
        >
          <RotateCcw size={16} />
        </button>

        <button className="btn btn-secondary" onClick={toggleTheme} style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }}>
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#8b5cf6" />}
        </button>

        {/* User Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-switcher" 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <div className="avatar-badge" style={{ backgroundColor: currentUser.color }}>
              {currentUser.avatar}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.1 }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.7rem' }}>{getRoleBadge(currentUser.role)}</span>
            </div>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          {showUserDropdown && (
            <div className="glass-card" style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '240px',
              padding: '0.75rem',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                Cambia Utente (Password):
              </div>
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    setShowUserDropdown(false);
                    setTargetUserIdForLogin(u.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: u.id === currentUser.id ? 'var(--bg-card-hover)' : 'transparent',
                    marginBottom: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div className="avatar-badge" style={{ backgroundColor: u.color, width: 28, height: 28, fontSize: '0.75rem' }}>
                      {u.avatar}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.name}</span>
                  </div>
                  <Lock size={12} color="var(--text-muted)" />
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setShowUserDropdown(false);
                    logoutUser();
                  }}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.35rem' }}
                >
                  <LogOut size={14} />
                  <span>Esci dall'Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCloudModal && <CloudConfigModal onClose={() => setShowCloudModal(false)} />}
      {targetUserIdForLogin && (
        <LoginModal
          targetUserId={targetUserIdForLogin}
          onClose={() => setTargetUserIdForLogin(null)}
        />
      )}
    </header>
  );
};
