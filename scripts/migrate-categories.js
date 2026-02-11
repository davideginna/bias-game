#!/usr/bin/env node

/**
 * Script di migrazione per categorizzare i dilemmi esistenti
 * Genera file JSON separati per ogni categoria
 */

const fs = require('fs');
const path = require('path');

// Percorsi file
const DILEMMAS_FILE = path.join(__dirname, '../data/dilemmas.json');
const OUTPUT_DIR = path.join(__dirname, '../data/categories');
const METADATA_FILE = path.join(OUTPUT_DIR, 'metadata.json');

// Definizione categorie
const CATEGORIES = {
  'serie-tv': {
    name: 'Serie TV',
    icon: '📺',
    description: 'Dilemmi nei panni di personaggi di serie TV',
    test: (text) => {
      // Regex per pattern "Sei [Personaggio] ([Show])"
      const tvPattern = /Sei .+ \(.+\)/i;
      if (!tvPattern.test(text)) return false;

      // Lista show TV noti (aggiungi altri se necessario)
      const tvShows = [
        'Breaking Bad', 'The Walking Dead', 'Game of Thrones', 'Friends',
        'The Office', 'Stranger Things', 'La Casa di Carta', 'Narcos',
        'Black Mirror', 'The Crown', 'Peaky Blinders', 'Sherlock',
        'The Mandalorian', 'The Witcher', 'Vikings', 'Westworld',
        'Prison Break', 'Lost', 'How I Met Your Mother', 'Grey\'s Anatomy'
      ];

      return tvShows.some(show => text.includes(show));
    }
  },

  'film': {
    name: 'Film',
    icon: '🎬',
    description: 'Dilemmi nei panni di personaggi cinematografici',
    test: (text) => {
      const moviePattern = /Sei .+ \(.+\)/i;
      if (!moviePattern.test(text)) return false;

      // Lista film noti
      const movies = [
        'Matrix', 'Star Wars', 'Il Padrino', 'Inception', 'Interstellar',
        'Pulp Fiction', 'Fight Club', 'Forrest Gump', 'Titanic',
        'Avengers', 'Batman', 'Spider-Man', 'Iron Man', 'Joker',
        'Il Signore degli Anelli', 'Harry Potter', 'Jurassic Park',
        'Ritorno al Futuro', 'Gladiatore', 'La La Land'
      ];

      return movies.some(movie => text.includes(movie));
    }
  },

  'sex': {
    name: 'Sessualità',
    icon: '💋',
    description: 'Contenuti sessuali e intimi',
    test: (text) => {
      const keywords = [
        'sex', 'sesso', 'porno', 'masturb', 'orgasmo', 'erezione',
        'nud', 'intim', 'eccit', 'desiderio sessuale', 'fare l\'amore',
        'letto', 'amplesso', 'preliminari', 'fantasie sessuali',
        'prostitut', 'bordello', 'strip', 'lap dance', 'sex toy'
      ];

      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    }
  },

  'money': {
    name: 'Denaro',
    icon: '💰',
    description: 'Etica finanziaria ed economica',
    test: (text) => {
      const keywords = [
        '€', 'euro', 'soldi', 'denaro', 'stipendio', 'salario',
        'milion', 'mila euro', 'pagare', 'pagato', 'ricco',
        'borsa', 'investimento', 'azioni', 'criptovalute', 'bitcoin',
        'debito', 'prestito', 'mutuo', 'affitto', 'tasse',
        'bonus', 'eredità', 'vincere', 'lotteria', 'gratta e vinci'
      ];

      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    }
  },

  'technology': {
    name: 'Tecnologia',
    icon: '💻',
    description: 'Social media, IA, privacy digitale',
    test: (text) => {
      const keywords = [
        'social', 'instagram', 'tiktok', 'facebook', 'twitter', 'youtube',
        'intelligenza artificiale', 'IA', 'AI', 'chatbot', 'algoritmo',
        'privacy', 'dati personali', 'sorveglianza', 'telecamera',
        'smartphone', 'app', 'internet', 'online', 'hacker', 'cyberbullismo',
        'deepfake', 'streaming', 'influencer', 'follower', 'like'
      ];

      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    }
  },

  'politics': {
    name: 'Politica',
    icon: '🏛️',
    description: 'Etica politica e governativa',
    test: (text) => {
      const keywords = [
        'voto', 'votare', 'elezioni', 'governo', 'democrazia', 'dittatura',
        'legge', 'legislazione', 'parlamento', 'politico', 'partito',
        'presidente', 'sindaco', 'ministro', 'corruzione politica',
        'referendum', 'manifestazione', 'protesta', 'rivoluzione',
        'costituzione', 'diritti civili', 'libertà di stampa'
      ];

      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    }
  },

  'religion': {
    name: 'Religione',
    icon: '⛪',
    description: 'Fede e spiritualità',
    test: (text) => {
      const keywords = [
        'dio', 'fede', 'religione', 'chiesa', 'pregare', 'preghiera',
        'sacerdote', 'prete', 'vescovo', 'papa', 'bibbia', 'vangelo',
        'paradiso', 'inferno', 'peccato', 'confessione', 'battesimo',
        'messa', 'culto', 'spirituale', 'divino', 'miracolo',
        'credente', 'ateo', 'agnostico', 'buddista', 'musulmano'
      ];

      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    }
  },

  'environment': {
    name: 'Ambiente',
    icon: '🌍',
    description: 'Clima e sostenibilità',
    test: (text) => {
      const keywords = [
        'ambiente', 'clima', 'riscaldamento globale', 'inquinamento',
        'plastica', 'riciclare', 'sostenibile', 'ecologico', 'green',
        'emissioni', 'CO2', 'energia rinnovabile', 'solare', 'eolico',
        'deforestazione', 'biodiversità', 'estinzione', 'animali in pericolo',
        'vegetariano', 'vegano', 'carbon footprint', 'zero waste'
      ];

      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    }
  }
};

// Carica dilemmi
console.log('📖 Caricamento dilemmi da:', DILEMMAS_FILE);
const dilemmas = JSON.parse(fs.readFileSync(DILEMMAS_FILE, 'utf8'));
console.log(`✅ Caricati ${dilemmas.length} dilemmi`);

// Inizializza categorie
const categorizedDilemmas = {
  'serie-tv': [],
  'film': [],
  'sex': [],
  'money': [],
  'technology': [],
  'politics': [],
  'religion': [],
  'environment': [],
  'default': []
};

// Statistiche
const stats = {
  total: dilemmas.length,
  categorized: 0,
  default: 0
};

// Classifica ogni dilemma
console.log('\n🔍 Classificazione dilemmi in corso...\n');

dilemmas.forEach((dilemma, index) => {
  let assigned = false;

  // Prova ogni categoria (ordine importante: serie-tv e film prima di default)
  for (const [categoryId, category] of Object.entries(CATEGORIES)) {
    if (category.test(dilemma.text)) {
      categorizedDilemmas[categoryId].push({
        id: `${categoryId}-${categorizedDilemmas[categoryId].length + 1}`,
        text: dilemma.text,
        category: categoryId
      });
      assigned = true;
      stats.categorized++;
      break;
    }
  }

  // Se non assegnato, va in default
  if (!assigned) {
    categorizedDilemmas['default'].push({
      id: `default-${categorizedDilemmas['default'].length + 1}`,
      text: dilemma.text,
      category: 'default'
    });
    stats.default++;
  }

  // Progress ogni 100 dilemmi
  if ((index + 1) % 100 === 0) {
    console.log(`  Processati ${index + 1}/${dilemmas.length} dilemmi...`);
  }
});

console.log('\n✅ Classificazione completata!\n');

// Mostra statistiche
console.log('📊 Statistiche per categoria:\n');
Object.keys(categorizedDilemmas).forEach(categoryId => {
  const count = categorizedDilemmas[categoryId].length;
  const icon = CATEGORIES[categoryId]?.icon || '📝';
  const name = CATEGORIES[categoryId]?.name || 'Default';
  console.log(`  ${icon} ${name.padEnd(20)} ${count.toString().padStart(4)} dilemmi`);
});

console.log(`\n  📊 TOTALE:              ${stats.total} dilemmi`);

// Salva file per categoria
console.log('\n💾 Salvataggio file categorie...\n');

Object.entries(categorizedDilemmas).forEach(([categoryId, dilemmas]) => {
  if (dilemmas.length === 0) return;

  const filename = path.join(OUTPUT_DIR, `${categoryId}.json`);
  fs.writeFileSync(filename, JSON.stringify(dilemmas, null, 2), 'utf8');
  console.log(`  ✅ Salvato ${filename} (${dilemmas.length} dilemmi)`);
});

// Validazione ID unici
console.log('\n🔍 Validazione ID unici...\n');
const allIds = new Set();
let duplicates = 0;

Object.values(categorizedDilemmas).forEach(dilemmas => {
  dilemmas.forEach(d => {
    if (allIds.has(d.id)) {
      console.log(`  ⚠️  ID duplicato: ${d.id}`);
      duplicates++;
    }
    allIds.add(d.id);
  });
});

if (duplicates === 0) {
  console.log('  ✅ Nessun ID duplicato trovato!');
} else {
  console.log(`  ❌ Trovati ${duplicates} ID duplicati!`);
}

// Genera metadata.json
console.log('\n📝 Generazione metadata.json...\n');

const metadata = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  categories: [
    {
      id: 'default',
      name: 'Dilemmi Generali',
      icon: '📝',
      description: 'Dilemmi morali generali su onestà, lealtà, sacrificio e vita quotidiana',
      count: categorizedDilemmas['default'].length,
      examples: categorizedDilemmas['default'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'sex',
      name: 'Sessualità',
      icon: '💋',
      description: 'Contenuti sessuali e intimi',
      count: categorizedDilemmas['sex'].length,
      examples: categorizedDilemmas['sex'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'serie-tv',
      name: 'Serie TV',
      icon: '📺',
      description: 'Dilemmi nei panni di personaggi di serie TV',
      count: categorizedDilemmas['serie-tv'].length,
      examples: categorizedDilemmas['serie-tv'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'film',
      name: 'Film',
      icon: '🎬',
      description: 'Dilemmi nei panni di personaggi cinematografici',
      count: categorizedDilemmas['film'].length,
      examples: categorizedDilemmas['film'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'politics',
      name: 'Politica',
      icon: '🏛️',
      description: 'Etica politica e governativa',
      count: categorizedDilemmas['politics'].length,
      examples: categorizedDilemmas['politics'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'money',
      name: 'Denaro',
      icon: '💰',
      description: 'Etica finanziaria ed economica',
      count: categorizedDilemmas['money'].length,
      examples: categorizedDilemmas['money'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'technology',
      name: 'Tecnologia',
      icon: '💻',
      description: 'Social media, IA, privacy digitale',
      count: categorizedDilemmas['technology'].length,
      examples: categorizedDilemmas['technology'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'religion',
      name: 'Religione',
      icon: '⛪',
      description: 'Fede e spiritualità',
      count: categorizedDilemmas['religion'].length,
      examples: categorizedDilemmas['religion'].slice(0, 3).map(d => d.text)
    },
    {
      id: 'environment',
      name: 'Ambiente',
      icon: '🌍',
      description: 'Clima e sostenibilità',
      count: categorizedDilemmas['environment'].length,
      examples: categorizedDilemmas['environment'].slice(0, 3).map(d => d.text)
    }
  ]
};

fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf8');
console.log(`  ✅ Salvato ${METADATA_FILE}`);

console.log('\n✨ Migrazione completata con successo!\n');
console.log('📋 Prossimi passi:');
console.log('  1. Creare 40 dilemmi cartoon e salvarli in data/categories/cartoon.json');
console.log('  2. Aggiornare metadata.json per includere la categoria cartoon');
console.log('  3. Validare tutti i file generati');
console.log('  4. Procedere con Fase 2: Backend - Card Manager\n');
