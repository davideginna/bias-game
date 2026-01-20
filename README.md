# Bias 🎮

I giocatori devono indovinare come i loro amici risponderebbero a dilemmi morali.

## 🎯 Come si Gioca

1. **Crea o Unisciti a una Stanza**: Il primo giocatore crea una stanza e condivide il codice a 6 caratteri con gli amici
2. **Lobby**: Tutti i giocatori si segnano come "Pronto" e l'host avvia la partita
3. **Turni**: A turno, ogni giocatore:
   - Sceglie una delle sue carte dilemma
   - Seleziona un giocatore target
   - Prevede come risponderà (Sì/No/Dipende)
4. **Risposta**: Il giocatore target risponde al dilemma
5. **Punteggio**: Se la previsione è corretta, il giocatore attivo guadagna 1 punto
6. **Vittoria**: Il primo giocatore a raggiungere 10 punti vince!

## 🚀 Setup e Installazione

### 1. Configurazione Firebase

Prima di utilizzare l'applicazione, devi configurare Firebase:

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuovo progetto (o seleziona uno esistente)
3. Abilita **Realtime Database**:
   - Vai su "Build" → "Realtime Database"
   - Clicca "Crea database"
   - Seleziona "Inizia in modalità test" (per sviluppo)
4. Configura le regole di sicurezza:
   - Vai su "Regole" nel Realtime Database
   - Copia e incolla queste regole:

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

**⚠️ Nota**: Queste sono regole permissive per semplicità. In produzione, dovresti implementare regole più restrittive.

5. Ottieni le credenziali:
   - Vai su "Impostazioni Progetto" (icona ingranaggio)
   - Scorri fino a "Le tue app"
   - Clicca su "Aggiungi app" → Web (icona `</>`)
   - Registra l'app con un nome (es. "Bias")
   - Copia le credenziali fornite

### 2. Configurazione dell'Applicazione

Apri il file `js/config.js` e sostituisci i placeholder con le tue credenziali Firebase:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Deploy su GitHub Pages

1. Crea un repository su GitHub
2. Carica tutti i file del progetto:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/bais.git
git push -u origin main
```

3. Abilita GitHub Pages:
   - Vai su Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main" → cartella "/ (root)"
   - Salva

4. L'applicazione sarà disponibile su:
   `https://TUO_USERNAME.github.io/bias/`

### 4. Test in Locale

Per testare in locale, devi usare un server HTTP (i moduli ES6 non funzionano con `file://`):

**Opzione A - Python:**
```bash
python3 -m http.server 8000
# Apri http://localhost:8000
```

**Opzione B - Node.js (http-server):**
```bash
npx http-server -p 8000
# Apri http://localhost:8000
```

**Opzione C - VS Code Live Server:**
- Installa l'estensione "Live Server"
- Right-click su `index.html` → "Open with Live Server"

## 📁 Struttura del Progetto

```
bias/
├── index.html                      # Pagina principale
├── css/
│   ├── main.css                   # Stili generali
│   └── mobile.css                 # Media queries mobile
├── js/
│   ├── main.js                    # Entry point
│   ├── config.js                  # Configurazione Firebase
│   └── modules/
│       ├── firebase-manager.js    # Gestione Firebase
│       ├── room-manager.js        # Gestione stanze
│       ├── game-logic.js          # Logica di gioco
│       ├── card-manager.js        # Gestione carte
│       └── ui-controller.js       # Controllo UI
├── data/
│   └── dilemmas.json              # 100 dilemmi
└── README.md
```

## 🎨 Caratteristiche

- ✅ **Mobile-First**: Completamente responsive e ottimizzato per mobile
- ✅ **Real-time**: Sincronizzazione istantanea tra tutti i giocatori
- ✅ **No Build**: Nessun processo di build, solo vanilla JavaScript
- ✅ **100 Dilemmi**: Dilemmi morali vari e provocatori
- ✅ **Offline-Ready**: Salvataggio sessione in localStorage
- ✅ **Dark Theme**: Design moderno con tema scuro

## 🛠️ Tecnologie Utilizzate

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Database**: Firebase Realtime Database
- **Hosting**: GitHub Pages
- **Styling**: CSS3 con variabili CSS e Grid/Flexbox

## 🐛 Troubleshooting

### Errore "Firebase not initialized"
- Verifica di aver configurato correttamente le credenziali in `js/config.js`
- Controlla che il Realtime Database sia abilitato nel tuo progetto Firebase

### I moduli non si caricano
- Assicurati di usare un server HTTP, non aprire direttamente `index.html`
- Verifica che i percorsi nei file siano corretti

### La stanza non si carica
- Controlla le regole di sicurezza di Firebase
- Verifica la connessione internet
- Apri la console del browser per vedere eventuali errori

### Il gioco non funziona su mobile
- Verifica che il viewport sia configurato correttamente
- Prova a svuotare la cache del browser
- Assicurati che JavaScript sia abilitato

## 📱 Browser Supportati

- Chrome/Edge (versione moderna)
- Firefox (versione moderna)
- Safari (iOS 12+)
- Chrome Mobile
- Safari Mobile

## 🔐 Sicurezza

**Importante**: Le regole di sicurezza fornite sono permissive per facilitare lo sviluppo. Per un ambiente di produzione:

1. Implementa autenticazione Firebase
2. Aggiungi validazione lato server con Cloud Functions
3. Limita le operazioni di scrittura solo ai giocatori autorizzati
4. Implementa rate limiting

Esempio di regole più sicure:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('players').child(auth.uid).exists())"
      }
    }
  }
}
```

## 🎮 Modalità di Gioco

- **Minimo giocatori**: 2
- **Massimo giocatori**: Nessun limite (consigliato 4-8)
- **Punti per vincere**: 10 (configurabile in `config.js`)
- **Carte per giocatore**: 6

## 🚧 Miglioramenti Futuri

- [ ] Animazioni tra i turni
- [ ] Effetti sonori
- [ ] Timer per le risposte
- [ ] Chat in-game
- [ ] Statistiche giocatore
- [ ] Dilemmi personalizzati
- [ ] PWA (Progressive Web App)
- [ ] Modalità spettatore
- [ ] Storia partite

## 📄 Licenza

Questo progetto è open source e disponibile sotto licenza MIT.

## 🤝 Contributi

Contributi, issues e feature requests sono benvenuti!

## 📧 Supporto

Per problemi o domande, apri un issue su GitHub.

---

**Buon divertimento con Bias! 🎉**
