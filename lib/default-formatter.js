'use strict';

const elv = require('elv');
const superstring = require('json-superstring');


//
// ERROR MESSAGES
//


const msg = {
  argDateFormat: 'Date format values must be one of: js, epoch, iso',
  argEnabled: 'The enabled option must be a Boolean for field: ',
  argEnableSafe: 'The enableSafe option must be a Boolean',
  argFieldConf: 'Field conf must be an object: ',
  argLabel: 'The label option must be a string for field: ',
  argOptionsObj: 'Argument "options" must be an object',
  argV: 'The v option value must be a number',
};


//
// CONSTANTS
//


const DEFAULT_DATE_FORMAT = 'js';
const DEFAULT_MODE = 'all';
const LOG_VERSION = 1;


//
// VALIDATORS
//


function assertFieldConfig(name, field) {
  if (typeof field !== 'object') {
    throw new TypeError(msg.argFieldConf + name);
  }

  const enabled = elv.coalesce(field.enabled, true);

  if (typeof enabled !== 'boolean') {
    throw new TypeError(msg.argEnabled + name);
  }

  const label = elv.coalesce(field.label, name);

  if (typeof label !== 'string') {
    throw new TypeError(msg.argLabel + name);
  }

  return { enabled, label };
}


function assertLevel(conf) {
  const field = elv.coalesce(conf, {});
  return assertFieldConfig('level', field);
}


function assertOccurred(conf) {
  const field = elv.coalesce(conf, {});
  const occurred = assertFieldConfig('occurred', field);
  const df = elv.coalesce(field.dateFormat, DEFAULT_DATE_FORMAT);

  if (df !== 'js' && df !== 'epoch' && df !== 'iso') {
    throw new TypeError(msg.argDateFormat);
  }

  occurred.dateFormat = df;

  return occurred;
}


function assertPid(conf) {
  const field = elv.coalesce(conf, {});
  return assertFieldConfig('pid', field);
}


function assertV(conf) {
  const field = elv.coalesce(conf, {});
  const v = assertFieldConfig('v', field);
  const val = elv.coalesce(field.dateFormat, LOG_VERSION);

  if (typeof val !== 'number') {
    throw new TypeError(msg.argV);
  }

  v.value = val;

  return v;
}


function assertStringify(mode) {
  const val = elv.coalesce(mode, DEFAULT_MODE);

  if (typeof val !== 'boolean') {
    throw new TypeError(msg.argEnableSafe);
  }

  return val;
}


//
// STRINGIFIERS
//


function allMode() {

}


function overrideMode() {

}


function safeMode() {

}


//
// JSDOC TYPE DEFINITIONS
//


/**
 * A date format value.
 * @typedef {('js'|'epoch'|'iso')} DateFormat
 */


/**
 * Provides parameters to customize formatting behavior
 *
 * @typedef {object} DefaultFormatterOptions
 *
 * @prop {boolean} enableSafe
 * @prop {object} level
 * @prop {boolean} level.enabled
 * @prop {string} level.label
 * @prop {object} occurred
 * @prop {DateFormat} occurred.dateFormat
 * @prop {boolean} occurred.enabled
 * @prop {string} occurred.label
 * @prop {object} pid
 * @prop {boolean} pid.enabled
 * @prop {string} pid.label
 * @prop {object} v
 * @prop {boolean} v.enabled
 * @prop {string} v.label
 * @prop {number} v.value
 */


//
// DATE FORMAT CLASS
//


/**
 * The default formatter used by clearcut. All log records are JSON strings.
 */
class DefaultFormatter {

  /**
   * Creates a new instance of DefaultFormatter.
   *
   * @param {DefaultFormatterOptions} options
   */
  constructor(options) {
    const opts = elv.coalesce(options, {});

    if (typeof opts !== 'object') {
      throw new TypeError(msg.argOptionsObj);
    }

    this._stringify = assertStringify(opts.mode);
    this._fields = {
      level: assertLevel(opts.level),
      occurred: assertOccurred(opts.occurred),
      pid: assertPid(opts.pid),
      v: assertV(opts.v),
    };
    this._supplement = {};
  }


  /**
   * The default date format to be used on timestamps on log records.
   *
   * @readonly
   * @type {string}
   */
  static get DEFAULT_DATE_FORMAT() { return DEFAULT_DATE_FORMAT; }


  /**
   * The default stringification and object merge mode.
   *
   * @readonly
   * @type {string}
   */
  static get DEFAULT_MODE() { return DEFAULT_MODE; }


  /**
   * The current, default version used for log records.
   *
   * @readonly
   * @type {number}
   */
  static get LOG_VERSION() { return LOG_VERSION; }


  /**
   * Clones the current instance of DefaultFormatter, and adds additional
   * supplemental data to amend to all log records.
   *
   * @param {object} data
   *
   * @returns {DefaultFormatter}
   */
  clone(data) {
  }


  /**
   * Formats a log record
   *
   * @param {number} level - The severity level of the log record
   * @param {object[]} datas - Data to include in the log record
   *
   * @returns {string}
   */
  format(level, datas) {
  }


  /**
   * Sets the supplemental data to be added to each log record.
   *
   * @param {*} data - The supplemental log data
   */
  supplement(data) {
  }


  /**
   * Sets a string value to attach to the end of all log records.
   *
   * @param {string} terminator - Value to attach to the end of all log records
   */
  terminate(terminator) {
  }

}


module.exports = DefaultFormatter;
