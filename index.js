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
  return function(resolver) {
    return value;
  };
}

export function singleton<T>(factory: Factory<T>): Factory<T> {
  var result;

  return function(resolver) {
    if(!result) {
      result = factory(resolver);
    }

    return result;
  };
}

export function func<T>(func: (...args: any) => T, entities: Array<string> = []): Factory<T> {
  return function(resolver) {
    var args = entities.map(entityName => resolver.resolve(entityName));
    return func(...args);
  };
}

type ConstructOptions = {
  args?: Array<string>,
  props?: { [key: string]: string }
};

export function construct<T>(constructor: Class<T>, options: ConstructOptions = {}): Factory<T> {
  var argEntities = options.args || [];
  var propEntities = options.props || {};


  return function(resolver) {
    var args = argEntities.map(argEntity => resolver.resolve(argEntity));

    var object = new (constructor: any)(...args);

    for(let propertyName in propEntities) {
      let entityName = propEntities[propertyName];

      object[propertyName] = resolver.resolve(entityName);
    }

    return object;
  };
}
