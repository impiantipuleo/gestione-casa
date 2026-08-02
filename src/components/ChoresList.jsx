import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Plus, Trash2, Award, Calendar, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChoresList = () => {
  const { chores, setChores, users, currentUser, hasPermission, logActivity, deleteFromCloud } = useApp();

  const [tabFilter, setTabFilter] = useState('miei');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState([currentUser.id]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [points, setPoints] = useState(15);
  const [frequency, setFrequency] = useState('Settimanale');

  const canWrite = hasPermission('chores_write');
  const canAssign = hasPermission('chores_assign');
  const canDelete = hasPermission('chores_delete');

  const toggleChoreStatus = (choreId) => {
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        const nextStatus = c.status === 'completato' ? 'da_fare' : 'completato';
        if (nextStatus === 'completato') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          logActivity(`${currentUser.name} ha completato il compito "${c.title}" (+${c.points} pt)`);
        } else {
          logActivity(`${currentUser.name} ha riaperto il compito "${c.title}"`);
        }
        return {
          ...c,
          status: nextStatus,
          completedBy: nextStatus === 'completato' ? currentUser.name : ''
        };
      }
      return c;
    }));
  };

  const handleAddChore = (e) => {
    e.preventDefault();
    if (!title.trim() || !canWrite) return;

    const newChore = {
      id: 'c_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      assignedTo: assignedTo.length ? assignedTo : [currentUser.id],
      dueDate,
      points: Number(points) || 10,
      frequency,
      status: 'da_fare'
    };

    setChores(prev => [newChore, ...prev]);
    logActivity(`${currentUser.name} ha creato il nuovo compito "${title.trim()}"`);
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleDeleteChore = (id, choreTitle) => {
    if (!canDelete) return;
    setChores(prev => prev.filter(c => c.id !== id));
    deleteFromCloud('chores', id);
    logActivity(`${currentUser.name} ha eliminato il compito "${choreTitle}"`);
  };

  const filteredChores = chores.filter(c => {
    if (tabFilter === 'miei') return c.status !== 'completato' && c.assignedTo?.includes(currentUser.id);
    if (tabFilter === 'tutti') return c.status !== 'completato';
    if (tabFilter === 'completati') return c.status === 'completato';
    return true;
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckSquare color="#f59e0b" size={28} />
            <span>Compiti Assegnati</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gestione faccende domestiche, assegnazioni e punti ricompensa
          </p>
        </div>

        {canWrite ? (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Crea Nuovo Compito</span>
          </button>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} />
            <span>Permesso di creazione compiti disabilitato per te</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={() => setTabFilter('miei')}
            style={{
              background: tabFilter === 'miei' ? 'var(--accent-primary)' : 'var(--bg-input)',
              color: tabFilter === 'miei' ? 'white' : 'var(--text-main)'
            }}
          >
            I Miei Compiti ({chores.filter(c => c.status !== 'completato' && c.assignedTo?.includes(currentUser.id)).length})
          </button>

          <button
            className="btn"
            onClick={() => setTabFilter('tutti')}
            style={{
              background: tabFilter === 'tutti' ? 'var(--accent-primary)' : 'var(--bg-input)',
              color: tabFilter === 'tutti' ? 'white' : 'var(--text-main)'
            }}
          >
            Tutti In Sospeso ({chores.filter(c => c.status !== 'completato').length})
          </button>

          <button
            className="btn"
            onClick={() => setTabFilter('completati')}
            style={{
              background: tabFilter === 'completati' ? 'var(--accent-success)' : 'var(--bg-input)',
              color: tabFilter === 'completati' ? 'white' : 'var(--text-main)'
            }}
          >
            Completati ({chores.filter(c => c.status === 'completato').length})
          </button>
        </div>
      </div>

      {/* Chores Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filteredChores.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <CheckSquare size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Nessun compito presente in questa sezione.</p>
          </div>
        ) : (
          filteredChores.map(chore => {
            const isDone = chore.status === 'completato';
            const assignedUsers = users.filter(u => chore.assignedTo?.includes(u.id));

            return (
              <div key={chore.id} className={`glass-card ${isDone ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{chore.title}</h3>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      <Award size={14} /> +{chore.points} pt
                    </span>
                  </div>

                  {chore.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      {chore.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> Scadenza: <strong>{chore.dueDate}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <RefreshCw size={14} /> Frequenza: <span>{chore.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    {assignedUsers.map(u => (
                      <div key={u.id} className="avatar-badge" style={{ backgroundColor: u.color, width: 26, height: 26, fontSize: '0.7rem' }} title={u.name}>
                        {u.avatar}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className={`btn ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleChoreStatus(chore.id)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isDone ? 'Riapri' : 'Completa'}</span>
                    </button>

                    {canDelete && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteChore(chore.id, chore.title)}
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Chore Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Crea Compito Domestico</h2>
            
            <form onSubmit={handleAddChore}>
              <div className="form-group">
                <label className="form-label">Titolo del Compito *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Es. Spolverare soggiorno, Pulire i bagni..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrizione / Dettagli</label>
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Dettagli sulle modalità o detergenti da usare..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {canAssign && (
                <div className="form-group">
                  <label className="form-label">Assegna A:</label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {users.map(u => {
                      const isSelected = assignedTo.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            setAssignedTo(prev =>
                              isSelected ? prev.filter(id => id !== u.id) : [...prev, u.id]
                            );
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            background: isSelected ? u.color : 'var(--bg-input)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                        >
                          <div className="avatar-badge" style={{ backgroundColor: 'rgba(0,0,0,0.2)', width: 22, height: 22, fontSize: '0.65rem' }}>
                            {u.avatar}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Data di Scadenza</label>
                  <input
                    type="date"
                    className="input"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Frequenza</label>
                  <select className="select" value={frequency} onChange={e => setFrequency(e.target.value)}>
                    <option value="Una volta">Una volta</option>
                    <option value="Giornaliero">Giornaliero</option>
                    <option value="Settimanale">Settimanale</option>
                    <option value="Mensile">Mensile</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Punti Ricompensa</label>
                <input
                  type="number"
                  className="input"
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  min={5}
                  max={100}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Crea Compito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile Floating Action Button (FAB) */}
      {canWrite && (
        <button className="fab-btn" onClick={() => setShowAddModal(true)} title="Nuovo Compito">
          <Plus size={26} />
        </button>
      )}
    </div>
  );
};
