import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { GroceriesList } from './components/GroceriesList';
import { ChoresList } from './components/ChoresList';
import { Wishlist } from './components/Wishlist';
import { BillsList } from './components/BillsList';
import { UsersManager } from './components/UsersManager';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Home, Lock, LogIn, Key, Sparkles, Clock, Eye, EyeOff } from 'lucide-react';

const LoginScreen = () => {
  const { users, loginUser, sessionExpired } = useApp();
  const [selectedUserId, setSelectedUserId] = useState(() => users[0]?.id || 'u_admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginUser(selectedUser.id, password.trim());
    if (!success) {
      setErrorMsg('Password non corretta per questo utente!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      background: 'var(--bg-primary)',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 54, height: 54, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem auto', color: 'white', fontWeight: 800
          }}>
            <Home size={30} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Gestione Casa PWA</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Seleziona il tuo profilo ed inserisci la password
          </p>
        </div>

        {sessionExpired && !errorMsg && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Clock size={16} /> Disconnessione automatica per inattività. Riconnettiti.
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Profile selection */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Seleziona Chi Sei:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {users.map(u => {
                const isSelected = selectedUser.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setErrorMsg('');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.85rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                      border: '2px solid ' + (isSelected ? u.color : 'transparent'),
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div className="avatar-badge" style={{ backgroundColor: u.color, width: 36, height: 36, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      {u.avatar}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>{u.name.split(' ')[0]}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.role}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} /> Password per {selectedUser.name}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Inserisci password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                required
                autoFocus
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
              *(Password impostata: <strong>{selectedUser.password}</strong>)
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}>
            <LogIn size={18} />
            <span>Accedi a Casa</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'groceries':
        return <GroceriesList />;
      case 'chores':
        return <ChoresList />;
      case 'wishlist':
        return <Wishlist />;
      case 'bills':
        return <BillsList />;
      case 'users':
        return <UsersManager />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="main-content">
        <NetworkStatusBanner />
        <Navbar
          deferredPrompt={deferredPrompt}
          onInstallPwa={handleInstallPwa}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main>{renderActiveTab()}</main>
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
