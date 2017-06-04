import Speedball, { fromContainer } from '../../';

interface MapOuter {
    foo: boolean;
    bar: number;
}

let speedballOuter = new Speedball<MapOuter>();

interface MapInner {
    foo1: boolean;
    bar2: number;
}

let speedballInner = new Speedball<MapInner>();

speedballOuter.register('foo', fromContainer(speedballInner, 'bar2'));