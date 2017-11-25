'use strict';

/**
 * An enumeration of log levels.
 *
 * @readonly
 * @enum
 */
const Level = {

  /**
   * Emergency (0). Indicates a system failure.
   *
   * @readonly
   * @type {number}
   */
  emerg: 0,


  /**
   * Alert (1). Indicates an issue that will result in a system outage.
   *
   * @readonly
   * @type {number}
   */
  alert: 1,


  /**
   * Critical (2). The system is in a degraded state.
   *
   * @readonly
   * @type {number}
   */
  crit: 2,


  /**
   * Error (3). An unexpected application error has occurred.
   *
   * @readonly
   * @type {number}
   */
  err: 3,


  /**
   * Warning (4). A nonfatal issue has occurred.
   *
   * @readonly
   * @type {number}
   */
  warning: 4,


  /**
   * Notice (5). An unusual, but non-fatal, event has occurred.
   *
   * @readonly
   * @type {number}
   */
  notice: 5,


  /**
   * Informational (6). Operational message.
   *
   * @readonly
   * @type {number}
   */
  info: 6,


  /**
   * Debug (7). Verbose debugging and tracing message.
   *
   * @readonly
   * @type {number}
   */
  debug: 7,


  /**
   * Indicates whether or not a value is valid log level.
   *
   * @param {(number|string)} level
   *
   * #returns {boolean} True if the level is a valid log level. Otherwise false.
   */
  isValid: function isValid(level) {
    return (level === 0
         || level === 1
         || level === 2
         || level === 3
         || level === 4
         || level === 5
         || level === 6
         || level === 7
         || level === 'emerg'
         || level === 'alert'
         || level === 'crit'
         || level === 'err'
         || level === 'warning'
         || level === 'notice'
         || level === 'info'
         || level === 'debug'
    );
  },


  /**
   * Asserts that a value is a valid log level.  Throws a TypeError if the value
   * is not a valid log level.
   *
   * @param {(number|string)} level
   */
  assert: function assert(level) {
    if (!this.isValid(level)) {
      throw new TypeError(`Invalid log severity level: ${level}`);
    }
  },

};


Object.freeze(Level);


module.exports = Level;
