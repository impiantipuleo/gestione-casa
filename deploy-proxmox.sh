#!/bin/bash
# Script di installazione automatica per Container LXC Proxmox (Debian/Ubuntu)

echo "🚀 Installazione Gestione Casa PWA su Proxmox CT..."

# Aggiornamento pacchetti
apt-get update && apt-get install -y curl git nginx

# Installazione Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Compilazione dell'applicazione Vite
npm install
npm run build

# Configurazione Nginx
cp -r dist/* /var/www/html/

cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

systemctl restart nginx

echo "✅ CONFIGURAZIONE COMPLETATA!"
echo "Ora l'applicazione è attiva all'IP del tuo container Proxmox: http://$(hostname -I | awk '{print $1}')"
