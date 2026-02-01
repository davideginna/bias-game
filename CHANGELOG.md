# Changelog Bias

## v1.4 - 2026-02-01

### ✨ Nuove Feature
- **Punteggio Personalizzabile**: L'host può scegliere il punteggio per vincere
  - Slider da 1 a 10 punti nel form di creazione stanza
  - Valore di default: 5 punti (prima era fisso a 10)
  - Punteggio obiettivo visibile in lobby e durante il gioco
  - Ogni stanza può avere un punteggio diverso

- **Scarto Carte Sempre Disponibile**: Miglioramento sistema scarto
  - Ora puoi scartare carte **anche quando non è il tuo turno**
  - Le tue carte sono sempre visibili nella schermata di attesa
  - Possibilità di gestire strategicamente la mano durante tutta la partita
  - Indicazione chiara: "Puoi scartare una carta anche mentre aspetti"

### 📝 Contenuti
- **Dilemmi Ottimizzati**: Revisione completa delle domande
  - 48 domande trasformate da scelta binaria a formato sì/no/dipende
  - Esempi:
    - ~~"Faresti A o faresti B?"~~ → "Faresti A?"
    - ~~"Lo considereresti amore o controllo?"~~ → "Lo considereresti controllo?"
  - Tutte le domande ora compatibili con risposte Sì/No/Dipende
  - Migliore esperienza di gioco e meno ambiguità

### 🎨 UI/UX
- **Slider Punteggio**: Design semplice e pulito
  - Slider nativo del browser (no personalizzazioni eccessive)
  - Valore visualizzato in tempo reale accanto alla label
  - Indicatori min/max sotto lo slider (1 e 10)
  - Validazione: punteggio deve essere tra 1 e 10

- **Modale Carte Rimossa**: Semplificazione interfaccia
  - Rimosso il pulsante "🃏 Vedi le tue carte"
  - Le carte sono sempre visibili quando pertinente
  - Meno click, esperienza più fluida

- **Carte nella Waiting View**: Nuova sezione
  - Visualizzazione delle proprie carte anche in attesa
  - Bottone scarto (✕) sempre disponibile
  - Messaggio informativo: "Puoi scartare una carta anche mentre aspetti"

### 🔧 Tecnico
- Firebase: `maxPoints` ora dinamico per ogni stanza (non più costante)
- Game Logic: `checkWinCondition` usa `maxPoints` dalla config della stanza
- Validazione lato client per punteggio (range 1-10)
- Event listener su slider per aggiornamento valore in tempo reale
- Funzione `renderWaitingPlayerCards` per mostrare carte in waiting view

### 🐛 Bug Fix
- Allineamento slider migliorato (ora usa design nativo del browser)
- Default values aggiornati da 10 a 5 in tutti i file

---

## v1.3 - 2026-01-21

### ✨ Nuove Feature
- **Sistema di Scarto Carte**: Durante il proprio turno è possibile scartare una carta
  - Bottone "X" rosso in alto a destra su ogni carta
  - Conferma richiesta prima dello scarto
  - Una nuova carta viene pescata automaticamente (se disponibile)
  - Le carte scartate possono essere ripescate da altri giocatori
  - Le nuove carte non sono mai quelle già in mano ad altri o già giocate

- **Partite Aperte/Chiuse**: L'host può decidere se permettere l'ingresso durante la partita
  - Toggle "Stanza Aperta" nella lobby (visibile solo all'host)
  - Se la stanza è aperta, nuovi giocatori possono entrare anche durante la partita
  - I nuovi giocatori ricevono 6 carte automaticamente
  - Entrano in gioco dal turno successivo
  - Impostazione mantenuta anche dopo un reset della partita

- **Menu Floating Espandibile**: Nuovo menu interattivo sempre accessibile
  - Bottone floating in basso a destra con icona hamburger (☰)
  - Si espande mostrando 2 cerchi:
    - 🎨 Cambia Tema
    - 📖 Regole del Gioco
  - Visibile in tutte le schermate (home, lobby, gioco)
  - Animazione fluida con transizioni sfalsate
  - Si chiude automaticamente dopo la selezione o cliccando fuori

### 🎨 UI/UX
- **Modale di Conferma Personalizzata**: Sostituisce le notifiche native del browser
  - Design coerente con il tema dell'app
  - Usata per: scarto carte, uscita dalla lobby, uscita dalla partita
  - Bottoni "Annulla" e "Conferma" chiaramente visibili

- **Selezione Temi Ridisegnata**: Cerchi colorati al posto dei quadrati
  - 7 cerchi con i colori del tema
  - Animazione al hover (scala 1.15)
  - Bordo bianco per il tema attivo
  - Tooltip con nome del tema
  - Layout centrato e compatto

- **Miglioramento Colori Temi**: Tutti i temi sono stati rivisti
  - **Blu Oceano**: tonalità più luminose, miglior contrasto
  - **Viola Cosmico**: viola più brillanti, background più scuro
  - **Verde Foresta**: verde smeraldo più visibile
  - **Tramonto**: giallo/arancio più caldi e leggibili
  - Tutti i temi ora hanno un contrasto ottimale

- **Home Semplificata**: Rimossi i bottoni "Cambia Tema" e "Regole"
  - Ora la home ha solo i 2 bottoni principali
  - Accesso a tema e regole tramite menu floating

### 🔧 Tecnico
- Firebase: aggiunto campo `isOpen` nella configurazione delle stanze
- Firebase: aggiunto campo `discardedCards` per tracciare le carte scartate
- Card Manager: nuova funzione `getCardsForNewPlayer()` per giocatori mid-game
- Card Manager: funzione `getAvailableDilemmaForDraw()` per scarto/pesca
- Room Manager: logica di join modificata per supportare partite aperte
- Responsive: menu floating ottimizzato per mobile e tablet

### 🐛 Bug Fix
- Risolto: impossibile entrare in partite già iniziate (ora dipende da isOpen)
- Migliorato: contrasto testo su tutti i temi per accessibilità

---

## v1.2 - 2026-01-20

### ✨ Nuove Feature
- **PWA (Progressive Web App)**: App installabile su mobile e desktop
  - **Banner di installazione automatico** su mobile (Chrome/Edge Android)
  - Prompt nativo quando clicchi "Installa"
  - Funziona offline (UI completa cachata)
  - Icona sulla home screen
  - Esperienza fullscreen app-like
  - Auto-update quando disponibile
  - Ricorda se l'utente ha chiuso il banner
- **Audio & Suoni**: Sistema audio integrato
  - Suono di successo quando indovini la risposta
  - Suono di errore quando sbagli
  - Bottone "🔊 Leggi ad alta voce" per ascoltare il dilemma (Text-to-Speech)
- **Modale Carte**: Bottone "🃏 Vedi le tue carte" durante l'attesa per visualizzare la tua mano
- **Sistema Temi**: 7 temi disponibili con modale di selezione visuale
  - Dark (default), Light, Darcula, Blu Oceano, Viola Cosmico, Verde Foresta, Tramonto
  - Preferenza salvata in localStorage
- **Regole del Gioco**: Bottone "📖 Regole" nella home con guida completa
- **Rinominato**: App rinominata da "Bais" a "Bias"

### 🎨 UI/UX
- Menu home con 4 bottoni: Crea Stanza, Unisciti, Cambia Tema, Regole
- Preview visivi per ogni tema nella modale di selezione
- Tema attivo evidenziato con bordo verde
- Bottone lettura vocale stile viola secondario

### 🔧 Tecnico
- Service Worker per caching e offline support
- Web Audio API per generazione suoni procedurali
- Web Speech API per text-to-speech in italiano
- Cache strategy: Cache-first per statici, Network-first per dinamici

---

## v1.1 - Precedenti Modifiche

### ✅ Interfaccia Home Migliorata
- **Prima**: Tutti i campi visibili insieme (confusionario)
- **Ora**: Menu a scelta → "Crea Stanza" o "Unisciti a Stanza" → Form dedicato
- Bottone "Indietro" per tornare al menu
- Spaziatura migliore tra i bottoni

### ✅ Bottone di Uscita Durante la Partita
- **Nuovo**: Bottone rosso con "✕" in alto a destra durante il gioco
- Permette di uscire dalla partita in qualsiasi momento
- Chiede conferma prima di uscire

### ✅ Riconnessione Automatica
- **Quando blocchi il telefono e riapri**, l'app ti riconnette automaticamente
- Mostra "Riconnessione in corso..." mentre si riconnette
- Funziona sia in lobby che durante la partita
- Se la stanza non esiste più, torna alla home

### ✅ Fix Caricamento Dilemmi
- **Problema risolto**: Le carte non si caricavano (rettangolo vuoto)
- Ora i dilemmi vengono caricati correttamente

### ✅ Uscita dalla Lobby
- Il bottone "Esci" è già presente nella lobby
- Clicca "Esci" per tornare alla home

### ✅ Ricominciare la Partita
- **Nella schermata finale**: Bottone "Nuova Partita"
- Resetta i punteggi e ricomincia con le stesse persone
- Oppure "Torna alla Home" per uscire completamente

## Come Testare

1. **Ricarica la pagina** (F5)
2. **Test Home**: Vedi 2 bottoni grandi → Clicca "Crea Stanza" → Inserisci nome
3. **Test Lobby**: Nella lobby c'è "Esci" in basso
4. **Test Gioco**: Durante il gioco c'è "✕" rosso in alto a destra
5. **Test Riconnessione**:
   - Avvia una partita
   - Chiudi la tab del browser
   - Riapri e vai su localhost:8000
   - Dovresti riconnetterti automaticamente!

## Problemi Noti Risolti

- ✅ Bottoni home troppo appiccicati
- ✅ Impossibile uscire durante la partita
- ✅ Rettangolo vuoto invece delle carte
- ✅ Riconnessione non funzionante

## Note Importanti

- **Riconnessione**: Funziona solo se la stanza esiste ancora e tu sei ancora dentro
- **localStorage**: L'app salva il tuo ID giocatore nel browser
- **Privacy**: Cancellando i dati del browser perdi la sessione salvata
