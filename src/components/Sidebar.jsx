import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, ShoppingCart, CheckSquare, Gift, CreditCard, Users, Shield } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { groceries, chores, wishlist, bills, currentUser, hasPermission } = useApp();

  const pendingGroceries = groceries.filter(g => !g.bought).length;
  const myPendingChores = chores.filter(c => c.status !== 'completato' && c.assignedTo?.includes(currentUser.id)).length;
  const unpaidBills = bills.filter(b => !b.paid).length;
  const pendingWishlist = wishlist.filter(w => !w.purchased).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, permission: null },
    { id: 'groceries', label: 'Lista Spesa', icon: ShoppingCart, badge: pendingGroceries, badgeColor: '#3b82f6', permission: 'groceries_read' },
    { id: 'chores', label: 'Compiti Assegnati', icon: CheckSquare, badge: myPendingChores, badgeColor: '#f59e0b', permission: 'chores_read' },
    { id: 'wishlist', label: 'Cose da Comprare', icon: Gift, badge: pendingWishlist, badgeColor: '#ec4899', permission: 'wishlist_read' },
    { id: 'bills', label: 'Cose da Pagare', icon: CreditCard, badge: unpaidBills, badgeColor: '#ef4444', permission: 'bills_read' },
    { id: 'users', label: 'Utenti & Permessi', icon: Users, badge: null, permission: 'users_manage' }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '0 0.5rem 1.5rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          color: 'white',
          fontWeight: 800
        }}>
          GC
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Casa Dolce Casa</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gestione Familiare</p>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isAllowed = item.permission ? hasPermission(item.permission) : true;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isAllowed) {
                  setActiveTab(item.id);
                  if (setIsOpen) setIsOpen(false);
                }
              }}
              className="btn"
              style={{
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.25), transparent)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : isAllowed ? 'var(--text-main)' : 'var(--text-dim)',
                borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                opacity: isAllowed ? 1 : 0.45,
                cursor: isAllowed ? 'pointer' : 'not-allowed'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={20} />
                <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}>{item.label}</span>
              </div>

              {item.badge > 0 && isAllowed && (
                <span 
                  style={{
                    backgroundColor: item.badgeColor || 'var(--accent-primary)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {item.badge}
                </span>
              )}

              {!isAllowed && <Shield size={14} style={{ color: 'var(--text-dim)' }} />}
            </button>
          );
        })}
      </nav>

      {/* User Info Card */}
      <div className="glass-card" style={{ padding: '1rem', marginTop: 'auto', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="avatar-badge" style={{ backgroundColor: currentUser.color }}>
            {currentUser.avatar}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ruolo: <strong style={{ color: 'var(--text-main)' }}>{currentUser.role}</strong>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
