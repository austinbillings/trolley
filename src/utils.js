function isNumber (value) {
  return typeof value === 'number'
}

function isFunction (value) {
  return typeof value === 'function'
}

function isBoolean (value) {
  return typeof value === 'boolean'
}

function isNull (value) {
  return value === null
}

function isFunctionArray (value) {
  return isArray(value) && value.every(isFunction)
}

function isString (value) {
  return typeof value === 'string'
}

function isDefined (value) {
  return typeof value !== 'undefined'
}

function isArray (value) {
  return Array.isArray(value)
}

function isObject (value) {
  return typeof value === 'object'
    && !Array.isArray(value)
    && !(value instanceof RegExp)
}

function isRegex (value) {
  return value instanceof RegExp
}

function isNonEmptyString (value) {
  return isString(value) && value.length
}

function isPrimitive (value) {
  return !isDefined(value)
    || isString(value)
    || isNumber(value)
    || isBoolean(value)
    || isNull(value)
}

function toFunctionArray (input) {
  return isFunctionArray(input)
    ? input
    : isFunction(input)
      ? [ input ]
      : []
}

function stringify (value) {
  return unwrapQuotes(JSON.stringify(value))
}

function lowercase (text) {
  if (!isString(text))
    throw new TypeError(`${text} is not a string.`)

  return text.toLowerCase()
}

function capitalize (text) {
  if (!isString(text))
    throw new TypeError(`${text} is not a string.`)

  return text.length
    ? text[0].toUpperCase() + text.substring(1)
    : ''
}

function convertCase (wordMapFunction, joinBy = '') {
  if (!isFunction(wordMapFunction))
    throw new TypeError(`${mapFunction} is not a function.`)

  return (text) => {
    if (!isString(text) && !isNumber(text))
      throw new TypeError(`${text} is wrong type. Must be <String|Number>.`)

    return text
      .trim()
      .split(/[^a-zA-Z0-9]+/)
      .filter(isNonEmptyString)
      .map(wordMapFunction)
      .join(joinBy)
  }
}

function camelCase (text) {
  const toCamelCase = (t, i) => i ? capitalize(t) : t

  return convertCase(toCamelCase)(text)
}

function pascalCase (text) {
  return convertCase(capitalize)(text)
}

function kebabCase (text) {
  return convertCase(lowercase, '-')(text)
}

function snakeCase (text) {
  return convertCase(lowercase, '_')(text)
}

function keys (object) {
  if (!isObject(object))
    throw new TypeError(`${object} is not an object.`)

  return Object.keys(object)
}

function withoutKeys (object, keysToRemove = []) {
  if (!isObject(object))
    throw new TypeError(`${object} is not an object.`)
  if (!isString(keysToRemove) && !isArray(keysToRemove))
    throw new TypeError(`${keysToRemove} must be <String|Array>`)

  if (isString(keysToRemove))
    keysToRemove = Array.from(keysToRemove)

  return keys(object).reduce((output, key) => (
    keysToRemove.includes(key)
      ? output
      : { ...output, [key]: object[key] }
  ), {})
}

function getPayloadStatusCode (payload, defaultCode) {
  return isObject(payload) && isNumber(payload.code)
    ? payload.code
    : isObject(payload) && isNumber(payload.status)
      ? payload.status
      : isObject(payload) && isNumber(payload.statusCode)
        ? payload.statusCode
        : isNumber(defaultCode)
          ? defaultCode
          : payload || isNumber(payload)
            ? statusCodes.OK
            : statusCodes.NoContent
}

function unwrapQuotes (string) {
  return !isString(string) || !string
    ? string
    : string[0] === '"' && string[string.length - 1] === '"'
      ? string.substring(1, string.length - 1)
      : string
}


module.exports = {
  isNumber,
  isFunction,
  isString,
  isDefined,
  isNonEmptyString,
  isArray,
  isBoolean,
  isNull,
  isObject,
  isRegex,
  isPrimitive,
  isFunctionArray,
  toFunctionArray,
  stringify,
  capitalize,
  lowercase,
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  keys,
  withoutKeys,
  getPayloadStatusCode,
  unwrapQuotes
}
