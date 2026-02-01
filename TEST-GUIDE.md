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
- [ ] Prossimo turno

### 3. Flusso Dubito - Maggioranza Mente
- [ ] Host fa domanda → Target risponde
- [ ] Host clicca "Dubito"
- [ ] Altri giocatori vedono schermata votazione
- [ ] Emoticon 😇😈 grandi e visibili
- [ ] 2 votano "Mente", 1 vota "Sincero"
- [ ] Risultato: "Mente vince → Host +1 punto"
- [ ] Prossimo turno

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
