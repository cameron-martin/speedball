// @flow

export type Factory<T> = (x: IResolver) => T;

export interface IResolver {
  resolve<T>(name: string): T;
}

export default class Speedball {
  _factories: { [key: string]: Factory<any> };

  constructor() {
    this._factories = {};
  }

  register<T>(name: string, factory: Factory<T>): Speedball {
    if(name in this._factories) {
      throw new Error(`An entity is already registered with the name "${name}"`);
    }

    this._factories[name] = factory;

    return this;
  }

  resolve<T>(name: string): T {
    return new Resolver(this._factories, []).resolve(name);
  }
}

class Resolver {
  _factories: { [key: string]: Factory<any> };
  _ancestors: Array<string>;

  constructor(factories, ancestors) {
    this._factories = factories;
    this._ancestors = ancestors;

    Object.freeze(this);
  }

  resolve(name: string) {
    if(this._ancestors.indexOf(name) !== -1) {
      throw new Error('Circular dependency detected');
    }

    if(!(name in this._factories)) {
      throw new Error('Attempted to resolve an unregistered dependency: ' + name);
    }

    const newResolver = new Resolver(this._factories, this._ancestors.concat([name]));

    return this._factories[name](newResolver);
  }
}

export function value<T>(value: T): Factory<T> {
  return function(speedball) {
    return value;
  };
}

export function singleton<T>(factory: Factory<T>): Factory<T> {
  var result;

  return function(speedball) {
    if(!result) {
      result = factory(speedball);
    }

    return result;
  };
}

export function func<T>(func: (...args: any) => T, entities: Array<string> = []): Factory<T> {
  return function(speedball) {
    var args = entities.map(entityName => speedball.resolve(entityName));
    return func(...args);
  };
}
