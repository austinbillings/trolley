const statuses = require('./constants/statuses')
const statusCodes = require('./constants/statusCodes')
const {
  isString,
  isObject,
  withoutKeys,
  getPayloadStatusCode
} = require('./utils')

function createPayloadWrapper (defaultCode, isErrorWrapper) {
  return (payload = null, spreadMeta = true) => {
    const timestamp = new Date()
    const code = getPayloadStatusCode(payload, defaultCode)
    const statusText = isObject(payload) && isString(payload.statusText)
      ? payload.statusText
      : statuses[code]

    const meta = spreadMeta ? { timestamp, code, statusText } : {}
    const output = isObject(payload)
      ? withoutKeys(payload, ['statusText', 'code'])
      : payload

    if (isErrorWrapper) {
      const error = isObject(output) && output.error
        ? output.error
        : output

      return { ...meta, error }
    }

    const message = isObject(output) && output.message
      ? output.message
      : null

    return message
      ? { ...meta, message, output: withoutKeys(output, 'message') }
      : isString(output)
        ? { ...meta, message: output }
        : { ...meta, data: output }
  }
}

function wrapSuccess (payload) {
  return createPayloadWrapper
    (statusCodes.OK)
    (payload)
}

function wrapError (payload) {
  return createPayloadWrapper
    (statusCodes.BadRequest, true)
    (payload)
}

function wrapException (payload) {
  return createPayloadWrapper
    (statusCodes.InternalServerError, true)
    (payload)
}

module.exports = {
  createPayloadWrapper,
  wrapSuccess,
  wrapError,
  wrapException
}
