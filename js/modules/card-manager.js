/**
 * Card Manager
 * Handles dilemma cards distribution and management
 */

import { CARDS_PER_PLAYER } from '../config.js';

let dilemmasData = [];

/**
 * Load dilemmas from JSON file
 */
export async function loadDilemmas() {
  try {
    const response = await fetch('./data/dilemmas.json');
    if (!response.ok) {
      throw new Error('Failed to load dilemmas');
    }
    dilemmasData = await response.json();
    console.log(`Loaded ${dilemmasData.length} dilemmas`);
    return dilemmasData;
  } catch (error) {
    console.error('Error loading dilemmas:', error);
    throw error;
  }
}

/**
 * Get all dilemmas
 */
export function getAllDilemmas() {
  return dilemmasData;
}

/**
 * Get dilemma by ID
 */
export function getDilemmaById(id) {
  if (dilemmasData.length === 0) {
    console.error('Dilemmas not loaded yet!');
    return null;
  }
  return dilemmasData.find(d => d.id === id);
}

/**
 * Get available dilemmas (not used yet)
 */
export function getAvailableDilemmas(usedDilemmas = []) {
  return dilemmasData.filter(d => !usedDilemmas.includes(d.id));
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Distribute cards to all players
 * Ensures no duplicate cards across players
 */
export function distributeCardsToPlayers(playerIds, usedDilemmas = []) {
  try {
    // Get available dilemmas
    const available = getAvailableDilemmas(usedDilemmas);

    // Calculate total cards needed
    const totalCardsNeeded = playerIds.length * CARDS_PER_PLAYER;

    // Check if we have enough cards
    if (available.length < totalCardsNeeded) {
      throw new Error('Not enough dilemmas available');
    }

    // Shuffle available dilemmas
    const shuffled = shuffleArray(available);

    // Distribute cards
    const distribution = {};
    let cardIndex = 0;

    for (const playerId of playerIds) {
      const playerCards = [];

      for (let i = 0; i < CARDS_PER_PLAYER; i++) {
        playerCards.push(shuffled[cardIndex].id);
        cardIndex++;
      }

      distribution[playerId] = playerCards;
    }

    console.log('Cards distributed:', distribution);
    return distribution;
  } catch (error) {
    console.error('Error distributing cards:', error);
    throw error;
  }
}

/**
 * Get random dilemma IDs
 */
export function getRandomDilemmaIds(count, exclude = []) {
  const available = dilemmasData.filter(d => !exclude.includes(d.id));

  if (available.length < count) {
    throw new Error('Not enough dilemmas available');
  }

  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count).map(d => d.id);
}

/**
 * Get multiple dilemmas by IDs
 */
export function getDilemmasByIds(ids) {
  console.log('getDilemmasByIds called with:', ids);
  console.log('Dilemmas data length:', dilemmasData.length);
  const result = ids.map(id => getDilemmaById(id)).filter(d => d !== undefined && d !== null);
  console.log('Found dilemmas:', result.length, 'out of', ids.length);
  return result;
}

/**
 * Check if enough cards are available
 */
export function hasEnoughCards(playerCount, usedDilemmas = []) {
  const available = getAvailableDilemmas(usedDilemmas);
  const needed = playerCount * CARDS_PER_PLAYER;
  return available.length >= needed;
}

/**
 * Get random dilemma (not in used list)
 */
export function getRandomDilemma(usedDilemmas = []) {
  const available = getAvailableDilemmas(usedDilemmas);

  if (available.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Validate dilemma ID exists
 */
export function isValidDilemmaId(id) {
  return dilemmasData.some(d => d.id === id);
}
