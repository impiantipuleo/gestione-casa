# 🏠 Gestione Casa PWA & Native Mobile App

Un'applicazione completa, moderna ed elegante per la gestione della casa in famiglia. Sincronizzata in tempo reale, protetta da password ed installabile sia come **PWA Web**, sia come app nativa per **Android (APK)** e **iOS (iPhone/iPad)**.

---

## 🌟 Funzionalità Principali

- 🛒 **Lista della Spesa**: Aggiunta rapida, spunta articoli, prezzo stimato e badge con chi ha aggiunto/comprato l'articolo.
- 📋 **Lista dei Compiti (Chores)**: Assegnazione compiti domestici ai membri della famiglia con priorità e frequenza.
- 💡 **Lista Desideri & Acquisti (Wishlist)**: Tracciamento degli acquisti pianificati con importo ed attribuzione dell'acquirente.
- 💳 **Bollette & Scadenze**: Gestione delle spese mensili, stato di saldo ("Da saldare" / "Saldato") e chi ha saldato la bolletta.
- 👥 **Gestione Utenti & Sicurezza**:
  - Cambio utente rapido protetto da password.
  - Profilo **Admin** (`Vittorio` / `Admin1234!`) per creare, modificare o eliminare utenti.
- 🔄 **Sincronizzazione Cloud & Offline**:
  - Funziona sia offline che online con sincronizzazione automatica su database Supabase Cloud.

---

## 🔐 Credenziali Predefinite

| Utente | Password | Ruolo |
| :--- | :--- | :--- |
| **Vittorio** | `Admin1234!` | 👑 Amministratore |

---

## 🚀 Installazione su Proxmox VE (Container LXC)

Per installare o aggiornare il server domestico 24/7 su Proxmox:

### 1️⃣ Creazione automatica del Container LXC (1-Click)
Apri la **Shell di Proxmox** ed incolla:

```bash
curl -sL https://raw.githubusercontent.com/Impiantipuleo/gestione-casa/main/deploy-proxmox-ct.sh | bash
```

### 2️⃣ Aggiornamento automatico (Senza ricreare il container)
Per aggiornare il codice all'ultima versione GitHub sul container esistente, esegui all'interno della shell del container:

```bash
curl -sL https://raw.githubusercontent.com/Impiantipuleo/gestione-casa/main/update-server.sh | bash
```

---

## 📱 Guida all'Installazione Mobile (Android & iOS)

Le build degli eseguibili vengono generate automaticamente ad ogni aggiornamento tramite **GitHub Actions**:
👉 **[GitHub Actions Releases & Artifacts](https://github.com/Impiantipuleo/gestione-casa/actions)**

### 🤖 Android (APK)
1. Scarica l'artifact **`GestioneCasa-Android-APK`**.
2. Apri il file **`app-debug.apk`** sul tuo smartphone Android e clicca **Installa**.

### 🍏 iOS (iPhone & iPad)
1. **Tramite Safari PWA (Consigliato)**:
   - Apri Safari sul tuo iPhone.
   - Vai all'indirizzo del server (es. `http://192.168.1.185/` o `proxmox.vittorioplu.synology.me`).
   - Tocca **Condividi** ➔ **Aggiungi alla schermata Home**.
2. **Tramite AltStore / Sideloadly**:
   - Scarica l'artifact **`GestioneCasa-iOS-IPA`**.
   - Apri **Sideloadly** o **AltStore** sul PC/Mac, collega l'iPhone via USB e seleziona `GestioneCasa-iOS.ipa` per l'installazione nativa.

---

## 🛠️ Stack Tecnologico

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS Glassmorphism Design System.
- **Backend / Database**: Supabase (PostgreSQL + Realtime Sync).
- **Mobile Engine**: Capacitor 6 (`@capacitor/android`, `@capacitor/ios`).
- **Server Deployment**: Docker / Nginx su Proxmox LXC Debian 12.
