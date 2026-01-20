#!/usr/bin/env python3
"""
Script per generare le favicon in varie dimensioni dal logo principale
Richiede: pip install Pillow
"""

from PIL import Image
import os

# Path del logo originale
logo_path = "image/logo.png"
output_dir = "image"

# Dimensioni da generare
sizes = {
    "favicon-16x16.png": (16, 16),
    "favicon-32x32.png": (32, 32),
    "apple-touch-icon.png": (180, 180),
    "android-chrome-192x192.png": (192, 192),
    "android-chrome-512x512.png": (512, 512),
}

def generate_favicons():
    """Genera tutte le versioni della favicon"""

    # Verifica che il logo esista
    if not os.path.exists(logo_path):
        print(f"❌ Errore: {logo_path} non trovato!")
        return

    # Apri l'immagine originale
    print(f"📖 Caricamento {logo_path}...")
    img = Image.open(logo_path)

    # Crea la directory di output se non esiste
    os.makedirs(output_dir, exist_ok=True)

    # Genera ogni dimensione
    for filename, size in sizes.items():
        output_path = os.path.join(output_dir, filename)

        # Ridimensiona mantenendo l'aspetto
        resized = img.copy()
        resized.thumbnail(size, Image.Resampling.LANCZOS)

        # Crea un'immagine quadrata con sfondo trasparente
        square_img = Image.new('RGBA', size, (0, 0, 0, 0))

        # Centra l'immagine ridimensionata
        offset = ((size[0] - resized.size[0]) // 2, (size[1] - resized.size[1]) // 2)
        square_img.paste(resized, offset)

        # Salva
        square_img.save(output_path, 'PNG', optimize=True)
        print(f"✅ Creato: {output_path} ({size[0]}x{size[1]})")

    # Genera favicon.ico (16x16 e 32x32 insieme)
    print("📦 Generazione favicon.ico...")
    ico_path = os.path.join(output_dir, "favicon.ico")

    # Crea le due dimensioni per l'ICO
    img_16 = img.copy()
    img_16.thumbnail((16, 16), Image.Resampling.LANCZOS)

    img_32 = img.copy()
    img_32.thumbnail((32, 32), Image.Resampling.LANCZOS)

    # Salva come ICO multi-dimensione
    img_32.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32)])
    print(f"✅ Creato: {ico_path}")

    print("\n🎉 Tutte le favicon sono state generate con successo!")
    print("\n📝 Prossimi passi:")
    print("1. Le favicon sono già referenziate nell'index.html")
    print("2. Ricarica la pagina per vedere il logo nella tab del browser")
    print("3. Su mobile, aggiungi l'app alla home per vedere l'icona")

if __name__ == "__main__":
    try:
        generate_favicons()
    except ImportError:
        print("❌ Errore: Pillow non installato!")
        print("📦 Installa con: pip install Pillow")
        print("   oppure: pip3 install Pillow")
    except Exception as e:
        print(f"❌ Errore: {e}")
