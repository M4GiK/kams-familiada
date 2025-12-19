/**
 * Represents a team in the Familiada game
 * Tracks the team's name, points, and error count
 */
export default class Team {
  /** Team name/identifier */
  private name: string;
  
  /** Total points accumulated by the team */
  private points: number;
  
  /** Number of errors (X marks) the team has */
  private errors: number;

  /**
   * Creates a new Team instance
   * @param name - The team's name
   */
  constructor(name: string) {
    this.name = name;
    this.points = 0;
    this.errors = 0;
  }

  /**
   * Adds points to the team's score
   * @param points - Number of points to add
   */
  addPoints(points: number): void {
    this.points += points;
  }

  /**
   * Sets the team's points to a specific value (used for undo)
   * @param points - New point total (minimum 0)
   */
  setPoints(points: number): void {
    this.points = Math.max(0, points);
  }

  /**
   * Adds one error to the team
   */
  addError(): void {
    this.errors += 1;
  }

  /**
   * Removes one error from the team (used for undo)
   */
  removeError(): void {
    this.errors = Math.max(0, this.errors - 1);
  }

  /**
   * Sets the error count to a specific value (used for undo)
   * @param errorCnt - New error count (minimum 0)
   */
  setErrors(errorCnt: number): void {
    this.errors = Math.max(0, errorCnt);
  }

  /**
   * Resets the error count to zero
   */
  resetErrors(): void {
    this.errors = 0;
  }

  /**
   * Gets the team's name
   * @returns The team name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the team's current error count
   * @returns Number of errors
   */
  getErrors(): number {
    return this.errors;
  }

  /**
   * Gets the team's current point total
   * @returns Number of points
   */
  getPoints(): number {
    return this.points;
  }
}
