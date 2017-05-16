import Speedball, { value, singleton, func, construct, props, register } from '../';

interface Map {
    foo: boolean;
    bar: number;
}

let speedball = new Speedball<Map>();

/*
resolve
*/

// Succeeds
speedball.resolve('foo')

// Fails 
speedball.resolve('none');

// Succeeds

let foo1: boolean = speedball.resolve('foo');

// Fails
let foo2: number = speedball.resolve('foo');


/*
register/value
*/

// Succeeds 
speedball.register('foo', value(true));

// Fails
speedball.register('foo', value(1));

// Fails
speedball.register('none', value(true));


/*
func
*/

// Succeeds
speedball.register('foo', func<Map, 'foo'>(() => true))

// Fails
speedball.register('foo', func<Map, 'foo'>(() => 1))

// Succeeds
speedball.register('foo', func<Map, 'bar', 'foo'>((bar: number) => true, ['bar']))

// Fails
speedball.register('foo', func<Map, 'bar', 'foo'>((bar: boolean) => true, ['bar']))
speedball.register('foo', func<Map, 'bar', 'foo'>((bar: number) => true, ['none']))
speedball.register('foo', func<Map, 'bar', 'foo'>((bar: number) => true, ['foo']))


/* PROPOSAL 1 */

// This doesn't actually get us any further towards the type parameter being inferred on func

// Succeeds
register(speedball, 'foo', func(() => true))

// Fails - FAIL
register(speedball, 'foo', func(() => 1))

// Fails
register(speedball, 'none', func(() => true))


/* PROPOSAL 2 */

// We don't have to specify the map each time we create factories,
// but still the type parameters to func cannot be inferred (why?).
// Also, this means all factory creators have to register themselves with the DI container (collisions/messy)

// Succeeds
speedball.register('foo', speedball.func<'foo', 'bar'>((bar: number) => true, ['bar']))

// Fails
speedball.register('bar', speedball.func<'foo', 'bar'>((bar: number) => true, ['bar']))