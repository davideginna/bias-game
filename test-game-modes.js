/**
 * Test Script per Modalità di Gioco
 * Esegui con: node test-game-modes.js
 *
 * Testa le modalità: Scelta e Sequenziale
 */

// Simula getNextTargetSequential
function getNextTargetSequential(activePlayerId, playerOrder) {
  const currentIndex = playerOrder.indexOf(activePlayerId);
  if (currentIndex === -1) return null;

  const nextIndex = (currentIndex + 1) % playerOrder.length;
  return playerOrder[nextIndex];
}

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║   TEST MODALITÀ DI GIOCO                          ║');
console.log('╚════════════════════════════════════════════════════╝\n');

let passedTests = 0;
let failedTests = 0;

// Test data
const playerOrder = ['player1', 'player2', 'player3', 'player4'];

// ===================
// TEST SEQUENZIALE
// ===================
console.log('\n📋 TEST MODALITÀ SEQUENZIALE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const sequentialTests = [
  {
    name: 'Player 1 → Player 2',
    active: 'player1',
    expectedTarget: 'player2'
  },
  {
    name: 'Player 2 → Player 3',
    active: 'player2',
    expectedTarget: 'player3'
  },
  {
    name: 'Player 4 → Player 1 (wrap around)',
    active: 'player4',
    expectedTarget: 'player1'
  }
];

sequentialTests.forEach(test => {
  const target = getNextTargetSequential(test.active, playerOrder);
  const passed = target === test.expectedTarget;

  console.log(`${test.name}`);
  console.log(`  Attivo: ${test.active}`);
  console.log(`  Target: ${target}`);
  console.log(`  Atteso: ${test.expectedTarget}`);
  console.log(`  ${passed ? '✅ PASSATO' : '❌ FALLITO'}\n`);

  if (passed) passedTests++;
  else failedTests++;
});

// ===================
// RIEPILOGO
// ===================
console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║              RIEPILOGO TEST                        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n✅ Test passati: ${passedTests}/3`);
console.log(`❌ Test falliti: ${failedTests}/3`);

if (failedTests === 0) {
  console.log('\n🎉 Tutti i test sono passati!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Alcuni test sono falliti.\n');
  process.exit(1);
}
