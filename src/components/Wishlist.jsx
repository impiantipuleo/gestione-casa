import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gift, Plus, Trash2, ExternalLink, CheckCircle2, DollarSign, Tag, AlertCircle, UserCheck } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist, setWishlist, currentUser, hasPermission, logActivity, deleteFromCloud } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('da_comprare');

  // Form
  const [title, setTitle] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [category, setCategory] = useState('Elettrodomestici');
  const [priority, setPriority] = useState('Media');
  const [url, setUrl] = useState('');

  const canWrite = hasPermission('wishlist_write');
  const canDelete = hasPermission('wishlist_delete');

  const pendingWishlist = wishlist.filter(w => !w.purchased);
  const totalBudgetEstimate = pendingWishlist.reduce((sum, item) => sum + (Number(item.estimatedPrice) || 0), 0);

  const togglePurchased = (id) => {
    if (!canWrite) return;
    setWishlist(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = !item.purchased;
        const buyer = nextStatus ? currentUser.name : '';
        logActivity(`${currentUser.name} ha contrassegnato "${item.title}" come ${nextStatus ? 'acquistato' : 'desiderio'}`);
        return { ...item, purchased: nextStatus, purchasedBy: buyer };
      }
      return item;
    }));
  };

  const handleAddWish = (e) => {
    e.preventDefault();
    if (!title.trim() || !canWrite) return;

    const newItem = {
      id: 'w_' + Date.now(),
      title: title.trim(),
      estimatedPrice: Number(estimatedPrice) || 0,
      category,
      priority,
      url: url.trim(),
      requester: currentUser.name,
      purchased: false,
      purchasedBy: ''
    };

    setWishlist(prev => [newItem, ...prev]);
    logActivity(`${currentUser.name} ha aggiunto alla Wishlist: "${title.trim()}" (€${newItem.estimatedPrice})`);
    setTitle('');
    setEstimatedPrice('');
    setUrl('');
    setShowAddModal(false);
  };

  const handleDeleteWish = (id, wishTitle) => {
    if (!canDelete) return;
    setWishlist(prev => prev.filter(w => w.id !== id));
    deleteFromCloud('wishlist', id);
    logActivity(`${currentUser.name} ha rimosso dalla Wishlist "${wishTitle}"`);
  };

  const filteredItems = wishlist.filter(item => {
    if (filter === 'da_comprare') return !item.purchased;
    if (filter === 'comprati') return item.purchased;
    return true;
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Gift color="#ec4899" size={28} />
            <span>Cose da Comprare (Wishlist)</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Oggetti, elettrodomestici e miglioramenti desiderati per la casa
          </p>
        </div>

        {canWrite ? (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Aggiungi Desiderio</span>
          </button>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} />
            <span>Permesso di aggiunta disabilitato per il tuo ruolo</span>
          </div>
        )}
      </div>

      {/* Budget Summary & Filters */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>STIMA BUDGET TOTALE</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>€{totalBudgetEstimate.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn"
              onClick={() => setFilter('da_comprare')}
              style={{
                background: filter === 'da_comprare' ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: filter === 'da_comprare' ? 'white' : 'var(--text-main)',
                fontSize: '0.8rem'
              }}
            >
              Da Comprare ({pendingWishlist.length})
            </button>
            <button
              className="btn"
              onClick={() => setFilter('comprati')}
              style={{
                background: filter === 'comprati' ? 'var(--accent-success)' : 'var(--bg-input)',
                color: filter === 'comprati' ? 'white' : 'var(--text-main)',
                fontSize: '0.8rem'
              }}
            >
              Già Acquistati ({wishlist.filter(w => w.purchased).length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <Gift size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Nessun elemento in questa lista desideri.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className={`glass-card ${item.purchased ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.title}</h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      background: item.priority === 'Alta' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: item.priority === 'Alta' ? '#f87171' : '#60a5fa'
                    }}
                  >
                    {item.priority}
                  </span>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-success)', marginBottom: '0.75rem' }}>
                  €{item.estimatedPrice.toFixed(2)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>Categoria: <strong style={{ color: 'var(--text-main)' }}>{item.category}</strong></div>
                  <div>Richiesto da: <strong style={{ color: 'var(--accent-primary)' }}>{item.requester}</strong></div>
                  {item.purchased && item.purchasedBy && (
                    <div style={{ color: 'var(--accent-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <UserCheck size={14} /> Acquistato da: {item.purchasedBy}
                    </div>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}
                    >
                      <span>Link Prodotto</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className={`btn ${item.purchased ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={!canWrite}
                  onClick={() => togglePurchased(item.id)}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{item.purchased ? 'Acquistato' : 'Segna Acquistato'}</span>
                </button>

                {canDelete && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteWish(item.id, item.title)}
                    style={{ padding: '0.35rem 0.5rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Aggiungi a Wishlist Casa</h2>
            
            <form onSubmit={handleAddWish}>
              <div className="form-group">
                <label className="form-label">Nome dell'Oggetto / Desiderio *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Es. Robot Aspirapolvere, Set di Pentole..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Prezzo Stimato (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="Es. 89.90"
                    value={estimatedPrice}
                    onChange={e => setEstimatedPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Elettrodomestici">Elettrodomestici</option>
                    <option value="Cucina">Cucina</option>
                    <option value="Arredo">Arredo</option>
                    <option value="Giardino">Giardino</option>
                    <option value="Fai-da-te">Fai-da-te</option>
                    <option value="Altro">Altro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priorità</label>
                <select className="select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="Bassa">Bassa</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Link Prodotto (Opzionale)</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Salva in Wishlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile Floating Action Button (FAB) */}
      {canWrite && (
        <button className="fab-btn" onClick={() => setShowAddModal(true)} title="Aggiungi Desiderio">
          <Plus size={26} />
        </button>
      )}
    </div>
  );
};
