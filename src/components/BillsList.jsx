import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Plus, Trash2, CheckCircle2, AlertTriangle, Calendar, Building, DollarSign, ShieldAlert } from 'lucide-react';

export const BillsList = () => {
  const { bills, setBills, users, currentUser, hasPermission, logActivity, deleteFromCloud } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('da_pagare');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Luce');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [provider, setProvider] = useState('');
  const [splits, setSplits] = useState(['u1', 'u2']);

  const canRead = hasPermission('bills_read');
  const canWrite = hasPermission('bills_write');
  const canDelete = hasPermission('bills_delete');

  if (!canRead) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem' }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Accesso Riservato</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Non disponi dei permessi per visualizzare le bollette e le spese da pagare della casa. Contatta un amministratore.
          </p>
        </div>
      </div>
    );
  }

  const unpaidBills = bills.filter(b => !b.paid);
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.filter(b => b.paid).reduce((sum, b) => sum + b.amount, 0);

  const togglePaid = (id) => {
    if (!canWrite) return;
    setBills(prev => prev.map(b => {
      if (b.id === id) {
        const nextPaid = !b.paid;
        logActivity(`${currentUser.name} ha segnato la bolletta "${b.title}" come ${nextPaid ? 'pagata' : 'da pagare'}`);
        return {
          ...b,
          paid: nextPaid,
          paidBy: nextPaid ? currentUser.name : ''
        };
      }
      return b;
    }));
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    if (!title.trim() || !canWrite) return;

    const newBill = {
      id: 'b_' + Date.now(),
      title: title.trim(),
      category,
      amount: Number(amount) || 0,
      dueDate,
      provider: provider.trim(),
      paid: false,
      paidBy: '',
      splits
    };

    setBills(prev => [newBill, ...prev]);
    logActivity(`${currentUser.name} ha registrato la nuova bolletta "${title.trim()}" di €${newBill.amount.toFixed(2)}`);
    setTitle('');
    setAmount('');
    setProvider('');
    setShowAddModal(false);
  };

  const handleDeleteBill = (id, billTitle) => {
    if (!canDelete) return;
    setBills(prev => prev.filter(b => b.id !== id));
    deleteFromCloud('bills', id);
    logActivity(`${currentUser.name} ha eliminato la bolletta "${billTitle}"`);
  };

  const filteredBills = bills.filter(b => {
    if (filterStatus === 'da_pagare') return !b.paid;
    if (filterStatus === 'pagate') return b.paid;
    return true;
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CreditCard color="#ef4444" size={28} />
            <span>Cose da Pagare (Bollette & Spese)</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tracciamento scadenze pagamenti, fornitori e ripartizione costi
          </p>
        </div>

        {canWrite && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Registra Bolletta / Spesa</span>
          </button>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTALE DA PAGARE</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>€{totalUnpaid.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>GIA SALDATE</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>€{totalPaid.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn"
              onClick={() => setFilterStatus('da_pagare')}
              style={{
                background: filterStatus === 'da_pagare' ? 'var(--accent-danger)' : 'var(--bg-input)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            >
              Da Pagare ({unpaidBills.length})
            </button>

            <button
              className="btn"
              onClick={() => setFilterStatus('pagate')}
              style={{
                background: filterStatus === 'pagate' ? 'var(--accent-success)' : 'var(--bg-input)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            >
              Pagate ({bills.filter(b => b.paid).length})
            </button>

            <button
              className="btn"
              onClick={() => setFilterStatus('tutti')}
              style={{
                background: filterStatus === 'tutti' ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            >
              Tutte ({bills.length})
            </button>
          </div>
        </div>
      </div>

      {/* Bills Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredBills.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <CreditCard size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Nessuna bolletta trovata in questo stato.</p>
          </div>
        ) : (
          filteredBills.map(bill => {
            const splitUsers = users.filter(u => bill.splits?.includes(u.id));
            const sharePerPerson = splitUsers.length > 0 ? (bill.amount / splitUsers.length) : bill.amount;

            return (
              <div key={bill.id} className={`glass-card ${bill.paid ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{bill.title}</h3>
                    <span className="badge badge-member">{bill.category}</span>
                  </div>

                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: bill.paid ? 'var(--accent-success)' : '#ef4444', marginBottom: '0.75rem' }}>
                    €{bill.amount.toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={15} /> Scadenza: <strong style={{ color: bill.paid ? 'inherit' : '#f87171' }}>{bill.dueDate}</strong>
                    </div>
                    {bill.provider && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building size={15} /> Fornitore: <span>{bill.provider}</span>
                      </div>
                    )}
                    {bill.paid && (
                      <div style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                        Pagata da: {bill.paidBy}
                      </div>
                    )}
                  </div>

                  {/* Split Breakdown */}
                  {splitUsers.length > 0 && (
                    <div style={{ background: 'var(--bg-input)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Ripartizione Costi ({splitUsers.length} persone):</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {splitUsers.map(u => (
                            <span key={u.id} className="avatar-badge" style={{ backgroundColor: u.color, width: 22, height: 22, fontSize: '0.65rem' }}>
                              {u.avatar}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontWeight: 700 }}>€{sharePerPerson.toFixed(2)} / persona</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className={`btn ${bill.paid ? 'btn-secondary' : 'btn-primary'}`}
                    disabled={!canWrite}
                    onClick={() => togglePaid(bill.id)}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{bill.paid ? 'Segna Non Pagata' : 'Segna Come Pagata'}</span>
                  </button>

                  {canDelete && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteBill(bill.id, bill.title)}
                      style={{ padding: '0.4rem 0.6rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Registra Nuova Bolletta / Spesa</h2>
            
            <form onSubmit={handleAddBill}>
              <div className="form-group">
                <label className="form-label">Nome Bolletta / Spesa *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Es. Bolletta Luce Luglio/Agosto, Canone Affitto..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Importo Totale (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="124.50"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Luce">Luce</option>
                    <option value="Gas">Gas</option>
                    <option value="Acqua">Acqua</option>
                    <option value="Affitto">Affitto</option>
                    <option value="Internet">Internet</option>
                    <option value="Condominio">Condominio</option>
                    <option value="Spesa Condivisa">Spesa Condivisa</option>
                    <option value="Altro">Altro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Data Scadenza *</label>
                  <input
                    type="date"
                    className="input"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fornitore / Ente (Opzionale)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Es. Enel, Fastweb..."
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dividi la Spesa Tra:</label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {users.map(u => {
                    const isSelected = splits.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSplits(prev =>
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
                        <span>{u.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Registra Spesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile Floating Action Button (FAB) */}
      {canWrite && (
        <button className="fab-btn" onClick={() => setShowAddModal(true)} title="Registra Nuova Spesa">
          <Plus size={26} />
        </button>
      )}
    </div>
  );
};
