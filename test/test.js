// @flow

import { expect } from 'chai';
import sinon from 'sinon';
import { suite, test } from 'mocha';

import type { Factory } from '../index';
import Speedball, { value, singleton, func } from '../index';

// TODO: Don't do this horrible typecasting
var noOpResolver = {
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

    test.skip('it passes the speedball instance to the factory', function() {
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

  suite('#resolve', function() {
    test('it throws an exception when resolving circular dependencies', function() {
      var speedball = new Speedball();

      speedball.register('entity1', function(speedball) {
        return speedball.resolve('entity2');
      });

      speedball.register('entity2', function(speedball) {
        return speedball.resolve('entity1');
      });

      expect(function() {
        speedball.resolve('entity1');
      }).to.throw(Error, 'Circular dependency detected');
    });

    test('it throws an exception when directly resolving an unknown dependency', function() {
      var speedball = new Speedball();

      expect(() => {
        speedball.resolve('abc');
      }).to.throw(Error, 'Attempted to resolve an unregistered dependency: abc');
    });

    test('it throws an exception when indirectly resolving an unknown dependency', function() {
      var speedball = new Speedball();

      speedball.register('a', function(speedball) {
        return speedball.resolve('b');
      });

      expect(() => {
        speedball.resolve('a');
      }).to.throw(Error, 'Attempted to resolve an unregistered dependency: b');
    });


  });
});

suite('value', function() {
  [1, 'value', {}].forEach(val => {
    test(`it returns a function which when called returns the constant value ${val}`, function() {
      var factory = value(val);

      expect(factory(noOpResolver)).to.eq(val);
    });
  });
});

suite('singleton', function() {
  test('it converts a factory into a singleton factory, i.e. one that memoises.', function() {
    const factory: Factory<number> = sinon.stub();

    factory.onFirstCall().returns(1);
    factory.onSecondCall().returns(2);

    const singletonFactory = singleton(factory);

    expect(singletonFactory(noOpResolver)).to.eq(1);
    expect(singletonFactory(noOpResolver)).to.eq(1);
  });
});

suite('func', function() {
  test('with no arguments the factory evaluates to correct value', function() {
    function a() {
      return true;
    }

    var factory = func(a);

    expect(factory(noOpResolver)).to.eq(true);
  });

  test('with arguments, the correct entities are passed to the function', function() {
    // Arrange
    const a = sinon.stub().returns(true);

    var entity1 = {},
        entity2 = {};

    var speedball = new Speedball();
    speedball.register('entity1', value(entity1));
    speedball.register('entity2', value(entity1));

    // Act
    func(a, ['entity1', 'entity2'])(speedball);

    // Assert
    sinon.assert.calledWithExactly(a, entity1, entity2);
  });
});
