import Speedball from '../../';

interface Map {
    foo: boolean;
    bar: number;
}

let speedball = new Speedball<Map>();

speedball.resolve('none');