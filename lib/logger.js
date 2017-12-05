'use strict';

const { EventEmitter } = require('events');
const Fs = require('fs');

const elv = require('elv');

const DefaultFormatter = require('./default-formatter');
const Level = require('./level');


//
// ERROR MESSAGES
//


const msg = {
  argBufferInterval: 'Buffer interval must be a positive integer',
  argBufferObj: 'Buffer options must be an object',
  argBufferSize: 'Buffer size must be a positive integer',
  argDataObj: 'Argument "data" must be an object',
  argEncoding: 'Encoding values must be a string',
  argFormatter: 'Formatters must have format() and supplement() methods',
  argOptsObj: 'Argument "options" must be an object',
  argParentLogger: 'Parent loggers must be an instance of Logger',
  argStream: 'Streams must be an object with a write() method',
  argSupplement: 'Supplemental values must be an object.',
};


//
// FORMATTER FUNCTIONS
//


function assertFormatter(formatter, defaultFormatter, supplement) {
  const result = elv.coalesce(formatter, defaultFormatter);

  if (typeof result.format !== 'function'
      || typeof result.supplement !== 'function'
      || typeof result.terminate !== 'function'
      || typeof result.clone !== 'function') {
    throw new TypeError(msg.argFormatter);
  }

  result.supplement(supplement);

  return result;
}


function setFormatter(name, formatters, settings, fmap) {
  const f = formatters;
  const current = settings[name];
  if (!elv(current)) return;

  const existing = fmap.get(current);
  if (elv(existing)) {
    f[name] = existing;
    return;
  }

  const formatter = current.clone();
  fmap.set(current, formatter);
  f[name] = formatter;
}


//
// CONSTANTS
//


const DEFAULT_ENCODING = 'utf8';
const DEFAULT_SIZE = 4096;
const DEFAULT_FD = 1;


/**
 * The primary application container for clearcut. Contains methods for writing
 * log data.
 *
 * @extends EventEmitter
*/
class Logger extends EventEmitter {

  /** @private */
  constructor(options) {
    super();

    const opts = elv.coalesce(options, {});

    if (typeof opts !== 'object') {
      throw new TypeError(msg.argOptsObj);
    }

    const { parent } = opts;
    const isChild = elv(parent);

    if (isChild && !(parent instanceof Logger)) {
      throw new TypeError(msg.argParentLogger);
    }

    const maxLevel = elv.coalesce(opts.maxLevel, Level.info);
    Level.assert(maxLevel);

    const { supplement } = opts;

    if (elv(supplement) && typeof supplement !== 'object') {
      throw new TypeError(msg.argSupplement);
    }

    const encoding = elv.coalesce(opts.encoding, DEFAULT_ENCODING);

    if (typeof encoding !== 'string') {
      throw new TypeError(msg.argEncoding);
    }

    const stream = elv.coalesce(opts.stream, process.stdout);

    if (typeof stream !== 'object' || typeof stream.write !== 'function') {
      throw new TypeError(msg.argStream);
    }

    const formatter = elv.coalesce(
      opts.formatter,
      () => new DefaultFormatter()
    );

    assertFormatter(formatter);

    const formatters = elv.coalesce(opts.formatters, {});
    const emerg = assertFormatter(formatters.emerg, formatter, supplement);
    const alert = assertFormatter(formatters.alert, formatter, supplement);
    const crit = assertFormatter(formatters.crit, formatter, supplement);
    const err = assertFormatter(formatters.err, formatter, supplement);
    const warning = assertFormatter(formatters.warning, formatter, supplement);
    const notice = assertFormatter(formatters.notice, formatter, supplement);
    const info = assertFormatter(formatters.info, formatter, supplement);
    const debug = assertFormatter(formatters.debug, formatter, supplement);

    let isBuffering = elv(opts.buffer);
    const buffer = {
      interval: 30000,
      length: 512,
      value: '',
    };

    if (isBuffering) {
      if (typeof opts.buffer !== 'object') {
        throw new TypeError(msg.argBufferObj);
      }

      buffer.interval = elv.coalesce(opts.buffer.interval, buffer.interval);

      if (!Number.isInteger(buffer.interval) || buffer.interval < 0) {
        throw new TypeError(msg.argBufferInterval);
      }

      const size = elv.coalesce(opts.buffer.size, DEFAULT_SIZE);

      if (!Number.isInteger(size) || size < 0) {
        throw new TypeError(msg.argBufferSize);
      }

      buffer.length = (size + (size % 8)) / 8;

      if (buffer.length === 0) isBuffering = false;
    }

    this._buffer = buffer;
    this._encoding = encoding;
    this._fd = DEFAULT_FD;
    this._isBuffering = isBuffering;
    this._isChild = isChild;
    this._formatters = {
      emerg,
      alert,
      crit,
      err,
      warning,
      notice,
      info,
      debug,
    };
    this._maxLevel = Level.valueOf(maxLevel);
    this._parent = parent;
    this._settings = opts;
    this._stream = stream;
    this._supplement = elv.coalesce(supplement, {});
  }


  //
  // PROPERTIES
  //


  /**
   * The encoding used when writing log records to the stream.
   *
   * @readonly
   * @type {string}
   */
  get encoding() { return this._encoding; }


  /**
   * Whether or not buffering is enabled.
   *
   * @readonly
   * @type {boolean}
   */
  get isBuffering() { return this._isBuffering; }


  /**
   * Whether or not the Logger is a child logger.
   *
   * @readonly
   * @type {boolean}
   */
  get isChild() { return this._isChild; }


  /**
   * The maximum log level of records the Logger will write to the stream.
   *
   * @readonly
   * @type {number}
   */
  get maxLevel() { return this._maxLevel; }


  /**
   * A reference to the Logger's parent Logger.  The value is null if the Logger
   * is not a child.
   *
   * @readonly
   * @type {Logger}
   */
  get parent() { return this._parent; }


  /**
   * A reference to the Stream to which the Logger writes data.
   *
   * @readonly
   * @type {@link: Stream}
   */
  get stream() { return this._stream; }


  //
  // WRITING
  //


  /** @private */
  _write(sync, value) {
    // flatten out the value string before writing to the stream
    Number(value);

    if (sync) {
      Fs.writeSync(this._fd, value);
      return;
    }

    this._stream.write(value, this._encoding);
  }


  //
  // BUFFERING
  //


  /** @private */
  _flush(sync) {
    if (!this._isBuffering) return;

    this.emit('flushed');

    const { value } = this._buffer;
    this._buffer.value = '';
    this._write(sync, value);
  }


  /**
   * If buffering is enabled, the buffer is flushed to the `Logger`'s stream.
   *
   * @returns {Logger}
   */
  flush() {
    this._flush(false);
    return this;
  }


  /**
   * If buffering is enabled, the buffer is flushed to the `Logger`'s stream.
   *
   * @returns {Logger}
   */
  flushSync() {
    this._flush(true);
    return this;
  }


  /** @private */
  onFd(fd) {
    this._fd = fd;
    this.emit('fd-resolved', fd);
  }


  //
  // CHILD LOGGERS
  //


  /**
   * Creates a new Logger as a child of the current Logger.
   *
   * @param {object} data
   *
   * @returns {Logger}
   */
  child(data) {
    if (!elv(data) || typeof data !== 'object') {
      throw new TypeError(msg.argDataObj);
    }

    const fmap = new Map();
    const options = {
      parent: this,
      stream: this._settings.stream,
      supplement: Object.assign(this._supplement, data),
    };

    if (elv(this._settings.buffer)) {
      options.buffer = Object.assign(this._settings.buffer);
    }

    if (elv(this._settings.encoding)) {
      options.encoding = this._settings.encoding;
    }

    if (elv(this._settings.formatter)) {
      options.formatter = this._settings.formatter.clone();
      fmap.set(this._settings.formatter, options.formatter);
    }

    if (elv(this._settings.formatters)) {
      options.formatters = {};
      const { formatters } = options;
      const current = this._settings.formatters;

      setFormatter('emerg', formatters, current, fmap);
      setFormatter('alert', formatters, current, fmap);
      setFormatter('crit', formatters, current, fmap);
      setFormatter('err', formatters, current, fmap);
      setFormatter('warning', formatters, current, fmap);
      setFormatter('notice', formatters, current, fmap);
      setFormatter('info', formatters, current, fmap);
      setFormatter('debug', formatters, current, fmap);
    }

    if (elv(this._settings.maxLevel)) {
      options.maxLevel = this._settings.maxLevel;
    }

    return new Logger(options);
  }


  //
  // LOGGERS
  //


  /** @private */
  _log(formatter, level, data) {
    if (level > this.maxLevel) return this;

    const record = formatter.format(level, data);

    if (this._isBuffering) {
      this._buffer.value += record;
      if (this._buffer.value.length < this._buffer.length) return this;
      return this.flush();
    }

    this._write(false, record);

    return this;
  }


  /**
   * Writes a log entry using the EMERGENCY (0) log level. Indicate that the
   * system is down.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  emerg(...data) {
    return this._log(this.formatters.emerg, Level.emerg, data);
  }


  /**
   * Writes a log entry using the ALERT (1) log level. Indicates an imminent
   * system outage.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  alert(...data) {
    return this._log(this.formatters.alert, Level.alert, data);
  }


  /**
   * Writes a log entry using the critical (2) log level. Indicates that the
   * system is in a degraded state.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  crit(...data) {
    return this._log(this.formatters.crit, Level.crit, data);
  }


  /**
   * Writes a log entry using the ERROR (3) log level. Indicates that an
   * unexpected application error has occurred.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  err(...data) {
    return this._log(this.formatters.err, Level.err, data);
  }


  /**
   * Writes a log entry using the warning (4) log level. Indicates that a
   * nonfatal issue has occurred.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  warning(...data) {
    return this._log(this.formatters.warning, Level.warning, data);
  }


  /**
   * Writes a log entry using the notice (5) log level. Indicates an unusual,
   * but nonfatal, event.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  notice(...data) {
    return this._log(this.formatters.notice, Level.notice, data);
  }


  /**
   * Writes a log entry using the informational (6) log level. Indicates an
   * operational message.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  info(...data) {
    return this._log(this.formatters.info, Level.info, data);
  }


  /**
   * Writes a log entry using the debug (7) log level. Indicates verbose
   * debugging and trace data.
   *
   * @param {...object} data
   *
   * @returns {Logger} The current Logger instance.
   */
  debug(...data) {
    return this._log(this.formatters.debug, Level.debug, data);
  }

}


module.exports = Logger;
