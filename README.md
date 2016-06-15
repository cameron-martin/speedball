[![Build Status](https://travis-ci.org/cameron-martin/speedball.svg?branch=master)](https://travis-ci.org/cameron-martin/speedball)
[![Project Status: WIP - Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](http://www.repostatus.org/badges/latest/wip.svg)](http://www.repostatus.org/#wip)
[![David](https://david-dm.org/cameron-martin/speedball.svg)](https://david-dm.org/cameron-martin/speedball)
[![Join the chat at https://gitter.im/cameron-martin/speedball](https://badges.gitter.im/cameron-martin/speedball.svg)](https://gitter.im/cameron-martin/speedball?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Speedball

Speedball is a [combinator-based][combinator] depdenency injection library. It consists of:

* *Factories*, which are functions which produce dependencies.
* A `Speedball` class, which is used to register factories with and resolve dependencies using those factories.
* *Factory creators*, which are functions which produce factories, given something which is not a factory.
* *Factory combinators*, which are functions which take factories as arguments and produce factories. These are used for modifying factories.

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

var speedball = new Speedball();

speedball.register('house', props(
  construct(House, ['streetNumber']),
  { neighboursStreetNumber: 'neighboursStreetNumber' }
));

speedball.register('heater', singleton(func(heater, ['log'])));

speedball.register('log', value(console.log.bind(console)));

speedball.register('streetNumber', value(1));

speedball.register('neighboursStreetNumber', function(speedball) {
  return speedball.resolve('streetNumber') - 1;
});
```

## API

The types in the api documentation follow the conventions of [flow].

Speedball has a fluent api, so `register` returns this.

### Methods

#### `register<T>(name: string,: Class<T>, options: ClassOptions): Speedball`


### Factory constructors

Factory constructors are functions which construct factories. Factories are functions which compute

```
type Factory<T> = (x: Speedball) => T;
```

#### `constructor<T>(constructor: Class<T>, options: ClassOptions): Factory<T>`

```
type ClassOptions = {
  args: Array<string>
  props: { [key: string]: string }
}
```


### Factory combinators

#### ```singleton<T>(factory: Factory<T>): Factory<T>```

Converts a factory into a singleton factory, i.e. a factory which memoises the result.

## TODO

* Add API documentation.
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
