/**
 * Main entry point for the Familiada game application
 * Initializes the game, sets up event listeners, and handles keyboard shortcuts
 */

import TEAMS from './teams';
import board from './board';
import speech from './speech';
import audio from './audio';
import data from '../../questions/data.json';
import Game from './model/game';
import Team from './model/team';
import QuestionStore from './model/questionStore';

/** Questions data from JSON */
const questions = data.questions;

/**
 * Initialize empty answer fields on the board
 */
board.setAnswer(1, '', 0);
board.setAnswer(2, '', 0);
board.setAnswer(3, '', 0);
board.setAnswer(4, '', 0);
board.setAnswer(5, '', 0);
board.setAnswer(6, '', 0);

/**
 * Initialize team scores to zero
 */
board.setPoints(TEAMS.BLUE, 0);
board.setPoints(TEAMS.RED, 0);

/**
 * Initialize team errors to zero
 */
board.setErrors(TEAMS.RED, 0);
board.setErrors(TEAMS.BLUE, 0);

/**
 * Main game instance with two teams and question store
 * Respects the 'random' flag from data.json for question order
 */
const game = new Game(
  [new Team(TEAMS.BLUE), new Team(TEAMS.RED)],
  new QuestionStore(questions, data.random)
);

/**
 * Load speech recognition grammar if supported
 */
if (speech.isSupported()) {
  speech.loadGrammar(game.getRound().getQuestion().getAnswersWords());
}

/** DOM element references */
const record = document.querySelector('.record') as HTMLElement;
const recordButton = document.querySelector('#recordButton') as HTMLButtonElement;
const undoButton = document.querySelector('#undoButton') as HTMLButtonElement;
const intro = document.querySelector('.intro') as HTMLElement;

/**
 * Checks if the intro screen is currently visible
 * @returns True if intro is visible, false otherwise
 */
const isIntroVisible = (): boolean => intro && !intro.classList.contains('hide');

/** Flag to track if intro music has been started */
let introMusicStarted = false;

/**
 * Voice recording button click handler
 * Starts speech recognition and processes the result
 */
if (record) {
  record.onclick = function() {
    if (!speech.isSupported()) {
      if (recordButton) recordButton.disabled = true;
      return;
    }

    board.recordButton('start');
    speech.start()
      .then((result) => {
        game.handlePlayerAnswer(result[0][0].transcript);
      })
      .finally(() => {
        board.recordButton('stop');
      });
  };
}

/**
 * Undo button click handler
 * Reverts the last game action and reloads speech grammar
 */
if (undoButton) {
  undoButton.onclick = function() {
    const undone = game.undo();
    if (undone && speech.isSupported()) {
      speech.loadGrammar(game.getRound().getQuestion().getAnswersWords());
    }
  };
}

/**
 * Global keyboard event handler
 * Manages all keyboard shortcuts for the game
 * 
 * Keyboard shortcuts:
 * - Space: Start intro music / Hide intro after music
 * - S: Toggle score overlay
 * - Z: Undo last action
 * - R: Start voice recording
 * - E: Deselect team
 * - X: Add error to selected team
 * - M: Toggle music
 * - Q: Select blue team
 * - W: Select red team
 * - P: Advance to next round
 * - 1-9: Reveal answer by number
 */
document.addEventListener('keydown', (event: KeyboardEvent) => {
  const key = event.key;

  // Intro screen handling
  if (isIntroVisible()) {
    if (key === ' ' || event.code === 'Space') {
      event.preventDefault();
      if (!introMusicStarted) {
        introMusicStarted = true;
        audio.startMusicOnce();
      } else {
        audio.stopMusic();
        if (intro) intro.classList.add('hide');
      }
    }
    return;
  }

  // Score overlay toggle (S) - always available
  if (key === 's' || key === 'S') {
    board.setScoreOverlayVisible(!board.isScoreOverlayVisible());
    return;
  }

  // Undo (Z) - always available
  if (key === 'z' || key === 'Z') {
    const undone = game.undo();
    if (undone && speech.isSupported()) {
      speech.loadGrammar(game.getRound().getQuestion().getAnswersWords());
    }
    return;
  }

  // Block other gameplay keys when score overlay is visible
  if (board.isScoreOverlayVisible()) {
    return;
  }

  // Voice recording (R)
  if (key === 'r' || key === 'R') {
    if (record) record.click();
    return;
  }

  // Deselect team (E)
  if (key === 'e' || key === 'E') {
    game.setCurrentTeam('');
    return;
  }

  // Add error to selected team (X)
  if (key === 'x' || key === 'X') {
    game.addErrorForSelectedTeam();
    return;
  }

  // Toggle music (M)
  if (key === 'm' || key === 'M') {
    audio.toggleMusic();
    return;
  }

  // Select blue team (Q)
  if (key === 'q' || key === 'Q') {
    game.setCurrentTeam(TEAMS.BLUE);
    return;
  }

  // Select red team (W)
  if (key === 'w' || key === 'W') {
    game.setCurrentTeam(TEAMS.RED);
    return;
  }

  // Advance to next round (P)
  if (key === 'p' || key === 'P') {
    const advanced = game.advanceToNextRound();
    if (advanced && speech.isSupported()) {
      speech.loadGrammar(game.getRound().getQuestion().getAnswersWords());
    }
    return;
  }

  // Reveal answer by number (1-9)
  if (/^[1-9]$/.test(key)) {
    game.revealAnswerByNumber(parseInt(key, 10));
    return;
  }
});
