// @flow

export type Factory<T> = (x: IResolver) => T;

export interface IResolver {
  resolve<T>(name: string): T;
  after(f: AfterHook): void;
  willCauseCycle(name: string): boolean;
}

export type AfterHook = (resolver: IResolver) => void;

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
    var resolvingSession = new ResolvingSession(this._factories);
    var entity = new Resolver(this._factories, [], resolvingSession).resolve(name);

    resolvingSession.runAfterHooks();

    return entity;
  }
}

class ResolvingSession {
  _afterHooks: Array<AfterHook>;
  _factories: { [key: string]: Factory<any> };

  constructor(factories: { [key: string]: Factory<any> }) {
    this._factories = factories;
    this._afterHooks = [];
  }

  addAfterHook(f: AfterHook) {
    this._afterHooks.push(f);
  }

  runAfterHooks() {
    this._afterHooks.forEach(after => {
      var resolvingSession = new ResolvingSession(this._factories);
      var resolver = new Resolver(this._factories, [], resolvingSession);

      after(resolver);

      resolvingSession.runAfterHooks();
    });
  }
}

class Resolver implements IResolver {
  _factories: { [key: string]: Factory<any> };
  _ancestors: Array<string>;
  _resolvingSession: ResolvingSession;

  constructor(factories: { [key: string]: Factory<any> }, ancestors: string[], resolvingSession: ResolvingSession) {
    this._factories = factories;
    this._ancestors = ancestors;
    this._resolvingSession = resolvingSession;

    Object.freeze(this);
  }

  resolve(name: string): any {
    if(!(name in this._factories)) {
      throw new Error('Attempted to resolve an unregistered dependency: ' + name);
    }

    if(this.willCauseCycle(name)) {
      throw new Error('Circular dependency detected');
    }

    const newResolver = new Resolver(this._factories, this._ancestors.concat([name]), this._resolvingSession);

    return this._factories[name](newResolver);
  }

  after(f: AfterHook): void {
    this._resolvingSession.addAfterHook(f);
  }

  willCauseCycle(entityName: string): boolean {
    return this._ancestors.indexOf(entityName) !== -1;
  }
}

export function value<T>(value: T): Factory<T> {
  return function(resolver) {
    return value;
  };
}

export function singleton<T>(factory: Factory<T>): Factory<T> {
  var result: T;

  return function(resolver) {
    if(!result) {
      result = factory(resolver);
    }

    return result;
  };
}

export function func<T>(func: (...args: any[]) => T, entities: Array<string> = []): Factory<T> {
  return function(resolver) {
    var args = entities.map(entityName => resolver.resolve(entityName));
    return func(...args);
  };
}

export interface Class<T> {
  new(...args: any[]): T;
}

export function construct<T>(constructor: Class<T>, entities: Array<string> = []): Factory<T> {
  return function(resolver) {
    var args = entities.map(entity => resolver.resolve(entity));

    return new (constructor)(...args);
  };
}

export function props<T extends Record<K, any>, K extends string>(factory: Factory<T>, props: Record<K, string>): Factory<T> {
  return function(resolver) {
    var entity = factory(resolver);

    for(let propertyName in props) {
      let entityName = props[propertyName];

      if(resolver.willCauseCycle(entityName)) {
        resolver.after(function(resolver) {
          entity[propertyName] = resolver.resolve<any>(entityName);
        });
      } else {
        entity[propertyName] = resolver.resolve<any>(entityName);
      }
    }

    return entity;
  };
}

export function fromContainer<T>(container: Speedball, entity: string): Factory<T> {
  return function(resolver) {
    return container.resolve<T>(entity);
  };
}
