'use strict';

const { assert } = require('chai');

const Level = require('../../lib/level');


describe('Level', function() {

  describe('#isValid', () => {
    it('should return true if value 0', function() {
      assert.isTrue(Level.isValid(0));
    });

    it('should return true if value 1', function () {
      assert.isTrue(Level.isValid(1));
    });

    it('should return true if value 2', function () {
      assert.isTrue(Level.isValid(2));
    });

    it('should return true if value 3', function () {
      assert.isTrue(Level.isValid(3));
    });

    it('should return true if value 4', function () {
      assert.isTrue(Level.isValid(4));
    });

    it('should return true if value 5', function () {
      assert.isTrue(Level.isValid(5));
    });

    it('should return true if value 6', function () {
      assert.isTrue(Level.isValid(6));
    });

    it('should return true if value 7', function () {
      assert.isTrue(Level.isValid(0));
    });

    it('should return true if value emerg', function () {
      assert.isTrue(Level.isValid('emerg'));
    });

    it('should return true if value alert', function () {
      assert.isTrue(Level.isValid('alert'));
    });

    it('should return true if value crit', function () {
      assert.isTrue(Level.isValid('crit'));
    });

    it('should return true if value err', function () {
      assert.isTrue(Level.isValid('err'));
    });

    it('should return true if value warning', function () {
      assert.isTrue(Level.isValid('warning'));
    });

    it('should return true if value notice', function () {
      assert.isTrue(Level.isValid('notice'));
    });

    it('should return true if value info', function () {
      assert.isTrue(Level.isValid('info'));
    });

    it('should return true if value info', function () {
      assert.isTrue(Level.isValid('info'));
    });

    it('should return false if value is invalid', function () {
      assert.isFalse(Level.isValid(42));
    });
  });

});
