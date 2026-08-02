import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Plus, Trash2, CheckCircle2, Filter, AlertCircle, Copy, Check, Printer, UserCheck } from 'lucide-react';

export const GroceriesList = () => {
  const { groceries, setGroceries, currentUser, hasPermission, logActivity, deleteFromCloud } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('Tutti');
  const [statusFilter, setStatusFilter] = useState('da_comprare');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Freschi');
  const [quantity, setQuantity] = useState('1 pacco');
  const [priority, setPriority] = useState('Media');

  const categories = ['Tutti', 'Freschi', 'Orto/Forno', 'Dispensa', 'Casa', 'Bevande', 'Altro'];

  const canWrite = hasPermission('groceries_write');
  const canDelete = hasPermission('groceries_delete');

  const handleToggleBought = (id) => {
    if (!canWrite) return;
    setGroceries(prev => prev.map(g => {
      if (g.id === id) {
        const nextStatus = !g.bought;
        const buyer = nextStatus ? currentUser.name : '';
        logActivity(`${currentUser.name} ha segnato "${g.name}" come ${nextStatus ? 'comprato' : 'da comprare'}`);
        return {
          ...g,
          bought: nextStatus,
          boughtBy: buyer
        };
      }
      return g;
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name.trim() || !canWrite) return;

    const newItem = {
      id: 'g_' + Date.now(),
      name: name.trim(),
      category,
      quantity,
      priority,
      bought: false,
      addedBy: currentUser.name,
      boughtBy: ''
    };

    setGroceries(prev => [newItem, ...prev]);
    logActivity(`${currentUser.name} ha aggiunto "${name.trim()}" alla spesa`);
    setName('');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id, itemName) => {
    if (!canDelete) return;
    setGroceries(prev => prev.filter(g => g.id !== id));
    deleteFromCloud('groceries', id);
    logActivity(`${currentUser.name} ha rimosso "${itemName}" dalla spesa`);
  };

  // Copy list formatted for WhatsApp
  const handleCopyForWhatsApp = () => {
    const unbought = groceries.filter(g => !g.bought);
    if (unbought.length === 0) {
      alert("Nessun articolo da comprare da condividere!");
      return;
    }

    let text = "🛒 *LISTA DELLA SPESA CASA* 🛒\n\n";
    const grouped = {};
    unbought.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    Object.keys(grouped).forEach(cat => {
      text += `📌 *${cat}*:\n`;
      grouped[cat].forEach(item => {
        text += `• ${item.name} (${item.quantity})\n`;
      });
      text += `\n`;
    });

    text += `_Generato da Gestione Casa PWA_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      logActivity(`${currentUser.name} ha copiato la lista spesa per WhatsApp`);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredGroceries = groceries.filter(item => {
    const matchesCategory = categoryFilter === 'Tutti' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'tutti' ? true : statusFilter === 'da_comprare' ? !item.bought : item.bought;
    return matchesCategory && matchesStatus;
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingCart color="#3b82f6" size={28} />
            <span>Spesa da Fare</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Aggiungi e spunta gli articoli necessari per la casa
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleCopyForWhatsApp} title="Copia testo per WhatsApp">
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'Copiato!' : 'Copia per WhatsApp'}</span>
          </button>

          <button className="btn btn-secondary" onClick={handlePrint} title="Stampa Lista">
            <Printer size={16} />
            <span>Stampa</span>
          </button>

          {canWrite ? (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              <span>Aggiungi Articolo</span>
            </button>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} />
              <span>Permesso di aggiunta disabilitato per il tuo ruolo</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Status Pills */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}>
            <button
              className="btn"
              onClick={() => setStatusFilter('da_comprare')}
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.8rem',
                background: statusFilter === 'da_comprare' ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === 'da_comprare' ? 'white' : 'var(--text-muted)'
              }}
            >
              Da Comprare ({groceries.filter(g => !g.bought).length})
            </button>
            <button
              className="btn"
              onClick={() => setStatusFilter('acquistati')}
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.8rem',
                background: statusFilter === 'acquistati' ? 'var(--accent-success)' : 'transparent',
                color: statusFilter === 'acquistati' ? 'white' : 'var(--text-muted)'
              }}
            >
              Acquistati ({groceries.filter(g => g.bought).length})
            </button>
            <button
              className="btn"
              onClick={() => setStatusFilter('tutti')}
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.8rem',
                background: statusFilter === 'tutti' ? 'var(--bg-secondary)' : 'transparent',
                color: statusFilter === 'tutti' ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              Tutti ({groceries.length})
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ width: '160px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Groceries Items List */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredGroceries.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>Nessun articolo trovato in questa categoria.</p>
          </div>
        ) : (
          filteredGroceries.map(item => (
            <div key={item.id} className={`item-row ${item.bought ? 'completed' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.bought}
                    disabled={!canWrite}
                    onChange={() => handleToggleBought(item.id)}
                    style={{ display: 'none' }}
                  />
                  <span className="checkbox-custom">
                    {item.bought && <CheckCircle2 size={14} color="white" />}
                  </span>
                </label>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                    <span>Quantità: <strong>{item.quantity}</strong></span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Aggiunto da: {item.addedBy}</span>
                    {item.bought && item.boughtBy && (
                      <>
                        <span>•</span>
                        <span style={{ color: 'var(--accent-success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UserCheck size={12} /> Comprato da: {item.boughtBy}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: item.priority === 'Alta' ? 'rgba(239, 68, 68, 0.2)' : item.priority === 'Media' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: item.priority === 'Alta' ? '#f87171' : item.priority === 'Media' ? '#fbbf24' : '#94a3b8'
                  }}
                >
                  {item.priority}
                </span>

                {canDelete && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    style={{ padding: '0.35rem 0.5rem' }}
                    title="Elimina articolo"
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Aggiungi Alla Spesa</h2>
            
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label className="form-label">Nome Prodotto / Articolo *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Es. Latte, Uova, Olio d'Oliva..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Freschi">Freschi</option>
                    <option value="Orto/Forno">Orto/Forno</option>
                    <option value="Dispensa">Dispensa</option>
                    <option value="Casa">Casa</option>
                    <option value="Bevande">Bevande</option>
                    <option value="Altro">Altro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantità</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Es. 1kg, 2 bottiglie..."
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priorità</label>
                <select className="select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="Bassa">Bassa</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta (Urgente)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Salva In Spesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile Floating Action Button (FAB) */}
      <button className="fab-btn" onClick={() => setShowAddModal(true)} title="Aggiungi Prodotto Spesa">
        <Plus size={26} />
      </button>
    </div>
  );
};
