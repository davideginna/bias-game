/**
 * Room Manager
 * Handles room creation, validation, and player management
 */

import * as FirebaseManager from './firebase-manager.js';
import { MIN_PLAYERS } from '../config.js';

/**
 * Generate a random 6-character room code
 */
export function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId() {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate room ID format
 */
export function validateRoomIdFormat(roomId) {
  if (!roomId || roomId.length !== 6) {
    return false;
  }
  return /^[A-Z0-9]{6}$/.test(roomId.toUpperCase());
}

/**
 * Validate player name
 */
export function validatePlayerName(name) {
  if (!name || name.trim().length === 0) {
    return false;
  }
  if (name.trim().length > 20) {
    return false;
  }
  return true;
}

/**
 * Create a new room
 */
export async function createNewRoom(playerName) {
  try {
    // Validate player name
    if (!validatePlayerName(playerName)) {
      throw new Error('Nome giocatore non valido');
    }

    // Generate unique room ID
    let roomId = generateRoomId();
    let exists = await FirebaseManager.roomExists(roomId);

    // Ensure room ID is unique
    while (exists) {
      roomId = generateRoomId();
      exists = await FirebaseManager.roomExists(roomId);
    }

    // Generate player ID
    const playerId = generatePlayerId();

    // Create room in Firebase
    await FirebaseManager.createRoom(roomId, playerName.trim(), playerId);

    // Save player info in localStorage
    savePlayerInfo(playerId, playerName.trim(), roomId);

    return { roomId, playerId };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

/**
 * Join an existing room
 */
export async function joinExistingRoom(roomId, playerName) {
  try {
    // Validate inputs
    if (!validateRoomIdFormat(roomId)) {
      throw new Error('Codice stanza non valido');
    }

    if (!validatePlayerName(playerName)) {
      throw new Error('Nome giocatore non valido');
    }

    const normalizedRoomId = roomId.toUpperCase();

    // Check if room exists
    const exists = await FirebaseManager.roomExists(normalizedRoomId);
    if (!exists) {
      throw new Error('Stanza non trovata');
    }

    // Check room status
    const roomData = await FirebaseManager.getRoomData(normalizedRoomId);
    const isLobby = roomData.config.status === 'lobby';
    const isOpen = roomData.config.isOpen === true;

    // Can join if in lobby, or if game is playing but room is open
    if (!isLobby && !isOpen) {
      throw new Error('La partita è già iniziata e la stanza è chiusa');
    }

    // Generate player ID
    const playerId = generatePlayerId();

    // Join room in Firebase
    await FirebaseManager.joinRoom(normalizedRoomId, playerName.trim(), playerId);

    // Save player info in localStorage
    savePlayerInfo(playerId, playerName.trim(), normalizedRoomId);

    return {
      roomId: normalizedRoomId,
      playerId,
      isJoiningMidGame: !isLobby
    };
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

/**
 * Check if all players are ready
 */
export function areAllPlayersReady(players) {
  const playersList = Object.values(players);

  if (playersList.length < MIN_PLAYERS) {
    return false;
  }

  return playersList.every(player => player.isReady);
}

/**
 * Get player count
 */
export function getPlayerCount(players) {
  return Object.keys(players).length;
}

/**
 * Check if player is host
 */
export function isPlayerHost(players, playerId) {
  return players[playerId]?.isHost === true;
}

/**
 * Get next active player
 */
export function getNextActivePlayer(players, currentActivePlayerId) {
  const playerIds = Object.keys(players).sort();

  // Find players who still have cards
  const playersWithCards = playerIds.filter(id => {
    const cards = players[id].cards || [];
    return cards.length > 0;
  });

  if (playersWithCards.length === 0) {
    return null;
  }

  // If current player is null or not in the list, return first player with cards
  if (!currentActivePlayerId || !playersWithCards.includes(currentActivePlayerId)) {
    return playersWithCards[0];
  }

  // Find current player index
  const currentIndex = playersWithCards.indexOf(currentActivePlayerId);

  // Return next player (circular)
  const nextIndex = (currentIndex + 1) % playersWithCards.length;
  return playersWithCards[nextIndex];
}

/**
 * Get available targets for active player
 */
export function getAvailableTargets(players, activePlayerId) {
  return Object.entries(players)
    .filter(([id]) => id !== activePlayerId)
    .map(([id, data]) => ({ id, name: data.name }));
}

/**
 * Save player info to localStorage
 */
function savePlayerInfo(playerId, playerName, roomId) {
  try {
    localStorage.setItem('bias_playerId', playerId);
    localStorage.setItem('bias_playerName', playerName);
    localStorage.setItem('bias_roomId', roomId);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get player info from localStorage
 */
export function getStoredPlayerInfo() {
  try {
    return {
      playerId: localStorage.getItem('bias_playerId'),
      playerName: localStorage.getItem('bias_playerName'),
      roomId: localStorage.getItem('bias_roomId')
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {};
  }
}

/**
 * Clear stored player info
 */
export function clearStoredPlayerInfo() {
  try {
    localStorage.removeItem('bias_playerId');
    localStorage.removeItem('bias_playerName');
    localStorage.removeItem('bias_roomId');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get player by ID
 */
export function getPlayerById(players, playerId) {
  return players[playerId] || null;
}

/**
 * Get all players as array
 */
export function getPlayersArray(players) {
  return Object.entries(players).map(([id, data]) => ({
    id,
    ...data
  }));
}

/**
 * Sort players by score (descending)
 */
export function sortPlayersByScore(players) {
  return getPlayersArray(players).sort((a, b) => b.score - a.score);
}
