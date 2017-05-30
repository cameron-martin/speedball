export declare type Factory<T> = (x: IResolver) => T;
export interface IResolver {
    resolve<T>(name: string): T;
    after(f: AfterHook): void;
    willCauseCycle(name: string): boolean;
}
export declare type AfterHook = (resolver: IResolver) => void;
export default class Speedball {
    _factories: {
        [key: string]: Factory<any>;
    };
    constructor();
    register<T>(name: string, factory: Factory<T>): Speedball;
    resolve<T>(name: string): T;
}
export declare function value<T>(value: T): Factory<T>;
export declare function singleton<T>(factory: Factory<T>): Factory<T>;
export declare function func<T>(func: (...args: any[]) => T, entities?: Array<string>): Factory<T>;
export interface Class<T> {
    new (...args: any[]): T;
}
export declare function construct<T>(constructor: Class<T>, entities?: Array<string>): Factory<T>;
export declare function props<T extends Record<K, any>, K extends string>(factory: Factory<T>, props: Record<K, string>): Factory<T>;
export declare function fromContainer<T>(container: Speedball, entity: string): Factory<T>;
