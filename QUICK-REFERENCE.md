# ⚡ Quick Reference - Bais

Comandi e snippet più usati.

---

## 🚀 Start Server
```bash
cd /home/davide/Documents/personale/scrupple
python3 -m http.server 8000
# http://localhost:8000
```

---

## 🐛 Debug Console

### Log Critici
```javascript
// ✅ OK
Loaded 100 dilemmas
Starting game...
Cards distributed: {...}
renderPlayerCards called with: [...]
Player xxx drew new card: 42

// ❌ PROBLEMI
Loaded 0 dilemmas
No current turn yet
Permission denied
```

### Verifica Carte
```javascript
// In Console browser:
CardManager.getAllDilemmas().length  // Dovrebbe essere 100
```

---

## 🔥 Firebase Quick Check

### Regole DB
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### Struttura Room
```
/rooms/ABC123/
  config/status: "playing"
  players/player_xxx/cards: [1,5,12,34,56,78]  ← sempre 6
  usedDilemmas: [2,7,15,...]
  currentTurn/activePlayerId: "player_xxx"
```

---

## 🎨 CSS Quick Edit

### Colori Tema
```css
--success-color: #10b981   (verde)
--danger-color: #ef4444    (rosso)
--warning-color: #f59e0b   (arancione)
--primary-color: #6366f1   (blu)
```

### Effetto Glow
```css
box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
```

---

## 📝 Snippet Comuni

### Aggiungere Firebase Function
```javascript
// firebase-manager.js
export async function nuovaFunzione(roomId, data) {
  try {
    await database.ref(`rooms/${roomId}/path`).set(data);
    return true;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Aggiungere UI Function
```javascript
// ui-controller.js
export function renderNuovoComponente(data) {
  const container = document.getElementById('container-id');
  if (!container) return;

  container.innerHTML = '';
  // render logic
}
```

### Event Listener Pattern
```javascript
// main.js
const btn = document.getElementById('btn-id');
if (btn) {
  btn.addEventListener('click', handleClick);
}

function handleClick() {
  try {
    UI.showLoading('Loading...');
    // logic
    UI.hideLoading();
  } catch (error) {
    console.error('Error:', error);
    UI.showToast('Errore', 'error');
  }
}
```

---

## 🔧 Fix Rapidi

### Cache
```
Ctrl+Shift+R  (hard reload)
Ctrl+Shift+N  (incognito)
```

### Firebase Error
```javascript
// Controlla credenziali
console.log(firebaseConfig);

// Test connessione
firebase.database().ref('.info/connected').on('value', snap => {
  console.log('Connected:', snap.val());
});
```

### Cards Non Appaiono
```javascript
// Console check
console.log('Dilemmas:', dilemmasData.length);
console.log('Player cards:', players[playerId].cards);
```

---

## 📱 Mobile Test

### Device Mode (Chrome)
```
F12 → Toggle device toolbar (Ctrl+Shift+M)
```

### IP Locale
```bash
# Trova IP
ip a | grep inet

# Access from phone
http://192.168.1.x:8000
```

---

## 🎯 Test Checklist

### Test Base
- [ ] Crea stanza → codice generato
- [ ] Unisciti → appare in lista
- [ ] Pronto + Avvia → carte appaiono (6)
- [ ] Seleziona carta → bordo verde
- [ ] Seleziona target → appare sezione risposta
- [ ] Conferma → target vede domanda
- [ ] Target risponde → risultato
- [ ] **Prossimo turno → carte tornano a 6**

### Test Edge
- [ ] Riconnessione (chiudi/riapri tab)
- [ ] Esci dalla partita (bottone X)
- [ ] 3+ giocatori
- [ ] Carte finite

---

## 📊 Firebase Console URLs

- **Realtime DB**: console.firebase.google.com/project/PROJECT_ID/database
- **Regole**: console.firebase.google.com/project/PROJECT_ID/database/rules
- **Usage**: console.firebase.google.com/project/PROJECT_ID/usage

---

## 🆘 Emergency Fixes

### Reset Room
```javascript
// Firebase Console → Delete /rooms/ROOM_ID
```

### Clear localStorage
```javascript
// Console browser
localStorage.clear();
```

### Force Reload Dilemmas
```javascript
// Console browser
location.reload(true);
```

---

## 📌 File Path Reference

```
Modifica UI → index.html
Style generale → css/main.css
Mobile style → css/mobile.css
Routing + events → js/main.js
Firebase ops → js/modules/firebase-manager.js
Game logic → js/modules/game-logic.js
UI render → js/modules/ui-controller.js
Carte/dilemmi → js/modules/card-manager.js
Room/players → js/modules/room-manager.js
Dilemmi data → data/dilemmas.json
Firebase creds → firebase-var.js (gitignored)
```

---

**Salva questo file per riferimento rapido! 📌**
