const statuses = require('./constants/statuses')
const statusCodes = require('./constants/statusCodes')
const {
  isString,
  isObject,
  withoutKeys,
  getPayloadStatusCode
} = require('./utils')

function createPayloadWrapper (defaultCode, isError) {
  return (payload = null, spreadMeta = true) => {
    const timestamp = new Date()
    const code = getPayloadStatusCode(payload, defaultCode)
    const statusText = isObject(payload) && isString(payload.statusText)
      ? payload.statusText
      : statuses[code]

    const meta = spreadMeta ? { timestamp, code, statusText } : {}
    const output = isError && isObject(payload) && payload.error
      ? payload.error
      : isObject(payload)
        ? withoutKeys(payload, ['statusText', 'code'])
        : payload

    return isError
      ? { ...meta, error: output }
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
