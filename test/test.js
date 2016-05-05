// @flow

import { expect } from 'chai';
import sinon from 'sinon';

import Speedball, { value } from '../index';

// TODO: Don't do this horrible typecasting
var noOpSpeedball = {
  register(name, factory) {},
  resolve<T>(): T { return ((undefined: any): T); }
};

suite('Speedball', function() {
  suite('#register', function() {
    test('it returns what the factory returns', function() {
      var speedball = new Speedball();

      var obj = {};

      speedball.register('factory', function(speedball) {
        return obj;
      });

      expect(speedball.resolve('factory')).to.eq(obj);
    });

    test('it does not memoise', function() {
      var speedball = new Speedball();

      var factory = sinon.stub();

      factory.onFirstCall().returns(1);
      factory.onSecondCall().returns(2);

      speedball.register('entity', factory);

      expect(speedball.resolve('entity')).to.eq(1);
      expect(speedball.resolve('entity')).to.eq(2);
    });

    test('registering a factory with a duplicate name throws an error', function() {
      var speedball = new Speedball();

      speedball.register('a', () => {});

      // TODO: Throw a more specific error class.
      expect(() => {
        speedball.register('a', () => {});
      }).to.throw(Error, `An entity is already registered with the name "a"`);
    });

    test('it passes the speedball instance to the factory', function() {
      var speedball = new Speedball();
      var factory = sinon.spy();

      speedball.register('entity', factory);
      speedball.resolve('entity');

      sinon.assert.calledWithExactly(factory, speedball);
    });

    test('it is fluent', function() {
      var speedball = new Speedball();

      var returnValue = speedball.register('val', () => {});

      expect(returnValue).to.eq(speedball);
    });
  });
});

suite('value', function() {
  [1, 'value', {}].forEach(val => {
    test(`it returns a function which when called returns the constant value ${val}`, function() {
      var factory = value(val);

      expect(factory(noOpSpeedball)).to.eq(val);
    });
  });
});
