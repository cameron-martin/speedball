export declare type Factory<Map, T> = (x: IResolver<Map>) => T;
export interface IResolver<Map> {
    resolve<T>(name: string): T;
    after(f: AfterHook<Map>): void;
    willCauseCycle(name: string): boolean;
    __tag: Map;
}
export declare type AfterHook<Map> = (resolver: IResolver<Map>) => void;
export default class Speedball<Map> {
    private _factories;
    constructor();
    register<K extends keyof Map>(name: K, factory: Factory<Map, Map[K]>): this;
    resolve<K extends keyof Map>(name: K): Map[K];
}
export declare function value<T>(value: T): Factory<{}, T>;
export declare function singleton<Map, T>(factory: Factory<Map, T>): Factory<Map, T>;
declare function func<R>(func: () => R): Factory<{}, R>;
declare function func<K1 extends string, D1, R>(f: (a: D1) => R, deps: [K1]): Factory<Record<K1, D1>, R>;
declare function func<K1 extends string, K2 extends string, D1, D2, R>(f: (a: D1, b: D2) => R, deps: [K1, K2]): Factory<Record<K1, D1> & Record<K2, D2>, R>;
export { func };
export interface Class<T> {
    new (...args: any[]): T;
}
export declare function fromContainer<K extends keyof Map, Map>(container: Speedball<Map>, entity: K): Factory<{}, Map[K]>;
