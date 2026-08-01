import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, CheckSquare, CreditCard, Gift, Clock, AlertTriangle, CheckCircle2, Trophy, PieChart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Dashboard = ({ setActiveTab }) => {
  const { currentUser, users, groceries, chores, setChores, bills, wishlist, activityLog, logActivity } = useApp();

  const pendingGroceriesCount = groceries.filter(g => !g.bought).length;
  const myChores = chores.filter(c => c.assignedTo?.includes(currentUser.id));
  const myPendingChores = myChores.filter(c => c.status !== 'completato');
  
  const unpaidBills = bills.filter(b => !b.paid);
  const unpaidBillsTotal = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  
  const pendingWishlistCount = wishlist.filter(w => !w.purchased).length;

  // Calculate Points Leaderboard per user
  const userPoints = users.map(user => {
    const completedChores = chores.filter(c => c.status === 'completato' && (c.completedBy === user.name || c.assignedTo?.includes(user.id)));
    const totalPoints = completedChores.reduce((sum, c) => sum + c.points, 0);
    return { ...user, points: totalPoints, count: completedChores.length };
  }).sort((a, b) => b.points - a.points);

  // Category breakdown for bills
  const billsByCategory = bills.reduce((acc, bill) => {
    acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
    return acc;
  }, {});
  const totalBillsSum = bills.reduce((sum, b) => sum + b.amount, 0) || 1;

  const toggleChoreStatus = (choreId) => {
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        const nextStatus = c.status === 'completato' ? 'da_fare' : 'completato';
        if (nextStatus === 'completato') {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
          logActivity(`${currentUser.name} ha completato il compito "${c.title}" (+${c.points} pt)`);
        }
        return { ...c, status: nextStatus, completedBy: nextStatus === 'completato' ? currentUser.name : '' };
      }
      return c;
    }));
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Bentornato, {currentUser.name}! 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Ecco la panoramica della tua casa per oggi. Hai <strong>{myPendingChores.length} compiti</strong> in sospeso.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab('chores')}>
            <Sparkles size={18} />
            <span>Vedi Tutti i Compiti</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="dashboard-grid">
        <div className="stat-card" onClick={() => setActiveTab('groceries')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SPESA DA FARE</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pendingGroceriesCount} articoli</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('chores')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>I MIEI COMPITI</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{myPendingChores.length} da fare</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('bills')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>BOLLETTE IN SOSPESO</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>€{unpaidBillsTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('wishlist')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <Gift size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>WISHLIST CASA</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pendingWishlistCount} desideri</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: My Chores & Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* My Chores */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={20} color="#f59e0b" />
                <span>I Miei Compiti di Oggi</span>
              </h3>
              <span className="badge badge-member">{myPendingChores.length} In sospeso</span>
            </div>

            {myChores.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                Nessun compito assegnato a te al momento! 🎉
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myChores.map(chore => {
                  const isDone = chore.status === 'completato';
                  return (
                    <div
                      key={chore.id}
                      className={`item-row ${isDone ? 'completed' : ''}`}
                      style={{ borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', padding: '0.85rem' }}
                    >
                      <label className="checkbox-label" style={{ flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleChoreStatus(chore.id)}
                          style={{ display: 'none' }}
                        />
                        <span className="checkbox-custom">
                          {isDone && <CheckCircle2 size={14} color="white" />}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{chore.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Scadenza: {chore.dueDate} • {chore.points} Punti
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leaderboard points */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Trophy size={20} color="#f59e0b" />
              <span>Classifica Punti Famiglia</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userPoints.map((u, idx) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: idx === 0 ? '#f59e0b' : 'var(--text-muted)', width: 20 }}>
                      #{idx + 1}
                    </span>
                    <div className="avatar-badge" style={{ backgroundColor: u.color, width: 30, height: 30, fontSize: '0.75rem' }}>
                      {u.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.count} compiti completati</div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f59e0b' }}>
                    {u.points} pt
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Upcoming Bills & Category Breakdown & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Upcoming Bills Widget */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertTriangle size={20} color="#ef4444" />
              <span>Bollette & Spese In Scadenza</span>
            </h3>

            {unpaidBills.length === 0 ? (
              <p style={{ color: 'var(--text-success)', fontSize: '0.9rem', fontWeight: 600 }}>
                Tutte le bollette sono saldate! Nessun pagamento in sospeso.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {unpaidBills.slice(0, 3).map(bill => (
                  <div key={bill.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{bill.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scadenza: {bill.dueDate}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem' }}>
                      €{bill.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bills Category Breakdown */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <PieChart size={20} color="#3b82f6" />
              <span>Spese Casa per Categoria</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.keys(billsByCategory).map(cat => {
                const catAmount = billsByCategory[cat];
                const pct = Math.round((catAmount / totalBillsSum) * 100);
                return (
                  <div key={cat} style={{ fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 600 }}>
                      <span>{cat}</span>
                      <span>€{catAmount.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: 'var(--radius-full)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log Widget */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={20} color="#8b5cf6" />
              <span>Attività Recenti</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto' }}>
              {activityLog.map(act => (
                <div key={act.id} style={{ fontSize: '0.8rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>[{act.timestamp}]</span> {act.text}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
