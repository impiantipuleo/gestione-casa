import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Shield, Check, Trash2, UserPlus, ShieldAlert, Key, Save, Clock } from 'lucide-react';

const UserCard = ({ user, currentUser, permissionLabels, onSaveUser, onDeleteUser }) => {
  const [password, setPassword] = useState(user.password || '');
  const [role, setRole] = useState(user.role || 'member');
  const [permissions, setPermissions] = useState(user.permissions || {});
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const isPasswordDirty = (password || '').trim() !== (user.password || '').trim();
  const isRoleDirty = role !== user.role;
  const isPermsDirty = JSON.stringify(permissions) !== JSON.stringify(user.permissions || {});
  const isDirty = isPasswordDirty || isRoleDirty || isPermsDirty;

  const isDirtyRef = React.useRef(isDirty);
  isDirtyRef.current = isDirty;

  useEffect(() => {
    if (!isDirtyRef.current) {
      setPassword(user.password || '');
      setRole(user.role || 'member');
      setPermissions(user.permissions || {});
    }
  }, [user.id, user.password, user.role, user.permissions]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const isAdmin = newRole === 'admin';
    const isKid = newRole === 'kid';

    const newPerms = isAdmin
      ? permissionLabels.reduce((acc, p) => ({ ...acc, [p.key]: true }), {})
      : {
          groceries_read: true,
          groceries_write: true,
          groceries_delete: false,
          chores_read: true,
          chores_write: !isKid,
          chores_assign: false,
          chores_delete: false,
          wishlist_read: true,
          wishlist_write: !isKid,
          wishlist_delete: false,
          bills_read: !isKid,
          bills_write: !isKid,
          bills_delete: false,
          users_manage: false
        };
    setPermissions(newPerms);
  };

  const handleTogglePermission = (permKey) => {
    setPermissions(prev => ({
      ...prev,
      [permKey]: !prev[permKey]
    }));
  };



  const handleSave = (e) => {
    e.preventDefault();
    onSaveUser(user.id, { password: password.trim(), role, permissions });
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 3000);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* User Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar-badge" style={{ backgroundColor: user.color, width: 44, height: 44, fontSize: '1.1rem' }}>
              {user.avatar}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user.name}</h3>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', alignItems: 'center' }}>
                <span className={`badge badge-${role}`}>{role.toUpperCase()}</span>
                {user.id === currentUser.id && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>[Tu]</span>
                )}
              </div>
            </div>
          </div>

          {user.id !== currentUser.id && (
            <button className="btn btn-danger" onClick={() => onDeleteUser(user.id, user.name)} style={{ padding: '0.35rem 0.5rem' }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Password Setting Field */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Key size={13} color="var(--accent-primary)" /> Password Accesso:
          </label>
          <input
            type="text"
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Imposta password..."
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        {/* Role Selection */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Ruolo Predefinito:</label>
          <select
            className="select"
            value={role}
            onChange={e => handleRoleChange(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="admin">Amministratore (Tutti i permessi)</option>
            <option value="member">Membro (Completo senza eliminazione)</option>
            <option value="kid">Bambino / Limitato (Solo compiti & spesa)</option>
          </select>
        </div>

        {/* Granular Permission Toggles */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={14} /> Permessi Granulari Attivi:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.4rem' }}>
            {permissionLabels.map(p => {
              const isChecked = role === 'admin' ? true : !!permissions[p.key];
              const isDisabled = role === 'admin';

              return (
                <label key={p.key} className="checkbox-label" style={{ opacity: isDisabled ? 0.7 : 1 }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => handleTogglePermission(p.key)}
                    style={{ display: 'none' }}
                  />
                  <span className="checkbox-custom" style={{ width: 16, height: 16 }}>
                    {isChecked && <Check size={12} color="white" />}
                  </span>
                  <span style={{ fontSize: '0.8rem' }}>{p.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Action & Feedback */}
      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '0.75rem' }}>
        {showSavedMsg && (
          <div style={{
            fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)',
            padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.6rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600
          }}>
            <Check size={14} /> Modifiche salvate con successo!
          </div>
        )}
        <button
          className={`btn ${isDirty ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleSave}
          disabled={!isDirty}
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.85rem',
            padding: '0.55rem',
            opacity: !isDirty ? 0.65 : 1,
            boxShadow: isDirty ? '0 0 12px rgba(59, 130, 246, 0.4)' : 'none'
          }}
        >
          <Save size={16} />
          <span>{isDirty ? 'Salva Modifiche' : 'Nessuna Modifica'}</span>
        </button>
      </div>
    </div>
  );
};

export const UsersManager = () => {
  const {
    users,
    setUsers,
    currentUser,
    hasPermission,
    logActivity,
    deleteFromCloud,
    autoLogoutMinutes,
    setAutoLogoutMinutes
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);

  // Add User Form
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [color, setColor] = useState('#10b981');
  const [password, setPassword] = useState('1234');

  const canManage = hasPermission('users_manage');

  if (!canManage) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem' }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Accesso Riservato agli Amministratori</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Non possiedi i permessi necessari per gestire gli utenti e modificare i ruoli della casa.
          </p>
        </div>
      </div>
    );
  }

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parts = name.trim().split(' ');
    const avatar = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();

    const isKid = role === 'kid';
    const isAdmin = role === 'admin';

    const defaultPermissions = {
      groceries_read: true,
      groceries_write: true,
      groceries_delete: isAdmin,
      chores_read: true,
      chores_write: !isKid,
      chores_assign: isAdmin,
      chores_delete: isAdmin,
      wishlist_read: true,
      wishlist_write: !isKid,
      wishlist_delete: isAdmin,
      bills_read: !isKid,
      bills_write: !isKid,
      bills_delete: isAdmin,
      users_manage: isAdmin
    };

    const newUser = {
      id: 'u_' + Date.now(),
      name: name.trim(),
      role,
      avatar,
      color,
      password: password.trim() || '1234',
      permissions: defaultPermissions
    };

    setUsers(prev => [...prev, newUser]);
    logActivity(`${currentUser.name} ha creato l'utente "${newUser.name}" (Ruolo: ${role})`);
    setName('');
    setPassword('1234');
    setShowAddModal(false);
  };

  const handleSaveUserChanges = (userId, updatedData) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        logActivity(`${currentUser.name} ha salvato le modifiche per l'utente ${u.name}`);
        return {
          ...u,
          password: updatedData.password,
          role: updatedData.role,
          permissions: updatedData.permissions
        };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId, userName) => {
    if (userId === currentUser.id) {
      alert("Non puoi eliminare il tuo stesso utente attivo!");
      return;
    }
    if (users.length <= 1) {
      alert("La casa deve avere almeno un utente!");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    deleteFromCloud('users', userId);
    logActivity(`${currentUser.name} ha eliminato l'utente "${userName}"`);
  };

  const permissionLabels = [
    { key: 'groceries_read', label: 'Spesa: Visualizza' },
    { key: 'groceries_write', label: 'Spesa: Aggiungi/Spunta' },
    { key: 'groceries_delete', label: 'Spesa: Rimuovi' },
    { key: 'chores_read', label: 'Compiti: Visualizza' },
    { key: 'chores_write', label: 'Compiti: Crea Nuovi' },
    { key: 'chores_assign', label: 'Compiti: Assegna agli altri' },
    { key: 'chores_delete', label: 'Compiti: Elimina' },
    { key: 'wishlist_read', label: 'Wishlist: Visualizza' },
    { key: 'wishlist_write', label: 'Wishlist: Aggiungi' },
    { key: 'wishlist_delete', label: 'Wishlist: Elimina' },
    { key: 'bills_read', label: 'Bollette: Visualizza' },
    { key: 'bills_write', label: 'Bollette: Aggiungi/Paga' },
    { key: 'bills_delete', label: 'Bollette: Elimina' },
    { key: 'users_manage', label: 'Gestione Utenti & Permessi' }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users color="#8b5cf6" size={28} />
            <span>Utenti & Gestione Permessi</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Aggiungi membri della casa, imposta le password di accesso e personalizza i permessi
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          <span>Aggiungi Nuovo Membro</span>
        </button>
      </div>

      {/* Inactivity Auto Logout Settings */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Disconnessione Automatica per Inattività</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Esegue il logout automatico dopo un periodo di inattività dell'utente per sicurezza
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="form-label" style={{ marginBottom: 0, fontSize: '0.85rem' }}>Timeout Inattività:</label>
          <select
            className="select"
            value={autoLogoutMinutes}
            onChange={e => setAutoLogoutMinutes(Number(e.target.value))}
            style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
          >
            <option value={5}>5 Minuti</option>
            <option value={15}>15 Minuti (Consigliato)</option>
            <option value={30}>30 Minuti</option>
            <option value={60}>60 Minuti</option>
            <option value={0}>Disattivato (Mai)</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {users.map(u => (
          <UserCard
            key={u.id}
            user={u}
            currentUser={currentUser}
            permissionLabels={permissionLabels}
            onSaveUser={handleSaveUserChanges}
            onDeleteUser={handleDeleteUser}
          />
        ))}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Aggiungi Nuovo Membro della Casa</h2>
            
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Es. Sofia Rossi, Matteo..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password di Accesso *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Imposta una password (es. 1234)..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ruolo</label>
                <select className="select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="admin">Amministratore (Gestione totale)</option>
                  <option value="member">Membro (Spesa, compiti, spese)</option>
                  <option value="kid">Bambino / Limitato (Solo compiti a lui dedicati)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Colore Profilo</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem' }}>
                  {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444'].map(c => (
                    <div
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: c,
                        cursor: 'pointer',
                        border: color === c ? '3px solid white' : 'none',
                        boxShadow: color === c ? '0 0 10px ' + c : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Crea Utente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
