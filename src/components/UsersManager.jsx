import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Shield, Check, Trash2, Lock, UserPlus, Sparkles, ShieldAlert, Key } from 'lucide-react';

export const UsersManager = () => {
  const { users, setUsers, currentUser, hasPermission, logActivity, deleteFromCloud } = useApp();

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

  const handleUpdatePassword = (userId, newPassword) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        logActivity(`${currentUser.name} ha aggiornato la password dell'utente ${u.name}`);
        return { ...u, password: newPassword };
      }
      return u;
    }));
  };

  const handleTogglePermission = (userId, permKey) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updatedPerms = {
          ...u.permissions,
          [permKey]: !u.permissions[permKey]
        };
        logActivity(`${currentUser.name} ha aggiornato il permesso "${permKey}" per ${u.name}`);
        return { ...u, permissions: updatedPerms };
      }
      return u;
    }));
  };

  const handleChangeRole = (userId, newRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const isAdmin = newRole === 'admin';
        const isKid = newRole === 'kid';

        const newPerms = isAdmin
          ? Object.keys(u.permissions).reduce((acc, k) => ({ ...acc, [k]: true }), {})
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

        logActivity(`${currentUser.name} ha cambiato il ruolo di ${u.name} a "${newRole}"`);
        return { ...u, role: newRole, permissions: newPerms };
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

      {/* Users Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {users.map(u => (
          <div key={u.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="avatar-badge" style={{ backgroundColor: u.color, width: 44, height: 44, fontSize: '1.1rem' }}>
                    {u.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{u.name}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <span className={`badge badge-${u.role}`}>{u.role.toUpperCase()}</span>
                      {u.id === currentUser.id && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>[Tu]</span>
                      )}
                    </div>
                  </div>
                </div>

                {u.id !== currentUser.id && (
                  <button className="btn btn-danger" onClick={() => handleDeleteUser(u.id, u.name)} style={{ padding: '0.35rem 0.5rem' }}>
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
                  value={u.password || ''}
                  onChange={e => handleUpdatePassword(u.id, e.target.value)}
                  placeholder="Imposta password..."
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Role Selection */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Ruolo Predefinito:</label>
                <select
                  className="select"
                  value={u.role}
                  onChange={e => handleChangeRole(u.id, e.target.value)}
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
                    const isChecked = u.role === 'admin' ? true : !!(u.permissions && u.permissions[p.key]);
                    const isDisabled = u.role === 'admin';

                    return (
                      <label key={p.key} className="checkbox-label" style={{ opacity: isDisabled ? 0.7 : 1 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleTogglePermission(u.id, p.key)}
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
          </div>
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
