#!/bin/bash

# Script per aprire automaticamente tab di test
# Uso: ./open-test-tabs.sh [numero_giocatori]

NUM_PLAYERS=${1:-4}  # Default: 4 giocatori
URL="http://localhost:8000"

echo "🧪 Apertura $NUM_PLAYERS tab per test Dubito..."
echo ""
echo "📋 Setup automatico:"
echo "   1. Tab 1-$NUM_PLAYERS aperti in Chrome"
echo "   2. Crea stanza in Tab 1"
echo "   3. Unisciti con gli altri tab"
echo "   4. Attiva Dubito quando raggiungi 4+ giocatori"
echo ""

# Controlla se il server è attivo
if ! curl -s "$URL" > /dev/null 2>&1; then
    echo "❌ Server non attivo su $URL"
    echo ""
    echo "Avvia il server con:"
    echo "   python3 -m http.server 8000"
    exit 1
fi

# Apri tab in Chrome (o browser di default)
if command -v google-chrome &> /dev/null; then
    BROWSER="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    BROWSER="chromium-browser"
elif command -v firefox &> /dev/null; then
    BROWSER="firefox"
else
    BROWSER="xdg-open"
fi

echo "🌐 Uso browser: $BROWSER"
echo ""

for i in $(seq 1 $NUM_PLAYERS); do
    echo "   Opening tab $i/$NUM_PLAYERS..."
    $BROWSER "$URL" &
    sleep 0.5  # Piccola pausa tra un tab e l'altro
done

echo ""
echo "✅ $NUM_PLAYERS tab aperti!"
echo ""
echo "📝 Prossimi passi:"
echo "   1. Tab 1: Crea Stanza → Nome: Host"
echo "   2. Copia codice stanza"
echo "   3. Altri tab: Unisciti → Incolla codice"
echo "   4. Tutti: Pronto"
echo "   5. Host: Attiva Dubito"
echo "   6. Host: Inizia Partita"
echo ""
echo "🐛 Per vedere i log:"
echo "   - Apri Console (F12) in ogni tab"
echo "   - Guarda messaggi durante votazione"
echo ""
