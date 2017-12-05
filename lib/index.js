'use strict';

const createLogger = require('./create-logger.js');
const DefaultFormatter = require('./default-formatter');
const Level = require('./level');


/**
 * An object used by Logger instances to format log records before writing to
 * the stream.
 * @typedef {object} Formatter
 * @prop {function} clone
 * @prop {function} format
 * @prop {function} supplement
 * @prop {function} terminate
 */


/**
 * @typedef {(0|1|2|3|4|5|6|7)} LogLevel
 */


/**
 * A writeable stream.
 * @typedef {object} WritableStream
 * @prop {function} write - Writes data to the string.
 */


/**
 * Optional parameters for changing the behavior of the created Logger instance.
 * @typedef CreateLoggerOptions
 * @prop {object} buffer - Enables and controls how buffering behavior.
 * @prop {string} buffer.delimiter - Delimiter between buffered log records.
 * @prop {number} buffer.interval - Milliseconds between buffer flushes.
 * @prop {number} buffer.size - High water mark for the buffer (in bytes).
 * @prop {string} encoding - Encoding to use when writing to the stream.
 * @prop {Formatter} formatter - The default formatter to be used by the Logger.
 * @prop {object} formatters - Specifies specific formatters for log levels.
 * @prop {Formatter} formatters.emerg - Formatter for emerg records.
 * @prop {Formatter} formatters.alert - Formatter for alert records.
 * @prop {Formatter} formatters.crit - Formatter to use for crit records.
 * @prop {Formatter} formatters.err - Formatter to use for err records.
 * @prop {Formatter} formatters.warning - Formatter to use for warning records.
 * @prop {Formatter} formatters.notice - Formatter to use for notice records.
 * @prop {Formatter} formatters.info - Formatter to use for info records.
 * @prop {Formatter} formatters.debug - Formatter to use for debug records.
 * @prop {LogLevel} maxLevel - Maximum level of records written to the stream.
 * @prop {WritableStream} stream - The stream to which log records are written.
 * @prop {object} supplement - Key-value pairs to include in every log record.
 */


/**
 * A versatile, high-performance logging library for Node.js.
 *
 * @module clearcut
 *
 * @prop {object} formatters Built-in formatters
 * @prop {@link DefaultFormatter} DefaultFormatter
 * @prop {@link Level} Level
 */
module.exports = {
  /**
   * A factory method for constructing instances of Logger.
   *
   * @method createLogger
   *
   * @param {CreateLoggerOptions} [options]
   *
   * @returns {@link Logger}
   */
  createLogger,

  formatters: {
    DefaultFormatter,
  },

  Level,
};
