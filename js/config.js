/**
 * Firebase Configuration
 *
 * Per ottenere le credenziali Firebase:
 * 1. Vai su https://console.firebase.google.com/
 * 2. Crea un nuovo progetto o seleziona uno esistente
 * 3. Vai su Impostazioni Progetto > Le tue app
 * 4. Aggiungi un'app Web
 * 5. Copia le credenziali qui sotto
 * 6. Abilita Realtime Database nel progetto Firebase
 */

export const firebaseConfig = {
  apiKey: JS_FIREBASE_API_KEY,
  authDomain: JS_FIREBASE_AUTH_DOMAIN,
  databaseURL: JS_FIREBASE_DATABASE_URL,
  projectId: JS_FIREBASE_PROJECT_ID,
  storageBucket: JS_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: JS_FIREBASE_MESSAGING_SENDER_ID,
  appId: JS_FIREBASE_APP_ID,
  measurementId: JS_FIREBASE_MEASUREMENT_ID,
};

// Max points to win the game
export const MAX_POINTS = 10;

// Number of cards per player
export const CARDS_PER_PLAYER = 6;

// Possible answers
export const ANSWERS = {
  SI: "si",
  NO: "no",
  DIPENDE: "dipende",
};

// Game status
export const GAME_STATUS = {
  LOBBY: "lobby",
  PLAYING: "playing",
  ENDED: "ended",
};

// Turn status
export const TURN_STATUS = {
  GUESSING: "guessing",
  WAITING_ANSWER: "waiting_answer",
  SHOWING_RESULT: "showing_result",
};

// Min players to start game
export const MIN_PLAYERS = 2;
