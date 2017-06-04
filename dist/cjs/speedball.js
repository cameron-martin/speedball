"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.value = value;
exports.singleton = singleton;
exports.fromContainer = fromContainer;
var Speedball = function () {
    function Speedball() {
        this._factories = {};
    }
    Speedball.prototype.register = function (name, factory) {
        if (name in this._factories) {
            throw new Error("An entity is already registered with the name \"" + name + "\"");
        }
        this._factories[name] = factory;
        return this;
    };
    Speedball.prototype.resolve = function (name) {
        var resolvingSession = new ResolvingSession(this._factories);
        var entity = new Resolver(this._factories, [], resolvingSession).resolve(name);
        resolvingSession.runAfterHooks();
        return entity;
    };
    return Speedball;
}();
exports.default = Speedball;

var ResolvingSession = function () {
    function ResolvingSession(factories) {
        this._factories = factories;
        this._afterHooks = [];
    }
    ResolvingSession.prototype.addAfterHook = function (f) {
        this._afterHooks.push(f);
    };
    ResolvingSession.prototype.runAfterHooks = function () {
        var _this = this;
        this._afterHooks.forEach(function (after) {
            var resolvingSession = new ResolvingSession(_this._factories);
            var resolver = new Resolver(_this._factories, [], resolvingSession);
            after(resolver);
            resolvingSession.runAfterHooks();
        });
    };
    return ResolvingSession;
}();
var Resolver = function () {
    function Resolver(factories, ancestors, resolvingSession) {
        this._factories = factories;
        this._ancestors = ancestors;
        this._resolvingSession = resolvingSession;
        Object.freeze(this);
    }
    Resolver.prototype.resolve = function (name) {
        if (!(name in this._factories)) {
            throw new Error('Attempted to resolve an unregistered dependency: ' + name);
        }
        if (this.willCauseCycle(name)) {
            throw new Error('Circular dependency detected');
        }
        var newResolver = new Resolver(this._factories, this._ancestors.concat([name]), this._resolvingSession);
        return this._factories[name](newResolver);
    };
    Resolver.prototype.after = function (f) {
        this._resolvingSession.addAfterHook(f);
    };
    Resolver.prototype.willCauseCycle = function (entityName) {
        return this._ancestors.indexOf(entityName) !== -1;
    };
    return Resolver;
}();
function value(value) {
    return function (resolver) {
        return value;
    };
}
function singleton(factory) {
    var result;
    return function (resolver) {
        if (!result) {
            result = factory(resolver);
        }
        return result;
    };
}
function func(func, entities) {
    if (entities === void 0) {
        entities = [];
    }
    return function (resolver) {
        var args = entities.map(function (entityName) {
            return resolver.resolve(entityName);
        });
        return func.apply(void 0, args);
    };
}
exports.func = func;
function fromContainer(container, entity) {
    return function () {
        return container.resolve(entity);
    };
}