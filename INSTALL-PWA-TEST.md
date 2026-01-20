# 📱 Come Testare il Prompt di Installazione PWA

## ✨ Implementazione Completata

Il banner di installazione apparirà automaticamente su dispositivi mobili quando:
1. L'app viene aperta da browser (non già installata)
2. L'utente non ha già rifiutato/chiuso il banner in precedenza
3. Il browser supporta l'evento `beforeinstallprompt` (Chrome/Edge Android, Safari iOS con limitazioni)

## 🎯 Come Testare su Mobile

### Su Android (Chrome/Edge)

1. **Fai Deploy su GitHub Pages**:
   ```bash
   git add .
   git commit -m "Add PWA install prompt"
   git push origin main
   ```

2. **Apri da Mobile**:
   - Vai su `https://davideginna.github.io/bias-game/`
   - Aspetta qualche secondo

3. **Dovrebbe Apparire**:
   - Banner colorato con gradiente viola/blu
   - Testo: "Installa l'app - Aggiungi Bias alla tua home screen!"
   - Bottone "Installa"
   - Bottone "✕" per chiudere

4. **Clicca "Installa"**:
   - Si aprirà il prompt nativo del browser
   - "Vuoi aggiungere Bias alla home screen?"
   - Clicca "Aggiungi"

5. **Verifica Installazione**:
   - L'icona di Bias appare sulla home screen
   - Il banner non appare più quando riapri l'app
   - L'app si apre fullscreen senza barra del browser

### Su iOS (Safari) - Limitato

**NOTA**: Safari iOS **NON supporta** `beforeinstallprompt`, quindi il banner non apparirà automaticamente.

**Installazione Manuale su iOS**:
1. Apri Safari
2. Vai su `https://davideginna.github.io/bias-game/`
3. Tocca il pulsante **Condividi** (□↑)
4. Scorri e tocca **"Aggiungi a Home"**
5. Conferma

## 🧪 Debug e Test

### Controlla Console (F12 su Desktop, Remote Debug su Mobile)

**Log Attesi**:
```javascript
✅ Service Worker registered: /
📲 beforeinstallprompt event fired
// Quando clicchi Installa:
📱 User choice: accepted
✅ App installed
```

**Se il Banner Non Appare**:

1. **Verifica Prerequisites**:
   ```javascript
   // Console browser
   console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches);
   // false = browser, true = già installato

   console.log('Banner dismissed:', localStorage.getItem('bias_install_dismissed'));
   // null = mai chiuso, "true" = chiuso dall'utente
   ```

2. **Reset Test**:
   ```javascript
   // Console browser
   localStorage.removeItem('bias_install_dismissed');
   location.reload();
   ```

3. **Verifica Service Worker**:
   - Chrome DevTools → Application → Service Workers
   - Deve essere "activated and running"

### Simula su Desktop (Chrome)

1. Apri Chrome DevTools (F12)
2. Device Toolbar (Ctrl+Shift+M)
3. Seleziona un dispositivo mobile (es. "iPhone 12 Pro")
4. **Application** tab → **Manifest** (verifica che sia valido)
5. **Application** tab → **Service Workers** (deve essere attivo)

**Nota**: Il prompt potrebbe non apparire su localhost anche in mobile mode. Testa sempre su GitHub Pages HTTPS.

## 🎨 Personalizzazione Banner

Il banner usa i colori del tema corrente:
- Sfondo: Gradiente `var(--primary-color)` → `var(--secondary-color)`
- Bottone Installa: Bianco con testo primario
- Animazione: Slide down da sopra

Puoi personalizzare in `css/main.css`:
```css
.install-banner {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    /* Modifica colori, padding, border-radius, etc. */
}
```

## 📝 Comportamento Intelligente

### Banner Nascosto Se:
1. ✅ App già installata (display-mode: standalone)
2. ✅ Utente ha già chiuso il banner (localStorage)
3. ✅ Browser non supporta installazione PWA
4. ✅ Dopo installazione completata

### Banner Appare Se:
1. ✅ Prima visita o localStorage pulito
2. ✅ Browser supporta `beforeinstallprompt`
3. ✅ App non ancora installata
4. ✅ HTTPS attivo

## 🔧 Comandi Utili

### Reset Completo (Console Browser)
```javascript
// Rimuovi flag banner chiuso
localStorage.removeItem('bias_install_dismissed');

// Disinstalla service worker
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Pulisci cache
caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));

// Ricarica
location.reload();
```

### Forza Mostra Banner (per test)
```javascript
// Mostra banner manualmente (ignora condizioni)
document.getElementById('install-banner').style.display = 'block';
```

## 🚀 Deployment Checklist

Prima di testare su mobile:

- [ ] Commit e push su GitHub
- [ ] GitHub Actions completato (green check)
- [ ] Service Worker deployato (`https://URL/service-worker.js` accessibile)
- [ ] Manifest valido (`https://URL/manifest.json` accessibile)
- [ ] HTTPS attivo (GitHub Pages lo fa automaticamente)
- [ ] Apri da Chrome Android (non Safari su Android)

## 📱 Browser Support

| Browser | Install Prompt | Install Banner | PWA Support |
|---------|----------------|----------------|-------------|
| Chrome Android | ✅ Sì | ✅ Sì | ✅ Full |
| Edge Android | ✅ Sì | ✅ Sì | ✅ Full |
| Samsung Internet | ✅ Sì | ✅ Sì | ✅ Full |
| Safari iOS | ❌ No | ❌ No | ⚠️ Limitato |
| Firefox Android | ⚠️ Parziale | ⚠️ Parziale | ⚠️ Limitato |
| Chrome Desktop | ✅ Sì | ✅ Sì | ✅ Full |

## 💡 Tips

- **Test su dispositivo reale**: Gli emulatori potrebbero non mostrare il prompt correttamente
- **Usa Chrome Android**: È il browser con miglior supporto PWA
- **Attendi qualche secondo**: Il prompt appare dopo che l'utente ha interagito con la pagina
- **Controlla console**: I log ti diranno esattamente cosa sta succedendo

---

**Problemi?** Controlla:
1. HTTPS attivo? ✅
2. Service Worker registrato? ✅
3. Manifest valido? ✅
4. `bias_install_dismissed` in localStorage? (rimuovilo)
5. Browser supportato? (Chrome Android consigliato)
