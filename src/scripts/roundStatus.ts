/**
 * Enum representing the current status of a game round
 * @readonly
 * @enum {string}
 */
export enum ROUND_STATUS {
  /** Normal round state - team can answer and accumulate errors */
  DEFAULT = 'default',
  /** Stolen state - opposing team gets one chance to answer and win round points */
  STOLEN = 'stolen'
}

export default ROUND_STATUS;
