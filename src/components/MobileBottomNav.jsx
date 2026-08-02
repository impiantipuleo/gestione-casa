import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, ShoppingCart, CheckSquare, Gift, CreditCard, Users } from 'lucide-react';

export const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const { groceries, chores, wishlist, bills, currentUser, hasPermission } = useApp();

  const pendingGroceries = groceries.filter(g => !g.bought).length;
  const myPendingChores = chores.filter(c => c.status !== 'completato' && c.assignedTo?.includes(currentUser.id)).length;
  const unpaidBills = bills.filter(b => !b.paid).length;
  const pendingWishlist = wishlist.filter(w => !w.purchased).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, permission: null },
    { id: 'groceries', label: 'Spesa', icon: ShoppingCart, badge: pendingGroceries, badgeColor: '#3b82f6', permission: 'groceries_read' },
    { id: 'chores', label: 'Compiti', icon: CheckSquare, badge: myPendingChores, badgeColor: '#f59e0b', permission: 'chores_read' },
    { id: 'wishlist', label: 'Wishlist', icon: Gift, badge: pendingWishlist, badgeColor: '#ec4899', permission: 'wishlist_read' },
    { id: 'bills', label: 'Bollette', icon: CreditCard, badge: unpaidBills, badgeColor: '#ef4444', permission: 'bills_read' },
    { id: 'users', label: 'Utenti', icon: Users, badge: null, permission: 'users_manage' }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const isAllowed = item.permission ? hasPermission(item.permission) : true;
        const isActive = activeTab === item.id;

        if (!isAllowed) return null;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} />
              {item.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    backgroundColor: item.badgeColor || '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    minWidth: 16,
                    height: 16,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 0 4px rgba(0,0,0,0.4)'
                  }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
