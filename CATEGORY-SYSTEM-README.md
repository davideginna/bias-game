# Sistema Categorie - Guida Completa

## 📋 Panoramica

Il sistema di categorie permette agli host di selezionare quali tipi di dilemmi includere durante la creazione della partita. Questo rende il gioco più personalizzabile e adatto a diversi gruppi e contesti.

## 🎯 Come Funziona

### Per l'Host (Creazione Stanza)

1. **Crea Stanza**: Click su "Crea Stanza"
2. **Seleziona Categorie**: Nella sezione "Categorie di Gioco":
   - Spunta le categorie che vuoi includere
   - Almeno 1 categoria deve essere selezionata
   - Vedi il conteggio categorie e dilemmi totali in tempo reale
3. **Vedi Esempi**: Click su "Vedi esempi" per vedere 3 domande di esempio
4. **Quick Actions**:
   - "Tutte": Seleziona tutte le categorie
   - "Nessuna": Deseleziona tutte
5. **Crea**: Click "Crea Stanza" (validazione automatica)

### Per i Giocatori (Lobby)

- **Badge Categorie**: Vedi quali categorie sono incluse nella partita
- **Info Visiva**: Icone colorate con nome e conteggio dilemmi
- **Read-Only**: Solo l'host può modificare le categorie (in lobby)

## 📚 Categorie Disponibili

### 1. 📝 Dilemmi Generali (689)
Dilemmi morali generali su onestà, lealtà, sacrificio e vita quotidiana.

**Esempi:**
- "Trovi 100€ per strada senza nessuno intorno. Li tieni?"
- "Mentiresti su un curriculum per ottenere il lavoro dei tuoi sogni?"
- "Sacrificheresti una persona innocente per salvarne mille?"

### 2. 💋 Sessualità (92)
Contenuti sessuali e intimi.

**Esempi:**
- "Se potessi scegliere il sesso di tuo figlio, lo faresti?"
- "Fingeresti un orgasmo per non ferire i sentimenti del partner?"
- "Accetteresti una relazione aperta?"

### 3. 📺 Serie TV (91)
Dilemmi nei panni di personaggi di serie TV.

**Esempi:**
- "Sei Walter White (Breaking Bad). Accetti di cucinare metanfetamina per la tua famiglia?"
- "Sei Rachel Green (Friends). Lasceresti il tuo lavoro a Parigi per Ross?"
- "Sei Jon Snow (Game of Thrones). Uccideresti Daenerys per salvare il regno?"

### 4. 🎬 Film (59)
Dilemmi nei panni di personaggi cinematografici.

**Esempi:**
- "Sei Harry Potter. Avresti scelto di andare a Serpeverde?"
- "Sei Neo (Matrix). Prendi la pillola rossa o blu?"
- "Sei Tony Stark (Iron Man). Riveleresti la tua identità al mondo?"

### 5. 🎭 Anime & Cartoon (40) **NUOVO!**
Dilemmi nei panni di personaggi di anime, manga e cartoni animati.

**Esempi:**
- "Sei Naruto Uzumaki. Kurama ti offre tutto il suo potere ma dovrai abbandonare Konoha. Accetti?"
- "Sei Luffy (One Piece). Puoi trovare il One Piece ma uno dei tuoi nakama morirà. Continui?"
- "Sei Light Yagami (Death Note). Ryuk ti offre un secondo Death Note ma dimezzerà la tua vita. Accetti?"

### 6. 🏛️ Politica (30)
Etica politica e governativa.

**Esempi:**
- "Voteresti per un politico corrotto se questo migliorasse la tua vita?"
- "Denunceresti un familiare per evasione fiscale?"
- "Accetteresti una dittatura benevola invece della democrazia?"

### 7. 💰 Denaro (161)
Etica finanziaria ed economica.

**Esempi:**
- "Tradiresti il tuo partner per 10 mila euro garantiti e senza che lo sappia mai?"
- "Useresti informazioni confidenziali per fare soldi in borsa?"
- "Accetteresti un lavoro ben pagato ma che danneggia l'ambiente?"

### 8. 💻 Tecnologia (101)
Social media, IA, privacy digitale.

**Esempi:**
- "Accetteresti che un'IA ti sostituisca al lavoro se ricevessi uno stipendio fisso?"
- "Venderesti i tuoi dati personali per 1000€ al mese?"
- "Elimineresti tutti i tuoi account social per un anno?"

### 9. ⛪ Religione (18)
Fede e spiritualità.

**Esempi:**
- "Fingeresti di essere credente per ottenere un vantaggio sociale?"
- "Elimineresti la religione dal mondo per porre fine ai conflitti religiosi?"
- "Mentiresti in confessione?"

### 10. 🌍 Ambiente (9)
Clima e sostenibilità.

**Esempi:**
- "Uccideresti un animale in via di estinzione per salvare 10 persone?"
- "Rinunceresti all'auto per il resto della vita?"
- "Vieteresti i jet privati per ridurre l'inquinamento?"

## 🔧 Dettagli Tecnici

### Architettura

```
data/categories/
├── metadata.json          # Metadati (icone, nomi, descrizioni, esempi)
├── default.json          # 689 dilemmi generali
├── sex.json             # 92 dilemmi
├── serie-tv.json        # 91 dilemmi
├── film.json            # 59 dilemmi
├── cartoon.json         # 40 dilemmi (NUOVI)
├── politics.json        # 30 dilemmi
├── money.json           # 161 dilemmi
├── technology.json      # 101 dilemmi
├── religion.json        # 18 dilemmi
└── environment.json     # 9 dilemmi
```

### Formato ID

I dilemmi hanno ID nel formato `<categoria>-<numero>`:
- `default-1`, `default-2`, ... `default-689`
- `cartoon-1`, `cartoon-2`, ... `cartoon-40`
- `sex-1`, `sex-2`, ... `sex-92`
- ecc.

### Schema Firebase

```javascript
{
  config: {
    selectedCategories: ['default', 'cartoon', 'technology'], // Array di category IDs
    // ... altri campi config
  },
  // ... resto della room
}
```

### Performance

- **Metadata load**: ~10ms (5KB)
- **Single category**: ~30-80ms
- **All categories**: ~200ms
- **Memory saving**: 53-80% con selezione parziale

### API CardManager

```javascript
// Carica metadata (all'avvio)
await CardManager.loadCategoryMetadata();

// Carica categorie specifiche
await CardManager.loadCategories(['default', 'cartoon']);

// Ottieni metadata
const metadata = CardManager.getCategoryMetadata();

// Ottieni dilemmi filtrati
const dilemmas = CardManager.getFilteredDilemmas();
```

## 🧪 Testing

### Test Automatici ✅

Tutti passati (vedi `TEST-RESULTS.md`):
- ✅ Validazione sintassi JavaScript
- ✅ Validazione JSON (11 file)
- ✅ 1290 ID unici verificati
- ✅ Conteggi corretti
- ✅ Struttura HTML/CSS

### Test Manuali Consigliati

1. **Base**:
   - Crea stanza con solo "Generale"
   - Crea stanza con tutte le categorie
   - Verifica aggiornamento contatori
   - Vedi esempi di ogni categoria

2. **Flow Completo**:
   - Crea stanza con 2-3 categorie
   - Verifica badge in lobby
   - Inizia partita
   - Verifica che le carte siano solo dalle categorie selezionate

3. **Edge Cases**:
   - Tenta creazione senza categorie → Errore
   - Categoria con pochi dilemmi (environment: 9)
   - Backward compatibility con stanze vecchie

## 🔄 Backward Compatibility

Il sistema è retrocompatibile:

1. **Stanze Esistenti**: Se `selectedCategories` manca, default a `['default']`
2. **Legacy IDs**: Supporta sia ID string (`cartoon-1`) che number (`1`)
3. **Fallback**: Se categorie non disponibili, carica `dilemmas.json` legacy
4. **Service Worker**: Versione cache aggiornata con invalidazione automatica

## 📊 Statistiche

- **File Modificati**: 8
- **File Creati**: 12
- **Codice Aggiunto**: ~800 righe
- **Dilemmi Totali**: 1290 (+40 rispetto a v1.6)
- **Nuova Categoria**: Anime & Cartoon (40 dilemmi)

## 🚀 Prossimi Passi

1. ✅ Implementazione completata
2. ⏳ Test manuali su staging
3. ⏳ Deploy in produzione
4. ⏳ Monitoraggio performance
5. 💡 Futuro: Espandere categoria cartoon a 100 dilemmi

## 📝 Note di Sviluppo

- **Script Migrazione**: `scripts/migrate-categories.js` per rigenerare categorie
- **Metadata**: Modificare `data/categories/metadata.json` per aggiungere/modificare categorie
- **Service Worker**: Incrementare versione cache quando si modificano file categorie
- **Legacy Support**: Mantenere `dilemmas.json` per almeno 1-2 release

## 🐛 Troubleshooting

### Problema: "Errore caricamento categorie"
- Verifica che i file JSON esistano in `data/categories/`
- Controlla console per errori di parsing JSON
- Verifica Service Worker cache (potrebbe essere stale)

### Problema: "Conteggi non corrispondono"
- Rigenera file con `node scripts/migrate-categories.js`
- Verifica che metadata.json sia aggiornato

### Problema: "Badge non appaiono in lobby"
- Verifica che `selectedCategories` sia presente in Firebase
- Controlla che `CardManager.getCategoryMetadata()` ritorni dati validi
- Ispeziona elemento DOM `#lobby-categories-display`

## 📞 Support

Per bug o feature request:
- Issues: https://github.com/anthropics/claude-code/issues
- Documentation: README.md, CHANGELOG.md
- Test Results: TEST-RESULTS.md
