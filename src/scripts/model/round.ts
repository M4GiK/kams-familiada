import board from '../board';
import Answer from './answer';
import Team from './team';
import Game from './game';
import ROUND_STATUS from '../roundStatus';
import audio from '../audio';
import Question from './question';

/**
 * Manages the current question round and board state
 * Handles answer reveals, errors, round completion, and point calculations
 */
export default class Round {
  /** Number of correct answers revealed */
  private right: number;
  
  /** Current status of the round (DEFAULT or STOLEN) */
  private status: ROUND_STATUS;
  
  /** Points accumulated in this round */
  private points: number;
  
  /** Set of revealed answer positions (lp values) */
  private revealed: Set<number>;
  
  /** The current question being played */
  private question: Question;

  /**
   * Creates a new Round instance
   * @param question - The Question object for this round
   */
  constructor(question: Question) {
    this.right = 0;
    this.status = ROUND_STATUS.DEFAULT;
    this.points = 0;
    this.revealed = new Set<number>();
    this.question = question;
    board.setQuestion(this.question.getName());
    board.manageAnswerFields(this.getQuestion().getAnswers().length);
  }

  /**
   * Reveals an answer on the board and adds its points to the round
   * If all answers are revealed or round is STOLEN, finishes the round
   * @param answer - The Answer object to reveal
   * @param game - The Game instance managing the overall game state
   */
  setBoardAnswer(answer: Answer, game: Game): void {
    if (this.revealed.has(answer.lp)) return;
    this.revealed.add(answer.lp);
    board.setAnswer(answer.lp, answer.ans, answer.points);
    audio.playReveal();
    this.right++;
    this.points += answer.points;
    if (this.checkFinish() || this.status === ROUND_STATUS.STOLEN) {
      this.finishRound(game);
    }
  }

  /**
   * Reveals an answer without awarding points (used for showing remaining answers)
   * @param answer - The Answer object to reveal
   */
  revealAnswerOnly(answer: Answer): void {
    if (this.revealed.has(answer.lp)) return;
    this.revealed.add(answer.lp);
    board.setAnswer(answer.lp, answer.ans, answer.points);
    audio.playReveal();
    this.right++;
  }

  /**
   * Records an error for the team and updates board
   * Handles STOLEN round resolution and transitions between teams
   * @param team - The Team that made an error
   * @param game - The Game instance managing the overall game state
   */
  setBoardError(team: Team, game: Game): void {
    team.addError();
    board.setErrors(team.getName(), team.getErrors());
    audio.playWrong();

    // In STOLEN state, opposing team gets the points if they answer correctly
    if (this.status === ROUND_STATUS.STOLEN) {
      game.switchCurrentTeam();
      const multiplier = (game.getRoundCount() === 4) ? 2 : (game.getRoundCount() === 5) ? 3 : 1;
      const awardedPoints = this.points * multiplier;
      const currentTeam = game.getCurrentTeam();
      if (currentTeam) {
        currentTeam.addPoints(awardedPoints);
        board.setPoints(currentTeam.getName(), currentTeam.getPoints());

        if (currentTeam.getPoints() >= 400) {
          this.finishGame(currentTeam.getName());
          return;
        }
      }
      game.switchCurrentTeam();
      game.pendingNextRound = true;
      return;
    }

    // After 3 errors, switch to STOLEN mode
    if (team.getErrors() === 3) {
      game.switchCurrentTeam();
      this.status = ROUND_STATUS.STOLEN;
    }
  }

  /**
   * Checks if all answers have been revealed
   * @returns True if round is complete, false otherwise
   */
  checkFinish(): boolean {
    return this.question.getAnswers().length === this.right;
  }

  /**
   * Finishes the current round, awards points with multiplier, and checks for game end
   * @param game - The Game instance managing the overall game state
   */
  finishRound(game: Game): void {
    const multiplier = (game.getRoundCount() === 4) ? 2 : (game.getRoundCount() === 5) ? 3 : 1;
    const awardedPoints = this.points * multiplier;

    const currentTeam = game.getCurrentTeam();
    if (currentTeam) {
      currentTeam.addPoints(awardedPoints);
      board.setPoints(currentTeam.getName(), currentTeam.getPoints());

      if (currentTeam.getPoints() >= 400) {
        this.finishGame(currentTeam.getName());
        return;
      }
    }
    game.switchCurrentTeam();
    game.pendingNextRound = true;
  }

  /**
   * Initiates a new round via the Game instance
   * @param game - The Game instance managing the overall game state
   */
  startNewRound(game: Game): void {
    game.startNewRound();
  }

  /**
   * Ends the game and displays the winning team
   * @param teamName - Name of the winning team
   */
  finishGame(teamName: string): void {
    board.finishGame(teamName);
  }

  /**
   * Gets the current question
   * @returns The Question object for this round
   */
  getQuestion(): Question {
    return this.question;
  }

  /**
   * Gets the current round points
   * @returns Total points accumulated in this round
   */
  getPoints(): number {
    return this.points;
  }

  /**
   * Gets the current round status
   * @returns The ROUND_STATUS enum value
   */
  getStatus(): ROUND_STATUS {
    return this.status;
  }

  /**
   * Gets the number of revealed answers
   * @returns Count of correct answers revealed
   */
  getRight(): number {
    return this.right;
  }
}
