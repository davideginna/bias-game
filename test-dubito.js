/**
 * Test Script per Modalità Dubito
 * Esegui con: node test-dubito.js
 *
 * Questo script simula scenari di gioco Dubito senza bisogno del browser
 */

// Simula la logica di votazione
function simulateVoting(votes) {
  const lieVotes = votes.filter(v => v === 'lie').length;
  const truthVotes = votes.filter(v => v === 'truth').length;
  const votedLie = lieVotes >= truthVotes; // Pareggio vince "mente"

  return {
    lieVotes,
    truthVotes,
    votedLie,
    result: votedLie ? '😈 Mente vince → +1 punto' : '😇 Sincero vince → Nessun punto'
  };
}

// Test scenarios
const scenarios = [
  {
    name: '🧪 Test 1: Maggioranza Mente (2 mente, 1 sincero)',
    votes: ['lie', 'lie', 'truth'],
    expectedWinner: 'lie'
  },
  {
    name: '🧪 Test 2: Maggioranza Sincero (1 mente, 2 sincero)',
    votes: ['lie', 'truth', 'truth'],
    expectedWinner: 'truth'
  },
  {
    name: '🧪 Test 3: Pareggio (1 mente, 1 sincero) → Mente vince',
    votes: ['lie', 'truth'],
    expectedWinner: 'lie'
  },
  {
    name: '🧪 Test 4: Pareggio (2 mente, 2 sincero) → Mente vince',
    votes: ['lie', 'lie', 'truth', 'truth'],
    expectedWinner: 'lie'
  },
  {
    name: '🧪 Test 5: Tutti votano Mente (3 mente)',
    votes: ['lie', 'lie', 'lie'],
    expectedWinner: 'lie'
  },
  {
    name: '🧪 Test 6: Tutti votano Sincero (3 sincero)',
    votes: ['truth', 'truth', 'truth'],
    expectedWinner: 'truth'
  },
  {
    name: '🧪 Test 7: 4 giocatori (2 votanti) - Pareggio',
    votes: ['lie', 'truth'],
    expectedWinner: 'lie'
  },
  {
    name: '🧪 Test 8: 5 giocatori (3 votanti) - Maggioranza Mente',
    votes: ['lie', 'lie', 'truth'],
    expectedWinner: 'lie'
  },
  {
    name: '🧪 Test 9: 6 giocatori (4 votanti) - Maggioranza Sincero',
    votes: ['truth', 'truth', 'truth', 'lie'],
    expectedWinner: 'truth'
  }
];

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║   TEST MODALITÀ DUBITO - Logica Votazione         ║');
console.log('╚════════════════════════════════════════════════════╝\n');

let passedTests = 0;
let failedTests = 0;

scenarios.forEach((scenario, index) => {
  console.log(`\n${scenario.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Voti: ${scenario.votes.join(', ')}`);

  const result = simulateVoting(scenario.votes);

  console.log(`\n📊 Risultato:`);
  console.log(`   😈 Mente: ${result.lieVotes}`);
  console.log(`   😇 Sincero: ${result.truthVotes}`);
  console.log(`   ${result.result}`);

  const actualWinner = result.votedLie ? 'lie' : 'truth';
  const passed = actualWinner === scenario.expectedWinner;

  if (passed) {
    console.log(`\n✅ TEST PASSATO`);
    passedTests++;
  } else {
    console.log(`\n❌ TEST FALLITO`);
    console.log(`   Atteso: ${scenario.expectedWinner}`);
    console.log(`   Ricevuto: ${actualWinner}`);
    failedTests++;
  }
});

console.log('\n\n╔════════════════════════════════════════════════════╗');
console.log('║              RIEPILOGO TEST                        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n✅ Test passati: ${passedTests}/${scenarios.length}`);
console.log(`❌ Test falliti: ${failedTests}/${scenarios.length}`);

if (failedTests === 0) {
  console.log('\n🎉 Tutti i test sono passati!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Alcuni test sono falliti.\n');
  process.exit(1);
}
