/**
 * Represents a single answer in a Familiada question
 */
export default class Answer {
  /** The answer text */
  public ans: string;
  
  /** Position/order of the answer (1-based) */
  public lp: number;
  
  /** Points awarded for this answer */
  public points: number;

  /**
   * Creates a new Answer instance
   * @param answer - Object containing answer data
   */
  constructor(answer: { ans: string; lp: number; points: number }) {
    this.ans = answer.ans;
    this.lp = answer.lp;
    this.points = answer.points;
  }
}
