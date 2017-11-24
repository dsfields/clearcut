'use strict';

const Level = {
  emerg: 0,
  alert: 1,
  crit: 2,
  err: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
  0: 'emerg',
  1: 'alert',
  2: 'crit',
  3: 'err',
  4: 'warning',
  5: 'notice',
  6: 'info',
  7: 'debug',

  isValid: function(level) {
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

  assert: function(level) {
    if (!this.isValid(level))
      throw new TypeError(`Invalid log severity level: ${level}`);
  },

  valueOf: function(level) {
    this.assert(level);
    if (typeof level === 'number') return level;
    return this[level];
  }
};

module.exports = Level;
