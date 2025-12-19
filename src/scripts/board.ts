/**
 * Board module - handles all DOM manipulation for the game board
 * Manages question display, answers, scores, errors, and overlays
 */

/** Template string used to fill empty answer slots */
const answerFieldFill = '... ... ... ... ... ... ... ... ... ... ... ... ...';

/**
 * Shows or hides the score overlay
 * @param visible - True to show, false to hide
 */
export function setScoreOverlayVisible(visible: boolean): void {
  const overlay = document.querySelector('.scoreOverlay');
  if (!overlay) return;
  overlay.classList.toggle('hide', !visible);
  overlay.setAttribute('aria-hidden', (!visible).toString());
  if (visible) refreshScoreOverlay();
}

/**
 * Checks if the score overlay is currently visible
 * @returns True if visible, false otherwise
 */
export function isScoreOverlayVisible(): boolean {
  const overlay = document.querySelector('.scoreOverlay');
  if (!overlay) return false;
  return !overlay.classList.contains('hide');
}

/**
 * Gets a team's display name from the board DOM
 * @param teamName - Team identifier (e.g., 'blue' or 'red')
 * @returns The team's display name or the identifier if not found
 */
function getTeamNameFromBoard(teamName: string): string {
  const el = document.querySelector(`.${teamName}-team .name`);
  if (!el) return teamName;
  return (el.textContent || '').trim() || teamName;
}

/**
 * Gets a team's current points from the board DOM
 * @param teamName - Team identifier (e.g., 'blue' or 'red')
 * @returns The team's point total, or 0 if not found
 */
function getTeamPointsFromBoard(teamName: string): number {
  const el = document.querySelector(`.${teamName}-team .team-points`);
  if (!el) return 0;
  const raw = (el.textContent || '').trim();
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Updates the score overlay with current team names and points
 */
export function refreshScoreOverlay(): void {
  const overlay = document.querySelector('.scoreOverlay');
  if (!overlay) return;

  const blueName = overlay.querySelector('[data-score-team="blue-name"]');
  const redName = overlay.querySelector('[data-score-team="red-name"]');
  const bluePoints = overlay.querySelector('[data-score-team="blue-points"]');
  const redPoints = overlay.querySelector('[data-score-team="red-points"]');

  if (blueName) blueName.textContent = getTeamNameFromBoard('blue');
  if (redName) redName.textContent = getTeamNameFromBoard('red');
  if (bluePoints) bluePoints.textContent = getTeamPointsFromBoard('blue').toString();
  if (redPoints) redPoints.textContent = getTeamPointsFromBoard('red').toString();
}

/**
 * Sets an answer on the board
 * @param number - Answer position (1-6)
 * @param text - Answer text
 * @param points - Points for this answer
 * @throws Error if the answer slot doesn't exist
 */
export function setAnswer(number: number, text: string, points: number): void {
  if (!document.querySelector(`[data-answer-num="${number}"]`)) {
    throw new Error('The HTML for the answer does not exist, ' +
      'make sure the question number you provided is in a 1-6 range');
  }

  const textContainer = document.querySelector(`[data-answer-num="${number}"] .text`);
  const pointsContainer = document.querySelector(`[data-answer-num="${number}"] .points`);

  if (textContainer) textContainer.innerHTML = fillAnswerField(removeDiacritics(text));
  if (pointsContainer) pointsContainer.innerHTML = points.toString();
}

/**
 * Shows/hides answer rows based on the number of answers in the question
 * @param answerLength - Number of answers (typically 1-6)
 */
export function manageAnswerFields(answerLength: number): void {
  const rowFields = document.querySelectorAll(`[data-answer-num]`);
  for (let i = 1; i <= 6; i++) {
    const row = rowFields.item(i - 1) as HTMLElement;
    if (!row) continue;
    if (i > answerLength) {
      row.style.display = 'none';
    } else {
      row.style.display = 'block';
    }
  }
}

/**
 * Fills an answer field with text and padding dots
 * @param text - The answer text
 * @returns Padded or truncated text to fit the field
 */
export function fillAnswerField(text: string): string {
  const fillLength = answerFieldFill.length;

  if (fillLength < text.length) {
    return text.substring(0, fillLength - 3) + '...';
  } else {
    return text + answerFieldFill.substring(text.length);
  }
}

/**
 * Updates a team's point display on the board
 * @param team - Team identifier (e.g., 'blue' or 'red')
 * @param points - New point total
 * @throws Error if team DOM element doesn't exist
 */
export function setPoints(team: string, points: number): void {
  const teamPointContainer = document.querySelector(`.${team}-team .team-points`);

  if (!teamPointContainer) {
    throw new Error('The HTML for the team you provided does not exist, you probably have a typo in a team name');
  }

  teamPointContainer.innerHTML = points.toString();

  if (isScoreOverlayVisible()) {
    refreshScoreOverlay();
  }
}

/**
 * Updates a team's error indicators (X marks) on the board
 * @param team - Team identifier (e.g., 'blue' or 'red')
 * @param errorCnt - Number of errors (0-3)
 * @throws Error if team DOM elements don't exist
 */
export function setErrors(team: string, errorCnt: number): void {
  const errorIndicators = document.querySelectorAll(`.${team}-team .fail`);

  if (!errorIndicators.length) {
    throw new Error('The HTML for the team you provided does not exist, you probably have a typo in a team name');
  }

  for (let i = 0; i < errorIndicators.length; i++) {
    if (i < errorCnt) {
      errorIndicators[i].className = 'fail active';
    } else {
      errorIndicators[i].className = 'fail';
    }
  }
}

/**
 * Sets the question text on the board
 * @param text - Question text
 */
export function setQuestion(text: string): void {
  const questionEl = document.querySelector('.question');
  if (questionEl) questionEl.innerHTML = removeDiacritics(text);
}

/**
 * Removes Polish diacritics and special characters from text
 * Used for case-insensitive answer matching
 * @param input - Text to process
 * @returns Text with diacritics removed
 */
export function removeDiacritics(input: string): string {
  return input.replace(/\u0142/g, "l").normalize('NFKD').replace(/[^\w\s.-_\/]/g, '');
}

/**
 * Clears all answers and errors from the board
 * Resets answer fields to empty state
 */
export function clearBoard(): void {
  const elements = document.querySelectorAll('[data-answer-num]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements.item(i);
    const textEl = el?.querySelector('span.text');
    const pointsEl = el?.querySelector('span.points');
    if (textEl) textEl.innerHTML = answerFieldFill;
    if (pointsEl) pointsEl.innerHTML = '0';
  }

  const hasBlue = document.querySelectorAll('.blue-team .fail').length > 0;
  const hasRed = document.querySelectorAll('.red-team .fail').length > 0;
  if (hasBlue) setErrors('blue', 0);
  if (hasRed) setErrors('red', 0);
}

/**
 * Gets a team's display name from the board
 * @param teamName - Team identifier (e.g., 'blue' or 'red')
 * @returns Team display name or identifier if not found
 */
function getTeamDisplayName(teamName: string): string {
  const el = document.querySelector(`.${teamName}-team .name`);
  if (!el) return teamName;
  return (el.textContent || '').trim() || teamName;
}

/**
 * Displays the game winner message
 * @param teamName - Name of the winning team
 */
export function finishGame(teamName: string): void {
  const winner = document.querySelector('.winner') as HTMLElement;
  if (!winner) return;
  const displayName = getTeamDisplayName(teamName);
  winner.innerHTML = `Wygrala druzyna ${displayName}`;
  winner.style.display = 'block';
}

/**
 * Updates the record button visual state
 * @param status - 'start' to show recording, anything else to hide
 */
export function recordButton(status: string): void {
  const button = document.querySelector('#recordButton') as HTMLElement;
  if (!button) return;
  button.className = (status === 'start') ? 'rec' : 'notRec';
}

/**
 * Highlights the currently active team on the board
 * @param teamName - Team identifier (e.g., 'blue' or 'red'), or undefined to clear
 */
export function setActiveTeam(teamName?: string): void {
  const blue = document.querySelector('.blue-team');
  const red = document.querySelector('.red-team');

  if (blue) blue.classList.remove('active-turn');
  if (red) red.classList.remove('active-turn');

  if (!teamName) return;

  const current = document.querySelector(`.${teamName}-team`);
  if (current) current.classList.add('active-turn');
}

export default {
  setAnswer,
  fillAnswerField,
  setPoints,
  setErrors,
  setQuestion,
  removeDiacritics,
  manageAnswerFields,
  clearBoard,
  finishGame,
  recordButton,
  setActiveTeam,
  setScoreOverlayVisible,
  isScoreOverlayVisible,
  refreshScoreOverlay
};
