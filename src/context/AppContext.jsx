import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabaseClient';

const AppContext = createContext();

const INITIAL_USERS = [
  {
    id: 'u_admin',
    name: 'Vittorio',
    role: 'admin',
    avatar: 'VI',
    color: '#8b5cf6',
    password: 'Admin1234!',
    permissions: {
      groceries_read: true, groceries_write: true, groceries_delete: true,
      chores_read: true, chores_write: true, chores_assign: true, chores_delete: true,
      wishlist_read: true, wishlist_write: true, wishlist_delete: true,
      bills_read: true, bills_write: true, bills_delete: true,
      users_manage: true
    }
  }
];

const INITIAL_GROCERIES = [
  { id: 'g1', name: 'Latte Intero (2L)', category: 'Freschi', quantity: '2 cartoni', priority: 'Alta', bought: false, addedBy: 'Vittorio', boughtBy: '' },
  { id: 'g2', name: 'Pane di Altamura', category: 'Orto/Forno', quantity: '1 kg', priority: 'Media', bought: false, addedBy: 'Vittorio', boughtBy: '' }
];

const INITIAL_CHORES = [
  { id: 'c1', title: 'Portare fuori la spazzatura differenziata', description: 'Plastica e Carta stasera entro le 22', assignedTo: ['u_admin'], dueDate: '2026-08-01', points: 15, frequency: 'Giornaliero', status: 'da_fare' }
];

const INITIAL_WISHLIST = [
  { id: 'w1', title: 'Aspirapolvere Robot Wi-Fi', estimatedPrice: 299.90, priority: 'Alta', category: 'Elettrodomestici', url: 'https://example.com/robot', requester: 'Vittorio', purchased: false, purchasedBy: '' }
];

const INITIAL_BILLS = [
  { id: 'b1', title: 'Bolletta Energia Elettrica (Luce)', category: 'Luce', amount: 124.50, dueDate: '2026-08-05', paid: false, paidBy: '', splits: ['u_admin'], provider: 'Enel Energia', addedBy: 'Vittorio' }
];

export const AppProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justSynced, setJustSynced] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('gc_theme') || 'dark');
  const [notificationsAllowed, setNotificationsAllowed] = useState(() => 'Notification' in window && Notification.permission === 'granted');

  // Supabase Client state
  const [supabaseClient, setSupabaseClient] = useState(() => getSupabaseClient());
  const [isCloudConnected, setIsCloudConnected] = useState(() => Boolean(getSupabaseClient()));

  // Persistent Users State
  const [users, setUsersState] = useState(() => {
    const saved = localStorage.getItem('gc_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem('gc_current_user') || (users[0]?.id || 'u_admin');
  });

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  
  const [groceries, setGroceriesState] = useState(() => JSON.parse(localStorage.getItem('gc_groceries')) || INITIAL_GROCERIES);
  const [chores, setChoresState] = useState(() => JSON.parse(localStorage.getItem('gc_chores')) || INITIAL_CHORES);
  const [wishlist, setWishlistState] = useState(() => JSON.parse(localStorage.getItem('gc_wishlist')) || INITIAL_WISHLIST);
  const [bills, setBillsState] = useState(() => JSON.parse(localStorage.getItem('gc_bills')) || INITIAL_BILLS);
  const [activityLog, setActivityLog] = useState(() => JSON.parse(localStorage.getItem('gc_activity_log')) || []);

  // Safe Push to Cloud
  const pushToCloud = async (tableName, dataArray) => {
    if (!supabaseClient) return;
    try {
      if (tableName === 'users') {
        const rows = dataArray.map(u => ({
          id: String(u.id),
          name: String(u.name),
          role: String(u.role),
          avatar: String(u.avatar),
          color: String(u.color),
          password: String(u.password || ''),
          permissions: u.permissions || {}
        }));
        const { error } = await supabaseClient.from('users').upsert(rows);
        if (error) {
          // If password column missing on Supabase, fallback without password column
          const safeRows = dataArray.map(u => ({
            id: String(u.id),
            name: String(u.name),
            role: String(u.role),
            avatar: String(u.avatar),
            color: String(u.color),
            permissions: u.permissions || {}
          }));
          await supabaseClient.from('users').upsert(safeRows);
        }
      } else if (tableName === 'groceries') {
        const rows = dataArray.map(g => ({
          id: String(g.id),
          name: String(g.name),
          category: String(g.category),
          quantity: String(g.quantity || ''),
          priority: String(g.priority || 'Media'),
          bought: Boolean(g.bought),
          added_by: String(g.addedBy || 'Utente')
        }));
        const { error } = await supabaseClient.from('groceries').upsert(rows);
        if (error) console.error("Groceries push error:", error);
      } else if (tableName === 'chores') {
        const rows = dataArray.map(c => ({
          id: String(c.id),
          title: String(c.title),
          description: String(c.description || ''),
          assigned_to: c.assignedTo || ['u_admin'],
          due_date: String(c.dueDate || ''),
          points: Number(c.points) || 10,
          frequency: String(c.frequency || 'Settimanale'),
          status: String(c.status || 'da_fare'),
          completed_by: String(c.completedBy || '')
        }));
        const { error } = await supabaseClient.from('chores').upsert(rows);
        if (error) console.error("Chores push error:", error);
      } else if (tableName === 'wishlist') {
        const rows = dataArray.map(w => ({
          id: String(w.id),
          title: String(w.title),
          estimated_price: Number(w.estimatedPrice) || 0,
          category: String(w.category || 'Altro'),
          priority: String(w.priority || 'Media'),
          url: String(w.url || ''),
          requester: String(w.requester || ''),
          purchased: Boolean(w.purchased)
        }));
        const { error } = await supabaseClient.from('wishlist').upsert(rows);
        if (error) console.error("Wishlist push error:", error);
      } else if (tableName === 'bills') {
        const rows = dataArray.map(b => ({
          id: String(b.id),
          title: String(b.title),
          category: String(b.category || 'Altro'),
          amount: Number(b.amount) || 0,
          due_date: String(b.dueDate || ''),
          paid: Boolean(b.paid),
          paid_by: String(b.paidBy || ''),
          splits: b.splits || ['u_admin'],
          provider: String(b.provider || '')
        }));
        const { error } = await supabaseClient.from('bills').upsert(rows);
        if (error) console.error("Bills push error:", error);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn("Cloud push error:", err);
    }
  };

  // Pull data from Supabase Cloud safely
  const pullFromCloud = useCallback(async () => {
    if (!supabaseClient) return;
    try {
      // 0. Users
      const { data: uData, error: uErr } = await supabaseClient.from('users').select('*');
      if (!uErr && uData && uData.length > 0) {
        setUsersState(prev => {
          const localMap = new Map(prev.map(u => [u.id, u.password]));
          const formattedUsers = uData.map(u => ({
            id: u.id,
            name: u.name,
            role: u.role,
            avatar: u.avatar || u.name.slice(0, 2).toUpperCase(),
            color: u.color || '#8b5cf6',
            password: u.password || localMap.get(u.id) || '1234',
            permissions: u.permissions || {}
          }));

          const cloudIds = new Set(formattedUsers.map(item => item.id));
          const localOnly = prev.filter(item => !cloudIds.has(item.id) && item.id.startsWith('u_'));
          const merged = [...formattedUsers, ...localOnly];
          localStorage.setItem('gc_users', JSON.stringify(merged));
          return merged;
        });
      }

      // 1. Groceries
      const { data: gData, error: gErr } = await supabaseClient.from('groceries').select('*');
      if (!gErr && gData) {
        const formatted = gData.map(g => ({
          id: g.id,
          name: g.name,
          category: g.category,
          quantity: g.quantity || '',
          priority: g.priority || 'Media',
          bought: Boolean(g.bought),
          addedBy: g.added_by || 'Utente',
          boughtBy: g.bought_by || ''
        }));
        
        setGroceriesState(prev => {
          const cloudIds = new Set(formatted.map(item => item.id));
          const localOnly = prev.filter(item => !cloudIds.has(item.id) && item.id.startsWith('g_'));
          const merged = [...formatted, ...localOnly];
          localStorage.setItem('gc_groceries', JSON.stringify(merged));
          return merged;
        });
      }

      // 2. Chores
      const { data: cData, error: cErr } = await supabaseClient.from('chores').select('*');
      if (!cErr && cData) {
        const formatted = cData.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          assignedTo: c.assigned_to || ['u_admin'],
          dueDate: c.due_date || '',
          points: Number(c.points) || 10,
          frequency: c.frequency || 'Settimanale',
          status: c.status || 'da_fare',
          completedBy: c.completed_by || ''
        }));
        setChoresState(prev => {
          const cloudIds = new Set(formatted.map(item => item.id));
          const localOnly = prev.filter(item => !cloudIds.has(item.id) && item.id.startsWith('c_'));
          const merged = [...formatted, ...localOnly];
          localStorage.setItem('gc_chores', JSON.stringify(merged));
          return merged;
        });
      }

      // 3. Wishlist
      const { data: wData, error: wErr } = await supabaseClient.from('wishlist').select('*');
      if (!wErr && wData) {
        const formatted = wData.map(w => ({
          id: w.id,
          title: w.title,
          estimatedPrice: Number(w.estimated_price) || 0,
          category: w.category || 'Altro',
          priority: w.priority || 'Media',
          url: w.url || '',
          requester: w.requester || '',
          purchased: Boolean(w.purchased),
          purchasedBy: w.purchased_by || ''
        }));
        setWishlistState(prev => {
          const cloudIds = new Set(formatted.map(item => item.id));
          const localOnly = prev.filter(item => !cloudIds.has(item.id) && item.id.startsWith('w_'));
          const merged = [...formatted, ...localOnly];
          localStorage.setItem('gc_wishlist', JSON.stringify(merged));
          return merged;
        });
      }

      // 4. Bills
      const { data: bData, error: bErr } = await supabaseClient.from('bills').select('*');
      if (!bErr && bData) {
        const formatted = bData.map(b => ({
          id: b.id,
          title: b.title,
          category: b.category || 'Altro',
          amount: Number(b.amount) || 0,
          dueDate: b.due_date || '',
          paid: Boolean(b.paid),
          paidBy: b.paid_by || '',
          splits: b.splits || ['u_admin'],
          provider: b.provider || '',
          addedBy: b.added_by || ''
        }));
        setBillsState(prev => {
          const cloudIds = new Set(formatted.map(item => item.id));
          const localOnly = prev.filter(item => !cloudIds.has(item.id) && item.id.startsWith('b_'));
          const merged = [...formatted, ...localOnly];
          localStorage.setItem('gc_bills', JSON.stringify(merged));
          return merged;
        });
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn("Pull Cloud error:", err);
    }
  }, [supabaseClient]);

  // Realtime Subscription & Background Polling
  useEffect(() => {
    if (!supabaseClient) return;

    pullFromCloud();

    const channel = supabaseClient
      .channel('public-realtime-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => pullFromCloud())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groceries' }, () => pullFromCloud())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores' }, () => pullFromCloud())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist' }, () => pullFromCloud())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => pullFromCloud())
      .subscribe();

    const syncInterval = setInterval(() => {
      pullFromCloud();
    }, 4000);

    return () => {
      supabaseClient.removeChannel(channel);
      clearInterval(syncInterval);
    };
  }, [supabaseClient, pullFromCloud]);

  // Explicit Delete from Supabase Cloud
  const deleteFromCloud = async (tableName, id) => {
    if (!supabaseClient) return;
    try {
      await supabaseClient.from(tableName).delete().eq('id', id);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn("Cloud delete error:", err);
    }
  };

  // Login & Authentication functions (Robust comparison)
  const loginUser = (userId, enteredPassword) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return false;

    const cleanEntered = (enteredPassword || '').trim();
    const cleanStored = (targetUser.password || '').trim();

    // If stored password matches clean entered password OR if cleanStored is empty
    if (!cleanStored || cleanStored === cleanEntered) {
      setCurrentUserId(userId);
      setIsLoggedIn(true);
      localStorage.setItem('gc_current_user', userId);
      localStorage.setItem('gc_is_logged_in', 'true');
      logActivity(`${targetUser.name} ha effettuato l'accesso all'applicazione`);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    localStorage.setItem('gc_is_logged_in', 'false');
  };

  // Sync state updaters
  const setUsers = (updater) => {
    setUsersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('gc_users', JSON.stringify(next));
      if (supabaseClient) pushToCloud('users', next);
      return next;
    });
  };

  const setGroceries = (updater) => {
    setGroceriesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('gc_groceries', JSON.stringify(next));
      if (supabaseClient) pushToCloud('groceries', next);
      return next;
    });
  };

  const setChores = (updater) => {
    setChoresState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('gc_chores', JSON.stringify(next));
      if (supabaseClient) pushToCloud('chores', next);
      return next;
    });
  };

  const setWishlist = (updater) => {
    setWishlistState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('gc_wishlist', JSON.stringify(next));
      if (supabaseClient) pushToCloud('wishlist', next);
      return next;
    });
  };

  const setBills = (updater) => {
    setBillsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('gc_bills', JSON.stringify(next));
      if (supabaseClient) pushToCloud('bills', next);
      return next;
    });
  };

  // Setup Cloud Sync
  const setupCloudSync = async (url, key) => {
    try {
      const targetUrl = url.trim() || 'https://vbhvbvguhdeiwujewjzm.supabase.co';
      const targetKey = key.trim() || 'sb_publishable_2jqauNNULfMPIfoxWEktaQ_jLoSQmXz';

      localStorage.setItem('gc_supabase_url', targetUrl);
      localStorage.setItem('gc_supabase_key', targetKey);
      
      const client = getSupabaseClient();
      if (!client) return false;

      setSupabaseClient(client);
      setIsCloudConnected(true);

      await pushToCloud('users', users);
      await pushToCloud('groceries', groceries);
      await pushToCloud('chores', chores);
      await pushToCloud('wishlist', wishlist);
      await pushToCloud('bills', bills);

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      logActivity(`Sincronizzazione Cloud Supabase attivata con successo!`);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const disableCloudSync = () => {
    localStorage.removeItem('gc_supabase_url');
    localStorage.removeItem('gc_supabase_key');
    setSupabaseClient(null);
    setIsCloudConnected(false);
    setLastSyncTime(null);
    logActivity(`Sincronizzazione Cloud disattivata`);
  };

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 4000);
      if (supabaseClient) {
        pullFromCloud();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [supabaseClient, pullFromCloud]);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('gc_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('gc_current_user', currentUserId); }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const hasPermission = (permissionKey) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return !!(currentUser.permissions && currentUser.permissions[permissionKey]);
  };

  const logActivity = (text) => {
    const newLog = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActivityLog(prev => {
      const next = [newLog, ...prev.slice(0, 24)];
      localStorage.setItem('gc_activity_log', JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setNotificationsAllowed(true);
        new Notification("Gestione Casa PWA", { body: "Notifiche attivate!", icon: "/vite.svg" });
      }
    }
  };

  const exportData = () => {
    const backupObj = { version: '1.0', exportedAt: new Date().toISOString(), users, groceries, chores, wishlist, bills, activityLog };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gestione_casa_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logActivity(`${currentUser.name} ha scaricato un backup completo dei dati JSON`);
  };

  const importData = (jsonContent) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.groceries) setGroceries(parsed.groceries);
      if (parsed.chores) setChores(parsed.chores);
      if (parsed.wishlist) setWishlist(parsed.wishlist);
      if (parsed.bills) setBills(parsed.bills);
      if (parsed.activityLog) setActivityLog(parsed.activityLog);
      alert("Dati ripristinati con successo!");
    } catch (err) {
      alert("Errore nel formato del file JSON. Impossibile importare.");
    }
  };

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('u_admin');
    setIsLoggedIn(true);
    setGroceries(INITIAL_GROCERIES);
    setChores(INITIAL_CHORES);
    setWishlist(INITIAL_WISHLIST);
    setBills(INITIAL_BILLS);
    logActivity('Ripristinati i dati demo iniziali dell\'applicazione');
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        justSynced,
        lastSyncTime,
        theme,
        toggleTheme,
        notificationsAllowed,
        requestNotificationPermission,
        isCloudConnected,
        setupCloudSync,
        disableCloudSync,
        users, setUsers,
        currentUserId, setCurrentUserId,
        currentUser,
        isLoggedIn,
        loginUser,
        logoutUser,
        hasPermission,
        groceries, setGroceries,
        chores, setChores,
        wishlist, setWishlist,
        bills, setBills,
        activityLog, logActivity,
        resetDemoData,
        exportData, importData,
        pullFromCloud,
        deleteFromCloud
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
