//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2011 Jeremy Ashkenas, DocumentCloud Inc.
//     (c) 2011-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports.ot_ = _;
  } else {
    root.ot_ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value == null ? _.identity : value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(slice.call(arguments));
  };

  // The inverse operation to `_.zip`. If given an array of pairs it
  // returns an array of the paired elements split into two left and
  // right element arrays, if given an array of triples it returns a
  // three element array and so on. For example, `_.unzip` given
  // `[['a',1],['b',2],['c',3]]` returns the array
  // [['a','b','c'],[1,2,3]].
  _.unzip = function(list) {
    var length = _.max(_.pluck(list, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(list, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait, immediate) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && immediate === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // Generate a GUID
  _.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);
//! moment.js
//! version : 2.8.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = '2.8.0',
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for locale config files
        locales = {},

        // extra moment internal properties (plugins register props here)
        momentProperties = [],

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        parseTokenOrdinal = /\d{1,2}/,

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' && console.warn) {
            console.warn("Deprecation warning: " + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }

        if (b.hasOwnProperty('toString')) {
            a.toString = b.toString;
        }

        if (b.hasOwnProperty('valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, "moment()." + name  + "(period, number) is deprecated. Please use moment()." + name + "(number, period).");
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (inputObject.hasOwnProperty(prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) :
            moment(input).local();
    }

    /************************************
        Locale
    ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment.utc([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) {
                return parseTokenOneDigit;
            }
            /* falls through */
        case 'SS':
            if (strict) {
                return parseTokenTwoDigits;
            }
            /* falls through */
        case 'SSS':
            if (strict) {
                return parseTokenThreeDigits;
            }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return config._locale._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return parseTokenOrdinal;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = config._locale.monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(input, 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = config._locale.isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = config._locale.weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual zone can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }

        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be "T" or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === "boolean") {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i);
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === "boolean") {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && input.hasOwnProperty('_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        "moment.lang is deprecated. Use moment.locale instead.",
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== "undefined") {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        "moment.langData is deprecated. Use moment.localeData instead.",
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null &&  obj.hasOwnProperty('_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.zone(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.zone(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.add(this._d.getTimezoneOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                output += ((this - moment(this).startOf('month')) -
                        (that - moment(that).startOf('month'))) / diff;
                // same as above but with zones, to negate all dst
                output -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = units || 'ms';
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },

        min: deprecate(
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._d.getTimezoneOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.subtract(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            if (key === undefined) {
                return this._locale._abbr;
            } else {
                this._locale = moment.localeData(key);
                return this;
            }
        },

        lang : deprecate(
            "moment().lang() is deprecated. Use moment().localeData() instead.",
            function (key) {
                return this.localeData(key);
            }
        ),

        localeData : function () {
            return this._locale;
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            days = this._days + this._milliseconds / 864e5;
            if (units === 'month' || units === 'year') {
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                days += yearsToDays(this._months / 12);
                switch (units) {
                    case 'week': return days / 7;
                    case 'day': return days;
                    case 'hour': return days * 24;
                    case 'minute': return days * 24 * 60;
                    case 'second': return days * 24 * 60 * 60;
                    case 'millisecond': return days * 24 * 60 * 60 * 1000;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            "toIsoString() is deprecated. Please use toISOString() instead " +
            "(notice the capitals)",
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        }
    });

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
        Default Locale
    ************************************/


    // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LOCALES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.ot_moment = deprecate(
                    'Accessing Moment through the global scope is ' +
                    'deprecated, and will be removed in an upcoming ' +
                    'release.',
                    moment);
        } else {
            globalScope.ot_moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define('moment', function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.ot_moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

// moment.js locale configuration
// locale : german (de)
// author : lluchs : https://github.com/lluchs
// author: Menelion Elensúle: https://github.com/Oire

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.ot_moment); // Browser global
    }
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    return moment.defineLocale('de', {
        months : "Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
        monthsShort : "Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
        weekdays : "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),
        weekdaysShort : "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
        weekdaysMin : "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
        longDateFormat : {
            LT: "HH:mm [Uhr]",
            L : "DD.MM.YYYY",
            LL : "D. MMMM YYYY",
            LLL : "D. MMMM YYYY LT",
            LLLL : "dddd, D. MMMM YYYY LT"
        },
        calendar : {
            sameDay: "[Heute um] LT",
            sameElse: "L",
            nextDay: '[Morgen um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[Gestern um] LT',
            lastWeek: '[letzten] dddd [um] LT'
        },
        relativeTime : {
            future : "in %s",
            past : "vor %s",
            s : "ein paar Sekunden",
            m : processRelativeTime,
            mm : "%d Minuten",
            h : processRelativeTime,
            hh : "%d Stunden",
            d : processRelativeTime,
            dd : processRelativeTime,
            M : processRelativeTime,
            MM : processRelativeTime,
            y : processRelativeTime,
            yy : processRelativeTime
        },
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));

// moment.js locale configuration
// locale : spanish (es)
// author : Julio Napurí : https://github.com/julionc

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.ot_moment); // Browser global
    }
}(function (moment) {
    var monthsShortDot = "ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.".split("_"),
        monthsShort = "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_");

    return moment.defineLocale('es', {
        months : "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays : "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
        weekdaysShort : "dom._lun._mar._mié._jue._vie._sáb.".split("_"),
        weekdaysMin : "Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"),
        longDateFormat : {
            LT : "H:mm",
            L : "DD/MM/YYYY",
            LL : "D [de] MMMM [del] YYYY",
            LLL : "D [de] MMMM [del] YYYY LT",
            LLLL : "dddd, D [de] MMMM [del] YYYY LT"
        },
        calendar : {
            sameDay : function () {
                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextDay : function () {
                return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastDay : function () {
                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : "en %s",
            past : "hace %s",
            s : "unos segundos",
            m : "un minuto",
            mm : "%d minutos",
            h : "una hora",
            hh : "%d horas",
            d : "un día",
            dd : "%d días",
            M : "un mes",
            MM : "%d meses",
            y : "un año",
            yy : "%d años"
        },
        ordinal : '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));

// moment.js locale configuration
// locale : french (fr)
// author : John Fischer : https://github.com/jfroffice

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.ot_moment); // Browser global
    }
}(function (moment) {
    return moment.defineLocale('fr', {
        months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
        monthsShort : "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
        weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
        weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
        weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
        longDateFormat : {
            LT : "HH:mm",
            L : "DD/MM/YYYY",
            LL : "D MMMM YYYY",
            LLL : "D MMMM YYYY LT",
            LLLL : "dddd D MMMM YYYY LT"
        },
        calendar : {
            sameDay: "[Aujourd'hui à] LT",
            nextDay: '[Demain à] LT',
            nextWeek: 'dddd [à] LT',
            lastDay: '[Hier à] LT',
            lastWeek: 'dddd [dernier à] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : "dans %s",
            past : "il y a %s",
            s : "quelques secondes",
            m : "une minute",
            mm : "%d minutes",
            h : "une heure",
            hh : "%d heures",
            d : "un jour",
            dd : "%d jours",
            M : "un mois",
            MM : "%d mois",
            y : "un an",
            yy : "%d ans"
        },
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : '');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));

// moment.js locale configuration
// locale : japanese (ja)
// author : LI Long : https://github.com/baryon

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.ot_moment); // Browser global
    }
}(function (moment) {
    return moment.defineLocale('ja', {
        months : "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
        monthsShort : "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
        weekdays : "日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日".split("_"),
        weekdaysShort : "日_月_火_水_木_金_土".split("_"),
        weekdaysMin : "日_月_火_水_木_金_土".split("_"),
        longDateFormat : {
            LT : "Ah時m分",
            L : "YYYY/MM/DD",
            LL : "YYYY年M月D日",
            LLL : "YYYY年M月D日LT",
            LLLL : "YYYY年M月D日LT dddd"
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return "午前";
            } else {
                return "午後";
            }
        },
        calendar : {
            sameDay : '[今日] LT',
            nextDay : '[明日] LT',
            nextWeek : '[来週]dddd LT',
            lastDay : '[昨日] LT',
            lastWeek : '[前週]dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : "%s後",
            past : "%s前",
            s : "数秒",
            m : "1分",
            mm : "%d分",
            h : "1時間",
            hh : "%d時間",
            d : "1日",
            dd : "%d日",
            M : "1ヶ月",
            MM : "%dヶ月",
            y : "1年",
            yy : "%d年"
        }
    });
}));

// moment.js locale configuration
// locale : dutch (nl)
// author : Joris Röling : https://github.com/jjupiter

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.ot_moment); // Browser global
    }
}(function (moment) {
    var monthsShortWithDots = "jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.".split("_"),
        monthsShortWithoutDots = "jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_");

    return moment.defineLocale('nl', {
        months : "januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShortWithoutDots[m.month()];
            } else {
                return monthsShortWithDots[m.month()];
            }
        },
        weekdays : "zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),
        weekdaysShort : "zo._ma._di._wo._do._vr._za.".split("_"),
        weekdaysMin : "Zo_Ma_Di_Wo_Do_Vr_Za".split("_"),
        longDateFormat : {
            LT : "HH:mm",
            L : "DD-MM-YYYY",
            LL : "D MMMM YYYY",
            LLL : "D MMMM YYYY LT",
            LLLL : "dddd D MMMM YYYY LT"
        },
        calendar : {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : "over %s",
            past : "%s geleden",
            s : "een paar seconden",
            m : "één minuut",
            mm : "%d minuten",
            h : "één uur",
            hh : "%d uur",
            d : "één dag",
            dd : "%d dagen",
            M : "één maand",
            MM : "%d maanden",
            y : "één jaar",
            yy : "%d jaar"
        },
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));

/*!
 * pickadate.js v3.6.3, 2019/04/03
 * By Amsul, http://amsul.ca
 * Hosted on http://amsul.github.io/pickadate.js
 * Licensed under MIT
 */

(function(factory) {

    // AMD.
    if (typeof define == 'function' && define.amd)
        define('picker', ['jquery'], factory)

    // Node.js/browserify.
    else if (typeof exports == 'object')
        module.exports = factory(require('jquery'))

    // Browser globals.
    else if (typeof window == 'object')
        window.Picker = factory(jQuery)

    else this.Picker = factory(jQuery)

}(function($) {

    var $window = $(window)
    var $document = $(document)
    var $html = $(document.documentElement)
    var supportsTransitions = document.documentElement.style.transition != null


    /**
     * The picker constructor that creates a blank picker.
     */
    function PickerConstructor(ELEMENT, NAME, COMPONENT, OPTIONS) {

        // If there’s no element, return the picker constructor.
        if (!ELEMENT) return PickerConstructor


        var
            IS_DEFAULT_THEME = false,


            // The state of the picker.
            STATE = {
                id: ELEMENT.id || 'P' + Math.abs(~~(Math.random() * new Date())),
                handlingOpen: false,
            },


            // Merge the defaults and options passed.
            SETTINGS = COMPONENT ? $.extend(true, {}, COMPONENT.defaults, OPTIONS) : OPTIONS || {},


            // Merge the default classes with the settings classes.
            CLASSES = $.extend({}, PickerConstructor.klasses(), SETTINGS.klass),


            // The element node wrapper into a jQuery object.
            $ELEMENT = $(ELEMENT),


            // Pseudo picker constructor.
            PickerInstance = function() {
                return this.start()
            },


            // The picker prototype.
            P = PickerInstance.prototype = {

                constructor: PickerInstance,

                $node: $ELEMENT,


                /**
                 * Initialize everything
                 */
                start: function() {

                    // If it’s already started, do nothing.
                    if (STATE && STATE.start) return P


                    // Update the picker states.
                    STATE.methods = {}
                    STATE.start = true
                    STATE.open = false
                    STATE.type = ELEMENT.type


                    // Confirm focus state, convert into text input to remove UA stylings,
                    // and set as readonly to prevent keyboard popup.
                    ELEMENT.autofocus = ELEMENT == getActiveElement()
                    ELEMENT.readOnly = !SETTINGS.editable
                    ELEMENT.id = ELEMENT.id || STATE.id
                    if (ELEMENT.type != 'text') {
                        ELEMENT.type = 'text'
                    }


                    // Create a new picker component with the settings.
                    P.component = new COMPONENT(P, SETTINGS)


                    // Create the picker root and then prepare it.
                    P.$root = $('<div class="' + CLASSES.picker + '" id="' + ELEMENT.id + '_root" role="dialog"/>')
                    prepareElementRoot()


                    // Create the picker holder and then prepare it.
                    P.$holder = $(createWrappedComponent()).appendTo(P.$root)
                    prepareElementHolder()


                    // If there’s a format for the hidden input element, create the element.
                    if (SETTINGS.formatSubmit) {
                        prepareElementHidden()
                    }


                    // Prepare the input element.
                    prepareElement()


                    // Insert the hidden input as specified in the settings.
                    if (SETTINGS.containerHidden) $(SETTINGS.containerHidden).append(P._hidden)
                    else $ELEMENT.after(P._hidden)


                    // Insert the root as specified in the settings.
                    if (SETTINGS.container) $(SETTINGS.container).append(P.$root)
                    else $ELEMENT.after(P.$root)


                    // Bind the default component and settings events.
                    P.on({
                        start: P.component.onStart,
                        render: P.component.onRender,
                        stop: P.component.onStop,
                        open: P.component.onOpen,
                        close: P.component.onClose,
                        set: P.component.onSet
                    }).on({
                        start: SETTINGS.onStart,
                        render: SETTINGS.onRender,
                        stop: SETTINGS.onStop,
                        open: SETTINGS.onOpen,
                        close: SETTINGS.onClose,
                        set: SETTINGS.onSet
                    })


                    // Once we’re all set, check the theme in use.
                    IS_DEFAULT_THEME = isUsingDefaultTheme(P.$holder[0])


                    // If the element has autofocus, open the picker.
                    if (ELEMENT.autofocus) {
                        P.open()
                    }


                    // Trigger queued the “start” and “render” events.
                    return P.trigger('start').trigger('render')
                }, //start


                /**
                 * Render a new picker
                 */
                render: function(entireComponent) {

                    // Insert a new component holder in the root or box.
                    if (entireComponent) {
                        P.$holder = $(createWrappedComponent())
                        prepareElementHolder()
                        P.$root.html(P.$holder)
                    }
                    else P.$root.find('.' + CLASSES.box).html(P.component.nodes(STATE.open))

                    // Trigger the queued “render” events.
                    return P.trigger('render')
                }, //render


                /**
                 * Destroy everything
                 */
                stop: function() {

                    // If it’s already stopped, do nothing.
                    if (!STATE.start) return P

                    // Then close the picker.
                    P.close()

                    // Remove the hidden field.
                    if (P._hidden) {
                        P._hidden.parentNode.removeChild(P._hidden)
                    }

                    // Remove the root.
                    P.$root.remove()

                    // Remove the input class, remove the stored data, and unbind
                    // the events (after a tick for IE - see `P.close`).
                    $ELEMENT.removeClass(CLASSES.input).removeData(NAME)
                    setTimeout(function() {
                        $ELEMENT.off('.' + STATE.id)
                    }, 0)

                    // Restore the element state
                    ELEMENT.type = STATE.type
                    ELEMENT.readOnly = false

                    // Trigger the queued “stop” events.
                    P.trigger('stop')

                    // Reset the picker states.
                    STATE.methods = {}
                    STATE.start = false

                    return P
                }, //stop


                /**
                 * Open up the picker
                 */
                open: function(dontGiveFocus) {

                    // If it’s already open, do nothing.
                    if (STATE.open) return P

                    // Add the “active” class.
                    $ELEMENT.addClass(CLASSES.active)
                    aria(ELEMENT, 'expanded', true)

                    // * A Firefox bug, when `html` has `overflow:hidden`, results in
                    //   killing transitions :(. So add the “opened” state on the next tick.
                    //   Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
                    setTimeout(function() {

                        // Add the “opened” class to the picker root.
                        P.$root.addClass(CLASSES.opened)
                        aria(P.$root[0], 'hidden', false)

                    }, 0)

                    // If we have to give focus, bind the element and doc events.
                    if (dontGiveFocus !== false) {

                        // Set it as open.
                        STATE.open = true

                        // Prevent the page from scrolling.
                        if (IS_DEFAULT_THEME) {
                            $('body').
                                css('overflow', 'hidden').
                                css('padding-right', '+=' + getScrollbarWidth())
                        }

                        // Pass focus to the root element’s jQuery object.
                        focusPickerOnceOpened()

                        // Bind the document events.
                        $document.on('click.' + STATE.id + ' focusin.' + STATE.id, function(event) {
                            // If the picker is currently midway through processing
                            // the opening sequence of events then don't handle clicks
                            // on any part of the DOM. This is caused by a bug in Chrome 73
                            // where a click event is being generated with the incorrect
                            // path in it.
                            // In short, if someone does a click that finishes after the
                            // new element is created then the path contains only the
                            // parent element and not the input element itself.
                            if (STATE.handlingOpen) {
                                return;
                            }

                            var target = getRealEventTarget(event, ELEMENT)

                            // If the target of the event is not the element, close the picker picker.
                            // * Don’t worry about clicks or focusins on the root because those don’t bubble up.
                            //   Also, for Firefox, a click on an `option` element bubbles up directly
                            //   to the doc. So make sure the target wasn't the doc.
                            // * In Firefox stopPropagation() doesn’t prevent right-click events from bubbling,
                            //   which causes the picker to unexpectedly close when right-clicking it. So make
                            //   sure the event wasn’t a right-click.
                            // * In Chrome 62 and up, password autofill causes a simulated focusin event which
                            //   closes the picker.
                            if (!event.isSimulated && target != ELEMENT && target != document && event.which != 3) {

                                // If the target was the holder that covers the screen,
                                // keep the element focused to maintain tabindex.
                                P.close(target === P.$holder[0])
                            }

                        }).on('keydown.' + STATE.id, function(event) {

                            var
                                // Get the keycode.
                                keycode = event.keyCode,

                                // Translate that to a selection change.
                                keycodeToMove = P.component.key[keycode],

                                // Grab the target.
                                target = getRealEventTarget(event, ELEMENT)


                            // On escape, close the picker and give focus.
                            if (keycode == 27) {
                                P.close(true)
                            }


                            // Check if there is a key movement or “enter” keypress on the element.
                            else if (target == P.$holder[0] && (keycodeToMove || keycode == 13)) {

                                // Prevent the default action to stop page movement.
                                event.preventDefault()

                                // Trigger the key movement action.
                                if (keycodeToMove) {
                                    PickerConstructor._.trigger(P.component.key.go, P, [PickerConstructor._.trigger(keycodeToMove)])
                                }

                                // On “enter”, if the highlighted item isn’t disabled, set the value and close.
                                else if (!P.$root.find('.' + CLASSES.highlighted).hasClass(CLASSES.disabled)) {
                                    P.set('select', P.component.item.highlight)
                                    if (SETTINGS.closeOnSelect) {
                                        P.close(true)
                                    }
                                }
                            }


                            // If the target is within the root and “enter” is pressed,
                            // prevent the default action and trigger a click on the target instead.
                            else if ($.contains(P.$root[0], target) && keycode == 13) {
                                event.preventDefault()
                                target.click()
                            }
                        })
                    }

                    // Trigger the queued “open” events.
                    return P.trigger('open')
                }, //open


                /**
                 * Close the picker
                 */
                close: function(giveFocus) {
                    if (OT.Widget.theme === 'tall') return;

                    // If we need to give focus, do it before changing states.
                    if (giveFocus) {
                        if (SETTINGS.editable) {
                            ELEMENT.focus()
                        }
                        else {
                            // ....ah yes! It would’ve been incomplete without a crazy workaround for IE :|
                            // The focus is triggered *after* the close has completed - causing it
                            // to open again. So unbind and rebind the event at the next tick.
                            P.$holder.off('focus.toOpen').focus()
                            setTimeout(function() {
                                P.$holder.on('focus.toOpen', handleFocusToOpenEvent)
                            }, 0)
                        }
                    }

                    // Remove the “active” class.
                    $ELEMENT.removeClass(CLASSES.active)
                    aria(ELEMENT, 'expanded', false)

                    // * A Firefox bug, when `html` has `overflow:hidden`, results in
                    //   killing transitions :(. So remove the “opened” state on the next tick.
                    //   Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=625289
                    setTimeout(function() {

                        // Remove the “opened” and “focused” class from the picker root.
                        P.$root.removeClass(CLASSES.opened + ' ' + CLASSES.focused)
                        aria(P.$root[0], 'hidden', true)

                    }, 0)

                    // If it’s already closed, do nothing more.
                    if (!STATE.open) return P

                    // Set it as closed.
                    STATE.open = false

                    // Allow the page to scroll.
                    if (IS_DEFAULT_THEME) {
                        $('body').
                            css('overflow', '').
                            css('padding-right', '-=' + getScrollbarWidth())
                    }

                    // Unbind the document events.
                    $document.off('.' + STATE.id)

                    // Trigger the queued “close” events.
                    return P.trigger('close')
                }, //close


                /**
                 * Clear the values
                 */
                clear: function(options) {
                    return P.set('clear', null, options)
                }, //clear


                /**
                 * Set something
                 */
                set: function(thing, value, options) {

                    var thingItem, thingValue,
                        thingIsObject = $.isPlainObject(thing),
                        thingObject = thingIsObject ? thing : {}

                    // Make sure we have usable options.
                    options = thingIsObject && $.isPlainObject(value) ? value : options || {}

                    if (thing) {

                        // If the thing isn’t an object, make it one.
                        if (!thingIsObject) {
                            thingObject[thing] = value
                        }

                        // Go through the things of items to set.
                        for (thingItem in thingObject) {

                            // Grab the value of the thing.
                            thingValue = thingObject[thingItem]

                            // First, if the item exists and there’s a value, set it.
                            if (thingItem in P.component.item) {
                                if (thingValue === undefined) thingValue = null
                                P.component.set(thingItem, thingValue, options)
                            }

                            // Then, check to update the element value and broadcast a change.
                            if ((thingItem == 'select' || thingItem == 'clear') && SETTINGS.updateInput) {
                                $ELEMENT.
                                    val(thingItem == 'clear' ? '' : P.get(thingItem, SETTINGS.format)).
                                    trigger('change')
                            }
                        }

                        // Render a new picker.
                        P.render()
                    }

                    // When the method isn’t muted, trigger queued “set” events and pass the `thingObject`.
                    return options.muted ? P : P.trigger('set', thingObject)
                }, //set


                /**
                 * Get something
                 */
                get: function(thing, format) {

                    // Make sure there’s something to get.
                    thing = thing || 'value'

                    // If a picker state exists, return that.
                    if (STATE[thing] != null) {
                        return STATE[thing]
                    }

                    // Return the submission value, if that.
                    if (thing == 'valueSubmit') {
                        if (P._hidden) {
                            return P._hidden.value
                        }
                        thing = 'value'
                    }

                    // Return the value, if that.
                    if (thing == 'value') {
                        return ELEMENT.value
                    }

                    // Check if a component item exists, return that.
                    if (thing in P.component.item) {
                        if (typeof format == 'string') {
                            var thingValue = P.component.get(thing)
                            return thingValue ?
                                PickerConstructor._.trigger(
                                    P.component.formats.toString,
                                    P.component,
                                    [format, thingValue]
                                ) : ''
                        }
                        return P.component.get(thing)
                    }
                }, //get



                /**
                 * Bind events on the things.
                 */
                on: function(thing, method, internal) {

                    var thingName, thingMethod,
                        thingIsObject = $.isPlainObject(thing),
                        thingObject = thingIsObject ? thing : {}

                    if (thing) {

                        // If the thing isn’t an object, make it one.
                        if (!thingIsObject) {
                            thingObject[thing] = method
                        }

                        // Go through the things to bind to.
                        for (thingName in thingObject) {

                            // Grab the method of the thing.
                            thingMethod = thingObject[thingName]

                            // If it was an internal binding, prefix it.
                            if (internal) {
                                thingName = '_' + thingName
                            }

                            // Make sure the thing methods collection exists.
                            STATE.methods[thingName] = STATE.methods[thingName] || []

                            // Add the method to the relative method collection.
                            STATE.methods[thingName].push(thingMethod)
                        }
                    }

                    return P
                }, //on



                /**
                 * Unbind events on the things.
                 */
                off: function() {
                    var i, thingName,
                        names = arguments;
                    for (i = 0, namesCount = names.length; i < namesCount; i += 1) {
                        thingName = names[i]
                        if (thingName in STATE.methods) {
                            delete STATE.methods[thingName]
                        }
                    }
                    return P
                },


                /**
                 * Fire off method events.
                 */
                trigger: function(name, data) {
                    var _trigger = function(name) {
                        var methodList = STATE.methods[name]
                        if (methodList) {
                            methodList.map(function(method) {
                                PickerConstructor._.trigger(method, P, [data])
                            })
                        }
                    }
                    _trigger('_' + name)
                    _trigger(name)
                    return P
                } //trigger
            } //PickerInstance.prototype


        /**
         * Wrap the picker holder components together.
         */
        function createWrappedComponent() {

            // Create a picker wrapper holder
            return PickerConstructor._.node('div',

                // Create a picker wrapper node
                PickerConstructor._.node('div',

                    // Create a picker frame
                    PickerConstructor._.node('div',

                        // Create a picker box node
                        PickerConstructor._.node('div',

                            // Create the components nodes.
                            P.component.nodes(STATE.open),

                            // The picker box class
                            CLASSES.box
                        ),

                        // Picker wrap class
                        CLASSES.wrap
                    ),

                    // Picker frame class
                    CLASSES.frame
                ),

                // Picker holder class
                CLASSES.holder,

                'tabindex="-1"'
            ) //endreturn
        } //createWrappedComponent

        /**
         * Prepare the input element with all bindings.
         */
        function prepareElement() {

            $ELEMENT.

                // Store the picker data by component name.
                data(NAME, P).

                // Add the “input” class name.
                addClass(CLASSES.input).

                // If there’s a `data-value`, update the value of the element.
                val($ELEMENT.data('value') ?
                    P.get('select', SETTINGS.format) :
                    ELEMENT.value
                ).

                // On focus/click, open the picker.
                on('focus.' + STATE.id + ' click.' + STATE.id,
                    debounce(function(event) {
                        event.preventDefault()
                        P.open()
                    }, 100))

                // Mousedown handler to capture when the user starts interacting
                // with the picker. This is used in working around a bug in Chrome 73.
                .on('mousedown', function() {
                    STATE.handlingOpen = true;
                    var handler = function() {
                        // By default mouseup events are fired before a click event.
                        // By using a timeout we can force the mouseup to be handled
                        // after the corresponding click event is handled.
                        setTimeout(function() {
                            $(document).off('mouseup', handler);
                            STATE.handlingOpen = false;
                        }, 0);
                    };
                    $(document).on('mouseup', handler);
                });


            // Only bind keydown events if the element isn’t editable.
            if (!SETTINGS.editable) {

                $ELEMENT.

                    // Handle keyboard event based on the picker being opened or not.
                    on('keydown.' + STATE.id, handleKeydownEvent)
            }


            // Update the aria attributes.
            aria(ELEMENT, {
                // BKG-4143 this is changed from the original library
                // haspopup: true,
                expanded: false,
                readonly: false,
                owns: ELEMENT.id + '_root'
            })
        }


        /**
         * Prepare the root picker element with all bindings.
         */
        function prepareElementRoot() {
            aria(P.$root[0], 'hidden', true)
        }


        /**
         * Prepare the holder picker element with all bindings.
         */
        function prepareElementHolder() {

            P.$holder.

                on({

                    // For iOS8.
                    keydown: handleKeydownEvent,

                    'focus.toOpen': handleFocusToOpenEvent,

                    blur: function() {
                        // Remove the “target” class.
                        $ELEMENT.removeClass(CLASSES.target)
                    },

                    // When something within the holder is focused, stop from bubbling
                    // to the doc and remove the “focused” state from the root.
                    focusin: function(event) {
                        P.$root.removeClass(CLASSES.focused)
                        event.stopPropagation()
                    },

                    // When something within the holder is clicked, stop it
                    // from bubbling to the doc.
                    'mousedown click': function(event) {

                        var target = getRealEventTarget(event, ELEMENT)

                        // Make sure the target isn’t the root holder so it can bubble up.
                        if (target != P.$holder[0]) {

                            event.stopPropagation()

                            // * For mousedown events, cancel the default action in order to
                            //   prevent cases where focus is shifted onto external elements
                            //   when using things like jQuery mobile or MagnificPopup (ref: #249 & #120).
                            //   Also, for Firefox, don’t prevent action on the `option` element.
                            if (event.type == 'mousedown' && !$(target).is('input, select, textarea, button, option')) {

                                event.preventDefault()

                                // Re-focus onto the holder so that users can click away
                                // from elements focused within the picker.
                                P.$holder.eq(0).focus()
                            }
                        }
                    }

                }).

                // If there’s a click on an actionable element, carry out the actions.
                on('click', '[data-pick], [data-nav], [data-clear], [data-close]', function() {

                    var $target = $(this),
                        targetData = $target.data(),
                        targetDisabled = $target.hasClass(CLASSES.navDisabled) || $target.hasClass(CLASSES.disabled),

                        // * For IE, non-focusable elements can be active elements as well
                        //   (http://stackoverflow.com/a/2684561).
                        activeElement = getActiveElement()
                    activeElement = activeElement && ((activeElement.type || activeElement.href) ? activeElement : null);

                    // If it’s disabled or nothing inside is actively focused, re-focus the element.
                    if (targetDisabled || activeElement && !$.contains(P.$root[0], activeElement)) {
                        P.$holder.eq(0).focus()
                    }

                    // If something is superficially changed, update the `highlight` based on the `nav`.
                    if (!targetDisabled && targetData.nav) {
                        P.set('highlight', P.component.item.highlight, { nav: targetData.nav })
                    }

                    // If something is picked, set `select` then close with focus.
                    else if (!targetDisabled && 'pick' in targetData) {
                        P.set('select', targetData.pick)
                        if (SETTINGS.closeOnSelect) {
                            P.close(true)
                        }
                    }

                    // If a “clear” button is pressed, empty the values and close with focus.
                    else if (targetData.clear) {
                        P.clear()
                        if (SETTINGS.closeOnClear) {
                            P.close(true)
                        }
                    }

                    else if (targetData.close) {
                        P.close(true)
                    }

                }) //P.$holder

        }


        /**
         * Prepare the hidden input element along with all bindings.
         */
        function prepareElementHidden() {

            var name

            if (SETTINGS.hiddenName === true) {
                name = ELEMENT.name
                ELEMENT.name = ''
            }
            else {
                name = [
                    typeof SETTINGS.hiddenPrefix == 'string' ? SETTINGS.hiddenPrefix : '',
                    typeof SETTINGS.hiddenSuffix == 'string' ? SETTINGS.hiddenSuffix : '_submit'
                ]
                name = name[0] + ELEMENT.name + name[1]
            }

            P._hidden = $(
                '<input ' +
                'type=hidden ' +

                // Create the name using the original input’s with a prefix and suffix.
                'name="' + name + '"' +

                // If the element has a value, set the hidden value as well.
                (
                    $ELEMENT.data('value') || ELEMENT.value ?
                        ' value="' + P.get('select', SETTINGS.formatSubmit) + '"' :
                        ''
                ) +
                '>'
            )[0]

            $ELEMENT.

                // If the value changes, update the hidden input with the correct format.
                on('change.' + STATE.id, function() {
                    P._hidden.value = ELEMENT.value ?
                        P.get('select', SETTINGS.formatSubmit) :
                        ''
                })
        }


        // Wait for transitions to end before focusing the holder. Otherwise, while
        // using the `container` option, the view jumps to the container.
        function focusPickerOnceOpened() {

            if (IS_DEFAULT_THEME && supportsTransitions) {
                P.$holder.find('.' + CLASSES.frame).one('transitionend', function() {
                    P.$holder.eq(0).focus()
                })
            }
            else {
                setTimeout(function() {
                    P.$holder.eq(0).focus()
                }, 0)
            }
        }


        function handleFocusToOpenEvent(event) {

            // Stop the event from propagating to the doc.
            event.stopPropagation()

            // Add the “target” class.
            $ELEMENT.addClass(CLASSES.target)

            // Add the “focused” class to the root.
            P.$root.addClass(CLASSES.focused)

            // And then finally open the picker.
            P.open()
        }


        // For iOS8.
        function handleKeydownEvent(event) {

            var keycode = event.keyCode,

                // Check if one of the delete keys was pressed.
                isKeycodeDelete = /^(8|46)$/.test(keycode)

            // For some reason IE clears the input value on “escape”.
            if (keycode == 27) {
                P.close(true)
                return false
            }

            // Check if `space` or `delete` was pressed or the picker is closed with a key movement.
            if (keycode == 32 || isKeycodeDelete || !STATE.open && P.component.key[keycode]) {

                // Prevent it from moving the page and bubbling to doc.
                event.preventDefault()
                event.stopPropagation()

                // If `delete` was pressed, clear the values and close the picker.
                // Otherwise open the picker.
                if (isKeycodeDelete) { P.clear().close() }
                else { P.open() }
            }
        }


        // Return a new picker instance.
        return new PickerInstance()
    } //PickerConstructor



    /**
     * The default classes and prefix to use for the HTML classes.
     */
    PickerConstructor.klasses = function(prefix) {
        prefix = prefix || 'picker'
        return {

            picker: prefix,
            opened: prefix + '--opened',
            focused: prefix + '--focused',

            input: prefix + '__input',
            active: prefix + '__input--active',
            target: prefix + '__input--target',

            holder: prefix + '__holder',

            frame: prefix + '__frame',
            wrap: prefix + '__wrap',

            box: prefix + '__box'
        }
    } //PickerConstructor.klasses



    /**
     * Check if the default theme is being used.
     */
    function isUsingDefaultTheme(element) {

        var theme,
            prop = 'position'

        // For IE.
        if (element.currentStyle) {
            theme = element.currentStyle[prop]
        }

        // For normal browsers.
        else if (window.getComputedStyle) {
            theme = getComputedStyle(element)[prop]
        }

        return theme == 'fixed'
    }



    /**
     * Get the width of the browser’s scrollbar.
     * Taken from: https://github.com/VodkaBears/Remodal/blob/master/src/jquery.remodal.js
     */
    function getScrollbarWidth() {

        if ($html.height() <= $window.height()) {
            return 0
        }

        var $outer = $('<div style="visibility:hidden;width:100px" />').
            appendTo('body')

        // Get the width without scrollbars.
        var widthWithoutScroll = $outer[0].offsetWidth

        // Force adding scrollbars.
        $outer.css('overflow', 'scroll')

        // Add the inner div.
        var $inner = $('<div style="width:100%" />').appendTo($outer)

        // Get the width with scrollbars.
        var widthWithScroll = $inner[0].offsetWidth

        // Remove the divs.
        $outer.remove()

        // Return the difference between the widths.
        return widthWithoutScroll - widthWithScroll
    }



    /**
     * Get the target element from the event.
     * If ELEMENT is supplied and present in the event path (ELEMENT is ancestor of the target),
     * returns ELEMENT instead
     */
    function getRealEventTarget(event, ELEMENT) {

        var path = []

        if (event.path) {
            path = event.path
        }

        if (event.originalEvent && event.originalEvent.path) {
            path = event.originalEvent.path
        }

        if (path && path.length > 0) {
            if (ELEMENT && path.indexOf(ELEMENT) >= 0) {
                return ELEMENT
            } else {
                return path[0]
            }
        }

        return event.target
    }

    // taken from https://davidwalsh.name/javascript-debounce-function
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * PickerConstructor helper methods.
     */
    PickerConstructor._ = {

        /**
         * Create a group of nodes. Expects:
         * `
            {
                min:    {Integer},
                max:    {Integer},
                i:      {Integer},
                node:   {String},
                item:   {Function}
            }
         * `
         */
        group: function(groupObject) {

            var
                // Scope for the looped object
                loopObjectScope,

                // Create the nodes list
                nodesList = '',

                // The counter starts from the `min`
                counter = PickerConstructor._.trigger(groupObject.min, groupObject)


            // Loop from the `min` to `max`, incrementing by `i`
            for (; counter <= PickerConstructor._.trigger(groupObject.max, groupObject, [counter]); counter += groupObject.i) {

                // Trigger the `item` function within scope of the object
                loopObjectScope = PickerConstructor._.trigger(groupObject.item, groupObject, [counter])

                // Splice the subgroup and create nodes out of the sub nodes
                nodesList += PickerConstructor._.node(
                    groupObject.node,
                    loopObjectScope[0],   // the node
                    loopObjectScope[1],   // the classes
                    loopObjectScope[2]    // the attributes
                )
            }

            // Return the list of nodes
            return nodesList
        }, //group


        /**
         * Create a dom node string
         */
        node: function(wrapper, item, klass, attribute) {

            // If the item is false-y, just return an empty string
            if (!item) return ''

            // If the item is an array, do a join
            item = $.isArray(item) ? item.join('') : item

            // Check for the class
            klass = klass ? ' class="' + klass + '"' : ''

            // Check for any attributes
            attribute = attribute ? ' ' + attribute : ''

            // Return the wrapped item
            return '<' + wrapper + klass + attribute + '>' + item + '</' + wrapper + '>'
        }, //node


        /**
         * Lead numbers below 10 with a zero.
         */
        lead: function(number) {
            return (number < 10 ? '0' : '') + number
        },


        /**
         * Trigger a function otherwise return the value.
         */
        trigger: function(callback, scope, args) {
            return typeof callback == 'function' ? callback.apply(scope, args || []) : callback
        },


        /**
         * If the second character is a digit, length is 2 otherwise 1.
         */
        digits: function(string) {
            return (/\d/).test(string[1]) ? 2 : 1
        },


        /**
         * Tell if something is a date object.
         */
        isDate: function(value) {
            return {}.toString.call(value).indexOf('Date') > -1 && this.isInteger(value.getDate())
        },


        /**
         * Tell if something is an integer.
         */
        isInteger: function(value) {
            return {}.toString.call(value).indexOf('Number') > -1 && value % 1 === 0
        },


        /**
         * Create ARIA attribute strings.
         */
        ariaAttr: ariaAttr
    } //PickerConstructor._



    /**
     * Extend the picker with a component and defaults.
     */
    PickerConstructor.extend = function(name, Component) {

        // Extend jQuery.
        $.fn[name] = function(options, action) {

            // Grab the component data.
            var componentData = this.data(name)

            // If the picker is requested, return the data object.
            if (options == 'picker') {
                return componentData
            }

            // If the component data exists and `options` is a string, carry out the action.
            if (componentData && typeof options == 'string') {
                return PickerConstructor._.trigger(componentData[options], componentData, [action])
            }

            // Otherwise go through each matched element and if the component
            // doesn’t exist, create a new picker using `this` element
            // and merging the defaults and options with a deep copy.
            return this.each(function() {
                var $this = $(this)
                if (!$this.data(name)) {
                    new PickerConstructor(this, name, Component, options)
                }
            })
        }

        // Set the defaults.
        $.fn[name].defaults = Component.defaults
    } //PickerConstructor.extend



    function aria(element, attribute, value) {
        if ($.isPlainObject(attribute)) {
            for (var key in attribute) {
                ariaSet(element, key, attribute[key])
            }
        }
        else {
            ariaSet(element, attribute, value)
        }
    }
    function ariaSet(element, attribute, value) {
        element.setAttribute(
            (attribute == 'role' ? '' : 'aria-') + attribute,
            value
        )
    }
    function ariaAttr(attribute, data) {
        if (!$.isPlainObject(attribute)) {
            attribute = { attribute: data }
        }
        data = ''
        for (var key in attribute) {
            var attr = (key == 'role' ? '' : 'aria-') + key,
                attrVal = attribute[key]
            data += attrVal == null ? '' : attr + '="' + attribute[key] + '"'
        }
        return data
    }

    // IE8 bug throws an error for activeElements within iframes.
    function getActiveElement() {
        try {
            return document.activeElement
        } catch (err) { }
    }



    // Expose the picker constructor.
    return PickerConstructor


}));

/*!
 * Date picker for pickadate.js v3.6.3
 * http://amsul.github.io/pickadate.js/date.htm
 */

(function(factory) {

    // AMD.
    if (typeof define == 'function' && define.amd)
        define(['./picker', 'jquery'], factory)

    // Node.js/browserify.
    else if (typeof exports == 'object')
        module.exports = factory(require('./picker.js'), require('jquery'))

    // Browser globals.
    else factory(Picker, jQuery)

}(function(Picker, $) {


/**
 * Globals and constants
 */
var DAYS_IN_WEEK = 7,
    WEEKS_IN_CALENDAR = 6,
    _ = Picker._



/**
 * The date picker constructor
 */
function DatePicker(picker, settings) {

    var calendar = this,
        element = picker.$node[0],
        elementValue = element.value,
        elementDataValue = picker.$node.data('value'),
        valueString = elementDataValue || elementValue,
        formatString = elementDataValue ? settings.formatSubmit : settings.format,
        isRTL = function() {

            return element.currentStyle ?

                // For IE.
                element.currentStyle.direction == 'rtl' :

                // For normal browsers.
                getComputedStyle(picker.$root[0]).direction == 'rtl'
        }
    calendar.settings = settings
    calendar.$node = picker.$node
    // The queue of methods that will be used to build item objects.
    calendar.queue = {
        min: 'measure create',
        max: 'measure create',
        now: 'now create',
        select: 'parse create validate',
        highlight: 'parse navigate create validate',
        view: 'parse create validate viewset',
        disable: 'deactivate',
        enable: 'activate'
    }

    // The component's item object.
    calendar.item = {}

    calendar.item.clear = null
    calendar.item.disable = (settings.disable || []).slice(0)
    calendar.item.enable = -(function(collectionDisabled) {
        return collectionDisabled[0] === true ? collectionDisabled.shift() : -1
    })(calendar.item.disable)

    calendar.
        set('min', settings.min).
        set('max', settings.max).
        set('now')

    // When there’s a value, set the `select`, which in turn
    // also sets the `highlight` and `view`.
    if (valueString) {
        calendar.set('select', valueString, {
            format: formatString,
            defaultValue: true
        })
    }

    // If there’s no value, default to highlighting “today”.
    else {
        calendar.
            set('select', null).
            set('highlight', calendar.item.now)
    }


    // The keycode to movement mapping.
    calendar.key = {
        40: 7, // Down
        38: -7, // Up
        39: function() { return isRTL() ? -1 : 1 }, // Right
        37: function() { return isRTL() ? 1 : -1 }, // Left
        go: function(timeChange) {
            var highlightedObject = calendar.item.highlight,
                targetDate = new Date(highlightedObject.year, highlightedObject.month, highlightedObject.date + timeChange)
            calendar.set(
                'highlight',
                targetDate,
                { interval: timeChange }
            )
            this.render()
        }
    }


    // Bind some picker events.
    picker.
        on('render', function() {
            picker.$root.find('.' + settings.klass.selectMonth).on('change', function() {
                var value = this.value
                if (value) {
                    picker.set('highlight', [picker.get('view').year, value, picker.get('highlight').date])
                    picker.$root.find('.' + settings.klass.selectMonth).trigger('focus')
                }
            })
            picker.$root.find('.' + settings.klass.selectYear).on('change', function() {
                var value = this.value
                if (value) {
                    picker.set('highlight', [value, picker.get('view').month, picker.get('highlight').date])
                    picker.$root.find('.' + settings.klass.selectYear).trigger('focus')
                }
            })
        }, 1).
        on('open', function() {
            var includeToday = ''
            if (calendar.disabled(calendar.get('now'))) {
                includeToday = ':not(.' + settings.klass.buttonToday + ')'
            }
            picker.$root.find('button' + includeToday + ', select').attr('disabled', false)
        }, 1).
        on('close', function() {
            picker.$root.find('button, select').attr('disabled', true)
        }, 1)

} //DatePicker


/**
 * Set a datepicker item object.
 */
DatePicker.prototype.set = function(type, value, options) {

    var calendar = this,
        calendarItem = calendar.item

    // If the value is `null` just set it immediately.
    if (value === null) {
        if (type == 'clear') type = 'select'
        calendarItem[type] = value
        return calendar
    }

    // Otherwise go through the queue of methods, and invoke the functions.
    // Update this as the time unit, and set the final value as this item.
    // * In the case of `enable`, keep the queue but set `disable` instead.
    //   And in the case of `flip`, keep the queue but set `enable` instead.
    calendarItem[(type == 'enable' ? 'disable' : type == 'flip' ? 'enable' : type)] = calendar.queue[type].split(' ').map(function(method) {
        value = calendar[method](type, value, options)
        return value
    }).pop()

    // Check if we need to cascade through more updates.
    if (type == 'select') {
        calendar.set('highlight', calendarItem.select, options)
    }
    else if (type == 'highlight') {
        calendar.set('view', calendarItem.highlight, options)
    }
    else if (type.match(/^(flip|min|max|disable|enable)$/)) {
        if (calendarItem.select && calendar.disabled(calendarItem.select)) {
            calendar.set('select', calendarItem.select, options)
        }
        if (calendarItem.highlight && calendar.disabled(calendarItem.highlight)) {
            calendar.set('highlight', calendarItem.highlight, options)
        }
    }

    return calendar
} //DatePicker.prototype.set


/**
 * Get a datepicker item object.
 */
DatePicker.prototype.get = function(type) {
    return this.item[type]
} //DatePicker.prototype.get


/**
 * Create a picker date object.
 */
DatePicker.prototype.create = function(type, value, options) {

    var isInfiniteValue,
        calendar = this

    // If there’s no value, use the type as the value.
    value = value === undefined ? type : value


    // If it’s infinity, update the value.
    if (value == -Infinity || value == Infinity) {
        isInfiniteValue = value
    }

    // If it’s an object, use the native date object.
    else if ($.isPlainObject(value) && _.isInteger(value.pick)) {
        value = value.obj
    }

    // If it’s an array, convert it into a date and make sure
    // that it’s a valid date – otherwise default to today.
    else if ($.isArray(value)) {
        value = new Date(value[0], value[1], value[2])
        value = _.isDate(value) ? value : calendar.create().obj
    }

    // If it’s a number or date object, make a normalized date.
    else if (_.isInteger(value) || _.isDate(value)) {
        value = calendar.normalize(new Date(value), options)
    }

    // If it’s a literal true or any other case, set it to now.
    else /*if ( value === true )*/ {
        value = calendar.now(type, value, options)
    }

    // Return the compiled object.
    return {
        year: isInfiniteValue || value.getFullYear(),
        month: isInfiniteValue || value.getMonth(),
        date: isInfiniteValue || value.getDate(),
        day: isInfiniteValue || value.getDay(),
        obj: isInfiniteValue || value,
        pick: isInfiniteValue || value.getTime()
    }
} //DatePicker.prototype.create


/**
 * Create a range limit object using an array, date object,
 * literal “true”, or integer relative to another time.
 */
DatePicker.prototype.createRange = function(from, to) {

    var calendar = this,
        createDate = function(date) {
            if (date === true || $.isArray(date) || _.isDate(date)) {
                return calendar.create(date)
            }
            return date
        }

    // Create objects if possible.
    if (!_.isInteger(from)) {
        from = createDate(from)
    }
    if (!_.isInteger(to)) {
        to = createDate(to)
    }

    // Create relative dates.
    if (_.isInteger(from) && $.isPlainObject(to)) {
        from = [to.year, to.month, to.date + from];
    }
    else if (_.isInteger(to) && $.isPlainObject(from)) {
        to = [from.year, from.month, from.date + to];
    }

    return {
        from: createDate(from),
        to: createDate(to)
    }
} //DatePicker.prototype.createRange


/**
 * Check if a date unit falls within a date range object.
 */
DatePicker.prototype.withinRange = function(range, dateUnit) {
    range = this.createRange(range.from, range.to)
    return dateUnit.pick >= range.from.pick && dateUnit.pick <= range.to.pick
}


/**
 * Check if two date range objects overlap.
 */
DatePicker.prototype.overlapRanges = function(one, two) {

    var calendar = this

    // Convert the ranges into comparable dates.
    one = calendar.createRange(one.from, one.to)
    two = calendar.createRange(two.from, two.to)

    return calendar.withinRange(one, two.from) || calendar.withinRange(one, two.to) ||
        calendar.withinRange(two, one.from) || calendar.withinRange(two, one.to)
}


/**
 * Get the date today.
 */
DatePicker.prototype.now = function(type, value, options) {
    value = new Date()
    if (options && options.rel) {
        value.setDate(value.getDate() + options.rel)
    }
    return this.normalize(value, options)
}


/**
 * Navigate to next/prev month.
 */
DatePicker.prototype.navigate = function(type, value, options) {

    var targetDateObject,
        targetYear,
        targetMonth,
        targetDate,
        isTargetArray = $.isArray(value),
        isTargetObject = $.isPlainObject(value),
        viewsetObject = this.item.view/*,
    safety = 100*/


    if (isTargetArray || isTargetObject) {

        if (isTargetObject) {
            targetYear = value.year
            targetMonth = value.month
            targetDate = value.date
        }
        else {
            targetYear = +value[0]
            targetMonth = +value[1]
            targetDate = +value[2]
        }

        // If we’re navigating months but the view is in a different
        // month, navigate to the view’s year and month.
        if (options && options.nav && viewsetObject && viewsetObject.month !== targetMonth) {
            targetYear = viewsetObject.year
            targetMonth = viewsetObject.month
        }

        // Figure out the expected target year and month.
        targetDateObject = new Date(targetYear, targetMonth + (options && options.nav ? options.nav : 0), 1)
        targetYear = targetDateObject.getFullYear()
        targetMonth = targetDateObject.getMonth()

        // If the month we’re going to doesn’t have enough days,
        // keep decreasing the date until we reach the month’s last date.
        while ( /*safety &&*/ new Date(targetYear, targetMonth, targetDate).getMonth() !== targetMonth) {
            targetDate -= 1
            /*safety -= 1
            if ( !safety ) {
                throw 'Fell into an infinite loop while navigating to ' + new Date( targetYear, targetMonth, targetDate ) + '.'
            }*/
        }

        value = [targetYear, targetMonth, targetDate]
    }

    return value
} //DatePicker.prototype.navigate


/**
 * Normalize a date by setting the hours to midnight.
 */
DatePicker.prototype.normalize = function(value/*, options*/) {
    value.setHours(0, 0, 0, 0)
    return value
}


/**
 * Measure the range of dates.
 */
DatePicker.prototype.measure = function(type, value/*, options*/) {

    var calendar = this

    // If it's an integer, get a date relative to today.
    if (_.isInteger(value)) {
        value = calendar.now(type, value, { rel: value })
    }

    // If it’s anything false-y, remove the limits.
    else if (!value) {
        value = type == 'min' ? -Infinity : Infinity
    }

    // If it’s a string, parse it.
    else if (typeof value == 'string') {
        value = calendar.parse(type, value)
    }

    return value
} ///DatePicker.prototype.measure


/**
 * Create a viewset object based on navigation.
 */
DatePicker.prototype.viewset = function(type, dateObject/*, options*/) {
    return this.create([dateObject.year, dateObject.month, 1])
}


/**
 * Validate a date as enabled and shift if needed.
 */
DatePicker.prototype.validate = function(type, dateObject, options) {

    var calendar = this,

        // Keep a reference to the original date.
        originalDateObject = dateObject,

        // Make sure we have an interval.
        interval = options && options.interval ? options.interval : 1,

        // Check if the calendar enabled dates are inverted.
        isFlippedBase = calendar.item.enable === -1,

        // Check if we have any enabled dates after/before now.
        hasEnabledBeforeTarget, hasEnabledAfterTarget,

        // The min & max limits.
        minLimitObject = calendar.item.min,
        maxLimitObject = calendar.item.max,

        // Check if we’ve reached the limit during shifting.
        reachedMin, reachedMax,

        // Check if the calendar is inverted and at least one weekday is enabled.
        hasEnabledWeekdays = isFlippedBase && calendar.item.disable.filter(function(value) {

            // If there’s a date, check where it is relative to the target.
            if ($.isArray(value)) {
                var dateTime = calendar.create(value).pick
                if (dateTime < dateObject.pick) hasEnabledBeforeTarget = true
                else if (dateTime > dateObject.pick) hasEnabledAfterTarget = true
            }

            // Return only integers for enabled weekdays.
            return _.isInteger(value)
        }).length/*,

    safety = 100*/



    // Cases to validate for:
    // [1] Not inverted and date disabled.
    // [2] Inverted and some dates enabled.
    // [3] Not inverted and out of range.
    //
    // Cases to **not** validate for:
    // • Navigating months.
    // • Not inverted and date enabled.
    // • Inverted and all dates disabled.
    // • ..and anything else.
    if (!options || (!options.nav && !options.defaultValue)) if (
    /* 1 */ (!isFlippedBase && calendar.disabled(dateObject)) ||
    /* 2 */ (isFlippedBase && calendar.disabled(dateObject) && (hasEnabledWeekdays || hasEnabledBeforeTarget || hasEnabledAfterTarget)) ||
    /* 3 */ (!isFlippedBase && (dateObject.pick <= minLimitObject.pick || dateObject.pick >= maxLimitObject.pick))
    ) {


        // When inverted, flip the direction if there aren’t any enabled weekdays
        // and there are no enabled dates in the direction of the interval.
        if (isFlippedBase && !hasEnabledWeekdays && ((!hasEnabledAfterTarget && interval > 0) || (!hasEnabledBeforeTarget && interval < 0))) {
            interval *= -1
        }


        // Keep looping until we reach an enabled date.
        while ( /*safety &&*/ calendar.disabled(dateObject)) {

            /*safety -= 1
            if ( !safety ) {
                throw 'Fell into an infinite loop while validating ' + dateObject.obj + '.'
            }*/


            // If we’ve looped into the next/prev month with a large interval, return to the original date and flatten the interval.
            if (Math.abs(interval) > 1 && (dateObject.month < originalDateObject.month || dateObject.month > originalDateObject.month)) {
                dateObject = originalDateObject
                interval = interval > 0 ? 1 : -1
            }


            // If we’ve reached the min/max limit, reverse the direction, flatten the interval and set it to the limit.
            if (dateObject.pick <= minLimitObject.pick) {
                reachedMin = true
                interval = 1
                dateObject = calendar.create([
                    minLimitObject.year,
                    minLimitObject.month,
                    minLimitObject.date + (dateObject.pick === minLimitObject.pick ? 0 : -1)
                ])
            }
            else if (dateObject.pick >= maxLimitObject.pick) {
                reachedMax = true
                interval = -1
                dateObject = calendar.create([
                    maxLimitObject.year,
                    maxLimitObject.month,
                    maxLimitObject.date + (dateObject.pick === maxLimitObject.pick ? 0 : 1)
                ])
            }


            // If we’ve reached both limits, just break out of the loop.
            if (reachedMin && reachedMax) {
                break
            }


            // Finally, create the shifted date using the interval and keep looping.
            dateObject = calendar.create([dateObject.year, dateObject.month, dateObject.date + interval])
        }

    } //endif


    // Return the date object settled on.
    return dateObject
} //DatePicker.prototype.validate


/**
 * Check if a date is disabled.
 */
DatePicker.prototype.disabled = function(dateToVerify) {

    var
        calendar = this,

        // Filter through the disabled dates to check if this is one.
        isDisabledMatch = calendar.item.disable.filter(function(dateToDisable) {

            // If the date is a number, match the weekday with 0index and `firstDay` check.
            if (_.isInteger(dateToDisable)) {
                return dateToVerify.day === (calendar.settings.firstDay ? dateToDisable : dateToDisable - 1) % 7
            }

            // If it’s an array or a native JS date, create and match the exact date.
            if ($.isArray(dateToDisable) || _.isDate(dateToDisable)) {
                return dateToVerify.pick === calendar.create(dateToDisable).pick
            }

            // If it’s an object, match a date within the “from” and “to” range.
            if ($.isPlainObject(dateToDisable)) {
                return calendar.withinRange(dateToDisable, dateToVerify)
            }
        })

    // If this date matches a disabled date, confirm it’s not inverted.
    isDisabledMatch = isDisabledMatch.length && !isDisabledMatch.filter(function(dateToDisable) {
        return $.isArray(dateToDisable) && dateToDisable[3] == 'inverted' ||
            $.isPlainObject(dateToDisable) && dateToDisable.inverted
    }).length

    // Check the calendar “enabled” flag and respectively flip the
    // disabled state. Then also check if it’s beyond the min/max limits.
    return calendar.item.enable === -1 ? !isDisabledMatch : isDisabledMatch ||
        dateToVerify.pick < calendar.item.min.pick ||
        dateToVerify.pick > calendar.item.max.pick

} //DatePicker.prototype.disabled


/**
 * Parse a string into a usable type.
 */
DatePicker.prototype.parse = function(type, value, options) {

    var calendar = this,
        parsingObject = {}

    // If it’s already parsed, we’re good.
    if (!value || typeof value != 'string') {
        return value
    }

    // We need a `.format` to parse the value with.
    if (!(options && options.format)) {
        options = options || {}
        options.format = calendar.settings.format
    }

    // Convert the format into an array and then map through it.
    calendar.formats.toArray(options.format).map(function(label) {

        var
            // Grab the formatting label.
            formattingLabel = calendar.formats[label],

            // The format length is from the formatting label function or the
            // label length without the escaping exclamation (!) mark.
            formatLength = formattingLabel ? _.trigger(formattingLabel, calendar, [value, parsingObject]) : label.replace(/^!/, '').length

        // If there's a format label, split the value up to the format length.
        // Then add it to the parsing object with appropriate label.
        if (formattingLabel) {
            parsingObject[label] = value.substr(0, formatLength)
        }

        // Update the value as the substring from format length to end.
        value = value.substr(formatLength)
    })

    // Compensate for month 0index.
    return [
        parsingObject.yyyy || parsingObject.yy,
        +(parsingObject.mm || parsingObject.m) - 1,
        parsingObject.dd || parsingObject.d
    ]
} //DatePicker.prototype.parse


/**
 * Various formats to display the object in.
 */
DatePicker.prototype.formats = (function() {

    // Return the length of the first word in a collection.
    function getWordLengthFromCollection(string, collection, dateObject) {

        // Grab the first word from the string.
        // Regex pattern from http://stackoverflow.com/q/150033
        var word = string.match(/[^\x00-\x7F]+|\w+/)[0]

        // If there's no month index, add it to the date object
        if (!dateObject.mm && !dateObject.m) {
            dateObject.m = collection.indexOf(word) + 1
        }

        // Return the length of the word.
        return word.length
    }

    // Get the length of the first word in a string.
    function getFirstWordLength(string) {
        return string.match(/\w+/)[0].length
    }

    return {

        d: function(string, dateObject) {

            // If there's string, then get the digits length.
            // Otherwise return the selected date.
            return string ? _.digits(string) : dateObject.date
        },
        dd: function(string, dateObject) {

            // If there's a string, then the length is always 2.
            // Otherwise return the selected date with a leading zero.
            return string ? 2 : _.lead(dateObject.date)
        },
        ddd: function(string, dateObject) {

            // If there's a string, then get the length of the first word.
            // Otherwise return the short selected weekday.
            return string ? getFirstWordLength(string) : this.settings.weekdaysShort[dateObject.day]
        },
        dddd: function(string, dateObject) {

            // If there's a string, then get the length of the first word.
            // Otherwise return the full selected weekday.
            return string ? getFirstWordLength(string) : this.settings.weekdaysFull[dateObject.day]
        },
        m: function(string, dateObject) {

            // If there's a string, then get the length of the digits
            // Otherwise return the selected month with 0index compensation.
            return string ? _.digits(string) : dateObject.month + 1
        },
        mm: function(string, dateObject) {

            // If there's a string, then the length is always 2.
            // Otherwise return the selected month with 0index and leading zero.
            return string ? 2 : _.lead(dateObject.month + 1)
        },
        mmm: function(string, dateObject) {

            var collection = this.settings.monthsShort

            // If there's a string, get length of the relevant month from the short
            // months collection. Otherwise return the selected month from that collection.
            return string ? getWordLengthFromCollection(string, collection, dateObject) : collection[dateObject.month]
        },
        mmmm: function(string, dateObject) {

            var collection = this.settings.monthsFull

            // If there's a string, get length of the relevant month from the full
            // months collection. Otherwise return the selected month from that collection.
            return string ? getWordLengthFromCollection(string, collection, dateObject) : collection[dateObject.month]
        },
        yy: function(string, dateObject) {

            // If there's a string, then the length is always 2.
            // Otherwise return the selected year by slicing out the first 2 digits.
            return string ? 2 : ('' + dateObject.year).slice(2)
        },
        yyyy: function(string, dateObject) {

            // If there's a string, then the length is always 4.
            // Otherwise return the selected year.
            return string ? 4 : dateObject.year
        },

        // Create an array by splitting the formatting string passed.
        toArray: function(formatString) { return formatString.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g) },

        // Format an object into a string using the formatting options.
        toString: function(formatString, itemObject) {
            var calendar = this
            return calendar.formats.toArray(formatString).map(function(label) {
                return _.trigger(calendar.formats[label], calendar, [0, itemObject]) || label.replace(/^!/, '')
            }).join('')
        }
    }
})() //DatePicker.prototype.formats




/**
 * Check if two date units are the exact.
 */
DatePicker.prototype.isDateExact = function(one, two) {

    var calendar = this

    // When we’re working with weekdays, do a direct comparison.
    if (
        (_.isInteger(one) && _.isInteger(two)) ||
        (typeof one == 'boolean' && typeof two == 'boolean')
    ) {
        return one === two
    }

    // When we’re working with date representations, compare the “pick” value.
    if (
        (_.isDate(one) || $.isArray(one)) &&
        (_.isDate(two) || $.isArray(two))
    ) {
        return calendar.create(one).pick === calendar.create(two).pick
    }

    // When we’re working with range objects, compare the “from” and “to”.
    if ($.isPlainObject(one) && $.isPlainObject(two)) {
        return calendar.isDateExact(one.from, two.from) && calendar.isDateExact(one.to, two.to)
    }

    return false
}


/**
 * Check if two date units overlap.
 */
DatePicker.prototype.isDateOverlap = function(one, two) {

    var calendar = this,
        firstDay = calendar.settings.firstDay ? 1 : 0

    // When we’re working with a weekday index, compare the days.
    if (_.isInteger(one) && (_.isDate(two) || $.isArray(two))) {
        one = one % 7 + firstDay
        return one === calendar.create(two).day + 1
    }
    if (_.isInteger(two) && (_.isDate(one) || $.isArray(one))) {
        two = two % 7 + firstDay
        return two === calendar.create(one).day + 1
    }

    // When we’re working with range objects, check if the ranges overlap.
    if ($.isPlainObject(one) && $.isPlainObject(two)) {
        return calendar.overlapRanges(one, two)
    }

    return false
}


/**
 * Flip the “enabled” state.
 */
DatePicker.prototype.flipEnable = function(val) {
    var itemObject = this.item
    itemObject.enable = val || (itemObject.enable == -1 ? 1 : -1)
}


/**
 * Mark a collection of dates as “disabled”.
 */
DatePicker.prototype.deactivate = function(type, datesToDisable) {

    var calendar = this,
        disabledItems = calendar.item.disable.slice(0)


    // If we’re flipping, that’s all we need to do.
    if (datesToDisable == 'flip') {
        calendar.flipEnable()
    }

    else if (datesToDisable === false) {
        calendar.flipEnable(1)
        disabledItems = []
    }

    else if (datesToDisable === true) {
        calendar.flipEnable(-1)
        disabledItems = []
    }

    // Otherwise go through the dates to disable.
    else {

        datesToDisable.map(function(unitToDisable) {

            var matchFound

            // When we have disabled items, check for matches.
            // If something is matched, immediately break out.
            for (var index = 0; index < disabledItems.length; index += 1) {
                if (calendar.isDateExact(unitToDisable, disabledItems[index])) {
                    matchFound = true
                    break
                }
            }

            // If nothing was found, add the validated unit to the collection.
            if (!matchFound) {
                if (
                    _.isInteger(unitToDisable) ||
                    _.isDate(unitToDisable) ||
                    $.isArray(unitToDisable) ||
                    ($.isPlainObject(unitToDisable) && unitToDisable.from && unitToDisable.to)
                ) {
                    disabledItems.push(unitToDisable)
                }
            }
        })
    }

    // Return the updated collection.
    return disabledItems
} //DatePicker.prototype.deactivate


/**
 * Mark a collection of dates as “enabled”.
 */
DatePicker.prototype.activate = function(type, datesToEnable) {

    var calendar = this,
        disabledItems = calendar.item.disable,
        disabledItemsCount = disabledItems.length

    // If we’re flipping, that’s all we need to do.
    if (datesToEnable == 'flip') {
        calendar.flipEnable()
    }

    else if (datesToEnable === true) {
        calendar.flipEnable(1)
        disabledItems = []
    }

    else if (datesToEnable === false) {
        calendar.flipEnable(-1)
        disabledItems = []
    }

    // Otherwise go through the disabled dates.
    else {

        datesToEnable.map(function(unitToEnable) {

            var matchFound,
                disabledUnit,
                index,
                isExactRange

            // Go through the disabled items and try to find a match.
            for (index = 0; index < disabledItemsCount; index += 1) {

                disabledUnit = disabledItems[index]

                // When an exact match is found, remove it from the collection.
                if (calendar.isDateExact(disabledUnit, unitToEnable)) {
                    matchFound = disabledItems[index] = null
                    isExactRange = true
                    break
                }

                // When an overlapped match is found, add the “inverted” state to it.
                else if (calendar.isDateOverlap(disabledUnit, unitToEnable)) {
                    if ($.isPlainObject(unitToEnable)) {
                        unitToEnable.inverted = true
                        matchFound = unitToEnable
                    }
                    else if ($.isArray(unitToEnable)) {
                        matchFound = unitToEnable
                        if (!matchFound[3]) matchFound.push('inverted')
                    }
                    else if (_.isDate(unitToEnable)) {
                        matchFound = [unitToEnable.getFullYear(), unitToEnable.getMonth(), unitToEnable.getDate(), 'inverted']
                    }
                    break
                }
            }

            // If a match was found, remove a previous duplicate entry.
            if (matchFound) for (index = 0; index < disabledItemsCount; index += 1) {
                if (calendar.isDateExact(disabledItems[index], unitToEnable)) {
                    disabledItems[index] = null
                    break
                }
            }

            // In the event that we’re dealing with an exact range of dates,
            // make sure there are no “inverted” dates because of it.
            if (isExactRange) for (index = 0; index < disabledItemsCount; index += 1) {
                if (calendar.isDateOverlap(disabledItems[index], unitToEnable)) {
                    disabledItems[index] = null
                    break
                }
            }

            // If something is still matched, add it into the collection.
            if (matchFound) {
                disabledItems.push(matchFound)
            }
        })
    }

    // Return the updated collection.
    return disabledItems.filter(function(val) { return val != null })
} //DatePicker.prototype.activate


/**
 * Create a string for the nodes in the picker.
 */
DatePicker.prototype.nodes = function(isOpen) {

    var
        calendar = this,
        settings = calendar.settings,
        calendarItem = calendar.item,
        nowObject = calendarItem.now,
        selectedObject = calendarItem.select,
        highlightedObject = calendarItem.highlight,
        viewsetObject = calendarItem.view,
        disabledCollection = calendarItem.disable,
        minLimitObject = calendarItem.min,
        maxLimitObject = calendarItem.max,


        // Create the calendar table head using a copy of weekday labels collection.
        // * We do a copy so we don't mutate the original array.
        tableHead = (function(collection, fullCollection) {

            // If the first day should be Monday, move Sunday to the end.
            if (settings.firstDay) {
                collection.push(collection.shift())
                fullCollection.push(fullCollection.shift())
            }

            // Create and return the table head group.
            return _.node(
                'thead',
                _.node(
                    'tr',
                    _.group({
                        min: 0,
                        max: DAYS_IN_WEEK - 1,
                        i: 1,
                        node: 'th',
                        item: function(counter) {
                            return [
                                collection[counter],
                                settings.klass.weekdays,
                                'scope=col title="' + fullCollection[counter] + '"'
                            ]
                        }
                    })
                )
            ) //endreturn
        })((settings.showWeekdaysFull ? settings.weekdaysFull : settings.weekdaysShort).slice(0), settings.weekdaysFull.slice(0)), //tableHead


        // Create the nav for next/prev month.
        createMonthNav = function(next) {

            // Otherwise, return the created month tag.
            return _.node(
                'div',
                ' ',
                settings.klass['nav' + (next ? 'Next' : 'Prev')] + (

                    // If the focused month is outside the range, disabled the button.
                    (next && viewsetObject.year >= maxLimitObject.year && viewsetObject.month >= maxLimitObject.month) ||
                        (!next && viewsetObject.year <= minLimitObject.year && viewsetObject.month <= minLimitObject.month) ?
                        ' ' + settings.klass.navDisabled : ''
                ),
                'data-nav=' + (next || -1) + ' ' +
                _.ariaAttr({
                    role: 'button',
                    controls: calendar.$node[0].id + '_table'
                }) + ' ' +
                'title="' + (next ? settings.labelMonthNext : settings.labelMonthPrev) + '"'
            ) //endreturn
        }, //createMonthNav


        // Create the month label.
        createMonthLabel = function() {

            var monthsCollection = settings.showMonthsShort ? settings.monthsShort : settings.monthsFull

            // If there are months to select, add a dropdown menu.
            if (settings.selectMonths) {

                return _.node('select',
                    _.group({
                        min: 0,
                        max: 11,
                        i: 1,
                        node: 'option',
                        item: function(loopedMonth) {

                            return [

                                // The looped month and no classes.
                                monthsCollection[loopedMonth], 0,

                                // Set the value and selected index.
                                'value=' + loopedMonth +
                                (viewsetObject.month == loopedMonth ? ' selected' : '') +
                                (
                                    (
                                        (viewsetObject.year == minLimitObject.year && loopedMonth < minLimitObject.month) ||
                                        (viewsetObject.year == maxLimitObject.year && loopedMonth > maxLimitObject.month)
                                    ) ?
                                        ' disabled' : ''
                                )
                            ]
                        }
                    }),
                    settings.klass.selectMonth,
                    (isOpen ? '' : 'disabled') + ' ' +
                    _.ariaAttr({ controls: calendar.$node[0].id + '_table' }) + ' ' +
                    'title="' + settings.labelMonthSelect + '"'
                )
            }

            // If there's a need for a month selector
            return _.node('div', monthsCollection[viewsetObject.month], settings.klass.month)
        }, //createMonthLabel


        // Create the year label.
        createYearLabel = function() {

            var focusedYear = viewsetObject.year,

                // If years selector is set to a literal "true", set it to 5. Otherwise
                // divide in half to get half before and half after focused year.
                numberYears = settings.selectYears === true ? 5 : ~~(settings.selectYears / 2)

            // If there are years to select, add a dropdown menu.
            if (numberYears) {

                var
                    minYear = minLimitObject.year,
                    maxYear = maxLimitObject.year,
                    lowestYear = focusedYear - numberYears,
                    highestYear = focusedYear + numberYears

                // If the min year is greater than the lowest year, increase the highest year
                // by the difference and set the lowest year to the min year.
                if (minYear > lowestYear) {
                    highestYear += minYear - lowestYear
                    lowestYear = minYear
                }

                // If the max year is less than the highest year, decrease the lowest year
                // by the lower of the two: available and needed years. Then set the
                // highest year to the max year.
                if (maxYear < highestYear) {

                    var availableYears = lowestYear - minYear,
                        neededYears = highestYear - maxYear

                    lowestYear -= availableYears > neededYears ? neededYears : availableYears
                    highestYear = maxYear
                }

                return _.node('select',
                    _.group({
                        min: lowestYear,
                        max: highestYear,
                        i: 1,
                        node: 'option',
                        item: function(loopedYear) {
                            return [

                                // The looped year and no classes.
                                loopedYear, 0,

                                // Set the value and selected index.
                                'value=' + loopedYear + (focusedYear == loopedYear ? ' selected' : '')
                            ]
                        }
                    }),
                    settings.klass.selectYear,
                    (isOpen ? '' : 'disabled') + ' ' + _.ariaAttr({ controls: calendar.$node[0].id + '_table' }) + ' ' +
                    'title="' + settings.labelYearSelect + '"'
                )
            }

            // Otherwise just return the year focused
            return _.node('div', focusedYear, settings.klass.year)
        } //createYearLabel


    // Create and return the entire calendar.
    return _.node(
        'div',
        (settings.selectYears ? createYearLabel() + createMonthLabel() : createMonthLabel() + createYearLabel()) +
        createMonthNav() + createMonthNav(1),
        settings.klass.header
    ) + _.node(
        'table',
        tableHead +
        _.node(
            'tbody',
            _.group({
                min: 0,
                max: WEEKS_IN_CALENDAR - 1,
                i: 1,
                node: 'tr',
                item: function(rowCounter) {

                    // If Monday is the first day and the month starts on Sunday, shift the date back a week.
                    var shiftDateBy = settings.firstDay && calendar.create([viewsetObject.year, viewsetObject.month, 1]).day === 0 ? -7 : 0

                    return [
                        _.group({
                            min: DAYS_IN_WEEK * rowCounter - viewsetObject.day + shiftDateBy + 1, // Add 1 for weekday 0index
                            max: function() {
                                return this.min + DAYS_IN_WEEK - 1
                            },
                            i: 1,
                            node: 'td',
                            item: function(targetDate) {

                                // Convert the time date from a relative date to a target date.
                                targetDate = calendar.create([viewsetObject.year, viewsetObject.month, targetDate + (settings.firstDay ? 1 : 0)])

                                var isSelected = selectedObject && selectedObject.pick == targetDate.pick,
                                    isHighlighted = highlightedObject && highlightedObject.pick == targetDate.pick,
                                    isDisabled = disabledCollection && calendar.disabled(targetDate) || targetDate.pick < minLimitObject.pick || targetDate.pick > maxLimitObject.pick,
                                    formattedDate = _.trigger(calendar.formats.toString, calendar, [settings.format, targetDate])

                                return [
                                     _.node(
                                       'div',
                                       [
                                         _.node('span', formattedDate, 'ot-offscreen'),
                                         _.node('span', targetDate.date, '', _.ariaAttr({ hidden: true }))
                                       ],
                                        (function(klasses) {

                                            // Add the `infocus` or `outfocus` classes based on month in view.
                                            klasses.push(viewsetObject.month == targetDate.month ? settings.klass.infocus : settings.klass.outfocus)

                                            // Add the `today` class if needed.
                                            if (nowObject.pick == targetDate.pick) {
                                                klasses.push(settings.klass.now)
                                            }

                                            // Add the `selected` class if something's selected and the time matches.
                                            if (isSelected) {
                                                klasses.push(settings.klass.selected)
                                            }

                                            // Add the `highlighted` class if something's highlighted and the time matches.
                                            if (isHighlighted) {
                                                klasses.push(settings.klass.highlighted)
                                            }

                                            // Add the `disabled` class if something's disabled and the object matches.
                                            if (isDisabled) {
                                                klasses.push(settings.klass.disabled)
                                            }

                                            return klasses.join(' ')
                                        })([settings.klass.day]),
                                        'data-pick=' + targetDate.pick + ' ' + _.ariaAttr({
                                            role: 'gridcell',
                                            selected: isSelected && calendar.$node.val() === formattedDate ? true : null,
                                            disabled: isDisabled ? true : null
                                        }) + ' ' + 'id=d' + targetDate.pick
                                    ),
                                    '',
                                    _.ariaAttr({ role: 'presentation' })
                                ] //endreturn
                            }
                        })
                    ] //endreturn
                }
            })
        ),
        settings.klass.table,
        'id="' + calendar.$node[0].id + '_table' + '" ' + _.ariaAttr({
            role: 'grid',
            controls: calendar.$node[0].id,
            readonly: true
        })
    ) +

        // * For Firefox forms to submit, make sure to set the buttons’ `type` attributes as “button”.
        _.node(
            'div',
            _.node('button', settings.today, settings.klass.buttonToday,
                'type=button data-pick=' + nowObject.pick +
                (isOpen && !calendar.disabled(nowObject) ? '' : ' disabled') + ' ' +
                _.ariaAttr({ controls: calendar.$node[0].id })) +
            _.node('button', settings.clear, settings.klass.buttonClear,
                'type=button data-clear=1' +
                (isOpen ? '' : ' disabled') + ' ' +
                _.ariaAttr({ controls: calendar.$node[0].id }))
        ) //endreturn
} //DatePicker.prototype.nodes




/**
 * The date picker defaults.
 */
DatePicker.defaults = (function(prefix) {

    return {

        // The title label to use for the month nav buttons
        labelMonthNext: 'Next month',
        labelMonthPrev: 'Previous month',

        // The title label to use for the dropdown selectors
        labelMonthSelect: 'Select a month',
        labelYearSelect: 'Select a year',

        // Months and weekdays
        monthsFull: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdaysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        // Today and clear
        today: 'Today',
        clear: 'Clear',
        close: 'Back',

        // Picker close behavior
        closeOnSelect: true,
        closeOnClear: true,

        // Update input value on select/clear
        updateInput: true,

        // The format to show on the `input` element
        format: 'd mmmm, yyyy',

        // Classes
        klass: {

            table: prefix + 'table',

            header: prefix + 'header',

            navPrev: prefix + 'nav--prev',
            navNext: prefix + 'nav--next',
            navDisabled: prefix + 'nav--disabled',

            month: prefix + 'month',
            year: prefix + 'year',

            selectMonth: prefix + 'select--month',
            selectYear: prefix + 'select--year',

            weekdays: prefix + 'weekday',

            day: prefix + 'day',
            disabled: prefix + 'day--disabled',
            selected: prefix + 'day--selected',
            highlighted: prefix + 'day--highlighted',
            now: prefix + 'day--today',
            infocus: prefix + 'day--infocus',
            outfocus: prefix + 'day--outfocus',

            footer: prefix + 'footer',

            buttonClear: prefix + 'button--clear',
            buttonToday: prefix + 'button--today'
        }
    }
})(Picker.klasses().picker + '__')





/**
 * Extend the picker to add the date picker.
 */
Picker.extend('pickadate', DatePicker)


}));

window.OT = window.OT || {};

OT.createNS = function (namespace) {
    var nsparts = namespace.split("."),
        parent  = OT;

    // we want to be able to include or exclude the root namespace so we strip
    // it if it's in the namespace
    if (nsparts[0] === 'OT') {
        nsparts = nsparts.slice(1);
    }

    // loop through the parts and create a nested namespace if necessary
    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];

        // check if the current parent already has the namespace declared
        // if it isn't, then create it
        if (typeof parent[partname] === 'undefined') {
            parent[partname] = {};
        }

        // get a reference to the deepest element in the hierarchy so far
        parent = parent[partname];
    }

    // the parent is now constructed with empty namespaces and can be used.
    // we return the outermost namespace
    return parent;
};
/**
 * Cookies
 *
 * Module that reads the cookie string and converts it into an easy to
 * read object with the correct key-value pairs for each cookie.
 *
 * @return {object}
 */

OT.createNS('OT.Common.Cookies');

OT.Common.Cookies = (function(_, $document){
    'use strict';

    var readCookies = function() {
        var cookieArr = $document.cookie.split('; '),
            cookies  = {};

        for(var i = 0, len = cookieArr.length; i < len; i++){
            var C = cookieArr[i].split('=');

            if(C.length < 3){
                cookies[C[0]] = C[1];
            } else {
                C[1] = cookieArr[i].substr(C[0].length + 1);
                var nestedC = C[1].split("&");
                cookies[C[0]] = {};
                for(var j = 0; j < nestedC.length; j++){
                    var d = nestedC[j].split("=");
                    cookies[C[0]][d[0]] = d[1];
                }
            }
        }

        return cookies;
    };

    var getCookie = function(key) {
        var result = readCookies()[key];
        return _.isObject(result) ? result : decodeURIComponent(result);
    };

    var findCookies = function(term) {
        var obj = {};

        _.each(readCookies(), function(val, key) {
            if(key.indexOf(term) !== -1) {
                obj[key] = getCookie(key);
            }
        });

        return obj;
    };

    var isStringNumberBoolean = function(el){
        return _.isString(el) || _.isNumber(el) || _.isBoolean(el);
    };

    var getExpirationValue = function(maxAge){

        var d = new Date();
        d.setTime(d.getTime() + maxAge);

        return d.toGMTString();
    };

    var setCookies = function(obj, maxAge, domain){
        var defaultMaxAge = 10 * 1000,
            expires = getExpirationValue(maxAge || defaultMaxAge);

        if(!_.isObject(obj) || _.isArray(obj)){
          throw new TypeError('setCookie expects an object');
        }

        _.forEach(_.keys(obj), function(key){
            var cookieString = key + "=",
                cookieValue = obj[key];

            if(isStringNumberBoolean(cookieValue)){
                cookieString += encodeURIComponent(cookieValue.toString());
            } else if(_.isObject(cookieValue) && !_.isArray(cookieValue)){
                _.forEach(cookieValue, function(valVal, valKey){
                    cookieString += valKey + "=";
                    if(isStringNumberBoolean(valVal)){
                        cookieString += valVal + "&";
                    } else {
                        throw new TypeError('setCookie expects an object with correct values');
                    }
                });
            } else {
                throw new TypeError('setCookie expects an object with correct values');
            }

            if(cookieString.slice(-1) === "&"){
                cookieString = cookieString.substr(0, cookieString.length -1);
            }

            cookieString += ";path=/;expires=" + expires;

            if (!!domain) {
                cookieString += ";domain=." + domain;
            }

            $document.cookie = cookieString;
        });
    };

    return {
        getAll: readCookies,
        get: getCookie,
        find: findCookies,
        set: setCookies
    };

})(ot_, document);
/**
 * Select - transform an html select with options to a new designed one,
 * with styling, menus, lionbars, handlers, etc.
 *
 */

OT.createNS('OT.Common.Select');

OT.Common.Select = (function($, _){
  'use strict';

  var _data = {};

  var templates = {
    nativeDesign: function(m){

      var t =  '<div class="' + m.cssClass + ' ot-dtp-picker-selector'+ (m.unselectedOnInit ? " unselected-on-init" : '') +'">' +
               '  <a class="ot-select-label ot-dtp-picker-selector-link" tabindex="-1">' + m.selectedValue + '</a>' +
               '  <select name="' + m.name + '">';

      for(var i = 0; i < m.options.length; i++){
        var option =  m.options[i],
            isChecked = option.selected ? " selected=\"selected\"" : '';

        t += '    <option value="' + option.value + '"' + isChecked + '>' + option.display + '</option>';
      }

      t += '  </select>' +
           '</div>';

      return t;
    }
  };

  var getUniqueName = function(isNative){
    var c = 0,
        name = "Select_" + c,
        htmlAttribute = isNative ? 'select' : 'input';

    while($(htmlAttribute + "[name='" + name + "']").length > 0){
      c++;
      name = "Select_" + c;
    }

    return name;
  };

  var getSelectModel = function($select){

    var outerHtml = function($el){ return $("<div />").append($el.clone()).html(); },
        unselectedOnInit = false;

    var name = getUniqueName(true),
        model = {
          name: name,
          cssClass: $select.attr("class") || "",
          unselectedOnInit: false,
          options: _.map($select.find("option"), function(option){
            var $option = $(option),
                selected = $option.prop('selected');

            if(!!selected && outerHtml($option).indexOf("selected") === -1){
              unselectedOnInit = true;
            }

            return {
              display: $option.text(),
              value: $option.val(),
              selected: selected
            };
          })
        };

    _data[name] = model.options;

    var selected = _.findWhere(model.options, { selected: true });
    model.selectedValue = !!selected ? selected.display : '';

    if(model.selectedValue === '' || unselectedOnInit){
      model.unselectedOnInit = true;
    }

    return model;
  };

  var transformSelect = function($select){

    $select.addClass("ot-hide");

    var $parent = $select.parent(),
        model = getSelectModel($select),
        ariaLabel = $select.attr("aria-label");

    $select.after(templates['nativeDesign'](model));
    $select.remove();

    var $newSelect = $parent.find("." + model.cssClass.replace(/ /g, '.')),
        $label = $newSelect.find(".ot-select-label");

    $label.text(model.selectedValue);

    $newSelect.removeClass("ot-hide");
    $newSelect.find('select').attr("aria-label", ariaLabel);

    return $newSelect;
  };

  var select = {

    info: function($select){
      return {
        unselectedOnInit: $select.hasClass("unselected-on-init")
      };
    },

    init: function($select){
      return select.initNative($select);
    },

    initNative: function($select){
      var $newSelect = transformSelect($select, true),
          $label = $newSelect.find(".ot-select-label"),
          previousValue = $newSelect.find("select").val();

      $newSelect.find("select").on('change keyup', function(){
        var $this = $(this),
            selectedValue = $this.val(),
            $selectedOption = $this.find("option[value='" + selectedValue + "']"),
            selectedDisplayValue = $selectedOption.text();

        if(previousValue !== selectedValue){
          previousValue = selectedValue;
          $label.text(selectedDisplayValue);
          OT.Events.fire("select:change", { sender: $this.parent() });
        }
      });

      return $newSelect;
    },

    get: function($select){
      return $select.find("select").val();
    },

    hide: function($select, values){
      if(!_.isArray(values)){
        values = [values];
      }

      _.forEach(values, function(value){
        var optionToHide = $select.find("option[value='" + value + "']");
        if(optionToHide.length > 0){
          optionToHide.remove();
        }
      });
    },

    select: function($select, value){
      var $selectedOption = $select.find("option[value='" + value + "']"),
          $label = $select.find(".ot-select-label");

      $select.find("option").removeAttr("selected");
      $select.find("select").val(value);
      $label.text($selectedOption.text());

      OT.Events.fire("select:change", { sender: $select });
    },

    showAll: function($select){
      var selectName = $select.find("select").attr("name"),
          initialOptions = _data[selectName] || [],
          newOptions = "";

      for(var i = 0; i < initialOptions.length; i++){
        var option = initialOptions[i];
        if($select.find("option[value='" + option.value + "']").length === 0){
          newOptions += "<option value='" + option.value + "'>" + option.display + "</option>";
        }
      }

      if(newOptions.length > 0){
        $select.find("select").prepend(newOptions);
      }
    },

    update: function(e, $selectedLabel){
      var $target = $(e.currentTarget),
          $options = $target.parent().parent(),
          $option = $options.find('label[data-value="' + $target.attr('name') + '_' + $target.val() + '"]');

      $options.find('.highlight').removeClass('highlight');
      $option.addClass("highlight");

      $options.find("input").attr("checked", false);
      $target.attr("checked", true);

      $selectedLabel.text($option.text());

      closeActiveMenus();
      OT.Events.fire("select:change", { sender: $($selectedLabel.parent()) });
    }
  };

  $.fn.OTselect = function(action, param){

    var $this = this;

    if(action === "init"){
      return select.init($this, param);
    } else if(action === "get"){
      return select.get($this);
    } else if(action === "select"){
      return select.select($this, param);
    } else if(action === "info"){
      return select.info($this);
    } else if(action === "showAll"){
      return select.showAll($this);
    } else if(action === "hide"){
      return select.hide($this, param);
    }

    return this;
  };

  return {
    init: select.init,
    get: select.get,
    select: select.select
  };

})(jQuery, ot_);

/*jslint latedef:false*/

/**
 * DatePicker - transform a html input to a date picker
 *
 */

OT.createNS('OT.Common.DatePicker');

OT.Common.DatePicker = (function($, moment){
  'use strict';

  var getLabelValue = function($dp){

    var selectedDay = $dp.get('highlight', 'yyyy-mm-dd'),
        today = moment().format('YYYY-MM-DD'),
        isToday = (today === selectedDay),
        textLabel = $dp.get();

     return isToday && OT.Widget.options && !!OT.Widget.options.waitlistEnabled ? OT.Widget.todayLabel : textLabel;
  };

  var datepicker = {
    get: function($datepicker, optionalFormat){
      var $datepickerInput = $datepicker.find('input'),
          $picker = $datepickerInput.pickadate('picker');

      if(!!optionalFormat){
        return $picker.get('select', optionalFormat);
      }

      return $picker.get('select');
    },
    getOriginalValue: function($datepicker){
      return $datepicker.find('input').attr('data-value');
    },
    init: function($datepicker, minDate){

      var cssClass = $datepicker.attr('class'),
          ariaLabel = $datepicker.attr('aria-label'),
          dateValue = $datepicker.val(),
          $parent = $datepicker.parent(),
          isJapanese = false,
          calendarStartsSunday = (typeof(OT) !== 'undefined' && !!OT.Widget) ? !!OT.Widget.calendarStartsSunday : true,
          a11yInstructions = (window.OT && window.OT.Widget && window.OT.Widget.datePickerA11yInstructions) || '';

      var template = function(dateValue){

        return '<div class="' + cssClass + '">' +
               '  <a class="ot-dtp-picker-selector-link ot-date-label ot-dtp-picker-label">' + dateValue + '</a>' +
               '  <input type="text" name="datepicker" class="ot-datepicker ot-dtp-picker-select" style="cursor: pointer;" data-value="' + dateValue + '" aria-label="' + ariaLabel + '" />' +
               '</div>';
      };

      if(dateValue === ''){
        dateValue = moment().format('YYYY-MM-DD');
      }

      $datepicker.after(template(dateValue));
      $datepicker.remove();
      $datepicker = $parent.find('.' + cssClass.replace(/ /g, '.'));

      var $label = $datepicker.find('.ot-date-label'),
          $datePickerInput = $datepicker.find('input');

      if(OT.Widget.lang){
        setupLanguage(OT.Widget.lang);
        if(OT.Widget.lang === 'ja'){
          isJapanese = true;
        }
      }

      var fixJapaneseYearMonthLabel = function(){
        // In case of Japanese, we display Year first + 年 + month on the month's label.

        var $headerYear = $datepicker.find('.picker__year'),
            $headerMonth = $datepicker.find('.picker__month'),
            $parent = $headerMonth.parent(),
            outerHtml = function($el){ return $('<div />').append($el.clone()).html(); },
            newHeaderContent = outerHtml($headerYear) + outerHtml($headerMonth);

        $headerYear.remove();
        $headerMonth.remove();
        $parent.prepend(newHeaderContent);
        $headerYear = $datepicker.find('.picker__year');

        var headerYearText = $headerYear.text();

        if(headerYearText.indexOf('年') < 0){
          $headerYear.text(headerYearText + '年');
        }
      };

      var closeDpIfOpened = function($dp){
        if(!!$dp.get('open')){
          $dp.close();
        }
      };

      var getRenderPosition = function(){
        var calendarHeight = 290,
            labelHeight = $datePickerInput.height(),
            datePickerOffset = parseInt($datepicker.offset().top, 10),
            bodyScroll = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
            $body = $('body'),
            bodyHeight = $body.height(),
            marginBottom = bodyScroll + bodyHeight - labelHeight - datePickerOffset,
            marginTop = datePickerOffset - bodyScroll;

        return marginTop < calendarHeight ? 'down' : (marginBottom >= calendarHeight ? 'down' : 'up');
      };

      var addCloseButton = function(thisDatepicker){
        var $pickerBox = $datepicker.find('.picker__box');
        var $pickerClose = $('<div class="picker__close" data-clear="true">'+getCloseButtonText()+'</div>');
        $pickerClose.on('click touchend', function(){
          closeDpIfOpened(thisDatepicker);
        });
        $pickerBox.before($pickerClose);
      };

      /**
       * This adds an offscreen a11y section that includes instructions on how to use the datepicker
       * and an indication of the current initial date. This is only read in screen readers that do
       * not fully support grid structures
       */
      var addA11yAnnounceSection = function(){
        var $pickerBox = $datepicker.find('.picker__box');
        var $pickerInitialDate = $('<div id="picker-announce-initial" class="ot-offscreen"></div>');
        var $pickerInstructions = $('<div class="ot-offscreen"></div>').text(a11yInstructions);
        $pickerBox.after($pickerInitialDate);
        $pickerBox.after($pickerInstructions);
      };

      var updateInput = function(){
        var $selected = $datepicker.find('div.picker__day--highlighted'),
            $datepickerInput = $datepicker.find('input'),
            $datepickerholder = $datepicker.find('.picker__holder'),
            dataPick = parseInt($selected.attr('data-pick')),
            selectedDate = moment(dataPick).format('ll');
        $selected.parent().attr({ 'aria-selected': 'true'});
        $datepickerInput.attr('aria-activedescendant', 'd' + dataPick);
        $datepickerholder.attr('aria-activedescendant', 'd' + dataPick).attr('role', 'group');
        $datepickerInput.val(selectedDate);
      };

      var monthsLabels = function(){
        $('.picker__nav--prev, .picker__nav--next').each(function() {
          var thisLabel = $(this).attr('title');
          $(this).attr('aria-label', thisLabel).removeAttr('title');
        });
      };

      OT.Events.on('datepicker:change', function(){
       updateInput();
       monthsLabels();
      });

      $('.ot-datepicker').on('keyup', function(){
       updateInput();
      });

      $datePickerInput.pickadate({
        firstDay: calendarStartsSunday ? 0 : 1,
        min: minDate ? moment(minDate).toDate() : new Date(),
        formatSubmit: 'yyyy-mm-dd',
        hiddenPrefix: 'submit_',
        hiddenSuffix: '',
        today: '',
        clear: '',
        format: OT.Common.Helpers.getDateFormatJS(),
        onStart: function () {
          var thisDatepicker = this;
          $label.text(getLabelValue(thisDatepicker));

          OT.Events.on('menus:cleared', function(){
            if($label.hasClass('picker-opening')){
              $label.removeClass('picker-opening');
            } else {
              closeDpIfOpened(thisDatepicker);
            }
          });

          // Add Close button in datepicker
          addCloseButton(thisDatepicker);
          addA11yAnnounceSection();
        },

        onOpen: function(){
          var thisDatepicker = this;
          if(isJapanese){
            fixJapaneseYearMonthLabel();
          }

          $label.addClass('picker-opening');
          $label.addClass('menu-opened');

          var $cal = $datepicker.find('.picker'),
              renderPosition = getRenderPosition();

          $cal.removeClass('up').removeClass('down').addClass(renderPosition);
          /**
           * For a11y, bind PageUp and PageDown to navigating by month
           */
          $datepicker.find('.picker__holder').on('keydown', function(event) {
            var currentHighlight = thisDatepicker.component.item.highlight;
            var isPageUp = event.key === 'PageUp' || event.keyCode === 33;
            var isPageDown = event.key === 'PageDown' || event.keyCode === 34;

            if (isPageUp || isPageDown) {
              event.preventDefault();
              thisDatepicker.set('select', moment(currentHighlight.obj).add(isPageUp ? 1 : -1, 'months').toDate());
            }
          });

          $datepicker.find('#picker-announce-initial').text(moment(thisDatepicker.component.item.highlight.obj).format('LL'));
        },
        onClose: function(){
          $label.removeClass('menu-opened');
        },
        onSet: function(){
          $label.text(getLabelValue(this));
          OT.Events.fire('datepicker:change', { sender: $datepicker });

          if(isJapanese){
            fixJapaneseYearMonthLabel();
          }
        },
        onRender: function() {
          /**
           * For a11y, every render we need to ensure that all input is updated, since it maintains
           * aria-activedescendant for this date picker widget
           */
          updateInput();
        }
      });

      return $datepicker;
    },
    refresh: function($datepicker){
      var $datepickerInput = $datepicker.find('input');

      if($datepickerInput.length === 0){
        return;
      }

      var $dp = $datepickerInput.pickadate('picker');

      if($dp.length === 0){
        return;
      }

      var $label = $datepicker.find('.ot-date-label');

      if($label.length === 0){
        return;
      }

      $label.text(getLabelValue($dp));
    },
    set: function($datepicker, value, format){
      var $datepickerInput = $datepicker.find('input'),
          optionalFormat = format || { format: 'yyyy-mm-dd' };

      return $datepickerInput.pickadate('picker').set('select', value, optionalFormat);
    }
  };

  var getCloseButtonText = function(){
    return $.fn.pickadate.defaults.close || 'Back';
  };

  var setupLanguage = function(lang){
    $.extend($.fn.pickadate.defaults, OT.Common.Helpers.DatePickerLocales.get(lang));
  };

  $.fn.OTdatepicker = function(action, param, param2){

    var $this = this;

    if(action === 'init'){
      return datepicker.init($this, param);
    } else if(action === 'get'){
      return datepicker.get($this, param);
    } else if(action === 'getOriginalValue'){
      return datepicker.getOriginalValue($this, param);
    } else if(action === 'refresh'){
      return datepicker.refresh($this);
    } else if(action === 'set'){
      return datepicker.set($this, param, param2);
    }

    return this;
  };

  return {
    init: datepicker.init,
    get: datepicker.get,
    getOriginalValue: datepicker.getOriginalValue,
    set: datepicker.set
  };

})(jQuery, ot_moment);

OT.createNS('OT.Common.Helpers.DatePickerLocales');

OT.Common.Helpers.DatePickerLocales = (function(){
  'use strict';
  var localeData = {
    ja: {
      monthsFull: [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ],
      monthsShort: [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ],
      weekdaysFull: [ '日', '月', '火', '水', '木', '金', '土' ],
      weekdaysShort: [ '日', '月', '火', '水', '木', '金', '土' ],
      today: '今日',
      clear: '消去',
      labelMonthNext: '次月',
      labelMonthPrev: '前月',
      close: '閉じる'
    },
    es: {
      monthsFull: [ 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ],
      monthsShort: [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic' ],
      weekdaysFull: [ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ],
      weekdaysShort: [ 'do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá' ],
      today: 'hoy',
      clear: 'borrar',
      labelMonthNext: 'Mes próximo',
      labelMonthPrev: 'Mes anterior',
      close: 'Cerrar'
    },
    fr: {
      monthsFull: [ 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre' ],
      monthsShort: [ 'jan', 'fev', 'mar', 'avr', 'mai', 'juin', 'juil', 'aou', 'sep', 'oct', 'nov', 'dec' ],
      weekdaysFull: [ 'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi' ],
      weekdaysShort: [ 'di', 'lu', 'ma', 'me', 'je', 've', 'sa' ],
      today: 'Aujourd\'hui',
      clear: 'Effacer',
      labelMonthNext: 'Mois suivant',
      labelMonthPrev: 'Mois précédent',
      close: 'Fermer'
    },
    de: {
      monthsFull: [ 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember' ],
      monthsShort: [ 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
      weekdaysFull: [ 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag' ],
      weekdaysShort: [ 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa' ],
      today: 'Heute',
      clear: 'Löschen',
      labelMonthNext: 'Nächste',
      labelMonthPrev: 'Früher',
      close: 'Schließen'
    },
    nl: {
      monthsFull: [ 'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December' ],
      monthsShort: [ 'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec' ],
      weekdaysFull: [ 'Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag' ],
      weekdaysShort: [ 'Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za' ],
      today: 'Vandaag',
      clear: 'Verwijderen',
      labelMonthNext: 'Volgende',
      labelMonthPrev: 'Vorige',
      close: 'Sluiten'
    },
    it: {
      monthsFull: [ 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre' ],
      monthsShort: [ 'gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic' ],
      weekdaysFull: [ 'domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato' ],
      weekdaysShort: [ 'dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab' ],
      today: 'Oggi',
      clear: 'Cancella',
      labelMonthNext: 'Mese successivo',
      labelMonthPrev: 'Mese precedente',
      close: 'Chiudi'
    },
    pl: {
      monthsFull: [ 'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień' ],
      monthsShort: [ 'sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru' ],
      weekdaysFull: [ 'niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota' ],
      weekdaysShort: [ 'niedz.', 'pn.', 'wt.', 'śr.', 'cz.', 'pt.', 'sob.' ],
      today: 'Dzisiaj',
      clear: 'Usuń',
      labelMonthNext: 'następny',
      labelMonthPrev: 'poprzedni',
      close: 'Zamknij'
    },
    zh: {
      monthsFull: [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
      monthsShort: [ '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二' ],
      weekdaysFull: [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ],
      weekdaysShort: [ '日', '一', '二', '三', '四', '五', '六' ],
      today: '今日',
      clear: '清除',
      labelMonthNext: '下个月',
      labelMonthPrev: '上个月',
      close: '关闭'
    }
  };

  var get = function(lang) {
    return localeData[lang];
  };

  return { get: get };

})();

/*jslint latedef:false*/

/**
 * QueryString
 *
 * Module for convert the query string into a key/value object
 *
 * @return {object}
 */

OT.createNS('OT.Common.Helpers.QueryString');

OT.Common.Helpers.QueryString = (function(_){
  'use strict';

  var safeConsole = {
    log: function(msg) {
      return typeof(console) !== 'undefined' && !!console.log && console.log(msg);
    }
  };

  var ensure = {
    isValid: {
      key: function(key){
        if(!key){
          throw new Error('QueryString: No parameter passed');
        }
      },
      object: function(obj){
        if(!obj){
          throw new TypeError('stringify expects an object');
        }
      }
    }
  };

  var parse = function(query, splitCommaSeparatedValues){
    if(_.isBoolean(query)){
      splitCommaSeparatedValues = query;
      query = undefined;
    }

    var params = !!query ? query.replace('?', '') : window.location.search.substring(1),
        paramsObj = {};

    params = params !== '' ? params.split('&') : '';

    for(var i = 0; i < params.length; i++) {

      var keyVal = params[i].split('='),
          key = keyVal[0],
          val = decodeURIComponent(keyVal[1]);

      paramsObj[key] = val;

      if(val.trim().toLowerCase() === 'true'){
        paramsObj[key] = true;
      }

      if(val.trim().toLowerCase() === 'false'){
        paramsObj[key] = false;
      }
    }

    return !!splitCommaSeparatedValues ? splitCommaSeparatedStrings(paramsObj) : paramsObj;
  };

  var find = function(key, query, splitCommaSeparatedValues){
    ensure.isValid.key(key);

    if(_.isBoolean(query)){
      splitCommaSeparatedValues = query;
      query = undefined;
    }

    var parsed = parse(query);

    if(!!splitCommaSeparatedValues){
      parsed = splitCommaSeparatedStrings(parsed);
    }

    if(_.has(parsed, key)){
      return parsed[key];
    }

    for(var objKey in parsed){
      if(objKey.trim().toLowerCase() === key.trim().toLowerCase()){
        return parsed[objKey];
      }
    }

    return undefined;
  };

  var splitCommaSeparatedStrings = function(obj){
    var splitted = {};

    _.forEach(obj, function(v, k){
      splitted[k] = _.isString(v) && v.indexOf(',') >= 0 ? v.split(',') : v;
    });

    return splitted;
  };

  var parseParams = function(query){
    safeConsole.log('OT.Common.Helpers.QueryString.getAll is deprecated, use parse() instead');
    var parsed = parse(query),
        lowered = {};

    _.forEach(parsed, function(v, k){
      lowered[k.toLowerCase()] = _.isString(v) ? v.toLowerCase() : v;
    });

    return splitCommaSeparatedStrings(lowered);
  };

  var getParam = function(key, query) {
    safeConsole.log('OT.Common.Helpers.QueryString.get is deprecated, use find() instead');
    ensure.isValid.key(key);
    return parseParams(query)[key.toLowerCase()];
  };

  var stringifyString = function (str, prefix) {
    ensure.isValid.object(prefix);
    return prefix + '=' + encodeURIComponent(str);
  };

  var stringifyArray = function (arr, prefix) {
    ensure.isValid.object(prefix);
    var ret = [];

    for (var i = 0; i < arr.length; i++) {
      ret.push(stringify(arr[i], prefix + '[' + i + ']'));
    }

    return ret.join('&');
  };

  var stringifyObject = function (obj, prefix) {
    var ret = [],
        keys = _.keys(obj),
        key;

    for (var i = 0, len = keys.length; i < len; ++i) {
      key = keys[i];

      if ('' === key) {
        continue;
      }

      var encodedKey = encodeURIComponent(key);

      if (null == obj[key]){
        ret.push(encodedKey + '=');
      } else {
        ret.push(stringify(obj[key], prefix ? prefix + '[' + encodedKey + ']' : encodedKey));
      }
    }

    return ret.join('&');
  };

  var stringify = function(obj, prefix) {
    if(_.isArray(obj)){
      return stringifyArray(obj, prefix);
    } else if(_.isObject(obj)){
      return stringifyObject(obj, prefix);
    } else if(_.isString(obj)){
      return stringifyString(obj, prefix);
    } else {
      return prefix + '=' + encodeURIComponent(String(obj));
    }
  };

  return {
    get: getParam, //deprecated -> find
    getAll: parseParams, //deprecated -> parse

    find: find,
    parse: parse,
    stringify: stringify
  };

})(ot_);

/**
 * GetDateFormatJS
 *
 * Module that deals with returning the current time format for appropriate region
 *
 * @return {string}
 */

OT.createNS('OT.Common.Helpers.getDateFormatJS');

OT.Common.Helpers.getDateFormatJS = function() {
    'use strict';

  return OT.Widget.dateFormatJS || "d mmmm, yyyy";
};
/**
 * GetTimeFormatJS
 *
 * Module that deals with returning the current time format for appropriate region
 *
 * @return {string}
 */

OT.createNS('OT.Common.Helpers.getTimeFormatJS');

OT.Common.Helpers.getTimeFormatJS = function() {
    'use strict';

  return OT.Widget.timeFormatJS || "HH:mm";
};
/**
 * ConvertTimeTo24Hour
 *
 * Converts a given time into the 24 hour format
 *
 * @return {function}
 */

OT.createNS('OT.Common.Helpers.convertTimeTo24Hour');

OT.Common.Helpers.convertTimeTo24Hour = function(time) {

    var timeOfDay = time.match(/AM|PM|a.m.|p.m./i);

    if(timeOfDay !== null) {
        timeOfDay = timeOfDay[0];
        time = time.replace(/ AM| PM| a.m.| p.m./i, '').split(':');

        if((timeOfDay === 'AM' || timeOfDay === 'a.m.') && time[0] === '12') {
            time[0] = '00';
        }
        if((timeOfDay === 'PM' || timeOfDay === 'p.m.') && parseInt(time[0], 10) < 12) {
            time[0] = parseInt(time[0], 10) + 12;
        }

        time = time.join(':');
    }

    return time;

};
/**
 * convertIsoDateTimeToTimestamp
 *
 * Converts a given iso date and time into a UTC timecode
 *
 * @return {}
 */

OT.createNS('OT.Common.Helpers');

OT.Common.Helpers.convertIsoDateTimeToTimestamp = (function(moment){
  'use strict';

  var convert = function (date, time) {
    var time24Hours = OT.Common.Helpers.convertTimeTo24Hour(time),
        datetime = date + ' ' + time24Hours;

    return moment(datetime, 'YYYY-MM-DD HH:mm').format('X');
  };
  return convert;
})(ot_moment);

/**
 * IsFutureDateTime
 *
 * Module for checking if a give time is in the future
 *
 * @return {boolean}
 */

OT.createNS('OT.Common.Helpers.isFutureDateTime');

OT.Common.Helpers.isFutureDateTime = (function(moment){
  var isFutureDateTime = function(time, presentTime) {
    var now = moment().format('X');
    return time*1 > (presentTime || now)*1;
  };
  return isFutureDateTime;
})(ot_moment);


/**
 * RoundTo
 *
 * Module that rounds a given time to the nearest quarter hour
 *
 * @return {string}
 */

OT.createNS('OT.Common.Helpers.RoundTimeTo');

OT.Common.Helpers.RoundTimeTo = (function(moment) {

    var quarterHour = function(time) {
        time = OT.Common.Helpers.convertTimeTo24Hour(time);

        var mins = time.split(':');

        if(+mins[1] > 45) {
            mins[0]++;
            mins[1] = '00';
        } else if(+mins[1] > 30) {
            mins[1] = '45';
        } else if(+mins[1] > 15) {
            mins[1] = '30';
        } else {
            mins[1] = '15';
        }

        return moment(mins[0] +':'+ mins[1], 'H:mm').format(OT.Common.Helpers.getTimeFormatJS());
    };

    var halfHour = function (time, format) {
        time = OT.Common.Helpers.convertTimeTo24Hour(time);

        var mins = time.split(':');

        if(mins[1] > 30) {
            mins[0]++;
            mins[1] = '00';
        } else {
            mins[1] = '30';
        }

        return moment(mins[0] + ':' + mins[1], 'H:mm').format(format || OT.Common.Helpers.getTimeFormatJS());
    };

    return {
        quarterHour: quarterHour,
        halfHour: halfHour
    };

})(ot_moment);
/**
 * GetMinimumDate
 *
 * Returns the minimum date available for a reservation
 *
 * @return {function}
 */

OT.createNS('OT.Common.Helpers.getMinimumDate');

OT.Common.Helpers.getMinimumDate = (function(moment){
  'use strict';

  var get = function(metroDateTime) {
    var metroDate = metroDateTime.format("YYYY-MM-DD"),
        minDate = metroDate;

    // when metroTime > 23:30 minDate++
    if(moment(metroDateTime.format('YYYY-MM-DD HH:mm')).format('X') >= moment(moment(metroDate + "T23:30").format('YYYY-MM-DD HH:mm')).format('X')){
      minDate = metroDateTime.add(1, 'days').format("YYYY-MM-DD");
    }

    return minDate;
  };

return get;

})(ot_moment);
/**
 * Date Time validator
 */

OT.createNS('OT.Common.Helpers.dateTimeValidator');

OT.Common.Helpers.dateTimeValidator = (function(moment) {
  'use strict';

  var helpers = OT.Common.Helpers;

  var isDateTimeValid = function(date, time, metroDate, metroTime){
    if(!!date && !!time){
      var timestamp = helpers.convertIsoDateTimeToTimestamp(date, time),
          metroTimeStamp = helpers.convertIsoDateTimeToTimestamp(metroDate, metroTime);
      return helpers.isFutureDateTime(timestamp, metroTimeStamp);
    }

    return false;
  };

  var Validator = function(metroDate, metroTime){
    return function(date, time){
      return isDateTimeValid(date, time, metroDate, metroTime);
    };
  };

  var isMayor = function(time1, time2){
    return time1.replace(":", "") > time2.replace(":", "");
  };

  var get = function(date, time, metroDate, metroTime){

    var isValid = new Validator(metroDate, metroTime),
        defaultTime = '19:00',
        tomorrowDate = moment(metroDate).add(1, 'days').format('YYYY-MM-DD');

    time = time || defaultTime;
    date = date || metroDate;

    if(isValid(date, time)){
    // The date/time is valid
      return  { date: date, time: time };
    }

    if(isMayor(metroTime, defaultTime)){
      var nextRoundedTimeSlot = helpers.RoundTimeTo.halfHour(metroTime, "HH:mm");

      if(time === metroTime && nextRoundedTimeSlot === metroTime){
        // DateTime to validate is now => is not future => not valid
        nextRoundedTimeSlot = helpers.RoundTimeTo.halfHour(metroTime.substr(0, 4) + "1", "HH:mm");
      }

      if(isValid(date, nextRoundedTimeSlot)){
        // The date is valid - time rounded to the next metro slot
        return { date: date, time: nextRoundedTimeSlot };
      }

      if(isValid(metroDate, nextRoundedTimeSlot)){
        return { date: metroDate, time: nextRoundedTimeSlot };
      }
    }

    if(isValid(date, defaultTime)){
      // date is valid - time is default
      return { date: date, time: defaultTime };
    }

    if(isValid(metroDate, defaultTime)){
      return { date: metroDate, time: defaultTime };
    }

    if(isValid(tomorrowDate, defaultTime)){
      // date is tomorrow - time is default
      return { date: tomorrowDate, time: defaultTime };
    }

    // Nothing is valid - let's return the current metro date + next metro time slot
    return { date: metroDate, time: helpers.RoundTimeTo.halfHour(moment('2000-01-01T' + metroTime).format("HH:mm"), "HH:mm") };
  };

  return {get: get};
})(ot_moment);
/**
 * Timeslots availability
 */

OT.createNS('OT.Common.Helpers.timeSlotsAvailability');

OT.Common.Helpers.timeSlotsAvailability = (function(_){

  var timeSlots = function(){
    'use strict';

    var helpers = OT.Common.Helpers;

    var allTimeSlots = [
      '00:00', '00:30',
      '01:00', '01:30',
      '02:00', '02:30',
      '03:00', '03:30',
      '04:00', '04:30',
      '05:00', '05:30',
      '06:00', '06:30',
      '07:00', '07:30',
      '08:00', '08:30',
      '09:00', '09:30',
      '10:00', '10:30',
      '11:00', '11:30',
      '12:00', '12:30',
      '13:00', '13:30',
      '14:00', '14:30',
      '15:00', '15:30',
      '16:00', '16:30',
      '17:00', '17:30',
      '18:00', '18:30',
      '19:00', '19:30',
      '20:00', '20:30',
      '21:00', '21:30',
      '22:00', '22:30',
      '23:00', '23:30'
    ];

    var isDatePast = function(date, metroDate, metroTime){
      if(!!date){
        var timestamp = helpers.convertIsoDateTimeToTimestamp(date, '23:59'),
            metroTimeStamp = helpers.convertIsoDateTimeToTimestamp(metroDate, metroTime);
        return !helpers.isFutureDateTime(timestamp, metroTimeStamp);
      }

      return true;
    };

    var isDateMayor = function(date1, date2){
      return date1.replace(/-/g, "") > date2.replace(/-/g, "");
    };

    var isTimeMayor = function(time1, time2){
      return time1.replace(":", "") > time2.replace(":", "");
    };

    return {
      get: function(date, metroDate, metroTime){
        date = date || metroDate;

        if(isDatePast(date, metroDate, metroTime)){
          return [];
        }

        return _.filter(_.clone(allTimeSlots), function(timeSlot){
          return isDateMayor(date, metroDate) || isTimeMayor(timeSlot, metroTime);
        });
      }
    };
  };

  return timeSlots;
})(ot_);
/*
  eslint-disable
    no-var,
    object-shorthand,
    prefer-arrow-callback,
    prefer-destructuring,
    prefer-template,
    strict,
    vars-on-top,
    wrap-iife
*/
/*
  global
    jQuery,
    OT,
    window
*/

OT.createNS('OT.Common.Helpers.navigate');

OT.Common.Helpers.navigate = (function ($, $window) {
  'use strict';

  var R3UID_REGEX = /r3uid=/i;
  function replaceRid(urlStr, rid) {
    return urlStr && urlStr.replace('{rid}', rid);
  }

  function buildR3QueryString(r3QueryString, r3uid, ref, ot_source, ot_campaign, colorId, dark) {
    var params = {};
    if (!R3UID_REGEX.test(r3QueryString)) {
      params.r3uid = r3uid;
    }
    if (ref) {
      params.ref = ref;
    }
    if (ot_campaign) {
      params.ot_campaign = ot_campaign;
    }
    if (ot_source) {
      params.ot_source = ot_source;
    }
    if (colorId) {
      params.color = colorId;
    }
    if (dark) {
      params.dark = dark;
    }
    return r3QueryString + '&' + $.param(params);
  }

  /**
   * @typedef {Object} NavigateOptions
   * @property {number} rid
   * @property {string} url
   * @property {string} host
   * @property {boolean} insideIframe
   * @property {boolean} [r3QueryString]
   * @property {number} colorId
   * @property {boolean} dark
   */

  /**
   * @param {NavigateOptions} options
   */
  function navigate(options) {
    var insideIframe = options.insideIframe;
    var host = options.host;
    var rid = options.rid;
    var ot_source = options.ot_source;
    var ot_campaign = options.ot_campaign;
    var path = replaceRid(options.path, rid);
    var r3QueryString = options.r3QueryString || $.param({ rid: rid, restref: rid });
    var popupWindow = options.popupWindow;
    var r3uid = options.r3uid;
    var ref = options.ref;
    var useModal = options.useModal;
    var targetWindow = insideIframe ? $window.parent : $window;
    var r3url;
    var colorId = options.colorId;
    var dark = options.dark;

    if (rid <= 0) {
      return;
    }

    r3QueryString = buildR3QueryString(r3QueryString, r3uid, ref, ot_source, ot_campaign, colorId, dark);
    r3url = host + path + '?' + r3QueryString;

    if (useModal) {
      targetWindow.postMessage({
        'data-ot-restref': r3QueryString,
        'data-ot-host': host,
        'data-ot-path': path,
        'data-ot-r3uid': r3uid
      }, '*');
    } else if (popupWindow) {
      popupWindow.location = r3url;
    } else {
      $window.open(r3url, '_blank');
    }
  }

  return navigate;
})(jQuery, window);

/* global OT */
OT.createNS('OT.Common.Helpers.modalListener');

OT.Common.Helpers.modalListener = (function ($, window) {
  'use strict';

  return function modalListener(insideIframe, callback) {
    var targetWindow = (insideIframe && window.parent) || window;
    function receiveMessage(event) {
      var r3uid;
      if (event.data && event.data.type && event.data.type === 'WIDGET_USE_MODAL') {
        r3uid = event.data.payload;
        callback(r3uid);
      }
    }

    if (window && window.addEventListener && window.postMessage) {
      window.addEventListener('message', receiveMessage, false);
      targetWindow.postMessage({ type: 'WIDGET_READY' }, '*');
    }
  };
})(jQuery, window);

/**
 * Events
 *
 * Event emitter for search
 *
 * @return {object}
 */

OT.createNS('OT.Events');

OT.Events = (function($) {
    'use strict';

    var eventObject = $({});

    var getAllEvents = function() {
        return $.map(eventObject.get(0), function(i, e) {
            return eventObject.get(0)[e].events;
        })[0] || [];
    };

    var getEvent = function(key) {
        if(!key) {
            return getAllEvents();
        }

        return getAllEvents()[key];
    };

    var hasEvent = function(key) {
        return !!getAllEvents()[key];
    };

    var setEvent = function(key, cb) {
        eventObject.on(key, cb || function(){});
    };

    var fireEvent = function(key, data) {
        eventObject.trigger(key, data || []);
    };

    var removeEvent = function(key) {
        eventObject.off(key);
    };

    var reset = function() {
        eventObject.off();
    };

    return {
        get: getEvent,
        has: hasEvent,
        on: setEvent,
        fire: fireEvent,
        remove: removeEvent,
        reset: reset
    };

})(jQuery);
/**
 * testObject
 *
 * Module that builds an object based on the 'Tests' parameter in the query string.
 * It sets each parameter to true.
 *
 * @return {object}
 */

OT.createNS('OT.Common.TestObject');

OT.Common.TestObject = (function($, _) {
    'use strict';

    var $body     = $('body'),
        testArray = [];

    var refresh = function() {
        var tests = OT.Common.Helpers.QueryString.find('tests', true);

        if(!tests) {
            testArray = [];
        } else {
            if(_.isString(tests)) {
                tests = [tests];
            }
            testArray = _.map(tests, function(val) {
                return val.toLowerCase();
            });
        }
    };

    var buildTestArray = function(fresh) {
        if(fresh) {
            refresh();
        }

        // Add the test names to the body
        $body.addClass(testArray.join(' '));

        return testArray;
    };

    var isActive = function(tests) {
        if(!tests) {
            return false;
        }

        var allTestsAreOn = true;

        if(typeof tests === 'string') {
            tests = [tests];
        }

        _.each(tests, function(test) {
            if(testArray.indexOf(test.toLowerCase()) === -1) {
                allTestsAreOn = false;
            }
        });

        return allTestsAreOn;
    };

    var set = function(key, val) {
        if(_.isNull(key) || _.isNull(val)) {
            throw new Error('testArray: No parameters provided');
        }

        testArray.push(key.toLowerCase());
    };

    refresh();
    buildTestArray();

    return {
        set: set,
        getAll: buildTestArray,
        refresh: refresh,
        isActive: isActive
    };

})(jQuery, ot_);
if (window.otGoogleAnalyticsDimensions) {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  var trackerName = 'opentable';
  ga('create', 'UA-52354388-1', 'auto', trackerName, {
    storage: 'none',
    clientId: window.otGoogleAnalyticsClientId
  });
  ga(trackerName + '.send', 'pageview', window.otGoogleAnalyticsDimensions);
}

/* eslint-disable wrap-iife, no-var, object-shorthand, vars-on-top, prefer-destructuring, strict, prefer-arrow-callback */
/* global OT, jQuery, ot_, ot_moment */

/**
 * Shared DTP functions
 */
OT.createNS('OT.Common.Dtp.Shared');

OT.Common.Dtp.Shared = (function ($, _, moment) {
  'use strict';

  var selectors = {
    restaurantPicker: '.ot-restaurant-picker',
    partySizePicker: '.ot-party-size-picker',
    timePicker: '.ot-time-picker',
    datePicker: '.ot-date-picker',
    dtpForm: '.ot-dtp-picker-form',
    timezoneOffset: 'input[name="timezoneOffset"]'
  };

  /**
   * binds focus/blur events to controls in order to enable label highlighting when mouse click/keyboard tab switching
   * @param {Object.<string, jQuery>} formInputs
   * @param {Object.<string, jQuery>} labelInputs
   */
  function setHighlighting(formInputs, labelInputs) {
    var highlightOnFocus = function ($formInput, $labelInput) {
      $formInput.focus(function () {
        $labelInput.addClass('highlighted');
      });
    };

    var unhighlightOnBlur = function ($formInput, $labelInput) {
      $formInput.blur(function () {
        $labelInput.removeClass('highlighted');
      });
    };

    _.forEach(labelInputs, function ($labelInput, key) {
      highlightOnFocus(formInputs[key], $labelInput);
      unhighlightOnBlur(formInputs[key], $labelInput);
    });
  }

  /**
   * @param {jQuery} $dtp
   * @returns {boolean}
   */
  function isWideTheme($dtp) {
    return $dtp.hasClass('wide');
  }

  /**
   * @param {Object} dtp
   * @param {Function} dtp.init
   * @param {Function} dtp.set
   */
  function initOTdtp(dtp) {
    // eslint-disable-next-line no-param-reassign
    $.fn.OTdtp = function (action) {
      this.each(function () {
        var $this = $(this);

        if (action === 'init') {
          return dtp.init($this);
        }

        return undefined;
      });
    };
  }

  /**
   * Retrieves the restaurant's metro timezone offset in minutes
   * @param {jQuery} $dtp
   * @param {Object} pageData
   * @returns {number}
   */
  function getMetroOffset($dtp, pageData) {
    var metroOffset = 0;
    var $dtpOffset = $dtp ? $dtp.find(selectors.timezoneOffset) : [];

    if ($dtpOffset.length > 0) {
      metroOffset = $dtpOffset.val();
    } else if (!!pageData && pageData.headerTimezoneOffset) {
      metroOffset = pageData.headerTimezoneOffset;
    }

    return metroOffset;
  }

  /**
   * Generates the current time relative to restaurant timezone
   * @param {jQuery} $dtp
   * @param {Object} pageData
   * @returns {Moment}
   */
  function getMetroDateTime($dtp, pageData) {
    return moment().utc().add(getMetroOffset($dtp, pageData), 'm');
  }

  return {
    getMetroDateTime: getMetroDateTime,
    initOTdtp: initOTdtp,
    isWideTheme: isWideTheme,
    selectors: selectors,
    setHighlighting: setHighlighting
  };
})(jQuery, ot_, ot_moment);

/* eslint-disable wrap-iife, no-var, object-shorthand, vars-on-top, prefer-template, prefer-destructuring, strict, new-cap, one-var */
/* global OT, jQuery, ot_, ot_moment, window */

/**
 * Dtp - binds actions to events and sets the proper js to style menus
 */

OT.createNS('OT.Common.Dtp.Reservation');

OT.Common.Dtp.Reservation = (function ($, _, moment, $pageData) {
  'use strict';

  var selectors = OT.Common.Dtp.Shared.selectors;
  var getMetroDateTime = OT.Common.Dtp.Shared.getMetroDateTime;
  var setHighlighting = OT.Common.Dtp.Shared.setHighlighting;
  var isWideTheme = OT.Common.Dtp.Shared.isWideTheme;

  var DTP_COOKIE_IDENTIFIER = 'ot_widget_dtp_values';
  var DTP_COOKIE_MAXAGE = 365 * 24 * 60 * 60 * 1000;

  var tabIndexCounter = 0;
  // eslint-disable-next-line no-underscore-dangle
  var _validateDateTime = true;
  // eslint-disable-next-line no-underscore-dangle
  var _shouldEmitChangedEvent = true;

  var cookies = {
    get: function (key) {
      var cookied = OT.Common.Cookies.get(DTP_COOKIE_IDENTIFIER);
      // eslint-disable-next-line no-nested-ternary
      return typeof (key) === 'string' ? ((!!cookied && !!cookied[key]) ? cookied[key] : undefined) : cookied;
    },
    set: function (values) {
      var cookiedValues = {};
      cookiedValues[DTP_COOKIE_IDENTIFIER] = _.pick(values, 'covers', 'datetime');

      return OT.Common.Cookies.set(cookiedValues, DTP_COOKIE_MAXAGE);
    }
  };

  var setTabIndexes = function (inputs, startIndex) {
    inputs.restaurantPicker.attr("tabindex", startIndex + 1);
    inputs.datePicker.attr("tabindex", startIndex + 2);
    inputs.timePicker.attr("tabindex", startIndex + 3);
    inputs.partySizePicker.attr("tabindex", startIndex + 4);
    inputs.searchButton.attr("tabindex", startIndex + 5);

    return startIndex + 5;
  };

  var dtp = {
    init: function (dtpSelector) {

      $(dtpSelector).each(function () {

        var $dtp = $(this);

        // ensure the dtp is hidden before rendering it
        $dtp.addClass('ot-hide');

        // inits and renders all the components
        var initMetroDateTime = getMetroDateTime($dtp, $pageData);
        var minDate = OT.Common.Helpers.getMinimumDate(initMetroDateTime);
        var $timePicker = $dtp.find(selectors.timePicker).OTselect("init");
        var $restaurantPicker = $dtp.find(selectors.restaurantPicker).OTselect("init");
        var $partySizePicker = $dtp.find(selectors.partySizePicker).OTselect("init");
        var $datepicker = $dtp.find(selectors.datePicker).OTdatepicker("init", minDate);
        var $form = $dtp.find(selectors.dtpForm);
        var dateTimeValidator = OT.Common.Helpers.dateTimeValidator;
        var selectInitValueFor = {
          covers: function () {

            var isValid = function (val) {
              return !!val && val <= 21 && val > 0;
            };

            var valueWasSupplied = !$partySizePicker.OTselect("info").unselectedOnInit,
              suppliedValue = valueWasSupplied ? $partySizePicker.OTselect("get") : null,
              defaultValue = 2;

            if (!isValid(suppliedValue)) {
              var cookiedValue = cookies.get('covers'),
                coversValue = isValid(cookiedValue) ? cookiedValue : defaultValue;

              $partySizePicker.OTselect("select", coversValue);
            }
          },
          dateTime: function () {
            var metroDateTime = getMetroDateTime($dtp),
              metroDate = metroDateTime.format("YYYY-MM-DD"),
              metroTime = metroDateTime.format("HH:mm");

            var isValid = function (date, time) {
              if (!date || !time) {
                return false;
              }

              var validated = dateTimeValidator.get(date, time, metroDate, metroTime);

              return validated.date === date && validated.time === time;
            };

            var suppliedValue = {
              time: $timePicker.OTselect("info").unselectedOnInit ? null : $timePicker.OTselect("get"),
              date: $datepicker.OTdatepicker("getOriginalValue")
            };

            var setValues = (function (originalDate, originalTime) {
              return function (newValues) {
                if (originalDate !== newValues.date) {
                  $datepicker.OTdatepicker("set", newValues.date);
                }

                if (originalTime !== newValues.time) {
                  $timePicker.OTselect("select", newValues.time);
                }
              };
            })(suppliedValue.date, suppliedValue.time);

            if (!isValid(suppliedValue.date, suppliedValue.time)) {
              var cookiedDateTimeValue = cookies.get('datetime'),
                splitted = !!cookiedDateTimeValue ? cookiedDateTimeValue.split(" ") : [],
                cookiedValue = splitted.length === 0 ? undefined : {
                  date: splitted[0],
                  time: splitted[1]
                };

              if (!cookiedValue) {
                setValues(dateTimeValidator.get(suppliedValue.date, suppliedValue.time, metroDate, metroTime));
              } else if (isValid(cookiedValue.date, cookiedValue.time)) {
                setValues(cookiedValue);
              } else {
                setValues(dateTimeValidator.get(cookiedValue.date, cookiedValue.time, metroDate, metroTime));
              }
            }
          }
        };

        var hidePastTimes = function () {

          $timePicker.OTselect("showAll");

          var metroDateTime = getMetroDateTime($dtp),
            metroDate = metroDateTime.format("YYYY-MM-DD"),
            metroTime = metroDateTime.format("HH:mm"),
            currentDate = $datepicker.OTdatepicker("get", 'yyyy-mm-dd'),
            availability = OT.Common.Helpers.timeSlotsAvailability(),
            availableTimeSlots = availability.get(currentDate, metroDate, metroTime),
            timeOptions = $timePicker.find("option");

          for (var i = 0; i < timeOptions.length; i++) {
            var $option = $(timeOptions[i]),
              value = $option.attr("value");

            if (!_.contains(availableTimeSlots, value)) {
              $timePicker.OTselect("hide", value);
            }
          }
        };

        var fixDateTimeValues = function (callback) {
          if (!_validateDateTime) {
            return callback();
          }

          var metroDateTime = getMetroDateTime($dtp),
            metroDate = metroDateTime.format("YYYY-MM-DD"),
            metroTime = metroDateTime.format("HH:mm"),
            currentTime = $timePicker.OTselect("get"),
            currentDate = $datepicker.OTdatepicker("get", 'yyyy-mm-dd'),
            validDateTime = dateTimeValidator.get(currentDate, currentTime, metroDate, metroTime);

          if (currentDate !== validDateTime.date) {
            $datepicker.OTdatepicker("set", validDateTime.date);
          } else if (currentTime !== validDateTime.time) {
            $timePicker.OTselect("select", validDateTime.time);
          } else if (typeof (callback) === 'function') {
            callback();
          }
        };

        var formInputs = {
          restaurantPicker: $restaurantPicker.find("select"),
          partySizePicker: $partySizePicker.find("select"),
          datePicker: $datepicker.find("input"),
          timePicker: $timePicker.find("select"),
          searchButton: $form.find("input.ot-button")
        };

        var labelInputs = {
          restaurantPicker: $restaurantPicker.find("a"),
          partySizePicker: $partySizePicker.find("a"),
          datePicker: $datepicker.find("a"),
          timePicker: $timePicker.find("a")
        };

        var updateTimeOptionsForWaitList = function () {
          if (OT.Widget.options && OT.Widget.options.waitlistEnabled) {
            var datePickerLabel = $($datepicker.find("a"));
            var isToday = datePickerLabel.text() === OT.Widget.todayLabel;
            var firstTimeOption = $($timePicker.find("option")[0]);
            var selectedTimeOption = $($timePicker.find("option:selected"));
            var firstOptionHasNowOption = (firstTimeOption.text() === OT.Widget.timeNowLabel);
            var nowTimeOption = $($timePicker.find("option:contains('" + OT.Widget.timeNowLabel + "')"));

            // Select first time options as now if today
            if (isToday && !firstOptionHasNowOption) {
              firstTimeOption.data('label', firstTimeOption.text());
              firstTimeOption.text(OT.Widget.timeNowLabel);
              $timePicker.OTselect("select", firstTimeOption.attr('value'));
            }

            // Reset now option back to regular time for future days
            if (!isToday && nowTimeOption.length > 0) {
              nowTimeOption.text(nowTimeOption.data('label'));
              $timePicker.OTselect("select", selectedTimeOption.attr('value'));
            }
          }
        };

        if (!isWideTheme($dtp)) {
          // sets unique tabIndexes to the controls in order to enable switching via keyboard tabs
          tabIndexCounter = setTabIndexes(formInputs, tabIndexCounter);
        }

        // binds focus/blur events to controls in order to enable label highlighting when mouse click/keyboard tab switching
        setHighlighting(formInputs, labelInputs);

        // sets initial values
        selectInitValueFor.covers();
        selectInitValueFor.dateTime();
        hidePastTimes();
        updateTimeOptionsForWaitList();

        // Events bindings
        var getSearchObj = function () {
          var rid = $restaurantPicker.OTselect("get");
          var covers = $partySizePicker.OTselect("get");
          var selectedTime = $timePicker.OTselect("get");
          var selectedDate = $datepicker.OTdatepicker("get", "yyyy-mm-dd");
          var dateTime = selectedDate + "T" + selectedTime;

          return {
            rid: rid,
            covers: covers,
            datetime: dateTime,
            sender: $dtp
          };
        };

        var onDTPChanged = function () {
          if (_shouldEmitChangedEvent) {
            hidePastTimes();
            updateTimeOptionsForWaitList();
            var searchObj = getSearchObj();
            cookies.set(searchObj);
            OT.Events.fire("dtp:change", searchObj);
          }
        };

        $form.submit(function (e) {
          var searchObj = getSearchObj();
          e.preventDefault();
          if (searchObj.rid === '0') {
            $restaurantPicker.addClass('error');
            formInputs.restaurantPicker
              .attr('aria-invalid', 'true')
              .attr('aria-describedby', 'ot-restaurant-picker-error');
            $('#ot-restaurant-picker-error').removeClass('ot-hide');
          } else {
            OT.Events.fire("dtp:search", getSearchObj());
            return false;
          }
        });

        OT.Events.on("datepicker:change", function (e, data) {
          if (data.sender.is($datepicker)) {
            fixDateTimeValues(onDTPChanged);
          }
        });

        OT.Events.on("select:change", function (e, data) {
          if (data.sender.is($timePicker)) {
            fixDateTimeValues(onDTPChanged);
          } else if (data.sender.is($partySizePicker) || data.sender.is($restaurantPicker)) {
            if (data.sender.is($restaurantPicker)) {
              var searchObj = getSearchObj();
              if (searchObj.rid !== '0') {
                $restaurantPicker.removeClass('error');
                formInputs.restaurantPicker
                  .attr('aria-invalid', null)
                  .attr('aria-describedby', null);
                $('#ot-restaurant-picker-error').addClass('ot-hide');
              }
            }
            onDTPChanged();
          }
        });

        // all done - make it visible
        $dtp.removeClass("ot-hide");
        OT.Events.fire("dtp:rendered", getSearchObj());
      });
    }
  };

  OT.Common.Dtp.Shared.initOTdtp(dtp);

  return dtp;
})(jQuery, ot_, ot_moment, window.pageData);

OT.createNS('OT.Widget');

OT.Widget.Init = (function($, moment, $window, $document, undefined) {
  var firstRid, searchHost, searchPath, insideIframe, lang, useModal, r3uid, ot_campaign, ot_source, ref, colorId, dark;

  var getRestaurantId = function(data) {
    return parseInt((data.rid || firstRid), 10) || 0;
  };

  var doRestaurantSearch = function(e, data){
    e.preventDefault();

    var rid = getRestaurantId(data);

    if (rid <= 0) {
      return;
    }

    var covers = parseInt(data.covers, 10) || 2;
    if(covers === 21) {
      searchPath = '/private-dining/restaurant/' + rid;
    }

    var r3QueryString = $("input.ot-button").attr('data-ot-restref');

    OT.Common.Helpers.navigate({
      insideIframe: insideIframe,
      host: searchHost,
      path: searchPath,
      r3QueryString: r3QueryString,
      rid: rid,
      r3uid: r3uid,
      ref: ref,
      ot_campaign: ot_campaign,
      ot_source: ot_source,
      useModal: useModal && covers !== 21, // private dining does not use modal
      colorId,
      dark
    });
  };

  var updateR3Attribute = function(e, data){
    var rid = getRestaurantId(data);

    var r3AttributeValues = {
      rid: rid,
      restref: rid,
      partysize: data.covers,
      datetime: data.datetime,
      lang: lang,
      r3uid: r3uid
    };
    var r3AttributeQueryString = OT.Common.Helpers.QueryString.stringify(r3AttributeValues);
    $("input.ot-button").attr('data-ot-restref', r3AttributeQueryString);
  };

  var bindSearchOptions = function(options){
    if (options){
      firstRid = options.restaurantId;
      searchHost = options.searchHost;
      insideIframe = options.insideIframe;
      lang = options.lang;
      ot_campaign = options.ot_campaign;
      ot_source = options.ot_source;
      searchPath = options.searchPath;
      r3uid = options.r3uid;
      ref = options.ref;
      colorId = parseInt(options.colorId, 10) || 0;
      dark = options.dark === 'true';
    }
  };

  var openDatePicker = function() {
    $("div.ot-date-picker > div.picker").addClass("picker--focused picker--opened");
  };

  $($document).ready(function(){
    // set locale for date/time
    moment.locale(OT.Widget.lang || 'en');

    // set search options
    bindSearchOptions(OT.Widget.options || {});

    // listion on dtp events
    OT.Events.on('dtp:rendered', updateR3Attribute);
    OT.Events.on('dtp:change', updateR3Attribute);
    OT.Events.on('dtp:search', doRestaurantSearch);

    $(".ot-dtp-picker").OTdtp("init");

    // update widget ui features
    if(OT.Widget.theme === 'tall') {
      openDatePicker();
    }

    OT.Common.Helpers.modalListener(insideIframe, function (modalR3uid) {
      if (r3uid === modalR3uid) {
        useModal = true;
      }
    });
  });

})(jQuery, ot_moment, window, document);
