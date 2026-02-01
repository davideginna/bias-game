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
console.log('║   TEST MODALITÀ DUBITO - Logica Completa          ║');
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

// Test controllo bottone "Prossimo Turno"
console.log('\n\n╔════════════════════════════════════════════════════╗');
console.log('║   TEST CONTROLLO BOTTONE PROSSIMO TURNO           ║');
console.log('╚════════════════════════════════════════════════════╝\n');

function testNextTurnButton() {
  const tests = [
    {
      name: 'Active Player vede il bottone',
      currentPlayerId: 'player1',
      activePlayerId: 'player1',
      shouldShowButton: true
    },
    {
      name: 'Altri giocatori NON vedono il bottone',
      currentPlayerId: 'player2',
      activePlayerId: 'player1',
      shouldShowButton: false
    },
    {
      name: 'Target player NON vede il bottone',
      currentPlayerId: 'player3',
      activePlayerId: 'player1',
      shouldShowButton: false
    }
  ];

  let btnTestsPassed = 0;
  let btnTestsFailed = 0;

  tests.forEach(test => {
    console.log(`\n${test.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Current Player: ${test.currentPlayerId}`);
    console.log(`Active Player: ${test.activePlayerId}`);

    const isActivePlayer = test.currentPlayerId === test.activePlayerId;
    const buttonVisible = isActivePlayer;

    console.log(`\n📊 Risultato:`);
    console.log(`   Bottone visibile: ${buttonVisible ? 'Sì' : 'No'}`);
    console.log(`   Atteso: ${test.shouldShowButton ? 'Sì' : 'No'}`);

    if (buttonVisible === test.shouldShowButton) {
      console.log(`\n✅ TEST PASSATO`);
      btnTestsPassed++;
    } else {
      console.log(`\n❌ TEST FALLITO`);
      btnTestsFailed++;
    }
  });

  return { passed: btnTestsPassed, failed: btnTestsFailed };
}

const btnResults = testNextTurnButton();
passedTests += btnResults.passed;
failedTests += btnResults.failed;

console.log('\n\n╔════════════════════════════════════════════════════╗');
console.log('║              RIEPILOGO GENERALE                    ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n✅ Test passati: ${passedTests}/${scenarios.length + 3}`);
console.log(`❌ Test falliti: ${failedTests}/${scenarios.length + 3}`);

if (failedTests === 0) {
  console.log('\n🎉 Tutti i test sono passati!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Alcuni test sono falliti.\n');
  process.exit(1);
}
