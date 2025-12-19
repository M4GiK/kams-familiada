import Round from './round';
import board from '../board';
import Team from './team';
import QuestionStore from './questionStore';
import Question from './question';
import Answer from './answer';
import ROUND_STATUS from '../roundStatus';

/**
 * Interface for undo snapshot data
 */
interface UndoSnapshot {
  roundCount: number;
  pendingNextRound: boolean;
  currentTeam: string;
  questionsStoreIndex: number;
  roundQuestion: Question;
  roundStatus: ROUND_STATUS;
  roundPoints: number;
  roundRight: number;
  revealed: number[];
  teamState: Array<{ name: string; points: number; errors: number }>;
  board: BoardState;
}

/**
 * Interface for captured board state
 */
interface BoardState {
  question: string;
  winnerHtml: string;
  winnerDisplay: string;
  answers: Array<{ num: number; text: string; points: string; display: string }>;
  teamPoints: { blue: string; red: string };
}

/**
 * Interface for answer resolution result
 */
interface AnswerResult {
  answer: Answer | null;
  status: boolean;
}

/**
 * Main game controller managing rounds, teams, and game flow
 * Handles the overall game state and undo functionality
 */
export default class Game {
  /** Array of teams playing the game */
  private teams: Team[];
  
  /** Store containing all available questions */
  private questionsStore: QuestionStore;
  
  /** Current round number (1-based) */
  private roundCount: number;
  
  /** Flag indicating if a new round should start on next action */
  public pendingNextRound: boolean;
  
  /** Stack of game states for undo functionality */
  private undoStack: UndoSnapshot[];
  
  /** Current active round */
  private round: Round;
  
  /** Name of the currently active team */
  private currentTeam?: string;

  /**
   * Creates a new Game instance
   * @param teams - Array of Team objects (typically 2 teams)
   * @param questionsStore - QuestionStore containing all game questions
   */
  constructor(teams: Team[], questionsStore: QuestionStore) {
    this.teams = teams;
    this.questionsStore = questionsStore;
    this.roundCount = 1;
    this.pendingNextRound = false;
    this.undoStack = [];
    this.round = new Round(this.questionsStore.getQuestion()!);
    this.setRandomTeam();
  }

  /**
   * Captures the current game state and pushes it to the undo stack
   * Includes team state, round state, question index, and board DOM state
   */
  pushUndoSnapshot(): void {
    const snapshot: UndoSnapshot = {
      roundCount: this.roundCount,
      pendingNextRound: this.pendingNextRound,
      currentTeam: this.currentTeam || '',
      questionsStoreIndex: this.questionsStore.getCurrentQuestionIndex(),
      roundQuestion: this.round.getQuestion(),
      roundStatus: this.round.getStatus(),
      roundPoints: this.round.getPoints(),
      roundRight: this.round.getRight(),
      revealed: Array.from((this.round as any).revealed || []),
      teamState: this.teams.map(team => ({
        name: team.getName(),
        points: team.getPoints(),
        errors: team.getErrors()
      })),
      board: this.captureBoardState()
    };

    this.undoStack.push(snapshot);
  }

  /**
   * Captures the current DOM state of the game board
   * @returns BoardState object with current board HTML/CSS state
   */
  private captureBoardState(): BoardState {
    const questionEl = document.querySelector('.question');
    const winnerEl = document.querySelector('.winner');

    const answerEls = document.querySelectorAll('[data-answer-num]');
    const answers: Array<{ num: number; text: string; points: string; display: string }> = [];
    
    for (let i = 0; i < answerEls.length; i++) {
      const el = answerEls.item(i) as HTMLElement;
      if (!el) continue;
      const numAttr = el.getAttribute('data-answer-num');
      const num = parseInt(numAttr || '0', 10);
      const text = el.querySelector('span.text')?.innerHTML ?? '';
      const points = el.querySelector('span.points')?.innerHTML ?? '0';
      const display = el.style?.display ?? '';
      answers.push({ num, text, points, display });
    }

    const teamPoints = {
      blue: document.querySelector('.blue-team .team-points')?.innerHTML ?? '0',
      red: document.querySelector('.red-team .team-points')?.innerHTML ?? '0'
    };

    return {
      question: questionEl?.innerHTML ?? '',
      winnerHtml: winnerEl?.innerHTML ?? '',
      winnerDisplay: (winnerEl as HTMLElement)?.style?.display ?? '',
      answers,
      teamPoints
    };
  }

  /**
   * Restores the board DOM state from a snapshot
   * @param boardState - Previously captured BoardState object
   */
  private restoreBoardState(boardState: BoardState): void {
    if (!boardState) return;

    const questionEl = document.querySelector('.question');
    if (questionEl) questionEl.innerHTML = boardState.question || '';

    const winnerEl = document.querySelector('.winner') as HTMLElement;
    if (winnerEl) {
      winnerEl.innerHTML = boardState.winnerHtml || '';
      winnerEl.style.display = boardState.winnerDisplay || '';
    }

    if (Array.isArray(boardState.answers)) {
      for (const a of boardState.answers) {
        if (!a || !Number.isFinite(a.num)) continue;
        const row = document.querySelector(`[data-answer-num="${a.num}"]`) as HTMLElement;
        if (!row) continue;
        const textEl = row.querySelector('span.text');
        const pointsEl = row.querySelector('span.points');
        if (textEl) textEl.innerHTML = a.text ?? '';
        if (pointsEl) pointsEl.innerHTML = a.points ?? '0';
        if (row.style) row.style.display = a.display ?? '';
      }
    }

    if (boardState.teamPoints) {
      const blueEl = document.querySelector('.blue-team .team-points');
      const redEl = document.querySelector('.red-team .team-points');
      if (blueEl) blueEl.innerHTML = boardState.teamPoints.blue ?? '0';
      if (redEl) redEl.innerHTML = boardState.teamPoints.red ?? '0';
    }

    if ((board as any).isScoreOverlayVisible && (board as any).isScoreOverlayVisible()) {
      if ((board as any).refreshScoreOverlay) (board as any).refreshScoreOverlay();
    }
  }

  /**
   * Starts a new round with a fresh question
   * Clears the board, resets team errors, increments round count
   */
  startNewRound(): void {
    this.pushUndoSnapshot();
    board.clearBoard();
    this.pendingNextRound = false;
    this.resetTeamsErrors();
    this.roundCount++;
    this.round = new Round(this.questionsStore.getQuestion()!);
    this.setRandomTeam();
  }

  /**
   * Advances to the next round if one is pending
   * @returns True if advanced, false if no round was pending
   */
  advanceToNextRound(): boolean {
    if (!this.pendingNextRound) return false;
    this.startNewRound();
    return true;
  }

  /**
   * Reveals a specific answer by its number
   * @param number - The answer number (lp) to reveal
   * @returns True if answer was found and revealed, false otherwise
   */
  revealAnswerByNumber(number: number): boolean {
    const answer = this.round.getQuestion().getAnswers().find(a => a.lp === number);
    if (!answer) return false;

    this.pushUndoSnapshot();
    if (!this.getCurrentTeam()) {
      this.round.revealAnswerOnly(answer);
      if (this.round.checkFinish()) {
        this.pendingNextRound = true;
      }
      return true;
    }
    this.round.setBoardAnswer(answer, this);
    return true;
  }

  /**
   * Resets error count to zero for all teams
   */
  private resetTeamsErrors(): void {
    for (const team of this.teams) {
      team.resetErrors();
    }
  }

  /**
   * Handles a player's answer input
   * Resolves the answer and updates board/round state accordingly
   * @param playerAnswer - The answer text provided by the player
   */
  handlePlayerAnswer(playerAnswer: string): void {
    this.pushUndoSnapshot();
    const result = this.resolvePlayerAnswer(playerAnswer);
    const currentTeam = this.getCurrentTeam();

    if (!currentTeam) {
      if (result.status === true && result.answer) {
        this.round.revealAnswerOnly(result.answer);
        if (this.round.checkFinish()) {
          this.pendingNextRound = true;
        }
      }
      return;
    }

    switch (result.status) {
      case true: {
        if (result.answer) {
          this.round.setBoardAnswer(result.answer, this);
        }
        break;
      }
      case false: {
        this.round.setBoardError(currentTeam, this);
        break;
      }
      default: {
        throw new Error('Result have only true of false status');
      }
    }
  }

  /**
   * Adds an error to the currently selected team
   * @returns True if error was added, false if no team is selected
   */
  addErrorForSelectedTeam(): boolean {
    const currentTeam = this.getCurrentTeam();
    if (!currentTeam) return false;

    this.pushUndoSnapshot();
    this.round.setBoardError(currentTeam, this);
    return true;
  }

  /**
   * Undoes the last game action by restoring the previous snapshot
   * @returns True if undo was successful, false if no snapshots available
   */
  undo(): boolean {
    const snapshot = this.undoStack.pop();
    if (!snapshot) return false;

    this.roundCount = snapshot.roundCount;
    this.pendingNextRound = snapshot.pendingNextRound;

    this.questionsStore.setCurrentQuestionIndex(snapshot.questionsStoreIndex);

    for (const state of snapshot.teamState) {
      const team = this.teams.find(t => t.getName() === state.name);
      if (!team) continue;
      team.setPoints(state.points);
      team.setErrors(state.errors);
    }

    for (const team of this.teams) {
      board.setPoints(team.getName(), team.getPoints());
      board.setErrors(team.getName(), team.getErrors());
    }

    this.round = new Round(snapshot.roundQuestion);
    (this.round as any).status = snapshot.roundStatus;
    (this.round as any).points = snapshot.roundPoints;
    (this.round as any).right = snapshot.roundRight;
    (this.round as any).revealed = new Set(snapshot.revealed || []);

    this.setCurrentTeam(snapshot.currentTeam, { skipUndo: true });

    this.restoreBoardState(snapshot.board);

    return true;
  }

  /**
   * Resolves a player answer by matching it against valid answers
   * Uses diacritic removal for flexible matching
   * @param playerAnswer - The answer text to resolve
   * @returns AnswerResult with the matched answer and success status
   */
  private resolvePlayerAnswer(playerAnswer: string): AnswerResult {
    const answer = this.round.getQuestion().getAnswers().find(answer => {
      return answer.ans.toLowerCase() === board.removeDiacritics(playerAnswer);
    });

    return answer !== undefined ? { answer, status: true } : { answer: null, status: false };
  }

  /**
   * Gets the questions store
   * @returns The QuestionStore instance
   */
  getQuestionsStore(): QuestionStore {
    return this.questionsStore;
  }

  /**
   * Switches to the other team (not currently active)
   */
  switchCurrentTeam(): void {
    const otherTeam = this.teams.find(team => team.getName() !== this.currentTeam);
    if (otherTeam) {
      this.setCurrentTeam(otherTeam.getName(), { skipUndo: true });
    }
  }

  /**
   * Randomly selects one of the teams to be active
   */
  setRandomTeam(): void {
    this.setCurrentTeam(this.teams[Math.round(Math.random())].getName(), { skipUndo: true });
  }

  /**
   * Sets the currently active team
   * @param teamName - Name of the team to make active
   * @param options - Options object with skipUndo flag to prevent snapshot
   */
  setCurrentTeam(teamName: string, options: { skipUndo?: boolean } = {}): void {
    if (!options.skipUndo) {
      this.pushUndoSnapshot();
    }
    this.currentTeam = teamName;
    board.setActiveTeam(teamName);
  }

  /**
   * Gets the currently active team object
   * @returns The active Team instance, or null if none selected
   */
  getCurrentTeam(): Team | null {
    if (!this.currentTeam) return null;
    return this.teams.find(team => team.getName() === this.currentTeam) || null;
  }

  /**
   * Gets the current round
   * @returns The active Round instance
   */
  getRound(): Round {
    return this.round;
  }

  /**
   * Gets all teams
   * @returns Array of Team instances
   */
  getTeams(): Team[] {
    return this.teams;
  }

  /**
   * Gets the current round number
   * @returns The round count (1-based)
   */
  getRoundCount(): number {
    return this.roundCount;
  }
}
