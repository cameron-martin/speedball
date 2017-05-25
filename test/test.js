// @flow

import { expect } from 'chai';
import sinon from 'sinon';
import { suite, test } from 'mocha';

import type { Factory } from '../src/speedball';
import Speedball, { value, singleton, func, construct, props } from '../src/speedball';

function createResolver(entities: { [key: string]: any }) {
  return {
    resolve<T>(name: string): T {
      return (entities[name]: T);
    },
    after(f) { },
    willCauseCycle() { return false; }
  };
}

var noOpResolver = createResolver({});

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
    test(`it returns a function which when called returns the constant value ${val.toString()}`, function() {
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

    var entity1 = 1,
        entity2 = 2;

    var resolver = createResolver({ entity1, entity2 });

    // Act
    func(a, ['entity1', 'entity2'])(resolver);

    // Assert
    sinon.assert.calledWithExactly(a, entity1, entity2);
  });
});

suite('construct', function() {
  test('injects dependencies into constructor and props', function() {
    var speedball = new Speedball();

    class Entity {
      one: number;

      constructor(one) {
        this.one = one;
      }
    }

    speedball.register('one', value(1));

    speedball.register('entity', construct(Entity, ['one']));

    var entity = speedball.resolve('entity');

    expect(entity.one).to.eq(1);
  });
});

suite('props', function() {
  test('it injects dependencies into props', function() {
    var speedball = new Speedball();

    class Entity {}

    speedball.register('two', value(2));

    speedball.register('entity', props(
      construct(Entity),
      { two: 'two' }
    ));

    var entity = speedball.resolve('entity');

    expect(entity.two).to.eq(2);
  });


  test('it allows circular dependencies', function() {
    var speedball = new Speedball();

    class Entity1 {}
    class Entity2 {}

    speedball.register('entity1', singleton(props(
      construct(Entity1),
      { prop: 'entity2'}
    )));

    speedball.register('entity2', singleton(props(
      construct(Entity2),
      { prop: 'entity1'}
    )));

    var entity1 = speedball.resolve('entity1');

    expect(entity1.prop).to.be.an.instanceOf(Entity2);
    expect(entity1.prop.prop).to.eq(entity1);
  });
});
