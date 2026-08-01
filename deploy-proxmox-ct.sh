#!/usr/bin/env bash
# Proxmox LXC Automatic Creator & Deployer for Gestione Casa PWA

set -e

CT_ID=$(pvesh get /cluster/nextid)
CT_NAME="gestione-casa"
STORAGE="local-lvm"

echo "🚀 Avvio creazione automatica LXC Container (ID: $CT_ID) su Proxmox VE..."

# Update pveam template database
pveam update || true

# Find debian-12 template or fallback
TEMPLATE_NAME=$(pveam available --section system | grep debian-12 | awk '{print $2}' | tail -n 1)

if [ -z "$TEMPLATE_NAME" ]; then
  TEMPLATE_NAME="debian-12-standard_12.7-1_amd64.tar.zst"
fi

echo "📥 Download del template Proxmox ($TEMPLATE_NAME)..."
pveam download local "$TEMPLATE_NAME" || true

TEMPLATE_FILE=$(ls /var/lib/vz/template/cache/debian-12* 2>/dev/null | head -n 1)

if [ -z "$TEMPLATE_FILE" ]; then
  echo "📥 Download diretto del template Debian 12..."
  wget -O "/var/lib/vz/template/cache/debian-12-standard_12.7-1_amd64.tar.zst" "http://download.proxmox.com/images/system/debian-12-standard_12.7-1_amd64.tar.zst"
  TEMPLATE_FILE="/var/lib/vz/template/cache/debian-12-standard_12.7-1_amd64.tar.zst"
fi

echo "📦 Creazione LXC Container ID $CT_ID ($CT_NAME)..."
pct create $CT_ID "local:vztmpl/$(basename "$TEMPLATE_FILE")" \
  --ostype debian \
  --hostname $CT_NAME \
  --cores 2 \
  --memory 1024 \
  --swap 512 \
  --features nesting=1 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --storage $STORAGE \
  --rootfs $STORAGE:8 \
  --onboot 1 \
  --unprivileged 1

echo "⚡ Avvio del container ID $CT_ID..."
pct start $CT_ID

sleep 5

echo "🛠️ Installazione Node.js, Git e Nginx all'interno del container..."
pct exec $CT_ID -- bash -c "
  apt-get update && apt-get install -y curl git nginx
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  
  git clone https://github.com/Impiantipuleo/gestione-casa.git /opt/gestione-casa
  cd /opt/gestione-casa
  npm install --legacy-peer-deps
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
