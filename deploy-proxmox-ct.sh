#!/usr/bin/env bash
# Proxmox LXC Automatic Creator & Deployer for Gestione Casa PWA

set -e

CT_ID=$(pvesh get /cluster/nextid)
CT_NAME="gestione-casa"
STORAGE="local-lvm"
TEMPLATE_STORAGE="local"
RAM=1024
DISK=8

echo "🚀 Avvio creazione automatica LXC Container (ID: $CT_ID) su Proxmox VE..."

# 1. Download Debian 12 Template se non presente
TEMPLATE="debian-12-standard_12.2-1_amd64.tar.zst"
if ! pveam list $TEMPLATE_STORAGE | grep -q "$TEMPLATE"; then
  echo "📥 Download del template Debian 12..."
  pveam download $TEMPLATE_STORAGE $TEMPLATE || true
fi

# Trova il percorso esatto del template scaricato
OSTEMPLATE=$(pveam list $TEMPLATE_STORAGE | grep debian-12 | awk '{print $2}' | head -n 1)

if [ -z "$OSTEMPLATE" ]; then
  # Fallback a qualsiasi template debian/ubuntu presente
  OSTEMPLATE=$(pveam list $TEMPLATE_STORAGE | grep -E "debian|ubuntu" | awk '{print $2}' | head -n 1)
fi

echo "📦 Creazione LXC Container $CT_ID ($CT_NAME)..."
pct create $CT_ID $TEMPLATE_STORAGE:vztmpl/$(basename $OSTEMPLATE) \
  --ostype debian \
  --hostname $CT_NAME \
  --cores 2 \
  --memory $RAM \
  --swap 512 \
  --features nesting=1 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --storage $STORAGE \
  --rootfs $STORAGE:$DISK \
  --onboot 1 \
  --unprivileged 1

echo "⚡ Avvio del container $CT_ID..."
pct start $CT_ID

sleep 5

echo "🛠️ Installazione Node.js, Git e Nginx all'interno del container..."
pct exec $CT_ID -- bash -c "
  apt-get update && apt-get install -y curl git nginx
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  
  git clone https://github.com/Impiantipuleo/gestione-casa.git /opt/gestione-casa
  cd /opt/gestione-casa
  npm ci
  npm run build
  
  cp -r dist/* /var/www/html/
  
  cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html;
    server_name _;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
  systemctl restart nginx
"

# Ottieni l'indirizzo IP del container
CT_IP=$(pct exec $CT_ID -- ip a show dev eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1 || echo "IP DHCP")

echo ""
echo "=========================================================="
echo "🎉 INSTALLAZIONE SU PROXMOX COMPLETATA CON SUCCESSO!"
echo "📍 Container CT ID: $CT_ID ($CT_NAME)"
echo "🌐 URL Applicazione: http://$CT_IP/"
echo "=========================================================="
