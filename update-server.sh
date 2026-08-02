#!/usr/bin/env bash
# Script di aggiornamento automatico per il server Gestione Casa su Proxmox / Linux

set -e

echo "🚀 Avvio aggiornamento di Gestione Casa PWA..."

# Se siamo nel container LXC, andiamo nella cartella dell'applicazione
if [ -d "/opt/gestione-casa" ]; then
  cd /opt/gestione-casa
fi

echo "📥 Sincronizzazione con il repository GitHub..."
git fetch origin main
git reset --hard origin/main

echo "📦 Installazione dipendenze e ricompilazione..."
npm install --legacy-peer-deps
npm run build

echo "🚚 Copia della nuova build nella cartella web di Nginx..."
cp -r dist/* /var/www/html/

echo "🔄 Riavvio server web Nginx..."
systemctl restart nginx

echo ""
echo "=========================================================="
echo "🎉 AGGIORNAMENTO SERVITORE COMPLETATO CON SUCCESSO!"
echo "🌐 L'applicazione aggiornata è ora attiva su porta 80."
echo "=========================================================="
