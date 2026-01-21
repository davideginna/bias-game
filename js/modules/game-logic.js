/**
 * Game Logic
 * Core game mechanics and turn management
 */

import * as FirebaseManager from './firebase-manager.js';
import * as RoomManager from './room-manager.js';
import * as CardManager from './card-manager.js';
import { MAX_POINTS, TURN_STATUS, GAME_STATUS } from '../config.js';

/**
 * Start the game
 */
export async function startGame(roomId, players) {
  try {
    console.log('Starting game...', { roomId, playerCount: Object.keys(players).length });

    // Get player IDs
    const playerIds = Object.keys(players);

    // Distribute cards to all players
    console.log('Distributing cards to players:', playerIds);
    const cardsDistribution = CardManager.distributeCardsToPlayers(playerIds);
    console.log('Cards distributed:', cardsDistribution);

    // Update cards in Firebase
    await FirebaseManager.distributeCards(roomId, cardsDistribution);

    // Update game status to playing
    await FirebaseManager.updateGameStatus(roomId, GAME_STATUS.PLAYING);

    // Start first turn - pick first player alphabetically
    // We can't use getNextActivePlayer here because the cards haven't been propagated yet
    const firstPlayer = Object.keys(players).sort()[0];
    console.log('First player chosen:', firstPlayer);
    await startNewTurn(roomId, firstPlayer);

    console.log('Game started successfully');
    return true;
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
}

/**
 * Start a new turn
 */
export async function startNewTurn(roomId, activePlayerId) {
  try {
    const turnData = {
      activePlayerId,
      targetPlayerId: null,
      dilemmaId: null,
      guess: null,
      answer: null,
      status: TURN_STATUS.GUESSING
    };

    await FirebaseManager.startTurn(roomId, turnData);
    console.log(`New turn started for player ${activePlayerId}`);
    return true;
  } catch (error) {
    console.error('Error starting new turn:', error);
    throw error;
  }
}

/**
 * Submit guess (active player selects card, target, and prediction)
 */
export async function submitGuess(roomId, dilemmaId, targetPlayerId, guess) {
  try {
    const updates = {
      dilemmaId,
      targetPlayerId,
      guess,
      status: TURN_STATUS.WAITING_ANSWER
    };

    await FirebaseManager.updateTurn(roomId, updates);
    console.log('Guess submitted:', updates);
    return true;
  } catch (error) {
    console.error('Error submitting guess:', error);
    throw error;
  }
}

/**
 * Submit answer (target player responds)
 */
export async function submitAnswer(roomId, answer, currentTurn, players, usedDilemmas) {
  try {
    // Update turn with answer
    await FirebaseManager.updateTurn(roomId, {
      answer,
      status: TURN_STATUS.SHOWING_RESULT
    });

    // Check if guess matches answer
    const isCorrect = checkMatch(currentTurn.guess, answer);

    // If correct, update score
    if (isCorrect) {
      const activePlayer = players[currentTurn.activePlayerId];
      const newScore = activePlayer.score + 1;
      await FirebaseManager.updatePlayerScore(roomId, currentTurn.activePlayerId, newScore);
    }

    // Remove card from active player's hand
    await FirebaseManager.removeCardFromHand(roomId, currentTurn.activePlayerId, currentTurn.dilemmaId);

    // Add dilemma to used list (include the one just played)
    await FirebaseManager.addUsedDilemma(roomId, currentTurn.dilemmaId);
    const updatedUsedDilemmas = [...(usedDilemmas || []), currentTurn.dilemmaId];

    // Draw a new card for the active player (if available)
    const newCard = CardManager.getRandomDilemma(updatedUsedDilemmas);
    if (newCard) {
      await FirebaseManager.addCardToHand(roomId, currentTurn.activePlayerId, newCard.id);
      console.log(`Player ${currentTurn.activePlayerId} drew new card: ${newCard.id}`);
    } else {
      console.log('No more cards available to draw');
    }

    // Add turn to history
    await FirebaseManager.addTurnToHistory(roomId, {
      ...currentTurn,
      answer,
      isCorrect,
      timestamp: Date.now()
    });

    console.log('Answer submitted, result:', isCorrect);
    return { isCorrect };
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
}

/**
 * Check if guess matches answer
 */
export function checkMatch(guess, answer) {
  return guess === answer;
}

/**
 * Proceed to next turn
 */
export async function proceedToNextTurn(roomId, currentActivePlayerId) {
  try {
    // Get updated room data to check scores
    const roomData = await FirebaseManager.getRoomData(roomId);
    const updatedPlayers = roomData.players;

    // Check win condition
    const winner = checkWinCondition(updatedPlayers);

    if (winner) {
      // End game
      await FirebaseManager.updateGameStatus(roomId, GAME_STATUS.ENDED);
      console.log(`Game ended! Winner: ${winner.name}`);
      return { gameEnded: true, winner };
    }

    // Get next active player
    const nextPlayer = RoomManager.getNextActivePlayer(updatedPlayers, currentActivePlayerId);

    if (!nextPlayer) {
      // No players with cards left, end game
      await FirebaseManager.updateGameStatus(roomId, GAME_STATUS.ENDED);
      console.log('Game ended! No more cards available');
      return { gameEnded: true, winner: null };
    }

    // Start next turn
    await startNewTurn(roomId, nextPlayer);

    return { gameEnded: false };
  } catch (error) {
    console.error('Error proceeding to next turn:', error);
    throw error;
  }
}

/**
 * Check if any player has reached the winning score
 */
export function checkWinCondition(players) {
  for (const [id, player] of Object.entries(players)) {
    if (player.score >= MAX_POINTS) {
      return { id, ...player };
    }
  }
  return null;
}

/**
 * Reset game for new round
 */
export async function resetGame(roomId) {
  try {
    await FirebaseManager.resetRoom(roomId);
    console.log('Game reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting game:', error);
    throw error;
  }
}

/**
 * Validate turn action
 */
export function canPlayerAct(playerId, currentTurn, actionType) {
  if (!currentTurn) {
    return false;
  }

  switch (actionType) {
    case 'guess':
      return currentTurn.activePlayerId === playerId &&
             currentTurn.status === TURN_STATUS.GUESSING;

    case 'answer':
      return currentTurn.targetPlayerId === playerId &&
             currentTurn.status === TURN_STATUS.WAITING_ANSWER;

    case 'next':
      return currentTurn.status === TURN_STATUS.SHOWING_RESULT;

    default:
      return false;
  }
}

/**
 * Get game state for player
 */
export function getGameStateForPlayer(playerId, roomData) {
  if (!roomData) {
    return null;
  }

  const { config, players, currentTurn } = roomData;
  const player = players[playerId];

  if (!player) {
    return null;
  }

  const state = {
    status: config.status,
    isMyTurn: currentTurn?.activePlayerId === playerId,
    isTarget: currentTurn?.targetPlayerId === playerId,
    canGuess: canPlayerAct(playerId, currentTurn, 'guess'),
    canAnswer: canPlayerAct(playerId, currentTurn, 'answer'),
    myCards: player.cards || [],
    myScore: player.score,
    currentTurn
  };

  return state;
}

/**
 * Get answer display text
 */
export function getAnswerText(answer) {
  const answerMap = {
    'si': 'Sì',
    'no': 'No',
    'dipende': 'Dipende'
  };
  return answerMap[answer] || answer;
}

/**
 * Discard a card and draw a new one
 */
export async function discardCard(roomId, playerId, dilemmaId) {
  try {
    // Get current room data
    const roomData = await FirebaseManager.getRoomData(roomId);
    const usedDilemmas = roomData.usedDilemmas || [];
    const discardedCards = roomData.discardedCards || [];

    // Get all cards currently in players' hands
    const cardsInHands = await FirebaseManager.getCardsInHands(roomId);

    // Remove the discarded card from player's hand
    await FirebaseManager.removeCardFromHand(roomId, playerId, dilemmaId);

    // Add card to discarded pile
    await FirebaseManager.addDiscardedCard(roomId, dilemmaId);

    // Draw a new card (exclude cards in hands, used, and discarded)
    // Remove the discarded card from cardsInHands for the next draw
    const updatedCardsInHands = cardsInHands.filter(id => id !== dilemmaId);
    const newCard = CardManager.getAvailableDilemmaForDraw(
      updatedCardsInHands,
      usedDilemmas,
      [...discardedCards, dilemmaId]
    );

    if (newCard) {
      await FirebaseManager.addCardToHand(roomId, playerId, newCard.id);
      console.log(`Player ${playerId} discarded card ${dilemmaId} and drew new card: ${newCard.id}`);
      return { success: true, newCard };
    } else {
      console.log('No more cards available to draw after discard');
      return { success: true, newCard: null };
    }
  } catch (error) {
    console.error('Error discarding card:', error);
    throw error;
  }
}
