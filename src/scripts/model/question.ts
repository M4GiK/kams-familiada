import Answer from './answer';

/**
 * Represents a Familiada question with its associated answers
 */
export default class Question {
  /** The question text */
  private name: string;
  
  /** Array of valid answers for this question */
  private answers: Answer[];

  /**
   * Creates a new Question instance
   * @param name - The question text
   * @param answers - Array of Answer objects (null entries are filtered out)
   */
  constructor(name: string, answers: (Answer | null)[]) {
    this.name = name;
    this.answers = answers.filter((answer): answer is Answer => answer !== null);
  }

  /**
   * Gets the question text
   * @returns The question name/text
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets all answers for this question
   * @returns Array of Answer objects
   */
  getAnswers(): Answer[] {
    return this.answers;
  }

  /**
   * Gets just the answer text strings (useful for speech recognition)
   * @returns Array of answer text strings
   */
  getAnswersWords(): string[] {
    return this.answers.map(answer => answer.ans);
  }
}
