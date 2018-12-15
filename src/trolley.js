const fs = require('fs')
const pathUtils = require('path')

const statusCodes = require('./constants/statusCodes')
const { createResponder } = require('./responder')
const { wrapSuccess, wrapError, wrapException } = require('./wrappers')
const { isFunction, isObject, stringify, isFunctionArray, toFunctionArray } = require('./utils')

const create = ({ onRespond, onSend, onDeliver, onCrash, onExplode } = {}) => {
  const handlers = {
    all: toFunctionArray(onRespond),
    send: toFunctionArray(onSend),
    deliver: toFunctionArray(onDeliver),
    crash: toFunctionArray(onCrash),
    explode: toFunctionArray(onExplode)
  }

  const addHandlersTo = (eventType) => (...handler) => (
    eventType in handlers && (isFunction(handler) || isFunctionArray(handler))
      ? handlers[eventType].push(...toFunctionArray(handler))
      : null
  )

  const getHandlers = (eventType) => {
    return eventType in handlers
      ? [ ...handlers.all, ...handlers[eventType]]
      : handlers.all
  }

  const respondAndHandle = (eventType, transformPayload) => (
    (...args) => createResponder(getHandlers(eventType), transformPayload)(...args)
  )

  const instance = {
    onRespond: addHandlersTo('all'),

    onSend: addHandlersTo('send'),
    send: respondAndHandle('send'),

    onDeliver: addHandlersTo('deliver'),
    deliver: respondAndHandle('deliver', wrapSuccess),

    onCrash: addHandlersTo('crash'),
    crash: respondAndHandle('crash', wrapError),

    onExplode: addHandlersTo('explode'),
    explode: respondAndHandle('explode', wrapException)
  }

  return instance
}

const createLogger = ({ logPath = './.trolley.log', serializer, useLineBreaks = true } = {}) => {
  const logWriter = fs.createWriteStream(logPath, { flags: 'a' })
  const serialize = isFunction(serializer) ? serializer : stringify

  return line => logWriter.write(serialize(line) + (useLineBreaks ? '\n' : ''))
}

const withLogger = (config = {}) => {
  const logger = createLogger(config)
  const onRespond = isObject(config)
    ? [ ...toFunctionArray(config.onRespond), logger ]
    : [ logger ]

  return create({ ...config, onRespond })
}

module.exports = { create, createLogger, withLogger }
