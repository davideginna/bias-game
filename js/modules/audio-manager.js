/**
 * Audio Manager
 * Handles sound effects and text-to-speech
 */

let audioContext = null;

/**
 * Initialize audio context
 */
function initAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window.webkitAudioContext || null);
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
}

/**
 * Play success sound (correct answer)
 */
export function playSuccessSound() {
  try {
    const ctx = initAudioContext();

    // Create oscillator for success sound (cheerful chime)
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Success melody: E5 -> G5 -> C6
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
    oscillator.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2); // C6

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);

    console.log('✅ Success sound played');
  } catch (error) {
    console.error('Error playing success sound:', error);
  }
}

/**
 * Play error sound (wrong answer)
 */
export function playErrorSound() {
  try {
    const ctx = initAudioContext();

    // Create oscillator for error sound (descending notes)
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Error melody: G4 -> D4
    oscillator.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
    oscillator.frequency.setValueAtTime(293.66, ctx.currentTime + 0.15); // D4

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    console.log('❌ Error sound played');
  } catch (error) {
    console.error('Error playing error sound:', error);
  }
}

/**
 * Speak text using Web Speech API
 */
export function speakText(text, lang = 'it-IT') {
  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return false;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find Italian voice
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find(voice => voice.lang.startsWith('it'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    utterance.onstart = () => {
      console.log('🔊 Speaking:', text);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error('Error speaking text:', error);
    return false;
  }
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable() {
  return 'speechSynthesis' in window;
}
