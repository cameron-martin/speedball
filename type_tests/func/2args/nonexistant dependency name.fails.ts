import Speedball, { func } from '../../../';

interface Map {
    foo: boolean;
    bar: number;
}

let speedball = new Speedball<Map>();

speedball.register('foo', func((bar: number, foo: boolean) => true, ['none', 'foo']))
