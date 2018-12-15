const {
  isFunction,
  isArray,
  isObject,
  getPayloadStatusCode
} = require('./utils')

function createResponder (handlers, transformPayload) {
  const transform = isFunction(transformPayload)
    ? transformPayload
    : (payload) => payload

  return (rawPayload, res, callback) => {
    const payload = transform(rawPayload)
    const statusCode = getPayloadStatusCode(payload)

    if (isObject(res) && isFunction(res.status))
      res.status(statusCode).send(payload)

    if (isArray(handlers))
      handlers.forEach(handler => handler(payload))

    if (isFunction(callback))
      callback(payload)

    return payload
  }
}

module.exports = { createResponder }
