import Speedball from '../../';

interface Map {
    foo: boolean;
    bar: number;
}

let speedball = new Speedball<Map>();

let foo1: boolean = speedball.resolve('foo');