export type Factory<Map, T> = (x: IResolver<Map>) => T;

export interface IResolver<Map> {
  resolve<T>(name: string): T;
  after(f: AfterHook<Map>): void;
  willCauseCycle(name: string): boolean;
  __tag: Map;
}

export type AfterHook<Map> = (resolver: IResolver<Map>) => void;

type Factories<Map> = {
  [K in keyof Map]: Factory<Map, Map[K]>;
};

export default class Speedball<Map> {
  private _factories: Record<string, Factory<Map, any>>;

  public constructor() {
    this._factories = {};
  }

  register<K extends keyof Map>(name: K, factory: Factory<Map, Map[K]>): this {
    if(name in this._factories) {
      throw new Error(`An entity is already registered with the name "${name}"`);
    }

    this._factories[name] = factory;

    return this;
  }

  resolve<K extends keyof Map>(name: K): Map[K] {
    var resolvingSession = new ResolvingSession(this._factories);
    var entity = new Resolver(this._factories, [], resolvingSession).resolve(name);

    resolvingSession.runAfterHooks();

    return entity;
  }
}

class ResolvingSession<Map> {
  private _afterHooks: Array<AfterHook<Map>>;
  private _factories: Factories<Map>;

  constructor(factories: Factories<Map>) {
    this._factories = factories;
    this._afterHooks = [];
  }

  addAfterHook(f: AfterHook<Map>) {
    this._afterHooks.push(f);
  }

  runAfterHooks() {
    this._afterHooks.forEach(after => {
      var resolvingSession = new ResolvingSession(this._factories);
      var resolver = new Resolver(this._factories, [], resolvingSession);

      // HACK: __tag
      after(resolver as any as IResolver<Map>);

      resolvingSession.runAfterHooks();
    });
  }
}

// HACK: __tag (does not implement IResolver<Map>)
class Resolver<Map> {
  _factories: Factories<Map>;
  _ancestors: Array<keyof Map>;
  _resolvingSession: ResolvingSession<Map>;

  constructor(factories: Factories<Map>, ancestors: (keyof Map)[], resolvingSession: ResolvingSession<Map>) {
    this._factories = factories;
    this._ancestors = ancestors;
    this._resolvingSession = resolvingSession;

    Object.freeze(this);
  }

  resolve<K extends keyof Map>(name: K): Map[K] {
    if(!(name in this._factories)) {
      throw new Error('Attempted to resolve an unregistered dependency: ' + name);
    }

    if(this.willCauseCycle(name)) {
      throw new Error('Circular dependency detected');
    }

    const newResolver = new Resolver(this._factories, this._ancestors.concat([name]), this._resolvingSession);

    // HACK: __tag
    return this._factories[name](newResolver as any as IResolver<Map>);
  }

  after(f: AfterHook<Map>): void {
    this._resolvingSession.addAfterHook(f);
  }

  willCauseCycle<K extends keyof Map>(entityName: K): boolean {
    return this._ancestors.indexOf(entityName) !== -1;
  }
}

export function value<T>(value: T): Factory<{}, T> {
  return function(resolver) {
    return value;
  };
}

export function singleton<Map, T>(factory: Factory<Map, T>): Factory<Map, T> {
  var result: T;

  return function(resolver) {
    if(!result) {
      result = factory(resolver);
    }

    return result;
  };
}

function func<R>(func: () => R): Factory<{}, R>;
function func<K1 extends string, D1, R>(f: (a: D1) => R, deps: [K1]): Factory<Record<K1, D1>, R>;
function func<K1 extends string, K2 extends string, D1, D2, R>(f: (a: D1, b: D2) => R, deps: [K1, K2]): Factory<Record<K1, D1> & Record<K2, D2>, R>;
function func<T, Map>(func: (...args: any[]) => T, entities: string[] = []): Factory<Map, T> {
  return function(resolver) {
    var args = entities.map(entityName => resolver.resolve(entityName));
    return func(...args);
  };
}

export { func };

export interface Class<T> {
  new(...args: any[]): T;
}

// export function construct<T>(constructor: Class<T>, entities: string[] = []): Factory<T> {
//   return function(resolver) {
//     var args = entities.map(entity => resolver.resolve(entity));

//     return new (constructor)(...args);
//   };
// }

// export function props<T extends Record<K, any>, K extends string>(factory: Factory<T>, props: Record<K, string>): Factory<T> {
//   return function(resolver) {
//     var entity = factory(resolver);

//     for(let propertyName in props) {
//       let entityName = props[propertyName];

//       if(resolver.willCauseCycle(entityName)) {
//         resolver.after(function(resolver) {
//           entity[propertyName] = resolver.resolve<any>(entityName);
//         });
//       } else {
//         entity[propertyName] = resolver.resolve<any>(entityName);
//       }
//     }

//     return entity;
//   };
// }

// export function fromContainer<K extends keyof Map, Map>(container: Speedball<Map>, entity: K): Factory<Map[K]> {
//   return function(resolver) {
//     return container.resolve(entity);
//   };
// }
