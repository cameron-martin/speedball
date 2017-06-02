import Speedball from '../../';

interface Map {
    foo: boolean;
    bar: number;
}

let speedball = new Speedball<Map>();

let foo2: number = speedball.resolve('foo');