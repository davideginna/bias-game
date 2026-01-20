/**
 * Firebase Manager
 * Handles all Firebase Realtime Database operations
 */

import { firebaseConfig } from '../config.js';

let database = null;
let currentRoomRef = null;

/**
 * Initialize Firebase connection
 */
export function initFirebase() {
  try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

/**
 * Get database reference
 */
export function getDatabase() {
  return database;
}

/**
 * Create a new room
 */
export async function createRoom(roomId, playerName, playerId) {
  try {
    const roomRef = database.ref(`rooms/${roomId}`);

    await roomRef.set({
      config: {
        maxPoints: 10,
        status: 'lobby',
        createdAt: firebase.database.ServerValue.TIMESTAMP
      },
      players: {
        [playerId]: {
          name: playerName,
          score: 0,
          cards: [],
          isReady: false,
          isHost: true
        }
      },
      usedDilemmas: [],
      currentTurn: null,
      turnHistory: []
    });

    console.log(`Room ${roomId} created successfully`);
    return true;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

/**
 * Check if room exists
 */
export async function roomExists(roomId) {
  try {
    const snapshot = await database.ref(`rooms/${roomId}`).once('value');
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking room existence:', error);
    return false;
  }
}

/**
 * Join an existing room
 */
export async function joinRoom(roomId, playerName, playerId) {
  try {
    const exists = await roomExists(roomId);
    if (!exists) {
      throw new Error('Room does not exist');
    }

    const playerRef = database.ref(`rooms/${roomId}/players/${playerId}`);
    await playerRef.set({
      name: playerName,
      score: 0,
      cards: [],
      isReady: false,
      isHost: false
    });

    console.log(`Player ${playerId} joined room ${roomId}`);
    return true;
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

/**
 * Listen to room changes
 */
export function listenToRoom(roomId, callback) {
  currentRoomRef = database.ref(`rooms/${roomId}`);
  currentRoomRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

/**
 * Stop listening to room changes
 */
export function stopListeningToRoom() {
  if (currentRoomRef) {
    currentRoomRef.off();
    currentRoomRef = null;
  }
}

/**
 * Update player ready status
 */
export async function updatePlayerReady(roomId, playerId, isReady) {
  try {
    await database.ref(`rooms/${roomId}/players/${playerId}/isReady`).set(isReady);
    return true;
  } catch (error) {
    console.error('Error updating player ready status:', error);
    throw error;
  }
}

/**
 * Update game status
 */
export async function updateGameStatus(roomId, status) {
  try {
    await database.ref(`rooms/${roomId}/config/status`).set(status);
    return true;
  } catch (error) {
    console.error('Error updating game status:', error);
    throw error;
  }
}

/**
 * Distribute cards to all players
 */
export async function distributeCards(roomId, playersCards) {
  try {
    const updates = {};

    for (const [playerId, cards] of Object.entries(playersCards)) {
      updates[`rooms/${roomId}/players/${playerId}/cards`] = cards;
    }

    await database.ref().update(updates);
    return true;
  } catch (error) {
    console.error('Error distributing cards:', error);
    throw error;
  }
}

/**
 * Start a new turn
 */
export async function startTurn(roomId, turnData) {
  try {
    await database.ref(`rooms/${roomId}/currentTurn`).set(turnData);
    return true;
  } catch (error) {
    console.error('Error starting turn:', error);
    throw error;
  }
}

/**
 * Update turn data
 */
export async function updateTurn(roomId, updates) {
  try {
    const turnRef = database.ref(`rooms/${roomId}/currentTurn`);
    await turnRef.update(updates);
    return true;
  } catch (error) {
    console.error('Error updating turn:', error);
    throw error;
  }
}

/**
 * Update player score
 */
export async function updatePlayerScore(roomId, playerId, score) {
  try {
    await database.ref(`rooms/${roomId}/players/${playerId}/score`).set(score);
    return true;
  } catch (error) {
    console.error('Error updating player score:', error);
    throw error;
  }
}

/**
 * Add dilemma to used list
 */
export async function addUsedDilemma(roomId, dilemmaId) {
  try {
    const usedRef = database.ref(`rooms/${roomId}/usedDilemmas`);
    const snapshot = await usedRef.once('value');
    const used = snapshot.val() || [];
    used.push(dilemmaId);
    await usedRef.set(used);
    return true;
  } catch (error) {
    console.error('Error adding used dilemma:', error);
    throw error;
  }
}

/**
 * Remove card from player's hand
 */
export async function removeCardFromHand(roomId, playerId, dilemmaId) {
  try {
    const cardsRef = database.ref(`rooms/${roomId}/players/${playerId}/cards`);
    const snapshot = await cardsRef.once('value');
    const cards = snapshot.val() || [];
    const newCards = cards.filter(id => id !== dilemmaId);
    await cardsRef.set(newCards);
    return true;
  } catch (error) {
    console.error('Error removing card from hand:', error);
    throw error;
  }
}

/**
 * Add card to player's hand
 */
export async function addCardToHand(roomId, playerId, dilemmaId) {
  try {
    const cardsRef = database.ref(`rooms/${roomId}/players/${playerId}/cards`);
    const snapshot = await cardsRef.once('value');
    const cards = snapshot.val() || [];
    console.log(`Current cards for ${playerId}:`, cards);
    cards.push(dilemmaId);
    await cardsRef.set(cards);
    console.log(`Added card ${dilemmaId} to player ${playerId}, now has ${cards.length} cards`);
    return true;
  } catch (error) {
    console.error('Error adding card to hand:', error);
    throw error;
  }
}

/**
 * Add turn to history
 */
export async function addTurnToHistory(roomId, turnData) {
  try {
    const historyRef = database.ref(`rooms/${roomId}/turnHistory`);
    const snapshot = await historyRef.once('value');
    const history = snapshot.val() || [];
    history.push(turnData);
    await historyRef.set(history);
    return true;
  } catch (error) {
    console.error('Error adding turn to history:', error);
    throw error;
  }
}

/**
 * Reset room for new game
 */
export async function resetRoom(roomId) {
  try {
    const snapshot = await database.ref(`rooms/${roomId}/players`).once('value');
    const players = snapshot.val();

    const updates = {};
    updates[`rooms/${roomId}/config/status`] = 'lobby';
    updates[`rooms/${roomId}/usedDilemmas`] = [];
    updates[`rooms/${roomId}/currentTurn`] = null;
    updates[`rooms/${roomId}/turnHistory`] = [];

    // Reset all players
    for (const playerId in players) {
      updates[`rooms/${roomId}/players/${playerId}/score`] = 0;
      updates[`rooms/${roomId}/players/${playerId}/cards`] = [];
      updates[`rooms/${roomId}/players/${playerId}/isReady`] = false;
    }

    await database.ref().update(updates);
    return true;
  } catch (error) {
    console.error('Error resetting room:', error);
    throw error;
  }
}

/**
 * Leave room (remove player)
 */
export async function leaveRoom(roomId, playerId) {
  try {
    await database.ref(`rooms/${roomId}/players/${playerId}`).remove();

    // Check if room is empty, delete it
    const snapshot = await database.ref(`rooms/${roomId}/players`).once('value');
    if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
      await database.ref(`rooms/${roomId}`).remove();
      console.log(`Room ${roomId} deleted (no players left)`);
    }

    return true;
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
}

/**
 * Get room data once
 */
export async function getRoomData(roomId) {
  try {
    const snapshot = await database.ref(`rooms/${roomId}`).once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error getting room data:', error);
    throw error;
  }
}
