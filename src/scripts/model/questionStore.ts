import Answer from './answer';
import Question from './question';

/**
 * Stores and manages the collection of game questions
 * Supports both sequential and random question ordering
 */
export default class QuestionStore {
  /** Whether questions should be presented in random order */
  private random: boolean;
  
  /** Array of all available questions */
  private questions: Question[];
  
  /** Index of the current/next question to be retrieved */
  private currentQuestionIndex: number;

  /**
   * Creates a new QuestionStore instance
   * @param questions - Raw questions object from data.json
   * @param random - If true, questions will be shuffled; if false, sequential order
   */
  constructor(questions: Record<string, any[]>, random: boolean = false) {
    this.random = random === true;
    this.questions = this.parseQuestions(questions);
    this.currentQuestionIndex = 0;

    if (this.random) {
      this.questions = this.shuffleQuestions(this.questions);
    }
  }

  /**
   * Shuffles the questions array using Fisher-Yates algorithm
   * @param questions - Array of questions to shuffle
   * @returns A new shuffled array
   */
  private shuffleQuestions(questions: Question[]): Question[] {
    const copy = questions.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Parses raw question data from JSON into Question objects
   * @param questions - Raw questions object with question titles as keys
   * @returns Array of parsed Question instances
   */
  private parseQuestions(questions: Record<string, any[]>): Question[] {
    const parsedQuestions: Question[] = [];

    for (const [title, answers] of Object.entries(questions)) {
      const parsedAnswers = answers
        .filter(answer => answer)
        .map(answer => new Answer(answer));
      parsedQuestions.push(new Question(title, parsedAnswers));
    }
    return parsedQuestions;
  }

  /**
   * Gets the next question in the sequence
   * @returns The next Question object, or undefined if no questions available
   */
  getQuestion(): Question | undefined {
    return this.getNextQuestion();
  }

  /**
   * Gets the next question and advances the internal index
   * Wraps around to the beginning when reaching the end
   * @returns The next Question object, or undefined if no questions available
   */
  private getNextQuestion(): Question | undefined {
    if (this.questions.length === 0) return undefined;
    const question = this.questions[this.currentQuestionIndex];
    this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.questions.length;
    return question;
  }

  /**
   * Gets the current question index (used for undo/restore)
   * @returns The current question index
   */
  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  /**
   * Sets the current question index (used for undo/restore)
   * @param index - New index value (will be normalized to valid range)
   */
  setCurrentQuestionIndex(index: number): void {
    if (!Number.isFinite(index)) return;
    if (this.questions.length === 0) {
      this.currentQuestionIndex = 0;
      return;
    }
    const normalized = ((index % this.questions.length) + this.questions.length) % this.questions.length;
    this.currentQuestionIndex = normalized;
  }

  /**
   * Gets a random question from the store (legacy method)
   * @returns A random Question object
   */
  getRandomQuestion(): Question {
    return this.questions[this.getRandomQuestionId()];
  }

  /**
   * Gets a random question index (legacy method)
   * @returns A random index in the questions array
   */
  getRandomQuestionId(): number {
    return Math.floor(Math.random() * (this.questions.length - 1 + 1) + 1) - 1;
  }
}
