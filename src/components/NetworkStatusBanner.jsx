import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const NetworkStatusBanner = () => {
  const { isOnline, justSynced } = useApp();

  if (isOnline && !justSynced) return null;

  return (
    <div>
      {!isOnline && (
        <div className="network-banner network-offline">
          <WifiOff size={18} />
          <span>Modalità Offline Attiva — Tutte le modifiche vengono salvate in locale e saranno sincronizzate al rientro della connessione.</span>
        </div>
      )}
      {isOnline && justSynced && (
        <div className="network-banner network-online-sync">
          <Wifi size={18} />
          <RefreshCw size={16} className="animate-spin" />
          <span>Connessione ripristinata! Dati della casa sincronizzati con successo.</span>
        </div>
      )}
    </div>
  );
};
