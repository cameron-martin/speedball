import Speedball, { value } from '../../';

interface Map {
    foo: boolean;
    bar: number;
}

let speedball = new Speedball<Map>();

speedball.register('foo', value(1));