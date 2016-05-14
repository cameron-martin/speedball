

export default class Speedball {

  constructor() {
    this._factories = {};
  }

  register(name, factory) {
    if (name in this._factories) {
      throw new Error(`An entity is already registered with the name "${ name }"`);
    }

    this._factories[name] = factory;

    return this;
  }

  resolve(name) {
    var resolvingSession = new ResolvingSession(this._factories);
    var entity = new Resolver(this._factories, [], resolvingSession).resolve(name);

    resolvingSession.runAfterHooks();

    return entity;
  }
}

class ResolvingSession {

  constructor(factories) {
    this._factories = factories;
    this._afterHooks = [];
  }

  addAfterHook(f) {
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

class Resolver {

  constructor(factories, ancestors, resolvingSession) {
    this._factories = factories;
    this._ancestors = ancestors;
    this._resolvingSession = resolvingSession;

    Object.freeze(this);
  }

  resolve(name) {
    if (!(name in this._factories)) {
      throw new Error('Attempted to resolve an unregistered dependency: ' + name);
    }

    if (this.willCauseCycle(name)) {
      throw new Error('Circular dependency detected');
    }

    const newResolver = new Resolver(this._factories, this._ancestors.concat([name]), this._resolvingSession);

    return this._factories[name](newResolver);
  }

  after(f) {
    this._resolvingSession.addAfterHook(f);
  }

  willCauseCycle(entityName) {
    return this._ancestors.indexOf(entityName) !== -1;
  }
}

export function value(value) {
  return function (resolver) {
    return value;
  };
}

export function singleton(factory) {
  var result;

  return function (resolver) {
    if (!result) {
      result = factory(resolver);
    }

    return result;
  };
}

export function func(func, entities = []) {
  return function (resolver) {
    var args = entities.map(entityName => resolver.resolve(entityName));
    return func(...args);
  };
}

export function construct(constructor, entities = []) {
  return function (resolver) {
    var args = entities.map(entity => resolver.resolve(entity));

    return new constructor(...args);
  };
}

export function props(factory, props) {
  return function (resolver) {
    var entity = factory(resolver);

    for (let propertyName in props) {
      let entityName = props[propertyName];

      if (resolver.willCauseCycle(entityName)) {
        resolver.after(function (resolver) {
          entity[propertyName] = resolver.resolve(entityName);
        });
      } else {
        entity[propertyName] = resolver.resolve(entityName);
      }
    }

    return entity;
  };
}