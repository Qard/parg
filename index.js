//     Parg.js 0.0.1
//     http://stephenbelanger.com
//     (c) 2009-2013 Stephen Belanger
//     Parg may be freely distributed under the MIT license.

// TODO: Figure out how to make `s:key s:values*` work

// Parse arguments with ease
// -------------------------

// Parg uses a selector string to translate argument lists to objects.
// Each argument is separated by a space and should follow this structure;
// `{types}:{name}{flags}`.
//
// The valid `types` are described above, `name` can be any string that passes
// a `\w` regex test, and available flags are `*` for grouping multiple
// arguments together and `?` to mark an argument as optional.
// 
// For example, in `sn:key :values* o:options? f:callback?` the `key` argument
// must be a string or number, there may be any number of `value` arguments
// that may be any type as types is omitted,  and it takes an optional
// `options` hash and `callback` function.
function Parg () {

  // Basic usage
  // -----------

  // The most basic usage of parg is inside a function, passing in the
  // arguments object `var opts = parg(selector, arguments)`. The `opts` value
  // returned will be either the parsed arguments, or an error object.
  // 
  // A simple `if (opts instanceof Error) { /* handle error */ }` should be
  // sufficient to handle any errors that may occur while validating the input.
  function parg (selector, args, throwErrors) {
    return parg.build(selector, function (err, opts) {
      if (err && throwErrors) throw err
      return err ? err : opts
    }).apply(null, args)
  }

  // Function wrapping
  // -----------

  // Parg can also be used to wrap a function, in which case the call should
  // look like `parg.build(selector, function (err, opts) {})` where `err` is
  // either the first validation error encountered while parsing the arguments
  // or null, and `opts` will be the resulting hash, if the parse succeeded.
  parg.build = function (selector, fn) {
    var stages = selector.split(' ')
      , steps = []

    // In this stage, we parse the selector string. The string is split into
    // individual argument definitions at spaces, then each is matched against
    // the `{types}:{name}{flags}` structure. Both `types` and `flags` are
    // split into single characters and each is used to match different types
    // or states.
    // 
    // All this criteria is stored in a matcher list that will be used later
    // to compare against each function argument.
    for (var i = 0; i < stages.length; i++) {
      var matches = stages[i].match(/(\w*):(\w*)(.*)/)

      steps.push({
        name: matches[2]
        , flags: matches[3].split('')
        , types: (matches[1] || '').split('')
      })
    }

    // Then we should return a function to receive the args and run them
    // through the matchers registered for each type short code.
    return function () {
      var args = Array.prototype.slice.call(arguments)
        , opts = {}

      // Run through the steps from the end back to the start. It's easier to
      // support optional arguments after splat arguments this way.
      while (steps.length) {
        var step = steps.pop()
          , isSplat = !!~step.flags.indexOf('*')
          , isOptional = !!~step.flags.indexOf('?')
          , doneStep = false
          , count = 0

        // If we are on a splat argument, we should assume that every remaining
        // argument is for the splat. We can determine otherwise later. If
        // there are no steps left, and the splat is required we should return
        // an error. Otherwise, open an array to store the splat arguments in.
        isSplat && (opts[step.name] = [])

        // Try matching the number of arguments we expect. If the required
        // types have been supplied but don't match, we should either add
        // optional args back in, or return an error.
        // 
        // If no types are required or the type matched, we should add the
        // argument to the resulting hash. If there is an existing field by
        // that name, ensure it is an array, then add current arg to it.
        while ( ! doneStep) {
          if ( ! args.length) {
            if ( ! isOptional && ( ! isSplat || count < 1)) {
              return fn(new Error('Ran out of arguments before matchers in "' + selector + '".'))
            }
            doneStep = true
          }

          var beforeLen = args.length, arg = args.pop()
          if (step.types.length && ! parg.oneOf(arg, step.types)) {
            if (count < 1) {
              if ( ! isOptional) {
                return fn(new Error(
                  '"' + step.name + '" '
                  + (isSplat ? 'requires at least one value' : 'must be one')
                  + ' of types ["' + step.types.join('", "') + '"]'
                ))
              }
            }
            beforeLen && args.push(arg)
            doneStep = true
            count = 0

          } else {
            if (opts[step.name]) {
              parg.oneOf(opts[step.name], ['a']) || (opts[step.name] = [opts[step.name]])
              opts[step.name].unshift(arg)
            } else {
              opts[step.name] = arg
            }
            isSplat || (doneStep = true)
            count++
          }
        }
      }

      // By now, we should have run out of arguments. If not, we should want
      // the caller that the resulting data is probably wrong.
      if (args.length) {
        return fn(new Error('Ran out of matchers before arguments in "' + selector + '".'))
      }

      // Otherwise, return the data happily. :)
      return fn(null, opts)
    }
  }

  // Validation
  // ----------

  // Parg includes an extendable validation system, so custom validations can
  // be created to do some more advanced validation of common arguments.
  parg.validators = {}
  parg.register = function (type, validator) {
    parg.validators[type] = validator
  }

  // Javascript can be kind of stupid sometimes, so we can't expect a simple
  // typeof check to work properly in all cases.
  parg.register('s', function (v) { return typeof v === 'string' })
  parg.register('n', function (v) { return typeof v === 'number' })
  parg.register('o', function (v) { return typeof v === 'object' })
  parg.register('f', function (v) { return typeof v === 'function' })
  parg.register('b', function (v) { return typeof v === 'boolean' })
  parg.register('r', function (v) { return v instanceof RegExp })
  parg.register('a', function (v) { return Array.isArray(v) })

  // Detect if the value matches at least one of the supplied types
  parg.oneOf = function (v, types) {
    return types.reduce(function (m, type) {
      return m || parg.validators[type](v)
    }, false)
  }

  return parg
}

// CommonJS
// --------

// Parg supports CommonJS, so it can be used in node.
if (typeof module !== 'undefined') {
  module.exports = Parg
}