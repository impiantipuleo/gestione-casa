import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Check, Copy, Server, Cloud, CloudOff, RefreshCw, AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { getSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../lib/supabaseClient';

export const CloudConfigModal = ({ onClose }) => {
  const { isCloudConnected, setupCloudSync, disableCloudSync, lastSyncTime, pullFromCloud } = useApp();

  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || 'https://vbhvbvguhdeiwujewjzm.supabase.co');
  const [key, setKey] = useState(currentConfig.key);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testing, setTesting] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!key.trim()) {
      setStatusMessage({ type: 'error', text: 'Incolla la tua API Key di Supabase!' });
      return;
    }

    setTesting(true);
    setStatusMessage(null);

    const success = await setupCloudSync(url.trim(), key.trim());
    setTesting(false);

    if (success) {
      setStatusMessage({ type: 'success', text: 'Salvataggio completato! Database Cloud Supabase collegato con successo.' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: 'Errore durante il collegamento. Verifica di aver incollato la chiave corretta.' });
    }
  };

  const handleManualSync = async () => {
    setPulling(true);
    await pullFromCloud();
    setPulling(false);
    setStatusMessage({ type: 'success', text: 'Sincronizzazione manuale effettuata!' });
  };

  const handleDisable = () => {
    disableCloudSync();
    setKey('');
    setStatusMessage({ type: 'info', text: 'Sincronizzazione Cloud disattivata. L\'app sta utilizzando il Database Locale.' });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Database size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Configurazione Cloud Database (Supabase)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sincronizza i dati della tua casa in tempo reale su smartphone, tablet e PC diversi
            </p>
          </div>
        </div>

        {/* Connection status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: isCloudConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
          border: '1px solid ' + (isCloudConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'),
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 700 }}>
              {isCloudConnected ? <Cloud color="#10b981" size={20} /> : <CloudOff color="#94a3b8" size={20} />}
              <span>Stato: <strong style={{ color: isCloudConnected ? '#10b981' : 'var(--text-muted)' }}>
                {isCloudConnected ? 'Connesso a Supabase Cloud (Realtime Active)' : 'Database Locale (LocalStorage)'}
              </strong></span>
            </div>
            {lastSyncTime && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={12} /> Ultimo sync riuscito: <strong>{lastSyncTime}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {isCloudConnected && (
              <button className="btn btn-secondary" onClick={handleManualSync} disabled={pulling} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                <RefreshCw size={12} className={pulling ? 'animate-spin' : ''} />
                <span>Sync Ora</span>
              </button>
            )}

            {isCloudConnected && (
              <button className="btn btn-danger" onClick={handleDisable} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                Disconnetti
              </button>
            )}
          </div>
        </div>

        {statusMessage && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-input)',
            color: statusMessage.type === 'success' ? '#10b981' : statusMessage.type === 'error' ? '#f87171' : 'var(--text-main)'
          }}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Supabase Project URL *</label>
            <input
              type="url"
              className="input"
              placeholder="https://vbhvbvguhdeiwujewjzm.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase API Key (Publishable o Anon Key) *</label>
            <input
              type="password"
              className="input"
              placeholder="Incolla la tua chiave sb_publishable_... o eyJhbGci..."
              value={key}
              onChange={e => setKey(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Quick instructions & SQL button */}
          <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Perché abilitare il Realtime:</span>
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                <span>supabase.com</span> <ExternalLink size={12} />
              </a>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.6rem' }}>
              Copia lo script qui sotto ed eseguilo nell'**SQL Editor** di Supabase per creare le 5 tabelle della casa ed abilitare la pubblicazione Realtime automatica.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopySql}
              style={{ width: '100%', fontSize: '0.8rem' }}
            >
              {copiedSql ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{copiedSql ? 'Script SQL Copiato!' : 'Copia Script SQL Tabelle & Realtime'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Chiudi
            </button>
            <button type="submit" className="btn btn-primary" disabled={testing}>
              {testing ? <RefreshCw size={16} className="animate-spin" /> : <Server size={16} />}
              <span>{testing ? 'Salvataggio in corso...' : 'Salva e Sincronizza'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
