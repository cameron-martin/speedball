# Speedball

## Examples

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
import Speedball, { constructor, func, value, singleton } from 'speedball';

var speedball = new Speedball();

speedball.register('house', constructor(House, {
  args: ['streetNumber'],
  props: { neighboursStreetNumber: 'neighboursStreetNumber' }
}));

speedball.register('heater', singleton(func(heater, ['log'])));

speedball.register('log', value(console.log.bind(console)));

speedball.register('streetNumber', value(1));

speedball.register('neighboursStreetNumber', function(speedball) {
  return speedball.resolve('streetNumber') - 1;
});
```

## API

The types in the api documentation follow the conventions of [flow].

Speedball has a fluent api, so all `register` returns this.

### `registerClass<T>(name: string, class: Class<T>, options: ClassOptions): Speedball`

```
type ClassOptions = {
  args: Array<string>
  props: { [key: string]: string }
}
```

### `registerFunction`

[flow]: http://flowtype.org/
