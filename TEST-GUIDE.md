# 🧪 Guida Test Rapidi - Modalità Dubito

## 🚀 Setup Veloce Multi-Tab

### Opzione A: 4 Giocatori (setup minimo)
1. Apri 4 tab del browser
2. In Tab 1: `Crea Stanza` → Nome: "Host"
3. Copia il codice stanza (es: ABC123)
4. In Tab 2, 3, 4: `Unisciti` → Codice + Nome (P1, P2, P3)
5. Tutti: `Pronto`
6. Host: Attiva toggle "Modalità Dubito" ✅
7. Host: `Inizia Partita`

### Opzione B: 6 Giocatori (test completo)
- Stessi passaggi ma con 6 tab
- Più votanti = test più robusto

---

## ✅ Checklist Test Base

### 1. Toggle Dubito (Lobby)
- [ ] Con 3 giocatori: toggle **disabilitato** ❌
- [ ] Con 4 giocatori: toggle **abilitato** ✅
- [ ] Attivo Dubito con 4 giocatori: avvio OK
- [ ] Attivo Dubito con 3 giocatori: errore "Servono almeno 4 giocatori"

### 2. Flusso Accetto
- [ ] Host fa domanda → Target risponde
- [ ] Host vede schermata "Accetto/Dubito"
- [ ] Host clicca "Accetto"
- [ ] Risultato normale (punto se indovinato)
- [ ] **Solo Host vede bottone "Prossimo Turno"**
- [ ] Altri giocatori vedono: "In attesa che [Host] passi al turno successivo..."
- [ ] Host clicca "Prossimo Turno" → cambio turno

### 3. Flusso Dubito - Maggioranza Mente
- [ ] Host fa domanda → Target risponde
- [ ] Host clicca "Dubito"
- [ ] Altri giocatori vedono schermata votazione
- [ ] Emoticon 😇😈 grandi e visibili
- [ ] 2 votano "Mente", 1 vota "Sincero"
- [ ] Risultato: "Mente vince → Host +1 punto"
- [ ] **Solo Host vede bottone "Prossimo Turno"**
- [ ] Altri vedono messaggio attesa
- [ ] Host clicca "Prossimo Turno" → cambio turno

### 4. Flusso Dubito - Pareggio
- [ ] 4 giocatori totali (2 votanti)
- [ ] 1 vota "Mente", 1 vota "Sincero"
- [ ] Risultato: "Pareggio → Host +1 punto" ⚠️
- [ ] Messaggio mostra "o c'è stato un pareggio"

### 5. Flusso Dubito - Maggioranza Sincero
- [ ] 1 vota "Mente", 2 votano "Sincero"
- [ ] Risultato: "Sincero vince → Nessun punto"
- [ ] Host non prende punti

### 6. Test Anti-Loop
- [ ] Durante votazione: **NO messaggi "Errore conteggio voti"** ripetuti
- [ ] Console: vedi solo "All votes received" **una volta**
- [ ] Console: vedi "Voting results processed successfully"

### 7. Test Bottone "Prossimo Turno"
- [ ] **Schermata Risultato Normale**:
  - [ ] Chi ha fatto domanda: vede bottone "Prossimo Turno"
  - [ ] Altri giocatori: vedono "In attesa che [Nome] passi al turno successivo..."
  - [ ] Bottone NON cliccabile da altri
- [ ] **Schermata Risultato Votazione**:
  - [ ] Chi ha fatto domanda: vede bottone "Prossimo Turno"
  - [ ] Altri: vedono messaggio attesa
  - [ ] Solo il questioner può far procedere il gioco

---

## 🐛 Test Bug Fix Loop

### Test Specifico Loop Infinito
1. 4 giocatori in partita
2. Host dubita
3. **Prima del fix**: loop di errori in console
4. **Dopo il fix**:
   ```
   Votes: 0/2
   Votes: 1/2
   Votes: 2/2
   All votes received, processing results...
   Voting results processed successfully
   Resetting vote processing flag
   ```

### Verifica Console (F12)
- [ ] NO ripetizioni "Error processing votes"
- [ ] NO stack trace ripetuto
- [ ] Vedere "processed successfully" **una volta sola**

---

## 📊 Test Scenari Voti

### 4 Giocatori (2 votanti)
| Voto 1 | Voto 2 | Risultato | Punto Host |
|--------|--------|-----------|------------|
| 😈     | 😈     | Mente     | ✅ +1      |
| 😇     | 😇     | Sincero   | ❌ 0       |
| 😈     | 😇     | **Pareggio** | ✅ +1   |

### 5 Giocatori (3 votanti)
| V1 | V2 | V3 | Risultato | Punto Host |
|----|----|----|-----------|------------|
| 😈 | 😈 | 😈 | Mente     | ✅ +1      |
| 😇 | 😇 | 😇 | Sincero   | ❌ 0       |
| 😈 | 😈 | 😇 | Mente     | ✅ +1      |
| 😈 | 😇 | 😇 | Sincero   | ❌ 0       |

### 6 Giocatori (4 votanti)
| V1 | V2 | V3 | V4 | Risultato | Punto Host |
|----|----|----|----|-----------|------------|
| 😈 | 😈 | 😇 | 😇 | **Pareggio** | ✅ +1   |
| 😈 | 😈 | 😈 | 😇 | Mente     | ✅ +1      |
| 😈 | 😇 | 😇 | 😇 | Sincero   | ❌ 0       |

---

## 🔧 Test Casi Edge

### Giocatore Esce Durante Votazione
- [ ] 4 giocatori, Dubito attivato
- [ ] 1 giocatore vota e esce (chiude tab)
- [ ] Verifica: nessun crash
- [ ] Comportamento atteso: votazione bloccata (manca un voto)

### Dubito si Disabilita Automaticamente
- [ ] 4 giocatori, Dubito ON
- [ ] 1 giocatore esce dalla lobby → rimangono 3
- [ ] Toggle Dubito si **disabilita** automaticamente
- [ ] Dubito viene **disattivato** in Firebase

### Vittoria Durante Dubito
- [ ] Host a 4 punti (obiettivo 5)
- [ ] Dubito → Mente vince → Host arriva a 5 punti
- [ ] Partita finisce, schermata vittoria

---

## ⚡ Test Veloce (3 minuti)

**Setup**: 4 tab, stesso PC
1. Crea stanza + 3 giocatori uniti (30 sec)
2. Attiva Dubito in lobby (5 sec)
3. Inizia partita (5 sec)
4. Fai 1 domanda → Dubito (30 sec)
5. 2 votano mente → Verifica risultato (20 sec)
6. Check console: NO loop errors (10 sec)

**Tempo totale**: ~2-3 minuti

---

## 📝 Note

- **Console sempre aperta** (F12) per vedere log
- Usa **Incognito mode** per evitare cache
- Se vedi errori, copia il messaggio completo
- Test con **4 giocatori** è sufficiente per la maggior parte dei casi
- Test con **6 giocatori** per scenari complessi di pareggio

---

## ✅ Tutto OK se:
1. Nessun errore in console
2. Voti contati correttamente
3. Pareggio → Mente vince
4. NO loop infinito
5. Toggle si abilita/disabilita correttamente

---

# 🎲 Test Modalità di Gioco

## 🧪 Test Automatici

### Esegui Test Suite
```bash
node test-game-modes.js
```

**Output Atteso**:
- ✅ Test passati: 3/3
- Test modalità sequenziale (3 test)

---

## 🎮 Test Modalità Scelta Libera

### Setup
1. Crea stanza con 3 giocatori
2. In lobby: modalità **Scelta Libera** (default)
3. Inizia partita

### Checklist
- [ ] Durante turno: selezione target **visibile**
- [ ] Dropdown mostra **tutti gli altri giocatori**
- [ ] Puoi scegliere **qualsiasi giocatore** come target
- [ ] Dopo risposta: turno passa a giocatore **non prevedibile**
- [ ] Non c'è ordine fisso nei turni

---

## ➡️ Test Modalità Sequenziale

### Setup
1. Crea stanza con 4 giocatori (A, B, C, D)
2. In lobby: **Riordina giocatori** nell'ordine desiderato (es: A → B → C → D)
3. Seleziona modalità **Sequenziale**
4. Inizia partita

### Checklist Base
- [ ] Selezione target **nascosta** (non compare dropdown)
- [ ] Player A fa domanda → target automaticamente Player B
- [ ] Player B fa domanda → target automaticamente Player C
- [ ] Player C fa domanda → target automaticamente Player D
- [ ] Player D fa domanda → target automaticamente Player A (wrap around)
- [ ] Ordine si ripete ciclicamente

### Test Riordino Pre-Game
1. In lobby: sposta Player B in cima (freccia ↑)
2. Ordine diventa: B → A → C → D
3. Inizia partita
4. Verifica:
   - [ ] Player B fa domanda → Player A
   - [ ] Player A fa domanda → Player C
   - [ ] Player C fa domanda → Player D
   - [ ] Player D fa domanda → Player B

### Test con Giocatore che Esce
1. Durante partita, Player C esce
2. Ordine diventa: A → B → D
3. Verifica:
   - [ ] Player B fa domanda → Player D (salta C)
   - [ ] Player D fa domanda → Player A

---

## 🔀 Test Cambio Modalità in Lobby

### Test Cambio Prima di Iniziare
1. Crea stanza, modalità **Scelta Libera**
2. Cambia in **Sequenziale**
3. Cambia di nuovo in **Scelta Libera**
4. Verifica:
   - [ ] Nessun errore in console
   - [ ] Radio button selezionato corretto
   - [ ] Firebase aggiornato correttamente

### Test Ordine Giocatori
1. Modalità **Scelta Libera**: sezione ordine **nascosta**
2. Modalità **Sequenziale**: sezione ordine **visibile**
3. Verifica:
   - [ ] Frecce ↑↓ funzionano solo per host
   - [ ] Altri giocatori vedono ordine ma **senza frecce**

---

## 🎯 Test Combinati

### Test: Sequenziale + Dubito
1. 4 giocatori, modalità Sequenziale, Dubito ON
2. Player A fa domanda (target auto: B)
3. Player B risponde
4. Player A clicca "Dubito"
5. Votazione: C e D votano
6. Verifica:
   - [ ] Tutto funziona come Dubito normale
   - [ ] Target era automatico (B)
   - [ ] Turno passa a B dopo votazione

### Test: Scelta Libera + Scarto Carte
1. Modalità Scelta Libera
2. Durante turno di altri: scarta una carta
3. Verifica:
   - [ ] Scarto funziona normalmente
   - [ ] Pesca nuova carta
   - [ ] Selezione target non influenzata

---

## 📊 Scenari Completi

### Scenario A: Partita Sequenziale 3 Giocatori
**Setup**: A, B, C in ordine

| Turno | Active | Target | Risultato |
|-------|--------|--------|-----------|
| 1     | A      | B      | Corretto (+1 A) |
| 2     | B      | C      | Sbagliato |
| 3     | C      | A      | Corretto (+1 C) |
| 4     | A      | B      | Sbagliato |
| 5     | B      | C      | Corretto (+1 B) |

**Verifica**: Ordine A→B→C→A rispettato perfettamente

---

## ⚡ Quick Test (3 minuti)

**Setup**: 3 tab, stesso PC

1. **Test Sequenziale** (1.5 min):
   - Riordina giocatori, seleziona Sequenziale
   - Fai 3 turni, verifica target automatici e messaggio
   - Verifica ordine rispettato

2. **Test Cambio Modalità** (0.5 min):
   - Torna in lobby, cambia modalità 2 volte
   - Verifica UI si adatta (ordine appare/scompare)

3. **Test Riordino** (1 min):
   - Sposta giocatori su/giù
   - Verifica ordine salvato
   - Inizia partita sequenziale, verifica ordine applicato

---

## ✅ Checklist Completa Modalità di Gioco

### Lobby
- [ ] Radio buttons modalità visibili (2 opzioni)
- [ ] Descrizione modalità chiara
- [ ] Sezione ordine giocatori appare solo per Sequenziale
- [ ] Frecce ↑↓ funzionano solo per host
- [ ] Altri giocatori vedono ordine senza frecce
- [ ] Cambio modalità aggiorna UI istantaneamente

### Sequenziale
- [ ] Selezione target nascosta
- [ ] Messaggio mostra "Stai facendo la domanda a: [Nome]"
- [ ] Target calcolato correttamente (next in order)
- [ ] Wrap around funziona (ultimo → primo)
- [ ] Ordine personalizzato rispettato

### Scelta Libera
- [ ] Selezione target mostra tutti
- [ ] Nessuna restrizione su chi chiedere
- [ ] Turni non seguono ordine fisso

### Generale
- [ ] Nessun errore console
- [ ] Firebase sincronizzato correttamente
- [ ] Test automatici passano (3/3)
- [ ] Documentazione aggiornata
