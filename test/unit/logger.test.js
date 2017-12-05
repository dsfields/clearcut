'use strict';

const { assert } = require('chai');

const Level = require('../../lib/level');
const Logger = require('../../lib/logger');


class TestFormatter {
  constructor() {
    this.cloned = 0;
  }

  clone() {
    this.cloned++;
    return this;
  }

  /* eslint-disable class-methods-use-this */
  format() { }
  supplement() { }
  terminate() { }
  /* eslint-enable class-methods-use-this */
}


describe('Logger', function() {

  describe('.constructor', function() {
    const formatter = new TestFormatter();

    it('throws if options not object', function() {
      assert.throws(() => {
        const logger = new Logger(42);
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('throws if parent not Logger', function() {
      assert.throws(() => {
        const logger = new Logger({ parent: 42 });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('throws if supplement not object', function() {
      assert.throws(() => {
        const logger = new Logger({ supplement: 42 });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if supplement an object', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ supplement: {} });
        assert.isOk(logger);
      });
    });

    it('throws if maxLevel an invalid log level', function() {
      assert.throws(() => {
        const logger = new Logger({ maxLevel: 42 });
        assert.isNotOk(logger);
      });
    });

    it('sets maxLevel', function() {
      const logger = new Logger({ maxLevel: Level.debug });
      assert.strictEqual(logger.maxLevel, Level.debug);
    });

    it('defaults maxLevel to info', function() {
      const logger = new Logger();
      assert.strictEqual(logger.maxLevel, Level.info);
    });

    it('coerces maxLevel to numeric if given string', function() {
      const logger = new Logger({ maxLevel: 'debug' });
      assert.strictEqual(logger.maxLevel, Level.debug);
    });

    it('throws if formatter not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatter: 42 });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('throws if formatter does not have clone method', function() {
      assert.throws(() => {
        const logger = new Logger({
          formatter: {
            format: () => {},
            supplement: () => {},
            terminate: () => {},
          },
        });
        assert.isNotOk(logger);
      });
    });

    it('throws if formatter does not have format method', function() {
      assert.throws(() => {
        const logger = new Logger({
          formatter: {
            clone: () => {},
            supplement: () => {},
            terminate: () => {},
          },
        });
        assert.isNotOk(logger);
      });
    });

    it('throws if formatter does not have supplement method', function() {
      assert.throws(() => {
        const logger = new Logger({
          formatter: {
            clone: () => {},
            format: () => {},
            terminate: () => {},
          },
        });
        assert.isNotOk(logger);
      });
    });

    it('throws if formatter does not have terminate method', function() {
      assert.throws(() => {
        const logger = new Logger({
          formatter: {
            clone: () => {},
            format: () => {},
            supplement: () => {},
          },
        });
        assert.isNotOk(logger);
      });
    });

    it('does not throw if formatter a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatter });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.emerg not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { emerg: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.emerg a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { emerg: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.alert not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { alert: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.alert a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { alert: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.crit not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { crit: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.crit a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { crit: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.err not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { err: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.err a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { err: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.warning not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { warning: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.warning a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { warning: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.notice not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { notice: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.notice a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { notice: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.info not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { info: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.info a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { info: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if formatters.debug not a formatter', function() {
      assert.throws(() => {
        const logger = new Logger({ formatters: { debug: 42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if formatters.debug a formatter', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ formatters: { debug: formatter } });
        assert.isOk(logger);
      });
    });

    it('throws if buffer not object', function() {
      assert.throws(() => {
        const logger = new Logger({ buffer: 42 });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if buffer is object', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ buffer: {} });
        assert.isOk(logger);
      });
    });

    it('throws if buffer interval not integer', function() {
      assert.throws(() => {
        const logger = new Logger({ buffer: { interval: 'abc' } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('throws if buffer interval less than 0', function() {
      assert.throws(() => {
        const logger = new Logger({ buffer: { interval: -42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if buffer interval integer', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ buffer: { interval: 42000 } });
        assert.isOk(logger);
      });
    });

    it('throws if buffer size not integer', function() {
      assert.throws(() => {
        const logger = new Logger({ buffer: { size: 'abc' } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('throws if buffer size less than 0', function() {
      assert.throws(() => {
        const logger = new Logger({ buffer: { size: -42 } });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if buffer size integer', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({ buffer: { size: 42000 } });
        assert.isOk(logger);
      });
    });

    it('disables buffering if size is set to 0', function() {
      const logger = new Logger({ buffer: { size: 0 } });
      assert.isFalse(logger.isBuffering);
    });

    it('throws if stream does not contain a write method', function() {
      assert.throws(() => {
        const logger = new Logger({ stream: {} });
        assert.isNotOk(logger);
      }, TypeError);
    });

    it('does not throw if stream contains a write method', function() {
      assert.doesNotThrow(() => {
        const logger = new Logger({
          stream: { write: () => {} },
        });
        assert.isOk(logger);
      });
    });
  });


  describe('#child', function() {
    beforeEach(function() {
      this.formatter = new TestFormatter();
    });

    it('throws if data null', function() {
      const parent = new Logger();

      assert.throws(() => {
        parent.child(null);
      }, TypeError);
    });

    it('throws if data undefined', function() {
      const parent = new Logger();

      assert.throws(() => {
        parent.child();
      }, TypeError);
    });

    it('throws if data not object', function() {
      const parent = new Logger();

      assert.throws(() => {
        parent.child(42);
      }, TypeError);
    });

    it('enables buffering in child if enabled in parent', function() {
      const parent = new Logger({ buffer: {} });
      const child = parent.child({ foo: 'bar' });
      assert.isTrue(child.isBuffering);
    });

    it('disables buffering in child if disabled in parent', function() {
      const parent = new Logger();
      const child = parent.child({ foo: 'bar' });
      assert.isFalse(child.isBuffering);
    });

    it('sets parent to parent logger', function() {
      const parent = new Logger();
      const child = parent.child({ foo: 'bar' });
      assert.strictEqual(child.parent, parent);
    });

    it('sets isChild to true', function() {
      const parent = new Logger({ buffer: {} });
      const child = parent.child({ foo: 'bar' });
      assert.isTrue(child.isChild);
    });

    it('set encoding to same as parent', function() {
      const parent = new Logger({ encoding: 'ascii' });
      const child = parent.child({ foo: 'bar' });
      assert.strictEqual(child.encoding, parent.encoding);
    });

    it('sets stream to same as parent', function() {
      const stream = { write: () => {} };
      const parent = new Logger({ stream });
      const child = parent.child({ foo: 'bar' });
      assert.strictEqual(child.stream, parent.stream);
    });

    it('sets maxLevel to same as parent', function() {
      const parent = new Logger({ maxLevel: Level.err });
      const child = parent.child({ foo: 'bar' });
      assert.strictEqual(child.maxLevel, parent.maxLevel);
    });

    it('clones formatter from parent', function() {
      const parent = new Logger({ formatter: this.formatter });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones emerg formatter from parent', function() {
      const parent = new Logger({ formatters: { emerg: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones alert formatter from parent', function() {
      const parent = new Logger({ formatters: { alert: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones crit formatter from parent', function() {
      const parent = new Logger({ formatters: { crit: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones err formatter from parent', function() {
      const parent = new Logger({ formatters: { err: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones warning formatter from parent', function() {
      const parent = new Logger({ formatters: { warning: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones notice formatter from parent', function() {
      const parent = new Logger({ formatters: { notice: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones info formatter from parent', function() {
      const parent = new Logger({ formatters: { info: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones debug formatter from parent', function() {
      const parent = new Logger({ formatters: { debug: this.formatter } });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { emerg: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones emerg formatter from parent only once', function() {
      const parent = new Logger({
        formatters: {
          emerg: this.formatter,
          alert: this.formatter,
        },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones alert formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { alert: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones crit formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { crit: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones err formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { err: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones warning formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { warning: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones notice formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { notice: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones info formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { info: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });

    it('clones debug formatter from parent only once', function() {
      const parent = new Logger({
        formatter: this.formatter,
        formatters: { debug: this.formatter },
      });
      parent.child({ foo: 'bar' });
      assert.strictEqual(this.formatter.cloned, 1);
    });
  });


  describe('#flush', function() {

  });


  describe('#flushSync', function () {

  });


  describe('#emerg', function () {

  });


  describe('#alert', function () {

  });


  describe('#crit', function () {

  });


  describe('#err', function () {

  });


  describe('#warning', function () {

  });


  describe('#notice', function () {

  });


  describe('#info', function () {

  });


  describe('#debug', function () {

  });

});
