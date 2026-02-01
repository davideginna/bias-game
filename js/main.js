/**
 * Main Application Entry Point
 * Handles initialization, routing, and global event listeners
 */

import * as FirebaseManager from './modules/firebase-manager.js';
import * as RoomManager from './modules/room-manager.js';
import * as CardManager from './modules/card-manager.js';
import * as GameLogic from './modules/game-logic.js';
import * as UI from './modules/ui-controller.js';
import * as AudioManager from './modules/audio-manager.js';
import { GAME_STATUS, TURN_STATUS, MIN_PLAYERS } from './config.js';

// Global state
let currentRoomId = null;
let currentPlayerId = null;
let currentRoomData = null;
let selectedDilemma = null;
let selectedTarget = null;
let selectedGuess = null;
let deferredInstallPrompt = null; // Store install prompt event

/**
 * Initialize application
 */
async function init() {
  console.log('Initializing Bias...');

  try {
    UI.showLoading('Inizializzazione...');

    // Initialize Firebase
    const firebaseInitialized = FirebaseManager.initFirebase();
    if (!firebaseInitialized) {
      throw new Error('Failed to initialize Firebase');
    }

    // Load dilemmas
    await CardManager.loadDilemmas();

    // Setup event listeners
    setupEventListeners();

    // Check if player has stored session
    const stored = RoomManager.getStoredPlayerInfo();
    if (stored.playerId && stored.roomId) {
      // Try to rejoin room
      UI.showLoading('Riconnessione in corso...');
      const exists = await FirebaseManager.roomExists(stored.roomId);
      if (exists) {
        console.log('Found stored session, attempting to rejoin...');
        currentPlayerId = stored.playerId;
        currentRoomId = stored.roomId;

        // Get room data to determine state
        const roomData = await FirebaseManager.getRoomData(stored.roomId);

        // Check if player still exists in the room
        if (roomData && roomData.players && roomData.players[stored.playerId]) {
          // Player still in room, rejoin
          await rejoinRoom();
          UI.hideLoading();
          UI.showToast('Riconnesso alla partita!', 'success');
          return;
        } else {
          // Player was removed, clear storage
          console.log('Player no longer in room');
          RoomManager.clearStoredPlayerInfo();
        }
      } else {
        // Room doesn't exist anymore, clear storage
        console.log('Room no longer exists');
        RoomManager.clearStoredPlayerInfo();
      }
    }

    // Show home screen
    UI.showScreen('home');
    UI.hideLoading();

    // Register service worker for PWA
    registerServiceWorker();

    // Setup install prompt
    setupInstallPrompt();
  } catch (error) {
    console.error('Error initializing app:', error);
    UI.hideLoading();
    UI.showToast('Errore durante l\'inizializzazione', 'error');
  }
}

/**
 * Register Service Worker for PWA functionality
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        scope: './'
      });

      console.log('✅ Service Worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 New Service Worker found, installing...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📦 New content available, reload to update');
            // Optionally show a toast to user about update
            UI.showToast('Nuova versione disponibile! Ricarica la pagina.', 'info');
          }
        });
      });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker updated, reloading...');
        window.location.reload();
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  } else {
    console.log('⚠️ Service Workers not supported in this browser');
  }
}

/**
 * Setup PWA install prompt
 */
function setupInstallPrompt() {
  const installBanner = document.getElementById('install-banner');
  const installBtn = document.getElementById('install-app-btn');
  const closeBannerBtn = document.getElementById('close-install-banner');

  // Check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 App already installed');
    return;
  }

  // Check if banner was previously dismissed
  if (localStorage.getItem('bias_install_dismissed') === 'true') {
    console.log('🚫 Install banner previously dismissed');
    return;
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('📲 beforeinstallprompt event fired');

    // Prevent the default install prompt
    event.preventDefault();

    // Store the event for later use
    deferredInstallPrompt = event;

    // Show our custom banner
    if (installBanner) {
      installBanner.style.display = 'block';
    }
  });

  // Handle install button click
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) {
        console.log('⚠️ No install prompt available');
        return;
      }

      // Show the install prompt
      deferredInstallPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`📱 User choice: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('✅ App installed');
      } else {
        console.log('❌ Installation declined');
      }

      // Clear the deferred prompt
      deferredInstallPrompt = null;

      // Hide banner
      if (installBanner) {
        installBanner.style.display = 'none';
      }
    });
  }

  // Handle close banner button
  if (closeBannerBtn) {
    closeBannerBtn.addEventListener('click', () => {
      if (installBanner) {
        installBanner.style.display = 'none';
      }
      // Remember that user dismissed the banner
      localStorage.setItem('bias_install_dismissed', 'true');
      console.log('🚫 Install banner dismissed');
    });
  }

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('✅ App successfully installed');
    if (installBanner) {
      installBanner.style.display = 'none';
    }
    UI.showToast('App installata con successo!', 'success');
  });
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
  // Home screen - Menu buttons
  const showCreateFormBtn = document.getElementById('show-create-form-btn');
  const showJoinFormBtn = document.getElementById('show-join-form-btn');
  const backFromCreateBtn = document.getElementById('back-from-create-btn');
  const backFromJoinBtn = document.getElementById('back-from-join-btn');

  if (showCreateFormBtn) {
    showCreateFormBtn.addEventListener('click', () => {
      document.getElementById('home-menu').style.display = 'none';
      document.getElementById('create-form').style.display = 'block';
    });
  }

  if (showJoinFormBtn) {
    showJoinFormBtn.addEventListener('click', () => {
      document.getElementById('home-menu').style.display = 'none';
      document.getElementById('join-form').style.display = 'block';
    });
  }

  if (backFromCreateBtn) {
    backFromCreateBtn.addEventListener('click', () => {
      document.getElementById('create-form').style.display = 'none';
      document.getElementById('home-menu').style.display = 'block';
    });
  }

  if (backFromJoinBtn) {
    backFromJoinBtn.addEventListener('click', () => {
      document.getElementById('join-form').style.display = 'none';
      document.getElementById('home-menu').style.display = 'block';
    });
  }

  // Home screen - Action buttons
  const createRoomBtn = document.getElementById('create-room-btn');
  const joinRoomBtn = document.getElementById('join-room-btn');

  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', handleCreateRoom);
  }

  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', handleJoinRoom);
  }

  // Lobby screen
  const readyBtn = document.getElementById('ready-btn');
  const startGameBtn = document.getElementById('start-game-btn');
  const leaveLobbyBtn = document.getElementById('leave-lobby-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const roomOpenToggle = document.getElementById('room-open-toggle');

  if (readyBtn) {
    readyBtn.addEventListener('click', handleReady);
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', handleStartGame);
  }

  if (leaveLobbyBtn) {
    leaveLobbyBtn.addEventListener('click', handleLeaveLobby);
  }

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', handleCopyCode);
  }

  if (roomOpenToggle) {
    roomOpenToggle.addEventListener('change', handleRoomOpenToggle);
  }

  // Game screen - Answer buttons for target player
  const targetAnswerButtons = document.querySelectorAll('#target-player-view .btn-answer');
  targetAnswerButtons.forEach(btn => {
    btn.addEventListener('click', handleTargetAnswer);
  });

  // Game screen - Speak dilemma button
  const speakDilemmaBtn = document.getElementById('speak-dilemma-btn');
  if (speakDilemmaBtn) {
    speakDilemmaBtn.addEventListener('click', handleSpeakDilemma);
  }

  // Game screen - Submit guess and cancel buttons
  const submitGuessBtn = document.getElementById('submit-guess-btn');
  const cancelSelectionBtn = document.getElementById('cancel-selection-btn');

  if (submitGuessBtn) {
    submitGuessBtn.addEventListener('click', handleSubmitGuess);
  }

  if (cancelSelectionBtn) {
    cancelSelectionBtn.addEventListener('click', handleCancelSelection);
  }

  // Game screen - Next turn button
  const nextTurnBtn = document.getElementById('next-turn-btn');
  if (nextTurnBtn) {
    nextTurnBtn.addEventListener('click', handleNextTurn);
  }

  // Game screen - Exit button
  const exitGameBtn = document.getElementById('exit-game-btn');
  if (exitGameBtn) {
    exitGameBtn.addEventListener('click', handleExitGame);
  }

  // End screen
  const newGameBtn = document.getElementById('new-game-btn');
  const leaveGameBtn = document.getElementById('leave-game-btn');

  if (newGameBtn) {
    newGameBtn.addEventListener('click', handleNewGame);
  }

  if (leaveGameBtn) {
    leaveGameBtn.addEventListener('click', handleLeaveGame);
  }

  // Rules modal handlers
  const closeRulesModal = document.getElementById('close-rules-modal');
  const rulesModal = document.getElementById('rules-modal');

  if (closeRulesModal) {
    closeRulesModal.addEventListener('click', () => {
      rulesModal.style.display = 'none';
    });
  }

  if (rulesModal) {
    rulesModal.addEventListener('click', (e) => {
      if (e.target === rulesModal) {
        rulesModal.style.display = 'none';
      }
    });
  }


  // Floating menu handlers
  const floatingMenu = document.getElementById('floating-menu');
  const floatingMenuBtn = document.getElementById('floating-menu-btn');
  const floatingThemeBtn = document.getElementById('floating-theme-btn');
  const floatingRulesBtn = document.getElementById('floating-rules-btn');

  if (floatingMenuBtn) {
    floatingMenuBtn.addEventListener('click', () => {
      floatingMenu.classList.toggle('active');
    });
  }

  if (floatingThemeBtn) {
    floatingThemeBtn.addEventListener('click', () => {
      floatingMenu.classList.remove('active');
      themeModal.style.display = 'flex';
      updateActiveTheme(document.body.getAttribute('data-theme'));
    });
  }

  if (floatingRulesBtn) {
    floatingRulesBtn.addEventListener('click', () => {
      floatingMenu.classList.remove('active');
      rulesModal.style.display = 'flex';
    });
  }

  // Close floating menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!floatingMenu.contains(e.target) && floatingMenu.classList.contains('active')) {
      floatingMenu.classList.remove('active');
    }
  });

  // Theme modal handlers
  const closeThemeModal = document.getElementById('close-theme-modal');
  const themeModal = document.getElementById('theme-modal');
  const themeOptions = document.querySelectorAll('.theme-option');

  // Load saved theme
  const savedTheme = localStorage.getItem('bias_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateActiveTheme(savedTheme);

  if (closeThemeModal) {
    closeThemeModal.addEventListener('click', () => {
      themeModal.style.display = 'none';
    });
  }

  if (themeModal) {
    themeModal.addEventListener('click', (e) => {
      if (e.target === themeModal) {
        themeModal.style.display = 'none';
      }
    });
  }

  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('bias_theme', theme);
      updateActiveTheme(theme);
    });
  });
}

/**
 * Update active theme indicator
 */
function updateActiveTheme(currentTheme) {
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    if (option.getAttribute('data-theme') === currentTheme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

/**
 * Show custom confirm modal
 */
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok-btn');
    const cancelBtn = document.getElementById('confirm-cancel-btn');

    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.style.display = 'flex';

    const handleOk = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      modal.removeEventListener('click', handleBackdrop);
      resolve(true);
    };

    const handleCancel = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      modal.removeEventListener('click', handleBackdrop);
      resolve(false);
    };

    const handleBackdrop = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleBackdrop);
  });
}

/**
 * Handle create room
 */
async function handleCreateRoom() {
  try {
    const playerNameInput = document.getElementById('create-player-name');
    const playerName = playerNameInput.value.trim();

    if (!RoomManager.validatePlayerName(playerName)) {
      UI.showToast('Inserisci un nome valido (1-20 caratteri)', 'error');
      return;
    }

    UI.showLoading('Creazione stanza...');

    const { roomId, playerId } = await RoomManager.createNewRoom(playerName);

    currentRoomId = roomId;
    currentPlayerId = playerId;

    await joinLobby();

    UI.hideLoading();
    UI.showToast('Stanza creata!', 'success');
  } catch (error) {
    console.error('Error creating room:', error);
    UI.hideLoading();
    UI.showToast('Errore durante la creazione della stanza', 'error');
  }
}

/**
 * Handle join room
 */
async function handleJoinRoom() {
  try {
    const playerNameInput = document.getElementById('join-player-name');
    const roomCodeInput = document.getElementById('room-code');

    const playerName = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim();

    if (!RoomManager.validatePlayerName(playerName)) {
      UI.showToast('Inserisci un nome valido (1-20 caratteri)', 'error');
      return;
    }

    if (!RoomManager.validateRoomIdFormat(roomCode)) {
      UI.showToast('Codice stanza non valido (6 caratteri)', 'error');
      return;
    }

    UI.showLoading('Accesso alla stanza...');

    const { roomId, playerId, isJoiningMidGame } = await RoomManager.joinExistingRoom(roomCode, playerName);

    currentRoomId = roomId;
    currentPlayerId = playerId;

    // If joining mid-game, give cards to the new player
    if (isJoiningMidGame) {
      const roomData = await FirebaseManager.getRoomData(roomId);
      const usedDilemmas = roomData.usedDilemmas || [];
      const discardedCards = roomData.discardedCards || [];
      const cardsInHands = await FirebaseManager.getCardsInHands(roomId);

      const newPlayerCards = CardManager.getCardsForNewPlayer(cardsInHands, usedDilemmas, discardedCards);
      await FirebaseManager.setPlayerCards(roomId, playerId, newPlayerCards);

      console.log(`New player ${playerId} joined mid-game with cards:`, newPlayerCards);
    }

    await joinLobby();

    UI.hideLoading();
    if (isJoiningMidGame) {
      UI.showToast('Sei entrato nella partita! Giocherai dal prossimo turno.', 'success');
    } else {
      UI.showToast('Sei entrato nella stanza!', 'success');
    }
  } catch (error) {
    console.error('Error joining room:', error);
    UI.hideLoading();
    UI.showToast(error.message || 'Errore durante l\'accesso alla stanza', 'error');
  }
}

/**
 * Join lobby and start listening to room updates
 */
async function joinLobby() {
  // Show lobby screen
  UI.showScreen('lobby');

  // Display room code
  const roomCodeElement = document.getElementById('lobby-room-code');
  if (roomCodeElement) {
    roomCodeElement.textContent = currentRoomId;
  }

  // Start listening to room updates
  FirebaseManager.listenToRoom(currentRoomId, handleRoomUpdate);
}

/**
 * Rejoin existing room (for reconnection)
 */
async function rejoinRoom() {
  // Display room code
  const roomCodeElement = document.getElementById('lobby-room-code');
  if (roomCodeElement) {
    roomCodeElement.textContent = currentRoomId;
  }

  // Start listening to room updates
  // The handleRoomUpdate will determine which screen to show based on game status
  FirebaseManager.listenToRoom(currentRoomId, handleRoomUpdate);
}

/**
 * Handle room data updates
 */
function handleRoomUpdate(roomData) {
  if (!roomData) {
    console.log('Room has been deleted');
    handleRoomDeleted();
    return;
  }

  currentRoomData = roomData;

  const { config, players, currentTurn } = roomData;

  // Check current screen and game status
  if (config.status === GAME_STATUS.LOBBY) {
    updateLobbyScreen(players);
  } else if (config.status === GAME_STATUS.PLAYING) {
    updateGameScreen(players, currentTurn);
  } else if (config.status === GAME_STATUS.ENDED) {
    updateEndScreen(players);
  }
}

/**
 * Update lobby screen
 */
function updateLobbyScreen(players) {
  // Ensure we're on lobby screen
  UI.showScreen('lobby');

  // Render player list
  UI.renderPlayerList(players, currentPlayerId);

  // Update ready button state
  const readyBtn = document.getElementById('ready-btn');
  const currentPlayer = players[currentPlayerId];

  if (readyBtn && currentPlayer) {
    if (currentPlayer.isReady) {
      readyBtn.textContent = 'Annulla';
      readyBtn.classList.remove('btn-primary');
      readyBtn.classList.add('btn-secondary');
    } else {
      readyBtn.textContent = 'Pronto';
      readyBtn.classList.remove('btn-secondary');
      readyBtn.classList.add('btn-primary');
    }
  }

  const isHost = RoomManager.isPlayerHost(players, currentPlayerId);

  // Show/hide room settings (only for host)
  const roomSettings = document.getElementById('room-settings');
  if (roomSettings) {
    if (isHost) {
      roomSettings.style.display = 'block';
      // Update toggle state
      const roomOpenToggle = document.getElementById('room-open-toggle');
      if (roomOpenToggle && currentRoomData) {
        roomOpenToggle.checked = currentRoomData.config.isOpen === true;
      }
    } else {
      roomSettings.style.display = 'none';
    }
  }

  // Show/hide start button (only for host when all ready)
  const startGameBtn = document.getElementById('start-game-btn');
  if (startGameBtn) {
    const allReady = RoomManager.areAllPlayersReady(players);
    const playerCount = RoomManager.getPlayerCount(players);

    if (isHost && allReady && playerCount >= MIN_PLAYERS) {
      startGameBtn.style.display = 'block';
    } else {
      startGameBtn.style.display = 'none';
    }
  }
}

/**
 * Update game screen
 */
function updateGameScreen(players, currentTurn) {
  // Ensure we're on game screen
  UI.showScreen('game');

  // Update room code in header
  const gameRoomCodeElement = document.getElementById('game-room-code');
  if (gameRoomCodeElement && currentRoomId) {
    gameRoomCodeElement.textContent = currentRoomId;
  }

  // Render scoreboard
  UI.renderScoreboard(players, currentTurn);

  // Update turn info
  UI.updateTurnInfo(currentTurn, players, currentPlayerId);

  if (!currentTurn) {
    console.log('No current turn yet, showing waiting message');
    UI.showWaitingView('In attesa del primo turno...', false);
    return;
  }

  console.log('Current turn:', currentTurn);

  // Determine which view to show
  const gameState = GameLogic.getGameStateForPlayer(currentPlayerId, currentRoomData);

  if (currentTurn.status === TURN_STATUS.SHOWING_RESULT) {
    // Show result
    const activePlayer = players[currentTurn.activePlayerId];
    const targetPlayer = players[currentTurn.targetPlayerId];
    const dilemma = CardManager.getDilemmaById(currentTurn.dilemmaId);
    const isCorrect = GameLogic.checkMatch(currentTurn.guess, currentTurn.answer);

    // Play sound based on result
    if (isCorrect) {
      AudioManager.playSuccessSound();
    } else {
      AudioManager.playErrorSound();
    }

    UI.showTurnResult(
      isCorrect,
      currentTurn.guess,
      currentTurn.answer,
      activePlayer.name,
      targetPlayer.name,
      dilemma.text
    );
  } else if (gameState.canGuess) {
    // Show active player view
    UI.showActivePlayerView();
    UI.renderPlayerCards(gameState.myCards, handleCardSelect, handleCardDiscard);
  } else if (gameState.canAnswer) {
    // Show target player view
    const activePlayer = players[currentTurn.activePlayerId];
    UI.showTargetPlayerView(currentTurn.dilemmaId, activePlayer.name);
  } else {
    // Show waiting view
    const activePlayer = players[currentTurn.activePlayerId];
    const targetPlayer = currentTurn.targetPlayerId ? players[currentTurn.targetPlayerId] : null;

    let message = 'Aspetta il tuo turno...';

    if (currentTurn.status === TURN_STATUS.GUESSING) {
      message = `${activePlayer.name} sta scegliendo...`;
    } else if (currentTurn.status === TURN_STATUS.WAITING_ANSWER && targetPlayer) {
      message = `${targetPlayer.name} sta rispondendo...`;
      UI.showWaitingView(message, true, currentTurn.dilemmaId);
      // Render player cards with discard option even while waiting
      renderWaitingPlayerCards(gameState.myCards);
      return;
    }

    UI.showWaitingView(message, false);
    // Render player cards with discard option even while waiting
    renderWaitingPlayerCards(gameState.myCards);
  }
}

/**
 * Update end screen
 */
function updateEndScreen(players) {
  UI.showScreen('end');

  // Find winner
  const winner = GameLogic.checkWinCondition(players);

  // Show winner
  UI.showWinner(winner);

  // Render final scoreboard
  UI.renderFinalScoreboard(players);
}

/**
 * Handle card selection
 */
function handleCardSelect(dilemma) {
  selectedDilemma = dilemma;

  // Update UI
  UI.clearSelectedCard();
  const card = document.querySelector(`.dilemma-card[data-dilemma-id="${dilemma.id}"]`);
  if (card) {
    card.classList.add('selected');
  }

  // Show turn form
  const turnForm = document.getElementById('turn-form');
  const selectedDilemmaText = document.getElementById('selected-dilemma-text');

  if (turnForm && selectedDilemmaText) {
    selectedDilemmaText.textContent = dilemma.text;
    turnForm.style.display = 'block';
  }

  // Populate target selector
  UI.renderTargetSelector(currentRoomData.players, currentPlayerId);

  // Hide guess section initially
  const guessSection = document.getElementById('guess-section');
  if (guessSection) {
    guessSection.style.display = 'none';
  }

  // Setup answer button listeners
  setupAnswerButtonListeners('active-player-view');

  // Reset selections
  selectedTarget = null;
  selectedGuess = null;
  updateSubmitButtonState();
}

/**
 * Render player cards in waiting view
 */
function renderWaitingPlayerCards(cardIds) {
  const cardsContainer = document.getElementById('waiting-player-cards');
  if (!cardsContainer) {
    console.error('waiting-player-cards container not found!');
    return;
  }

  cardsContainer.innerHTML = '';

  if (!cardIds || cardIds.length === 0) {
    cardsContainer.innerHTML = '<p>Non hai più carte disponibili.</p>';
    return;
  }

  const dilemmas = CardManager.getDilemmasByIds(cardIds);

  dilemmas.forEach(dilemma => {
    const card = document.createElement('div');
    card.className = 'dilemma-card';
    card.dataset.dilemmaId = dilemma.id;

    const text = document.createElement('p');
    text.textContent = dilemma.text;
    card.appendChild(text);

    // Add discard button
    const discardBtn = document.createElement('button');
    discardBtn.className = 'btn-discard-card';
    discardBtn.innerHTML = '✕';
    discardBtn.title = 'Scarta questa carta';

    discardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCardDiscard(dilemma);
    });

    card.appendChild(discardBtn);
    cardsContainer.appendChild(card);
  });
}

/**
 * Handle card discard
 */
async function handleCardDiscard(dilemma) {
  const confirmed = await showConfirm(
    'Scarta carta',
    `Sei sicuro di voler scartare questa carta?\n\n"${dilemma.text}"`
  );

  if (!confirmed) {
    return;
  }

  try {
    UI.showLoading('Scarto carta...');

    const result = await GameLogic.discardCard(
      currentRoomId,
      currentPlayerId,
      dilemma.id
    );

    UI.hideLoading();

    if (result.success) {
      if (result.newCard) {
        UI.showToast('Carta scartata e nuova carta pescata!', 'success');
      } else {
        UI.showToast('Carta scartata! Non ci sono più carte disponibili.', 'warning');
      }
    }
  } catch (error) {
    console.error('Error discarding card:', error);
    UI.hideLoading();
    UI.showToast('Errore durante lo scarto della carta', 'error');
  }
}

/**
 * Setup answer button listeners
 */
function setupAnswerButtonListeners(viewId) {
  const view = document.getElementById(viewId);
  if (!view) return;

  const answerButtons = view.querySelectorAll('.btn-answer');
  answerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Clear previous selection
      UI.clearSelectedAnswer();

      // Select this button
      btn.classList.add('selected');

      // Store selected answer
      if (viewId === 'active-player-view') {
        selectedGuess = btn.dataset.answer;
        updateSubmitButtonState();
      }
    });
  });

  // Target selector change listener
  const targetSelect = document.getElementById('target-player-select');
  if (targetSelect) {
    targetSelect.addEventListener('change', () => {
      selectedTarget = targetSelect.value;

      // Show/hide guess section based on selection
      const guessSection = document.getElementById('guess-section');
      if (guessSection) {
        if (selectedTarget) {
          guessSection.style.display = 'block';
        } else {
          guessSection.style.display = 'none';
          // Reset guess when target is deselected
          selectedGuess = null;
          UI.clearSelectedAnswer();
        }
      }

      updateSubmitButtonState();
    });
  }
}

/**
 * Update submit button state
 */
function updateSubmitButtonState() {
  const submitBtn = document.getElementById('submit-guess-btn');
  if (!submitBtn) return;

  if (selectedDilemma && selectedTarget && selectedGuess) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

/**
 * Handle submit guess
 */
async function handleSubmitGuess() {
  if (!selectedDilemma || !selectedTarget || !selectedGuess) {
    UI.showToast('Completa tutte le selezioni', 'error');
    return;
  }

  try {
    UI.showLoading('Invio risposta...');

    await GameLogic.submitGuess(
      currentRoomId,
      selectedDilemma.id,
      selectedTarget,
      selectedGuess
    );

    // Reset selections
    selectedDilemma = null;
    selectedTarget = null;
    selectedGuess = null;

    UI.hideLoading();
  } catch (error) {
    console.error('Error submitting guess:', error);
    UI.hideLoading();
    UI.showToast('Errore durante l\'invio', 'error');
  }
}

/**
 * Handle cancel selection
 */
function handleCancelSelection() {
  selectedDilemma = null;
  selectedTarget = null;
  selectedGuess = null;

  UI.clearSelectedCard();
  UI.clearSelectedAnswer();

  const turnForm = document.getElementById('turn-form');
  if (turnForm) {
    turnForm.style.display = 'none';
  }
}

/**
 * Handle target answer
 */
async function handleTargetAnswer(event) {
  const answer = event.target.dataset.answer;

  if (!answer) return;

  try {
    UI.showLoading('Invio risposta...');

    await GameLogic.submitAnswer(
      currentRoomId,
      answer,
      currentRoomData.currentTurn,
      currentRoomData.players,
      currentRoomData.usedDilemmas || []
    );

    UI.hideLoading();
  } catch (error) {
    console.error('Error submitting answer:', error);
    UI.hideLoading();
    UI.showToast('Errore durante l\'invio', 'error');
  }
}

/**
 * Handle speak dilemma
 */
function handleSpeakDilemma() {
  const dilemmaText = document.getElementById('target-dilemma-text');
  if (!dilemmaText || !dilemmaText.textContent) {
    return;
  }

  const text = dilemmaText.textContent.trim();
  const success = AudioManager.speakText(text, 'it-IT');

  if (!success) {
    UI.showToast('Sintesi vocale non disponibile', 'warning');
  }
}

/**
 * Handle next turn
 */
async function handleNextTurn() {
  try {
    UI.showLoading('Prossimo turno...');

    const result = await GameLogic.proceedToNextTurn(
      currentRoomId,
      currentRoomData.currentTurn.activePlayerId
    );

    UI.hideLoading();

    if (result.gameEnded) {
      console.log('Game has ended');
    }
  } catch (error) {
    console.error('Error proceeding to next turn:', error);
    UI.hideLoading();
    UI.showToast('Errore durante il cambio turno', 'error');
  }
}

/**
 * Handle ready button
 */
async function handleReady() {
  try {
    const currentPlayer = currentRoomData.players[currentPlayerId];
    const newReadyState = !currentPlayer.isReady;

    await FirebaseManager.updatePlayerReady(currentRoomId, currentPlayerId, newReadyState);
  } catch (error) {
    console.error('Error updating ready status:', error);
    UI.showToast('Errore durante l\'aggiornamento', 'error');
  }
}

/**
 * Handle room open/closed toggle
 */
async function handleRoomOpenToggle(event) {
  try {
    const isOpen = event.target.checked;
    await FirebaseManager.updateRoomOpenStatus(currentRoomId, isOpen);

    const statusText = isOpen ? 'aperta' : 'chiusa';
    UI.showToast(`Stanza ${statusText}`, 'success');
  } catch (error) {
    console.error('Error updating room open status:', error);
    UI.showToast('Errore durante l\'aggiornamento', 'error');
  }
}

/**
 * Handle start game
 */
async function handleStartGame() {
  try {
    UI.showLoading('Avvio partita...');

    await GameLogic.startGame(currentRoomId, currentRoomData.players);

    UI.hideLoading();
    UI.showToast('Partita iniziata!', 'success');
  } catch (error) {
    console.error('Error starting game:', error);
    UI.hideLoading();
    UI.showToast('Errore durante l\'avvio della partita', 'error');
  }
}

/**
 * Handle leave lobby
 */
async function handleLeaveLobby() {
  const confirmed = await showConfirm(
    'Esci dalla lobby',
    'Sei sicuro di voler uscire dalla lobby?'
  );

  if (!confirmed) {
    return;
  }

  try {
    UI.showLoading('Uscita...');

    await FirebaseManager.leaveRoom(currentRoomId, currentPlayerId);
    FirebaseManager.stopListeningToRoom();
    RoomManager.clearStoredPlayerInfo();

    currentRoomId = null;
    currentPlayerId = null;
    currentRoomData = null;

    UI.hideLoading();
    UI.showScreen('home');
    UI.resetFormInputs();
  } catch (error) {
    console.error('Error leaving lobby:', error);
    UI.hideLoading();
    UI.showToast('Errore durante l\'uscita', 'error');
  }
}

/**
 * Handle copy code
 */
function handleCopyCode() {
  const code = currentRoomId;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(code)
      .then(() => {
        UI.showToast('Codice copiato!', 'success');
      })
      .catch(err => {
        console.error('Error copying code:', err);
        UI.showToast('Impossibile copiare il codice', 'error');
      });
  } else {
    // Fallback for older browsers
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    UI.showToast('Codice copiato!', 'success');
  }
}

/**
 * Handle new game
 */
async function handleNewGame() {
  try {
    UI.showLoading('Preparazione nuova partita...');

    await GameLogic.resetGame(currentRoomId);

    UI.hideLoading();
    UI.showToast('Nuova partita pronta!', 'success');
  } catch (error) {
    console.error('Error starting new game:', error);
    UI.hideLoading();
    UI.showToast('Errore durante la preparazione', 'error');
  }
}

/**
 * Handle leave game
 */
async function handleLeaveGame() {
  const confirmed = await showConfirm(
    'Esci dalla partita',
    'Sei sicuro di voler uscire? La partita terminerà.'
  );

  if (!confirmed) {
    return;
  }

  try {
    UI.showLoading('Uscita...');

    await FirebaseManager.leaveRoom(currentRoomId, currentPlayerId);
    FirebaseManager.stopListeningToRoom();
    RoomManager.clearStoredPlayerInfo();

    currentRoomId = null;
    currentPlayerId = null;
    currentRoomData = null;

    UI.hideLoading();
    UI.showScreen('home');
    UI.resetFormInputs();
  } catch (error) {
    console.error('Error leaving game:', error);
    UI.hideLoading();
    UI.showToast('Errore durante l\'uscita', 'error');
  }
}

/**
 * Handle exit game (during play)
 */
async function handleExitGame() {
  const confirmed = await showConfirm(
    'Esci dalla partita',
    'Sei sicuro di voler uscire? La partita terminerà per te.'
  );

  if (!confirmed) {
    return;
  }

  try {
    UI.showLoading('Uscita...');

    await FirebaseManager.leaveRoom(currentRoomId, currentPlayerId);
    FirebaseManager.stopListeningToRoom();
    RoomManager.clearStoredPlayerInfo();

    currentRoomId = null;
    currentPlayerId = null;
    currentRoomData = null;

    UI.hideLoading();
    UI.showScreen('home');
    UI.resetFormInputs();
  } catch (error) {
    console.error('Error exiting game:', error);
    UI.hideLoading();
    UI.showToast('Errore durante l\'uscita', 'error');
  }
}

/**
 * Handle room deleted
 */
function handleRoomDeleted() {
  FirebaseManager.stopListeningToRoom();
  RoomManager.clearStoredPlayerInfo();

  currentRoomId = null;
  currentPlayerId = null;
  currentRoomData = null;

  UI.showScreen('home');
  UI.showToast('La stanza è stata chiusa', 'warning');
  UI.resetFormInputs();
}


// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
