'use strict';

const { assert } = require('chai');

const Level = require('../../lib/level');


describe('Level', function() {

  describe('.isValid', () => {
    it('returns true if value 0', function() {
      assert.isTrue(Level.isValid(0));
    });

    it('returns true if value 1', function () {
      assert.isTrue(Level.isValid(1));
    });

    it('returns true if value 2', function () {
      assert.isTrue(Level.isValid(2));
    });

    it('returns true if value 3', function () {
      assert.isTrue(Level.isValid(3));
    });

    it('returns true if value 4', function () {
      assert.isTrue(Level.isValid(4));
    });

    it('returns true if value 5', function () {
      assert.isTrue(Level.isValid(5));
    });

    it('returns true if value 6', function () {
      assert.isTrue(Level.isValid(6));
    });

    it('returns true if value 7', function () {
      assert.isTrue(Level.isValid(0));
    });

    it('returns true if value emerg', function () {
      assert.isTrue(Level.isValid('emerg'));
    });

    it('returns true if value alert', function () {
      assert.isTrue(Level.isValid('alert'));
    });

    it('returns true if value crit', function () {
      assert.isTrue(Level.isValid('crit'));
    });

    it('returns true if value err', function () {
      assert.isTrue(Level.isValid('err'));
    });

    it('returns true if value warning', function () {
      assert.isTrue(Level.isValid('warning'));
    });

    it('returns true if value notice', function () {
      assert.isTrue(Level.isValid('notice'));
    });

    it('returns true if value info', function () {
      assert.isTrue(Level.isValid('info'));
    });

    it('returns true if value info', function () {
      assert.isTrue(Level.isValid('info'));
    });

    it('returns false if value is invalid', function () {
      assert.isFalse(Level.isValid(42));
    });
  });


  describe('.assert', function() {
    it('throws if invalid numeric log level', function() {
      assert.throws(() => {
        Level.assert(42);
      }, TypeError);
    });

    it('throws if invalid keyword log level', function () {
      assert.throws(() => {
        Level.assert('blah');
      }, TypeError);
    });

    it('does not throw if valid numeric log level', function() {
      assert.doesNotThrow(() => {
        Level.assert(3);
      });
    });

    it('does not throw if valid keyword log level', function() {
      assert.doesNotThrow(() => {
        Level.assert('crit');
      });
    });

    it('throws if given non-numeric or string', function() {
      assert.throws(() => {
        Level.assert({});
      }, TypeError);
    });
  });


  describe('.valueOf', function() {
    it('throws if invalid log level', function() {
      assert.throws(() => {
        Level.valueOf(42);
      }, TypeError);
    });

    it('returns the numeric value if given a numeric', function() {
      const level = 4;
      const result = Level.valueOf(level);
      assert.strictEqual(result, level);
    });

    it('returns 0 for emerg', function() {
      const level = 'emerg';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });

    it('returns 0 for alert', function () {
      const level = 'alert';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });

    it('returns 0 for crit', function () {
      const level = 'crit';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });

    it('returns 0 for err', function () {
      const level = 'err';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });

    it('returns 0 for warning', function () {
      const level = 'warning';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });

    it('returns 0 for notice', function () {
      const level = 'notice';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });

    it('returns 0 for info', function () {
      const level = 'info';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });

    it('returns 0 for debug', function () {
      const level = 'debug';
      const result = Level.valueOf(level);
      assert.strictEqual(result, Level[level]);
    });
  });

});
