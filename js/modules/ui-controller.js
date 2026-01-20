/**
 * UI Controller
 * Handles all UI updates and rendering
 */

import * as CardManager from './card-manager.js';
import * as RoomManager from './room-manager.js';
import * as GameLogic from './game-logic.js';

/**
 * Show specific screen
 */
export function showScreen(screenName) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));

  // Show target screen
  const targetScreen = document.getElementById(`${screenName}-screen`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

/**
 * Show loading overlay
 */
export function showLoading(message = 'Caricamento...') {
  const overlay = document.getElementById('loading-overlay');
  const text = document.getElementById('loading-text');
  if (overlay && text) {
    text.textContent = message;
    overlay.style.display = 'flex';
  }
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

/**
 * Render player list in lobby
 */
export function renderPlayerList(players, currentPlayerId) {
  const listContainer = document.getElementById('players-list');
  const countElement = document.getElementById('player-count');

  if (!listContainer) return;

  const playerArray = RoomManager.getPlayersArray(players);

  // Update count
  if (countElement) {
    countElement.textContent = playerArray.length;
  }

  // Clear list
  listContainer.innerHTML = '';

  // Render each player
  playerArray.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-name';
    nameSpan.textContent = player.name;

    if (player.id === currentPlayerId) {
      nameSpan.textContent += ' (Tu)';
    }

    if (player.isHost) {
      nameSpan.textContent += ' 👑';
    }

    const statusSpan = document.createElement('span');
    statusSpan.className = `player-status ${player.isReady ? 'ready' : 'waiting'}`;
    statusSpan.textContent = player.isReady ? 'Pronto' : 'In attesa';

    playerItem.appendChild(nameSpan);
    playerItem.appendChild(statusSpan);
    listContainer.appendChild(playerItem);
  });
}

/**
 * Render scoreboard
 */
export function renderScoreboard(players, currentTurn) {
  const scoreboard = document.getElementById('scoreboard');
  if (!scoreboard) return;

  const playerArray = RoomManager.getPlayersArray(players);

  scoreboard.innerHTML = '';

  playerArray.forEach(player => {
    const scoreItem = document.createElement('div');
    scoreItem.className = 'score-item';

    // Highlight active player
    if (currentTurn && currentTurn.activePlayerId === player.id) {
      scoreItem.classList.add('active-turn');
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-name';
    nameSpan.textContent = player.name;

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'score';
    scoreSpan.textContent = player.score;

    scoreItem.appendChild(nameSpan);
    scoreItem.appendChild(scoreSpan);
    scoreboard.appendChild(scoreItem);
  });
}

/**
 * Render player cards
 */
export function renderPlayerCards(cardIds, onCardClick) {
  console.log('renderPlayerCards called with:', cardIds);
  const cardsContainer = document.getElementById('player-cards');
  if (!cardsContainer) {
    console.error('player-cards container not found!');
    return;
  }

  cardsContainer.innerHTML = '';

  if (!cardIds || cardIds.length === 0) {
    console.log('No cards to render');
    cardsContainer.innerHTML = '<p>Non hai più carte disponibili.</p>';
    return;
  }

  const dilemmas = CardManager.getDilemmasByIds(cardIds);
  console.log('Dilemmas to render:', dilemmas);

  dilemmas.forEach(dilemma => {
    const card = document.createElement('div');
    card.className = 'dilemma-card';
    card.dataset.dilemmaId = dilemma.id;

    const text = document.createElement('p');
    text.textContent = dilemma.text;

    card.appendChild(text);

    // Add click handler
    if (onCardClick) {
      card.addEventListener('click', () => onCardClick(dilemma));
    }

    cardsContainer.appendChild(card);
  });
}

/**
 * Render target player selector
 */
export function renderTargetSelector(players, activePlayerId) {
  const select = document.getElementById('target-player-select');
  if (!select) return;

  select.innerHTML = '<option value="">Seleziona un giocatore...</option>';

  const targets = RoomManager.getAvailableTargets(players, activePlayerId);

  targets.forEach(target => {
    const option = document.createElement('option');
    option.value = target.id;
    option.textContent = target.name;
    select.appendChild(option);
  });
}

/**
 * Update turn info display
 */
export function updateTurnInfo(currentTurn, players, currentPlayerId) {
  const turnInfo = document.getElementById('turn-info');
  if (!turnInfo) return;

  if (!currentTurn) {
    turnInfo.innerHTML = '';
    return;
  }

  const activePlayer = players[currentTurn.activePlayerId];
  const targetPlayer = currentTurn.targetPlayerId ? players[currentTurn.targetPlayerId] : null;

  // Safety check
  if (!activePlayer) {
    console.error('Active player not found:', currentTurn.activePlayerId);
    turnInfo.innerHTML = 'Caricamento...';
    return;
  }

  let message = '';

  if (currentTurn.activePlayerId === currentPlayerId) {
    message = '<strong>È il tuo turno!</strong>';
  } else if (currentTurn.targetPlayerId === currentPlayerId) {
    message = `<strong>${activePlayer.name}</strong> ti ha posto una domanda`;
  } else {
    message = `Turno di <strong>${activePlayer.name}</strong>`;
    if (targetPlayer) {
      message += ` → <strong>${targetPlayer.name}</strong>`;
    }
  }

  turnInfo.innerHTML = message;
}

/**
 * Show turn result
 */
export function showTurnResult(isCorrect, guess, answer, activePlayerName, targetPlayerName, dilemmaText) {
  const resultView = document.getElementById('result-view');
  const resultContent = document.getElementById('result-content');

  if (!resultView || !resultContent) return;

  const guessText = GameLogic.getAnswerText(guess);
  const answerText = GameLogic.getAnswerText(answer);

  let html = '';

  if (isCorrect) {
    html += '<div class="result-correct">✓ INDOVINATO!</div>';
    html += `<p><strong>${activePlayerName}</strong> ha guadagnato 1 punto!</p>`;
  } else {
    html += '<div class="result-wrong">✗ SBAGLIATO!</div>';
    html += `<p><strong>${activePlayerName}</strong> non ha indovinato.</p>`;
  }

  html += '<div class="result-answers">';
  html += `<div class="result-answer-item">`;
  html += `<strong>Dilemma:</strong><br>${dilemmaText}`;
  html += `</div>`;
  html += `<div class="result-answer-item">`;
  html += `<strong>${activePlayerName} ha previsto:</strong> ${guessText}`;
  html += `</div>`;
  html += `<div class="result-answer-item">`;
  html += `<strong>${targetPlayerName} ha risposto:</strong> ${answerText}`;
  html += `</div>`;
  html += '</div>';

  resultContent.innerHTML = html;

  // Show result view, hide others
  hideAllGameViews();
  resultView.style.display = 'block';
}

/**
 * Hide all game views
 */
export function hideAllGameViews() {
  const views = [
    'active-player-view',
    'target-player-view',
    'waiting-view',
    'result-view'
  ];

  views.forEach(viewId => {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
    }
  });
}

/**
 * Show active player view
 */
export function showActivePlayerView() {
  hideAllGameViews();
  const view = document.getElementById('active-player-view');
  if (view) {
    view.style.display = 'block';
  }

  // Hide turn form initially
  const turnForm = document.getElementById('turn-form');
  if (turnForm) {
    turnForm.style.display = 'none';
  }
}

/**
 * Show target player view
 */
export function showTargetPlayerView(dilemmaId, activePlayerName) {
  hideAllGameViews();
  const view = document.getElementById('target-player-view');
  if (!view) return;

  const dilemma = CardManager.getDilemmaById(dilemmaId);
  if (!dilemma) return;

  const dilemmaText = document.getElementById('target-dilemma-text');
  const playerNameElement = document.getElementById('active-player-name');

  if (dilemmaText) {
    dilemmaText.textContent = dilemma.text;
  }

  if (playerNameElement) {
    playerNameElement.textContent = activePlayerName;
  }

  view.style.display = 'block';
}

/**
 * Show waiting view
 */
export function showWaitingView(message, showDilemma = false, dilemmaId = null) {
  hideAllGameViews();
  const view = document.getElementById('waiting-view');
  if (!view) return;

  const messageElement = document.getElementById('waiting-message');
  if (messageElement) {
    messageElement.textContent = message;
  }

  const dilemmaDisplay = document.getElementById('current-dilemma-display');
  const dilemmaText = document.getElementById('current-dilemma-text');

  if (showDilemma && dilemmaId && dilemmaDisplay && dilemmaText) {
    const dilemma = CardManager.getDilemmaById(dilemmaId);
    if (dilemma) {
      dilemmaText.textContent = dilemma.text;
      dilemmaDisplay.style.display = 'block';
    }
  } else if (dilemmaDisplay) {
    dilemmaDisplay.style.display = 'none';
  }

  view.style.display = 'block';
}

/**
 * Render final scoreboard
 */
export function renderFinalScoreboard(players) {
  const finalScoreboard = document.getElementById('final-scoreboard');
  if (!finalScoreboard) return;

  const sortedPlayers = RoomManager.sortPlayersByScore(players);

  finalScoreboard.innerHTML = '<h3>Classifica Finale</h3>';

  sortedPlayers.forEach((player, index) => {
    const item = document.createElement('div');
    item.className = 'final-score-item';

    const position = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${position} ${player.name}`;

    const scoreSpan = document.createElement('span');
    scoreSpan.textContent = `${player.score} punti`;

    item.appendChild(nameSpan);
    item.appendChild(scoreSpan);
    finalScoreboard.appendChild(item);
  });
}

/**
 * Show winner
 */
export function showWinner(winner) {
  const winnerDisplay = document.getElementById('winner-display');
  if (!winnerDisplay) return;

  if (winner) {
    winnerDisplay.innerHTML = `
      <h3>🎉 ${winner.name} ha vinto! 🎉</h3>
      <p>Con ${winner.score} punti</p>
    `;
  } else {
    winnerDisplay.innerHTML = `
      <h3>Partita Terminata</h3>
      <p>Nessun vincitore</p>
    `;
  }
}

/**
 * Reset form inputs
 */
export function resetFormInputs() {
  const inputs = document.querySelectorAll('input[type="text"]');
  inputs.forEach(input => {
    input.value = '';
  });

  // Reset home screen to show menu
  const homeMenu = document.getElementById('home-menu');
  const createForm = document.getElementById('create-form');
  const joinForm = document.getElementById('join-form');

  if (homeMenu) homeMenu.style.display = 'flex';
  if (createForm) createForm.style.display = 'none';
  if (joinForm) joinForm.style.display = 'none';
}

/**
 * Clear selected cards
 */
export function clearSelectedCard() {
  const cards = document.querySelectorAll('.dilemma-card.selected');
  cards.forEach(card => card.classList.remove('selected'));
}

/**
 * Clear selected answers
 */
export function clearSelectedAnswer() {
  const buttons = document.querySelectorAll('.btn-answer.selected');
  buttons.forEach(btn => btn.classList.remove('selected'));
}
