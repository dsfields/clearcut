# clearcut

A versatile, high-performance logging library.  Log levels follow semantics found in the broadly-adopted [RFC 5424 (syslog)](https://tools.ietf.org/html/rfc5424) standard.  The `clearcut` module is built on the premise that your logging library should have as small an impact on performance as possible, and, thus, defer transformation and transport logic to another process.

__Table of Contents__

* [Usage](#usage)
* [Log Levels](#log-levels)
* [API](#api)
  + [Module Interface](#module-interface)
  + [Method: `createLogger()`](#method-createloggeroptions)
  + [Formatters](#formatters)
  + [Class: `Logger`](#class-logger)
* [Considerations](#considerations)
  + [Max Logging Level](#max-logging-level)
  + [Buffering](#buffering)
  + [Custom Formatter Behavior](#custom-formatter-behavior)

## Usage

Install with NPM:

```sh
$ npm install clearcut -S
```

Then create loggers using `clearcut`:

```js
const Http = require('http');

const Clearcut = require('clearcut');
const { ElfFormatter } = require('clearcut-elf'); // extended log format

const requestLogger = Clearcut.createLogger({
  stream: Socket.connect('/logging/logstash.sock'),
  formatter: new ElfFormatter({ fields: ['time', 'cs-method', 'cs-uri'] }),
  buffer: {
    size: 200,
  },
});

const server = Http.createServer((req, res) => {
  logger.info(req);
  // do something smart
  res.end();
});

server.on('error', (error) => {
  logger.err(error);
  logger.flush();
});
```

## Log Levels

The `clearcut` module uses [RFC 5424](https://tools.ietf.org/html/rfc5424) syslog-style logging levels.  This is a widely-used, well understood standard, and is suitable for the vast majority of logging use cases.

| Name          | Value | Keyword   | Description                  | Intervention Required |
|---------------|-------|-----------|------------------------------|-----------------------|
| EMERGENCY     | 0     | `emerg`   | System is down               | Y                     |
| ALERT         | 1     | `alert`   | Outage imminent              | Y                     |
| CRITICAL      | 2     | `crit`    | System degraded              | Y                     |
| ERROR         | 3     | `err`     | Unexpected application error | Y                     |
| WARNING       | 4     | `warning` | Nonfatal issue               | Y                     |
| NOTICE        | 5     | `notice`  | Unusual event                | N                     |
| INFORMATIONAL | 6     | `info`    | Operational message          | N                     |
| DEBUG         | 7     | `debug`   | Verbose debugging message    | N                     |

## API

### Module Interface

The `clearcut` module provides a simple interface for creating loggers:

* [`createLogger()`](#method-createLoggeroptions): a factory method for constructing instances of [`Logger`](#class-logger).

* [`formatters`](#built-in-formatters): a property containing references to all built-in formatters.

* [`Level`](#enum-level): an enumeration of all log levels.

### Method: `createLogger([options])`

A factory method for constructing instances of [`Logger`](#class-logger).

_Arguments_

* `options`: _(optional)_ an object that dictates the behavior of the created `Logger` instance.  This object can have the following properties:

  + `buffer`: _(optional)_ an object that indicates how the `Logger` instance buffers log data before being written to the stream.  By default, a `Logger` will immediately write to the stream upon receiving log data.  If this the `buffer` key is set, then buffering is enabled.  If enabled, logging performance can be greatly increased, [but there are caveats](#buffering).  This object can have the following properties:

    - `delimiter`: _(optional)_ a string indicating how buffered records are delimited when written to the stream.  Buffered records are held in memory as a large, concatenated string.  By writing at all records in a single push to the stream, a great amount of latency can be saved.  This option specifies each record is delimited.  The default is `\n`.

    - `interval` _(optional)_ an integer indicating the number of milliseconds to wait before flushing the buffer to the stream.  This can be used in conjunction with `size` to ensure log data is flushed to the stream in periods where the buffer is not being maxed out, and flushing is not occurring.  If buffering is enabled, the default is `30000` (30 seconds).  If set to `0`, interval flushing is disabled.

    - `size`: _(optional)_ an integer indicating the size of the buffer in bytes, before the buffer is drained to the stream.  The default is `4096`.  All values are rounded up to the nearest octet.

  + `encoding`: _(optional)_ a string specifying the encoding to use when writing data to the stream.  The default is `utf8`.

  + `formatter`: _(optional)_ an object containing a `format()` method, which is used to amend and serialize log data before pushing to the stream.  [See below](#formatters) for more information.  If a formatter is set for specific log levels using the `formatters` option, the `formatter` option functions as the default formatter.

  + `formatters`: _(optional)_ an object whose allowable keys are syslog keywords.  Values are an object containing a `format()` method, which is used to amend and serialize log data for log records with the corresponding log level before pushing to the stream.

  + `maxLevel`: _(optional)_ an integer from `0` to `7` indicating the maximum logging level of entries that can be written to the stream.  The default is `6` (INFO).

  + `stream`: _(optional)_ the [`Stream`](https://nodejs.org/api/stream.html) object to which log data is written.  If omitted, [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout) is used.

  + `supplement`: _(optional)_ an object containing key-value pairs to append to every log record.

_Returns_

An instance of `Logger`.

_Example_

```js
const Clearcut = require('clearcut');
const KeyValueFormatter = require('clearcut-kv');
const { Socket } = require('net');

const { DefaultErrorFormatter } = Clearcut.formatters;

const logstashSocket = Socket.connect('/logging/logstash.sock');

const logger = Clearcut.createLogger({
  buffer: {                           // enable buffering
    size: 500,                        // change the size of the buffer 500
    interval: 60000,                  // ensure buffer is flushed every 60 sec
  },
  formatter: new KeyValueFormatter(), // use the key-value message formatter
  formatters: {
    err: new DefaultFormatter(),      // use DefaultFormatter for err
  },
  maxLevel: Clearcut.Level.debug,     // log debug messages
  stream: logstashSocket,             // send data to a Unix domain socket
  supplement: { foo: 'bar' },         // add "foo: 'bar'" eo every log record
});
```

### Formatters

Formatters are the brains of `clearcut` loggers.  They contain all logic for asserting valid log records, amending log data, and preparing messages to be written to the stream.

#### Class: `DefaultFormatter`

The default formatter used by `clearcut`.  All log records are JSON strings, and amend the following keys:

* `level`: an integer that represents the log level of the record.

* `occurred`: a date/time stamp that is either an integer representing milliseconds since epoch, or a string in [ISO 8601 Extended](https://www.iso.org/iso-8601-date-and-time-format.html) format.  The format depends on what was specified for the `dateFormat` option on the constructor.

* `pid`: an integer value representing the ID of the current process.

* `v`: an integer representing the version of the log data format.  This is the same value of the constant `DefaultFormatter.LOG_VERSION`.

##### `new DefaultFormatter([options])`

The constructor for `DefaultFormatter`.

_Arguments_

* `options`: _(optional)_ an object with the following properties:

  + `dateFormat`: _(optional)_ a string with following possible values:

    - `js`: tells the formatter to use [JavaScript time](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now) for all date/time values amended to log records.  This is the default.

    - `iso`: tells the formatter to use ISO 8601 Extended strings for all date/time values amended to log records.

_Example_

```js
const Clearcut = require('clearcut');

const { DefaultFormatter } = Clearcut.formatters;

const logger = Clearcut.createLogger({
  formatter: new DefaultFormatter({
    dateFormat: 'iso' // use ISO date format for timestamps on log records
  }),
});
```

##### `DefaultFormatter.LOG_VERSION`

An integer value specifying the version number amended to all log records.  The current version is `1`.

##### `DefaultFormatter.prototype.clone()`

Make a copy of the formatter instance.  This is called by the `Logger` clause when making child instances.

_Returns_

A new instance of `DefaultFormatter`.

_Example_

```js
const Clearcut = require('clearcut');

const { DefaultFormatter } = Clearcut.formatters;

const formatter = new DefaultFormatter();
formatter.supplement({foo: 'bar' });

const cloned = formatter.clone();

// The cloned formatter is basically a copy of the original.  The following
// method call overwrites its internal supplemental data.
cloned.supplement({ baz: 'qux' });
```

##### `DefaultFormatter.prototype.format(level, datas)`

Converts log data into a record to be written to a logger stream.

_Arguments_

* `level`: _(required)_ an integer value representing the level of the log record.

* `datas`: _(required)_ an array of objects containing key-value pairs to be merged into a single log record.

_Returns_

A string in JSON format.

_Example_

```js
const Clearcut = require('clearcut');

const { DefaultFormatter } = Clearcut.formatters;
const { Level } = Clearcut;

const formatter = new DefaultFormatter();

console.log(formatter.format(Level.emerg, [{ foo: 'bar' }]));
// { "level": 0, "occurred": 1511231899091, "pid": 42, "v": 1, "foo": "bar" }
```

##### `DefaultFormatter.prototype.supplement(data)`

Sets supplementary key-value pairs to include in every log record.  The `Logger` class calls this method with the value of `options.supplement` when processing options in its constructor.

_Arguments_

* `data`: _(required)_ an object whose keys and values are to be written to each log record.

_Example_

```js
const Clearcut = require('clearcut');

const { DefaultFormatter } = Clearcut.formatters;
const { Level } = Clearcut;

const formatter = new DefaultFormatter();

formatter.supplement({ chips: 'chocolate', nuts: 'macadamia' });

console.log(formatter.format(Level.info, [{ msg: 'Yum!' }]));
// { "level": 6, "occurred": 1511231899091, "pid": 42, "v": 1, "chips": "chocolate", "nuts": "macadamia", "msg": "Yum!" }
```

##### `DefaultFormatter.prototype.terminate(terminator)`

Sets a string used to append to the end of log records.  The `Logger` class calls this method with the value of `options.buffer.delimiter` when processing buffer options in its constructor.

_Arguments_

* `terminator`: _(required)_ a string to append to the end of each log record.

_Example_

```js
const Clearcut = require('clearcut');

const { DefaultFormatter } = Clearcut.formatters;
const { Level } = Clearcut;

const formatter = new DefaultFormatter();

formatter.terminate(',');

console.log(formatter.format(Level.info, [{ msg: 'Cookies!' }]));
// { "level": 6, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "Cookies!" },
```

#### Custom

A formatter is simply an object that implements the interface:

* `clone()`

  Make a copy of the formatter instance.  This is called by the `Logger` class when making child instances.

  _Returns_

  A new formatter instance.

* `format(level, datas)`

  Responsible for turning log data into a single log record.

  _Arguments_

  + `level`: _(required)_ an integer representing the level of the log record.

  + `datas`: _(required)_ an array of objects containing key-value pairs to be merged into a single log record.

  _Returns_

  A string value representing the log record to be written to the stream.

* `supplement(data)`

  Informs the formatter of additional data to include with every log record.  The `Logger` class calls this method with the value of `options.supplement` when processing options in its constructor.  This method should overwrite any existing supplemental data.

  _Arguments_

  + `data`: _(required)_ an object whose keys and values are to be written to each log record.

* `terminate(terminator)`

  Sets a string used to append to the end of log records.  The `Logger` class calls this method with the value of `options.buffer.delimiter` when processing buffer options in its constructor.

Formatters contain all of the logic for asserting log contracts, and serialization.  They do not have any built-in restrictions, but there are [best practices for creating new formatters](#custom-formatter-behavior).

_Example_

Generally, you would never work directly with a formatter.  The following is here to illustrate its intended behavior.

```js
const Clearcut = require('clearcut');
const elv = require('elv');

const formatter = {
  _supplement: {},

  format: function (level, datas) {
    let record = Object.assign(
      { level, foo: 'bar' }),
      this._supplement,
      ...datas
    );
    return JSON.stringify(record) + elv.coalesce(this._terminator, '');
  },

  supplement: function (data) {
    this._supplement = data;
  },

  terminate: function (terminator) {
    this._terminator = terminator;
  }
};

const logger = Clearcut.createLogger({
  buffer: {
    delimiter: ',',
  },
  formatter,
  supplement: { baz: 'qux' },
});

logger.info({ msg: 'These cookies are delicious!' });
// { "level": 6, "foo": "bar", "baz": "qux", "msg": "These cookies are delicious!" },
```

### Enum: `Level`

An enumeration of all log levels:

* `emerg`: 0
* `alert`: 1
* `crit`: 2
* `err`: 3
* `warning`: 4
* `notice`: 5
* `info`: 6
* `debug`: 7


### Class: `Logger`

The `Logger` class is `clearcut`'s primary application container.  It contains all of the methods and logic for writing log data.

#### `Logger.prototype.isChild`

Gets a Boolean value that is `true` if the `Logger` instance is a child logger.

#### `Logger.prototype.parent`

Gets the parent `Logger` instance if it is a child logger.  Otherwise, this property is `null`.

#### `Logger.prototype.alert(...data)`

Writes a log record with the "ALERT" level (1).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.alert({ msg: 'The cookies are burning.' });
// { "level": 1, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "The cookies are burning." }
```

#### `Logger.prototype.child(...data)`

Clones the `Logger` instance, and includes addition data in each log record.

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into every log record written by the `Logger` instance.

_Returns_

A new `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger({
  value: { foo: 'bar' }
});

const child = logger.child({ baz: 'qux' });

child.info({ msg: 'Yummy cookies.' });
// { "level": 6, "occurred": 1511231899091, "pid": 42, "v": 1, "foo": "bar", "baz": "qux", "msg": "Yummy cookies." }
```

#### `Logger.prototype.crit(...data)`

Writes a log record with the "CRITICAL" level (2).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.crit({ msg: 'The cookies are overdone.' });
// { "level": 2, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "The cookies are overdone." }
```

#### `Logger.prototype.debug(...data)`

Writes a log record with the "DEBUG" level (7).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.debug({ msg: 'Preheating oven.' });
// { "level": 7, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "Preheating oven." }
```

#### `Logger.prototype.emerg(...data)`

Writes a log record with the "EMERGENCY" level (0).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.emerg({ msg: 'The cookies are on fire.' });
// { "level": 0, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "The cookies are on fire." }
```

#### `Logger.prototype.err(...data)`

Writes a log record with the "ERROR" level (3).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.err({ msg: 'The oven blew up.' });
// { "level": 3, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "The oven blew up." }
```

#### `Logger.prototype.flush()`

If buffering is enabled, the buffer is flushed to the `Logger`'s stream.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger({
  buffer: {},
});

logger.info({ msg: 'Baking cookies.' });
logger.flush();
```

#### `Logger.prototype.info(...data)`

Writes a log record with the "INFO" level (6).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.info({ msg: 'Cookies are done baking.' });
// { "level": 6, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "Cookies are done baking." }
```

#### `Logger.prototype.notice(...data)`

Writes a log record with the "NOTICE" level (5).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.notice({ msg: 'The cookies took 5 minutes longer to back than normal.' });
// { "level": 5, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "The cookies took 5 minutes longer to back than normal." }
```

#### `Logger.prototype.warning(...data)`

Writes a log record with the "WARNING" level (4).

_Arguments_

* `...data`: _(required)_ n number of objects containing key-value pairs to be merged into a single log record.

_Returns_

The `Logger` instance.

_Example_

```js
const Clearcut = require('clearcut');

const logger = Clearcut.createLogger();

logger.warning({ msg: 'You forgot to preheat the oven.' });
// { "level": 4, "occurred": 1511231899091, "pid": 42, "v": 1, "msg": "You forgot to preheat the oven." }
```

## Considerations

### Max Logging Level

The primary use case for the `DEBUG` log level is for tracing application logic during development.  This is normally information that is not necessary for monitoring operations, and, because of its verbosity, it is not recommended for use in production.

### Buffering

The `clearcut` module's buffering functionality is a powerful tool for increasing logging performance.  By writing data to the stream in fewer but larger chunks, latency is greatly reduced.  The trade off is an increased chance for data loss.  If your Node.js process crashes between flush cycles then any data still in memory, and not pushed to the stream, will be lost.

Buffered records are written as a single string to the stream.  Each record is delimited with, by default, a `\n` character.  This may cause problems with some log aggregators that rely on events to delimit records.

### Custom Formatter Behavior

Formatters offer a lot of flexibility.  The `clearcut` module is designed to be as unopinionated as possible, and does not put constraints around the internal implementation of formatters.  Because of this, it is possible to write formatters with a great deal of transformation and transport logic.  This is regarded as a misuse of the power afforded by formatters, as it violates `clearcut`'s design principal that this sort of logic should be deferred to another process.  It is _highly_ recommended that you keep the logic in formatters as thin as possible.
