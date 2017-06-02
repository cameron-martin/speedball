import Speedball, { func } from '../../../';

interface Map {
    foo: boolean;
    bar: number;
}

let speedball = new Speedball<Map>();

speedball.register('foo', func((bar: boolean, foo: boolean) => true, ['bar', 'foo']))
