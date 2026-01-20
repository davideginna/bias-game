# 📱 Guida PWA - Bias

Bias è ora una **Progressive Web App (PWA)** installabile!

## ✨ Vantaggi

- 📲 **Installabile**: Aggiungi alla home screen come un'app nativa
- ⚡ **Offline Ready**: Funziona anche senza connessione internet
- 🚀 **Caricamento Veloce**: File cachati per prestazioni ottimali
- 📱 **App-like**: Esperienza fullscreen senza browser UI
- 🔄 **Auto-Update**: Aggiornamenti automatici quando disponibili

## 🚀 Come Installare

### Su Android (Chrome)
1. Apri `https://davideginna.github.io/bias-game/`
2. Tocca il menu (⋮) in alto a destra
3. Seleziona **"Aggiungi a schermata Home"** o **"Installa app"**
4. Conferma e l'icona apparirà nella home screen

### Su iPhone/iPad (Safari)
1. Apri `https://davideginna.github.io/bias-game/`
2. Tocca il pulsante **Condividi** (quadrato con freccia)
3. Scorri e seleziona **"Aggiungi a Home"**
4. Conferma e l'icona apparirà nella home screen

### Su Desktop (Chrome/Edge)
1. Apri `https://davideginna.github.io/bias-game/`
2. Clicca sull'icona **Installa** (+) nella barra degli indirizzi
3. Oppure: Menu → **Installa Bias...**
4. L'app apparirà come finestra separata

### Su Desktop (Firefox)
1. Firefox non supporta l'installazione PWA diretta
2. Usa il sito normalmente o installa su mobile

## 🔧 Requisiti

Per installare la PWA, il sito deve essere:
- ✅ Servito via **HTTPS** (GitHub Pages lo fa automaticamente)
- ✅ Avere un **manifest.json** valido ✓
- ✅ Avere un **Service Worker** registrato ✓
- ✅ Avere **icone** in varie dimensioni ✓

## 📦 Cosa Viene Cachato

### Cache Statica (sempre disponibile offline)
- HTML, CSS, JavaScript
- Icone e immagini
- File dilemmi (100 dilemmi)
- Configurazione Firebase

### Cache Dinamica
- Librerie Firebase da CDN
- Risorse esterne caricate durante l'uso

### NON Cachato (richiede internet)
- **Firebase Realtime Database** (sincronizzazione in tempo reale)
- Dati delle stanze e giocatori
- Stato del gioco live

## 🎮 Funzionalità Offline

### ✅ Funziona Offline:
- Apertura dell'app
- Visualizzazione home screen
- Lettura regole
- Cambio tema
- Interfaccia completa

### ❌ Richiede Connessione:
- Creare/unirsi a stanze
- Giocare (Firebase real-time)
- Sincronizzazione giocatori
- Aggiornamenti turni

## 🔄 Aggiornamenti

L'app controlla automaticamente gli aggiornamenti:
- Quando disponibile una nuova versione, vedrai un messaggio
- Ricarica la pagina per applicare l'aggiornamento
- I tuoi dati salvati (tema, sessione) vengono preservati

## 🧪 Test PWA

### Verifica Installabilità (Chrome DevTools)
1. Apri DevTools (F12)
2. Tab **Application**
3. Sezione **Manifest**: Controlla errori
4. Sezione **Service Workers**: Deve essere "activated and running"
5. **Lighthouse** → Run audit → PWA score

### Comandi Console per Debug
```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs));

// Clear all caches
caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));

// Unregister service worker
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

## 📊 Performance

**Lighthouse PWA Score Target: 90+**

Requisiti soddisfatti:
- ✅ Fast load time (< 3s)
- ✅ Works offline
- ✅ Installable
- ✅ Mobile responsive
- ✅ HTTPS served
- ✅ Themed splash screen
- ✅ Viewport meta tag
- ✅ Service worker registered

## 🐛 Troubleshooting

### "Installa" non appare
- Verifica di essere su HTTPS
- Apri DevTools → Application → Manifest (controlla errori)
- Service Worker deve essere "activated"
- Ricarica la pagina con Ctrl+Shift+R

### App non funziona offline
- Controlla Service Worker in DevTools
- Verifica che i file siano stati cachati
- Controlla console per errori

### Aggiornamento non si applica
- Chiudi tutte le tab dell'app
- Riapri l'app
- Oppure: Disinstalla e reinstalla

### Service Worker non si registra
```javascript
// In console, controlla:
navigator.serviceWorker.ready.then(reg => console.log('SW ready:', reg));
```

## 🔒 Sicurezza

- Service Worker funziona solo su HTTPS
- GitHub Pages fornisce HTTPS automaticamente
- Cache è isolata per origine (domain)
- Firebase credenziali sono sicure (regole DB)

## 📝 Note Tecniche

**Service Worker:** `/service-worker.js`
- Cache strategy: Cache-first per statici, Network-first per dinamici
- Versione: `bias-v1.2.0`
- Scope: `/` (tutto il sito)

**Manifest:** `/manifest.json`
- Display: standalone (fullscreen)
- Orientation: portrait-primary
- Theme color: `#0f172a` (dark blue)
- Icone: 32x32, 192x192, 512x512

---

**Buon gioco con Bias PWA! 🎮**
