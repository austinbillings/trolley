# Trolley

Trolley is an opinionated, easy to use and extensible logging tool and response abstraction for Express-based APIs.

---

# Usage / public API

In action:

```js
// server.js

const Trolley = require('./my-trolley-instance.js');
const { somethingIsWrongWith, allIsGoodWith } = require('./somefile.js');

app.use('/health', (req, res) => Trolley.deliver('API is up and running!', res))

app.use('/myRoute', (req, res) => {
    try {
        if (somethingIsWrongWith(req.data)) {
            Trolley.crash('SomeValue is invalid!', res);
        } else if (allIsGoodWith(req.data)) {
            Trolley.deliver({ updated: true }, res);
        } else {
            Trolley.send({ code: 420, message: 'Hello world!' }, res);
        }
    } catch (e) {
        Trolley.explode({ message: 'Sorry! We\'re experiencing issues.' }, res);
    }
})
```

## Trolley.create({ config })

Trolley.create is the main method used to create a trolley instance. The resulting instance has methods for flusing responses (`.deliver`, `.crash`, `.explode`, `.send`) as well as methods for adding additional handlers (`.onDeliver`, etc.)

```js
// my-trolley-instance.js

const trolley = require('trolley');
const { reportBadRequestSomehow, reportExceptionSomehow } = require('./somefile.js')

module.exports = trolley.create({
    onCrash: reportBadRequestSomehow,
    onExplode: reportExceptionSomehow
});

```


Responses from .crash and .explode both include some metadata about the failed request, to assist with debugging. Given the above `.crash` usage, the client will receive JSON like this:
```json
{
    "timestamp": 1000000000,
    "status": 400,
    "statusText": "Bad Request",
    "error": "SomeValue is invalid!"
}
```

Use .crash to return an error-type response, 400 by default. you can provide whatever response code you wish by giving { code: number } or { status: number } or { statusCode: number } within the payload.

Trolley also offers means to set default response handlers in your Express API. For instance, if you always perform some action when a request fails for client-side reasons (4XX errors), or for server-side reasons (5XX errors), you can set those up in just one place.

```js
const trolley = require('trolley').create({
    // onRespond is called for all responses through Trolley
    onRespond: (payload) => console.log('server responded with this payload:', payload),
    // onDeliver is called when .deliver is used (successes)
    onDeliver: (payload) => console.log('huzzah, successful response:', payload)
    // onCrash is called when .crash is used (errors)
    onCrash: (payload) => console.log('server got a bad request', payload),
    // onExplode is called when .explode is used (exceptions)
    onExplode: (payload) => console.log('server ran into an exception!', payload)
});

```

## Trolley.createLogger({ loggerConfig })

Returns a logger, which is a function that takes a single line to log to the output file specified in the loggerConfig.

```js
// logger.js

const trolley = require('trolley');
const logger = trolley.createLogger({
    logPath: 'auth_server.log',
    useLineBreaks: true
})

```

## Trolley.withLogger({ combinedLoggerAndTrolleyConfig })

Returns a trolley instance with a pre-built logger added as an `onRespond` handler.

---

# Internals / utilities

## Trolley.statuses
Map of status codes -> status names, like:
```js
{
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  [etc]
```

## Trolley.statusCodes
Map of status names -> status codes, like:
```js
{
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  OK: 200,
  Created: 201,
  Accepted: 202,
  [etc]
```

## Trolley.utils

#### toFunctionArray(whatever)
If given an array of functions, returns that function array. If given a function, returns an array of just that function. If given anything else, returns empty array.

```
toFunctionArray(null)
=> []

toFunctionArray(myCoolFunction)
=> [myCoolFunction]

toFunctionArray([someFunc, anotherFunc, thirdFunc])
=> [someFunc, anotherFunc, thirdFunc]
```

#### stringify(whatever)
Does `JSON.stringify`, but unwraps the added quotes if the value is already a string.

```
stringify({ ok: 1234, what: true })
=> '{ "ok": 1234, "what": true }'

stringify(43)
=> '43'

stringify('hey')
=> 'hey'
```

#### capitalize(string)
Capitalizes the first letter of the string given. Leaves the rest of the casings untouched.

```
capitalize('hello there')
=> 'Hello there'
```

#### lowercase(string)
Lowercases the whole darn string.
```
lowercase('OMG!')
=> 'omg!'
```

#### camelCase(string)
Splits the string into words (breaking by non-alphanumeric chars), doesn't touch the first word, and runs `capitalize` on the subsequent words, joining them without spaces.

> Warning! This and other code-casing functions remove all whitespace and non-alphanumeric characters.

```
camelCase('what the heck!? I am only 29.')
=> 'whatTheHeckIAmOnly29'

camelCase('OMG')
=> 'OMG'

camelCase('What is it anyway') // note the capital initial
=> 'WhatIsItAnyway'

camelCase('$)!$(#')
=> ''
```


#### pascalCase(string)
Splits the string into words (breaking by non-alphanumeric chars) and runs `capitalize` on each word, joining them without spaces.

> Warning! This and other code-casing functions remove all whitespace and non-alphanumeric characters.

```
pascalCase('possible unreality')
=> 'PossibleUnreality'
```

#### snakeCase(string)
Splits the string into words (breaking by non-alphanumeric chars) and runs `lowercase` on all of them, joining them by underscores (_).

> Warning! This and other code-casing functions remove all whitespace and non-alphanumeric characters.


```
snakeCase('Possible Unreality')
=> 'possible_unreality'
```


#### kebabCase(string)
Splits the string into words (breaking by non-alphanumeric chars) and runs `lowercase` on all of them, joining them by dashes (-).

> Warning! This and other code-casing functions remove all whitespace and non-alphanumeric characters.


```
kebabCase('Possible Unreality Detected!')
=> 'possible-unreality-detected'
```


#### keys(object)
Returns all the keys of an object, same as `Object.keys` (but with an object-type-check included).

```
keys('lol')
=> TypeError: 'lol' is not an object.

keys({ ok: 'yes', what: true })
=> ['ok', 'what']
```

#### withoutKeys(object, keysToRemove: String[])
Returns the given object without any properties whose names match strings in `keysToRemove`.


#### getPayloadStatusCode(payload, defaultCode)
Checks `payload` for `code`, `status`, or `statusCode` properties containing a number. Returns the first it finds. If none, return `defaultCode`, or if none given, return 200 if the `payload` is truthy or 0, otherwise 204 (No Content).

#### unwrapQuotes(string)
If given a string that has double quotes (") at the beginning and the end, returns the same string without them.


### Type checkers
Fairly self-explanatory:

- isNumber
- isFunction
- isString
- isDefined
- isNonEmptyString
- isArray
- isBoolean
- isNull
- isObject
- isRegex
- isPrimitive
- isFunctionArray
