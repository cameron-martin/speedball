[![Build Status](https://travis-ci.org/cameron-martin/speedball.svg?branch=master)](https://travis-ci.org/cameron-martin/speedball)
[![Project Status: WIP - Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](http://www.repostatus.org/badges/latest/wip.svg)](http://www.repostatus.org/#wip)
[![David](https://david-dm.org/cameron-martin/speedball.svg)](https://david-dm.org/cameron-martin/speedball)
[![Join the chat at https://gitter.im/cameron-martin/speedball](https://badges.gitter.im/cameron-martin/speedball.svg)](https://gitter.im/cameron-martin/speedball?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Speedball

Speedball is a [combinator-based][combinator] dependency injection library. It consists of:

* *Factories*, which are functions that produce dependencies.
* A `Speedball` class, which is used to register factories with and resolve dependencies using those factories.
* *Factory creators*, which are functions that produce factories, given something which is not a factory.
* *Factory combinators*, which are functions that take factories as arguments and produce factories. These are used for modifying factories.

## Installation

    npm install --save speedball

## Example

```javascript
class House {
  constructor(streetNumber) {
    this._streetNumber = streetNumber;
  }

  toString() {
    return 'House at street number ' + this._streetNumber +
      'with neighbour at street number ' + this.neighboursStreetNumber;
  }

  increaseTemperature() {
    this.heater(1);
  }

  decreaseTemperature() {
    this.heater(-1);
  }
}

const heater = log => heatingAmount => {
  log('heating by ' + heatingAmount);
};

```


```javascript
import Speedball, { construct, props, func, value, singleton } from 'speedball';

var speedball = new Speedball()
  .register('house', props(
    construct(House, ['streetNumber']),
    { neighboursStreetNumber: 'neighboursStreetNumber' }
  ))
  .register('heater', singleton(func(heater, ['log'])));
  .register('log', value(console.log.bind(console)));
  .register('streetNumber', value(1));
  .register('neighboursStreetNumber', function(speedball) {
    return speedball.resolve('streetNumber') - 1;
  });
```

## Design Goals

* To not be tied to a particular module system.
* To allow currying style DI, e.g.
  `const f = (dep1, dep2) => (arg1, arg2) => {}`
* To be extensible. The indicator I used for this is the ability to implement AOP without modifying existing code.

## API

The types in the api documentation follow the conventions of [flow].

### Speedball class

This is what you will use to configure your dependency hierachy and resolve your dependencies with. Unless you are creating custom factory combinators/constructors, the `Factory<T>` type can be considered [abstract][abstract-data-type].

#### `register<T>(name: string, factory: Factory<T>): Speedball`

Registers a dependency under the name `name`.

#### `resolve<T>(name: string): T`

Resolves a dependency that has been registered under the name `name`.

### Factory constructors

Factory constructors are functions that construct factories, given something that is not a factory.


#### `value<T>(value: T): Factory<T>`

Create a constant factory that always returns `value`. This is useful for configuration constants, e.g. database connection strings, but also for injecting values such as `window` and `localStorage`.

#### `construct<T>(constructor: Class<T>, entities: Array<string> = []): Factory<T>`

Creates a factory that resolves the entities `entities` then constructs the class `constructor` with them. Similar to `func`.

#### `func<T>(func: (...args: any) => T, entities: Array<string> = []): Factory<T>`

Creates a factory that resolves the entities `entities` then passes them into a function. Similar to `construct`.

### Factory combinators

Factory combinators modify behaviour of exsting factories. All factory combinators return new factories, rather than mutating existing ones.

#### `singleton<T>(factory: Factory<T>): Factory<T>`

Converts a factory into a singleton factory, i.e. a factory that memoises the result.

#### `props<T>(factory: Factory<T>, props: { [key: string]: string }): Factory<T>`

Converts a factory into a factory that behaves the same as originally, but also has the behaviour of injecting entities as properties of the subject. The keys of `props` are the property names, and the values are entity names.

### Factory type

A factory is a function that is used to instantiate your dependencies.

```
type Factory<T> = (x: IResolver) => T;
```

### IResolver interface

An IResolver is something that can be used to resolve other dependencies during resolution of a dependency and enquire about and modify various aspects of the resolution procedure.

This will probably only be of interest if you are developing custom factory combinators/constructors.

#### `resolve<T>(name: string): T`

Resolves a dependency that has been registered under the name `name`. Behaves the same as `Speedball#resolve`.

#### `after(f: AfterHook): void`

Registers an *after hook*, a function that is executed after the root dependency is resolved, but before it is returned to the user. This can be used to "join the circle" when resolving cyclic dependencies.

#### `willCauseCycle(name: string): bool`

Determines whether resolving the dependency registered under the name `name` would result in the dependency graph being cyclic. This can be used in combination with `after` to resolve cyclic dependencies.

## TODO

* Implement AOP features. Maybe as a seperate npm module?
* Make better testing.
  - Have a separation between unit and integration tests?
  - Do some property-based testing where arbitrary dependency graphs are generated
    and assertions are calculated based on whether they are cyclic or acyclic.
  - Find out why travis is failing on all nodes < 5.0
* Add code climate etc.
* Submit PR to micro js.

## Contributing

Pull requests are very much welcome. Also, if there is something you want added or something is broken then please open an issue.

[flow]: http://flowtype.org/
[combinator]: https://wiki.haskell.org/Combinator_pattern
[abstract-data-type]: https://en.wikipedia.org/wiki/Abstract_data_type
