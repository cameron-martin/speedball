// @flow

type Factory<T> = (x: Speedball) => T;

interface ISpeedball {
  register<T>(name: string, factory: Factory<T>): void;
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
    return this._factories[name](this);
  }
}

export function value<T>(value: T): (speedball: ISpeedball) => T {
  return function(speedball) {
    return value;
  }
}
