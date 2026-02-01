# 🤖 Claude Context - Bias Game

Questo file contiene tutto il contesto necessario per lavorare rapidamente sul progetto.

---

## 📋 Stato Attuale del Progetto

### ✅ Completato (v1.6)
- [x] Struttura base HTML/CSS/JS (vanilla, no build)
- [x] Firebase Realtime Database integrato
- [x] Sistema lobby con codice stanza (6 caratteri maiuscoli)
- [x] Distribuzione 6 carte per giocatore
- [x] Sistema turni ciclici
- [x] **Punteggio personalizzabile** (1-10 punti, scelto dall'host)
- [x] **2 Modalità di Gioco** (Scelta Libera, Sequenziale)
- [x] **Riordino Giocatori** (frecce ↑↓ per host in lobby, per modalità Sequenziale)
- [x] UI mobile-first responsive
- [x] Logo e favicon + PWA
- [x] Riconnessione automatica (localStorage)
- [x] Bottone uscita durante partita
- [x] Codice stanza sempre visibile in-game
- [x] Bottoni risposta con bordi colorati (verde/rosso/arancione)
- [x] Carta selezionata con glow verde
- [x] Pesca carta nuova dopo averla giocata (torna a 6 carte)
- [x] **Scarto carte sempre disponibile** (anche quando non è il tuo turno)
- [x] **1200+ dilemmi ottimizzati** (formato sì/no/dipende)
- [x] Sistema temi (7 temi disponibili)
- [x] Audio system (suoni vittoria/sconfitta, TTS)
- [x] Stanze aperte/chiuse (join durante partita)
- [x] Menu floating con regole e temi
- [x] **Modalità Dubito** (4+ giocatori)
- [x] **Sistema votazione** (😇 Sincero / 😈 Mente)
- [x] **Pareggio vince Mente**
- [x] **Bottone "Prossimo Turno" solo per questioner**
- [x] **Toggle Dubito in impostazioni lobby**

### 🐛 Problemi Noti
Nessun problema critico noto.

### ✅ Bug Risolti (v1.6)
- [x] Loop infinito durante conteggio voti (flag `isProcessingVotes`) - v1.5
- [x] Messaggio errore ripetuto in console durante votazione - v1.5

### 🎯 TODO Prossimi
- [ ] Timer per turno (opzionale)
- [ ] Statistiche giocatore
- [ ] Chat in-game
- [ ] Dilemmi personalizzati dall'utente
- [ ] Modalità spettatore
- [ ] Storia partite
- [ ] Migliorare regole Firebase per produzione

---

## 🏗️ Architettura

```
/scrupple/
├── index.html              # Single page app
├── css/
│   ├── main.css           # Dark theme principale
│   └── mobile.css         # Media queries responsive
├── js/
│   ├── config.js          # Firebase config (usa variabili da firebase-var.js)
│   ├── main.js            # Entry point, routing, event handlers
│   └── modules/
│       ├── firebase-manager.js    # Wrapper Firebase operations
│       ├── room-manager.js        # Stanze, giocatori, codici
│       ├── card-manager.js        # Distribuzione carte, dilemmi
│       ├── game-logic.js          # Core game, turni, punteggi
│       └── ui-controller.js       # Rendering UI
├── data/
│   └── dilemmas.json      # 100 dilemmi morali
├── image/                 # Logo + favicon (tutte le dimensioni)
├── firebase-var.js        # Credenziali Firebase (gitignored)
└── manifest.json          # PWA config
```

### Tecnologie
- **Frontend**: Vanilla JS (ES6 modules), no framework, no build
- **Database**: Firebase Realtime Database
- **Hosting**: GitHub Pages ready
- **Styling**: CSS3 custom (no Bootstrap)

---

## 🔥 Firebase

### Struttura Database
```javascript
/rooms/
  /{roomId}/              // 6 caratteri maiuscoli
    /config/
      maxPoints: 1-10      // Personalizzabile dall'host (default: 5)
      status: "lobby"|"playing"|"ended"
      isOpen: true|false   // Permetti join durante partita
      isDubitoMode: true|false  // Modalità Dubito (4+ giocatori)
      gameMode: "choice"|"sequential"  // ⚠️ NUOVO v1.6
      playerOrder: ["player1", "player2", ...]  // ⚠️ NUOVO v1.6
    /players/
      /{playerId}/
        name: "string"
        score: 0
        cards: [1, 5, 12, ...]  // IDs dilemmi (sempre 6)
        isReady: false
        isHost: true/false
    /usedDilemmas: [1, 5, ...]
    /discardedCards: [3, 7, ...]  // Carte scartate dai giocatori
    /currentTurn/
      activePlayerId: "string"
      targetPlayerId: "string"
      dilemmaId: 42
      guess: "si"|"no"|"dipende"
      answer: "si"|"no"|"dipende"
      status: "guessing"|"waiting_answer"|"showing_result"|"waiting_accept_or_doubt"|"voting_truth"|"showing_vote_result"
      dubitoChoice: "accept"|"doubt"|null    // Solo in Dubito mode
      votes: {                                // Solo in Dubito mode
        playerId1: "truth"|"lie",
        playerId2: "truth"|"lie"
      }
      votingResult: {                        // Solo in Dubito mode
        lieVotes: number,
        truthVotes: number,
        pointAwarded: boolean
      }
    /turnHistory: [...]
```

### File Config
- `firebase-var.js` contiene le credenziali (non committato)
- `config.js` importa da firebase-var.js usando variabili globali

---

## 🎮 Meccanica di Gioco

### Flusso Base
1. **Home**: Scelta "Crea Stanza" o "Unisciti"
   - Host sceglie punteggio per vincere (slider 1-10, default 5)
2. **Lobby**: Giocatori si segnano "Pronto"
   - Punteggio obiettivo visibile: "🎯 Punteggio per vincere: X"
   - **Host sceglie modalità di gioco**:
     - **Scelta Libera** (default): Scegli liberamente a chi fare domande
     - **Sequenziale**: Domande automatiche al giocatore successivo nell'ordine
   - **Host può riordinare i giocatori** (frecce ↑↓) per modalità Sequenziale
   - **Host può attivare "Modalità Dubito"** (se 4+ giocatori)
3. **Gioco**: Turni ciclici
   - Active player: sceglie carta, target (dipende da modalità), risposta prevista
     - **Scelta Libera**: Selezione manuale del target
     - **Sequenziale**: Target auto-selezionato e mostrato (prossimo nell'ordine)
   - Target player: risponde al dilemma
   - **SE DUBITO ATTIVO**:
     - Active player vede "Accetto" o "Dubito"
     - Se Accetto: confronto normale (match → +1 punto)
     - Se Dubito: votazione (altri votano 😇 Sincero / 😈 Mente)
       - Mente vince (o pareggio) → Active player +1 punto
       - Sincero vince → Nessun punto
   - **SE DUBITO NON ATTIVO**: Confronto normale
   - Active player pesca nuova carta (torna a 6)
   - Tutti i giocatori possono scartare carte in qualsiasi momento
   - **Solo Active player vede bottone "Prossimo Turno"**
   - Altri vedono: "In attesa che [Nome] passi al turno successivo..."
4. **Fine**: Primo a raggiungere il punteggio scelto vince

### Distribuzione Carte
- Inizio: 6 carte random uniche per giocatore
- Dopo ogni turno:
  - Rimuove carta giocata
  - **Pesca nuova carta random** (non ancora usata)
  - Torna sempre a 6 carte
- **NUOVO - Scarto Carte**:
  - Disponibile in **qualsiasi momento** (anche quando non è il tuo turno)
  - Bottone ✕ su ogni carta
  - Pesca automatica dopo lo scarto
  - Le carte sono sempre visibili nella waiting view
- Se finite carte disponibili: continua con quelle che ha

---

## 🐛 Debug Guide Rapida

### Aprire Console
```
F12 → Tab "Console"
```

### Log Importanti
```javascript
// Inizializzazione
Initializing Bias...
Loaded 100 dilemmas

// Inizio gioco
Starting game... {roomId: "ABC123", playerCount: 2}
Cards distributed: {...}
First player chosen: player_xxx

// Durante turno
renderPlayerCards called with: [1, 5, 12, 34, 56, 78]
Dilemmas to render: [...]

// Pesca carta (IMPORTANTE per debug)
Player player_xxx drew new card: 42
Current cards for player_xxx: [1, 46, 74, 77, 62]  // 5 carte
Added card 42 to player_xxx, now has 6 cards
```

### Problemi Comuni

**"Rettangolo vuoto"** → Dilemmi non caricati
```javascript
// Controlla:
Loaded 0 dilemmas  ❌
Dilemmas data length: 0  ❌
```

**"Carte non aumentano"** → Pesca non funziona
```javascript
// Dovrebbe apparire:
Player xxx drew new card: 42  ✅
Added card 42 to player xxx  ✅

// Se manca:
No more cards available to draw  ⚠️
```

**"Errori rossi Firebase"** → Regole DB o credenziali
```javascript
// Verifica:
Permission denied  ❌
```

---

## 🎨 Design System

### Colori
```css
--primary-color: #6366f1     (blu)
--secondary-color: #8b5cf6   (viola)
--success-color: #10b981     (verde)
--danger-color: #ef4444      (rosso)
--warning-color: #f59e0b     (arancione)
--bg-color: #0f172a          (dark)
```

### Componenti Chiave

**Carta Selezionata**:
- Bordo verde 3px
- Glow verde
- Scala 1.02 + solleva -8px

**Bottoni Risposta**:
- Default: Bordo colorato (verde/rosso/arancione)
- Selected: Pieno di colore + glow

**Bottoni Azione**:
- Conferma: Verde con ✓
- Annulla: Rosso con ✕
- 60px altezza, font-weight 700

---

## 🚀 Comandi Rapidi

### Test Locale
```bash
cd /home/davide/Documents/personale/scrupple
python3 -m http.server 8000
# Apri http://localhost:8000
```

### Rigenerare Favicon
```bash
python3 generate-favicon.py
```

### Hard Refresh (pulisce cache)
```
Ctrl + Shift + R
```

### Deploy GitHub Pages
```bash
git add .
git commit -m "Update"
git push
# Auto-deploy su username.github.io/bais
```

---

## 📝 Pattern Modifiche Comuni

### Aggiungere Funzione Firebase
1. Aggiungi export in `firebase-manager.js`
2. Importa in modulo che la usa
3. Chiama dalla logica appropriata

### Modificare UI
1. HTML in `index.html`
2. Style in `css/main.css`
3. Mobile in `css/mobile.css`
4. Logic in `ui-controller.js`

### Aggiungere Dilemma
1. Apri `data/dilemmas.json`
2. Aggiungi oggetto: `{"id": 101, "text": "..."}`
3. ID deve essere unico e sequenziale

### Debug Firebase
1. Apri Firebase Console
2. Realtime Database → Dati
3. Guarda struttura `/rooms/{roomId}`
4. Verifica listeners in Console browser

---

## ⚡ Quick Fixes

### Cache Problemi
```javascript
// 1. Hard refresh: Ctrl+Shift+R
// 2. Incognito: Ctrl+Shift+N
// 3. Clear site data: F12 → Application → Clear
```

### Firebase Permission Denied
```json
// Verifica regole:
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

### Cards Non Renderizzate
```javascript
// Verifica in Console:
console.log('Dilemmas loaded:', CardManager.getAllDilemmas().length);
// Dovrebbe essere 100
```

---

## 🔗 Link Utili

- Firebase Console: https://console.firebase.google.com/
- Realtime DB Docs: https://firebase.google.com/docs/database
- GitHub Repo: https://github.com/davide/bais

---

## 💡 Note Sviluppo

### Race Conditions
- **Problema**: Listeners Firebase potrebbero non sincronizzarsi subito
- **Soluzione**: Usa `await` per operazioni sequenziali critiche
- **Esempio**: Pesca carta dopo rimozione

### localStorage
- Salva: `playerId`, `playerName`, `roomId`
- Prefisso: `bias_`
- Riconnessione automatica all'init

### Mobile Testing
- DevTools: F12 → Device mode
- Real device: usa IP locale (es. 192.168.1.x:8000)
- Touch targets: min 44x44px

---

## 🎯 Checklist Pre-Commit

- [ ] Console pulita (no errori rossi)
- [ ] Test con 2 giocatori (PC + telefono)
- [ ] Verifica pesca carte funziona
- [ ] Riconnessione funziona (chiudi/riapri tab)
- [ ] Mobile responsive OK
- [ ] Firebase rules OK

---

**Ultimo aggiornamento**: 2026-02-01
**Versione**: 1.6
**Status**: ✅ Produzione-Ready, 🎮 2 Modalità di Gioco, 🔄 Riordino Giocatori, 🎭 Modalità Dubito, 🧪 Test OK (15/15)
