(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('speedball', ['exports'], factory) :
  (factory((global.Speedball = global.Speedball || {})));
}(this, function (exports) { 'use strict';

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Speedball = function () {
    function Speedball() {
      _classCallCheck(this, Speedball);

      this._factories = {};
    }

    _createClass(Speedball, [{
      key: 'register',
      value: function register(name, factory) {
        if (name in this._factories) {
          throw new Error('An entity is already registered with the name "' + name + '"');
        }

        this._factories[name] = factory;

        return this;
      }
    }, {
      key: 'resolve',
      value: function resolve(name) {
        var resolvingSession = new ResolvingSession(this._factories);
        var entity = new Resolver(this._factories, [], resolvingSession).resolve(name);

        resolvingSession.runAfterHooks();

        return entity;
      }
    }]);

    return Speedball;
  }();

  var ResolvingSession = function () {
    function ResolvingSession(factories) {
      _classCallCheck(this, ResolvingSession);

      this._factories = factories;
      this._afterHooks = [];
    }

    _createClass(ResolvingSession, [{
      key: 'addAfterHook',
      value: function addAfterHook(f) {
        this._afterHooks.push(f);
      }
    }, {
      key: 'runAfterHooks',
      value: function runAfterHooks() {
        var _this = this;

        this._afterHooks.forEach(function (after) {
          var resolvingSession = new ResolvingSession(_this._factories);
          var resolver = new Resolver(_this._factories, [], resolvingSession);

          after(resolver);

          resolvingSession.runAfterHooks();
        });
      }
    }]);

    return ResolvingSession;
  }();

  var Resolver = function () {
    function Resolver(factories, ancestors, resolvingSession) {
      _classCallCheck(this, Resolver);

      this._factories = factories;
      this._ancestors = ancestors;
      this._resolvingSession = resolvingSession;

      Object.freeze(this);
    }

    _createClass(Resolver, [{
      key: 'resolve',
      value: function resolve(name) {
        if (!(name in this._factories)) {
          throw new Error('Attempted to resolve an unregistered dependency: ' + name);
        }

        if (this.willCauseCycle(name)) {
          throw new Error('Circular dependency detected');
        }

        var newResolver = new Resolver(this._factories, this._ancestors.concat([name]), this._resolvingSession);

        return this._factories[name](newResolver);
      }
    }, {
      key: 'after',
      value: function after(f) {
        this._resolvingSession.addAfterHook(f);
      }
    }, {
      key: 'willCauseCycle',
      value: function willCauseCycle(entityName) {
        return this._ancestors.indexOf(entityName) !== -1;
      }
    }]);

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

  function func(func) {
    var entities = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    return function (resolver) {
      var args = entities.map(function (entityName) {
        return resolver.resolve(entityName);
      });
      return func.apply(undefined, _toConsumableArray(args));
    };
  }

  function construct(constructor) {
    var entities = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    return function (resolver) {
      var args = entities.map(function (entity) {
        return resolver.resolve(entity);
      });

      return new (Function.prototype.bind.apply(constructor, [null].concat(_toConsumableArray(args))))();
    };
  }

  function props(factory, props) {
    return function (resolver) {
      var entity = factory(resolver);

      var _loop = function _loop(propertyName) {
        var entityName = props[propertyName];

        if (resolver.willCauseCycle(entityName)) {
          resolver.after(function (resolver) {
            entity[propertyName] = resolver.resolve(entityName);
          });
        } else {
          entity[propertyName] = resolver.resolve(entityName);
        }
      };

      for (var propertyName in props) {
        _loop(propertyName);
      }

      return entity;
    };
  }

  exports['default'] = Speedball;

Object.defineProperty(exports, "__esModule", {value: true});


  exports.value = value;
  exports.singleton = singleton;
  exports.func = func;
  exports.construct = construct;
  exports.props = props;

}));
//# sourceMappingURL=speedball.js.map
