# Guida Debug - Problema "Rettangolo Vuoto"

## 🔍 Come Debuggare

Ho aggiunto molti `console.log` per capire dove si blocca. Segui questi passi:

### 1. Apri la Console del Browser

**Chrome/Edge/Firefox**:
- Premi **F12** (o Ctrl+Shift+I su Linux/Windows, Cmd+Option+I su Mac)
- Vai sulla tab **"Console"**

### 2. Ricrea il Problema

1. Ricarica la pagina (**Ctrl+Shift+R** per pulire cache)
2. Crea una stanza con un nome
3. Da un'altra tab/dispositivo, unisciti alla stanza
4. Entrambi mettete "Pronto"
5. Avvia la partita
6. **Guarda la console mentre succede tutto**

### 3. Cosa Cercare nella Console

Dovresti vedere questi messaggi in ordine:

```
✅ Caso NORMALE (funziona):
----------------------------
Initializing Bais...
Loaded 100 dilemmas
Starting game... {roomId: "ABC123", playerCount: 2}
Distributing cards to players: ["player_xxx", "player_yyy"]
Cards distributed: {player_xxx: [1,5,12,34,56,78], player_yyy: [2,7,15,...]]}
Game started successfully
Current turn: {activePlayerId: "player_xxx", status: "guessing", ...}
renderPlayerCards called with: [1, 5, 12, 34, 56, 78]
Dilemmas data length: 100
getDilemmasByIds called with: [1, 5, 12, 34, 56, 78]
Found dilemmas: 6 out of 6
Dilemmas to render: [{id: 1, text: "..."}, {id: 5, text: "..."}, ...]


❌ Caso PROBLEMA (cosa potrebbe apparire):
------------------------------------------
Opzione A - Dilemmi non caricati:
  Loaded 0 dilemmas  ← PROBLEMA QUI
  Dilemmas data length: 0
  Dilemmas not loaded yet!

Opzione B - Carte non distribuite:
  Cards distributed: {player_xxx: [], player_yyy: []}  ← PROBLEMA QUI
  No cards to render

Opzione C - Turno non creato:
  No current turn yet, showing waiting message  ← PROBLEMA QUI

Opzione D - Errore durante il gioco:
  Error starting game: [qualche errore]  ← PROBLEMA QUI
```

### 4. Copia TUTTI i Log

**IMPORTANTE**: Copia **TUTTI** i messaggi dalla console (sia verdi che rossi) e mandameli.

In particolare:
- ✅ Messaggi verdi/blu (info)
- ❌ Messaggi rossi (errori)
- ⚠️ Messaggi gialli (warning)

### 5. Screenshot

Fai uno screenshot di:
1. La schermata del gioco (il "rettangolo vuoto")
2. La console con tutti i log

---

## 🛠️ Fix Temporanei da Provare

### Fix 1: Hard Refresh
```
Ctrl + Shift + R  (pulisce cache)
oppure
Ctrl + F5
```

### Fix 2: Cancella Cache
1. F12 → Tab "Application" (o "Archiviazione")
2. Click su "Clear site data" (o "Cancella dati sito")
3. Ricarica

### Fix 3: Modalità Incognito
1. Ctrl + Shift + N (Chrome/Edge)
2. Prova il gioco da lì

---

## 📋 Checklist Verifica

Prima di mandarmi i log, verifica:

- [ ] Ho ricaricato con Ctrl+Shift+R
- [ ] Sono su http://localhost:8000 (non file://)
- [ ] Il server Python è in esecuzione
- [ ] Ho aperto la Console (F12)
- [ ] Vedo messaggi nella console quando clicco i bottoni
- [ ] Ho copiato TUTTI i log dalla console

---

## 🎯 Cosa mi Serve

Per aiutarti, mandami:

1. **Screenshot della schermata di gioco** (il rettangolo vuoto)
2. **Screenshot della console** (con tutti i log visibili)
3. **Copia-incolla** di tutti i log dalla console
4. **Dimmi**: Su quale dispositivo stai testando? (PC/Mac/Telefono)

Con queste info posso capire esattamente dove si blocca! 🔍
