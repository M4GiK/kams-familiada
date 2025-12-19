/**
 * Audio module - handles all game sound effects and music playback
 * Includes autoplay handling for browsers with autoplay restrictions
 */

/** Wrong answer sound effect */
const wrong = new Audio('assets/sounds/wrong.mp3');

/** Correct answer reveal sound effect */
const reveal = new Audio('assets/sounds/reveal.mp3');

/** Intro music track */
const music = new Audio('assets/sounds/music.mp3');

music.loop = false;

/**
 * Detects if running in a test environment (Jest/JSDOM)
 * Audio playback is disabled in tests to avoid "Not implemented" errors
 */
const isTestEnv = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') ||
  (typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string' && navigator.userAgent.toLowerCase().includes('jsdom'));

/** Flag indicating autostart has been armed */
let autostartArmed = false;

/** Flag indicating autostart has completed */
let autostartDone = false;

/**
 * Safely plays an audio element with error handling
 * Skips playback in test environments
 * @param audio - HTML Audio element to play
 */
function safePlay(audio: HTMLAudioElement | null): void {
  if (!audio) return;
  if (isTestEnv) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (e) {
    // Silently ignore playback errors
  }
}

/**
 * Plays the wrong answer sound effect
 */
export function playWrong(): void {
  safePlay(wrong);
}

/**
 * Plays the correct answer reveal sound effect
 */
export function playReveal(): void {
  safePlay(reveal);
}

/**
 * Stops the intro music and resets playback position
 */
export function stopMusic(): void {
  try {
    music.pause();
    music.currentTime = 0;
  } catch (e) {
    // Silently ignore errors
  }
}

/**
 * Registers a one-time callback for when the music ends
 * @param handler - Callback function to execute when music ends
 */
export function onMusicEndedOnce(handler: () => void): void {
  if (!handler) return;
  try {
    music.addEventListener('ended', handler, { once: true });
  } catch (e) {
    // Silently ignore errors
  }
}

/**
 * Plays the intro music once (no loop)
 * @returns True if playback started successfully, false otherwise
 */
function playMusicOnce(): boolean {
  if (isTestEnv) return false;
  try {
    music.loop = false;
    music.currentTime = 0;
    const p = music.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Starts the intro music once
 * @returns True if playback started, false otherwise
 */
export function startMusicOnce(): boolean {
  return playMusicOnce();
}

/**
 * Attempts to autostart music, falling back to user interaction if blocked
 * Modern browsers often require user interaction before audio can play
 * This function tries to play immediately, and if blocked, waits for user interaction
 */
export function autostartMusic(): void {
  if (autostartDone || autostartArmed) return;
  if (isTestEnv) return;
  autostartArmed = true;

  const tryStart = () => {
    if (autostartDone) return;
    const started = playMusicOnce();
    if (started) autostartDone = true;
  };

  try {
    const p = music.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        autostartDone = true;
      }).catch(() => {
        // If autoplay fails, wait for user interaction
        const opts = { once: true };
        document.addEventListener('click', tryStart, opts);
        document.addEventListener('keydown', tryStart, opts);
        document.addEventListener('touchstart', tryStart, opts);
      });
    } else {
      autostartDone = true;
    }
  } catch (e) {
    // If play() throws, wait for user interaction
    const opts = { once: true };
    document.addEventListener('click', tryStart, opts);
    document.addEventListener('keydown', tryStart, opts);
    document.addEventListener('touchstart', tryStart, opts);
  }
}

/**
 * Toggles music playback on/off
 * @returns True if music started playing, false if stopped
 */
export function toggleMusic(): boolean {
  try {
    if (!music.paused) {
      stopMusic();
      return false;
    }
    return playMusicOnce();
  } catch (e) {
    return false;
  }
}

export default {
  playWrong,
  playReveal,
  toggleMusic,
  autostartMusic,
  startMusicOnce,
  stopMusic,
  onMusicEndedOnce
};
