/**
 * Card Manager
 * Handles dilemma cards distribution and management
 */

import { CARDS_PER_PLAYER } from '../config.js';

let dilemmasData = [];
let categoryMetadata = null;
let selectedCategories = [];
let allDilemmas = [];

/**
 * Load category metadata (icons, names, descriptions, examples)
 * This is a lightweight file loaded at app startup (~5KB)
 */
export async function loadCategoryMetadata() {
  try {
    const response = await fetch('./data/categories/metadata.json');
    if (!response.ok) {
      throw new Error('Failed to load category metadata');
    }
    categoryMetadata = await response.json();
    console.log(`Loaded metadata for ${categoryMetadata.categories.length} categories`);
    return categoryMetadata;
  } catch (error) {
    console.error('Error loading category metadata:', error);
    throw error;
  }
}

/**
 * Get category metadata
 */
export function getCategoryMetadata() {
  return categoryMetadata;
}

/**
 * Load a single category file
 */
async function loadCategoryFile(categoryId) {
  try {
    const response = await fetch(`./data/categories/${categoryId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load category: ${categoryId}`);
    }
    const categoryDilemmas = await response.json();
    console.log(`Loaded ${categoryDilemmas.length} dilemmas from category: ${categoryId}`);
    return categoryDilemmas;
  } catch (error) {
    console.error(`Error loading category ${categoryId}:`, error);
    throw error;
  }
}

/**
 * Load multiple categories in parallel
 * @param {string[]} categoryIds - Array of category IDs to load
 */
export async function loadCategories(categoryIds) {
  try {
    console.log('Loading categories:', categoryIds);

    // Load all categories in parallel
    const loadPromises = categoryIds.map(id => loadCategoryFile(id));
    const categoryArrays = await Promise.all(loadPromises);

    // Flatten all dilemmas into a single array
    allDilemmas = categoryArrays.flat();
    selectedCategories = categoryIds;

    // Update dilemmasData to point to filtered dilemmas
    dilemmasData = allDilemmas;

    console.log(`Loaded ${allDilemmas.length} total dilemmas from ${categoryIds.length} categories`);
    return allDilemmas;
  } catch (error) {
    console.error('Error loading categories:', error);
    throw error;
  }
}

/**
 * Get filtered dilemmas based on selected categories
 */
export function getFilteredDilemmas() {
  if (selectedCategories.length === 0) {
    return allDilemmas;
  }
  return allDilemmas.filter(d => selectedCategories.includes(d.category));
}

/**
 * Get selected category IDs
 */
export function getSelectedCategories() {
  return selectedCategories;
}

/**
 * Load dilemmas from JSON file (legacy support)
 * For backward compatibility - loads all categories
 */
export async function loadDilemmas() {
  try {
    // Try loading from categories first
    if (!categoryMetadata) {
      await loadCategoryMetadata();
    }

    const allCategoryIds = categoryMetadata.categories.map(c => c.id);
    return await loadCategories(allCategoryIds);
  } catch (error) {
    // Fallback to legacy dilemmas.json
    console.warn('Falling back to legacy dilemmas.json');
    try {
      const response = await fetch('./data/dilemmas.json');
      if (!response.ok) {
        throw new Error('Failed to load dilemmas');
      }
      dilemmasData = await response.json();
      allDilemmas = dilemmasData;
      console.log(`Loaded ${dilemmasData.length} dilemmas (legacy)`);
      return dilemmasData;
    } catch (legacyError) {
      console.error('Error loading legacy dilemmas:', legacyError);
      throw legacyError;
    }
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
 * Supports both string IDs (category-based) and numeric IDs (legacy)
 */
export function getDilemmaById(id) {
  if (dilemmasData.length === 0) {
    console.error('Dilemmas not loaded yet!');
    return null;
  }
  // Support both string and number IDs for backward compatibility
  return dilemmasData.find(d => d.id === id || d.id === String(id) || d.id === Number(id));
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

/**
 * Get random available dilemma for discard/draw
 * Excludes cards that are: in players' hands, used, or discarded
 */
export function getAvailableDilemmaForDraw(cardsInHands = [], usedDilemmas = [], discardedCards = []) {
  const excludedCards = [...cardsInHands, ...usedDilemmas, ...discardedCards];
  const available = dilemmasData.filter(d => !excludedCards.includes(d.id));

  if (available.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Get cards for a new player joining mid-game
 * Returns CARDS_PER_PLAYER cards that aren't in use
 */
export function getCardsForNewPlayer(cardsInHands = [], usedDilemmas = [], discardedCards = []) {
  const excludedCards = [...cardsInHands, ...usedDilemmas, ...discardedCards];
  const available = dilemmasData.filter(d => !excludedCards.includes(d.id));

  if (available.length < CARDS_PER_PLAYER) {
    console.warn(`Not enough cards available. Need ${CARDS_PER_PLAYER}, have ${available.length}`);
    // Return as many as possible
    return shuffleArray(available).slice(0, available.length).map(d => d.id);
  }

  // Shuffle and take CARDS_PER_PLAYER cards
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, CARDS_PER_PLAYER).map(d => d.id);
}
