const fs = require('fs');
const pathUtils = require('path');
const messages = require('./Messages');

const Trolley = function ({ enabled = true, path = './', filename = '.trolley.log' } = {}) {
  const instance = {
    messages,
    log: null,
    initialize: () => {
      instance.log = enabled
        ? fs.createWriteStream(pathUtils.join(path, filename), { flags: 'a' })
        : null;
      return instance;
    },
    setMessages: (messages) => {
      instance.messages = Object.assign({}, instance.messages, messages);
    },
    logger: (line) => {
      if (instance.log)
        instance.log.write(line + '\n');
    },
    respond: (res, report = {}, handlers = []) => {
      const { code } = report;
      res.status(code).send(report);
      if (handlers.length)
        handlers.forEach(handler => handler ? handler(report) : null);
      return report;
    },
    deliver: (res, report, callback) => {
      const defaults = { message: instance.messages.success, code: 200 };
      const fullReport = Object.assign({}, defaults, report);
      const handlers = [ callback, ...instance.deliveryHandlers ];
      return instance.respond(res, fullReport, handlers);
    },
    deliveryHandlers: [],
    onDeliver: (handler) => {
      if (typeof handler === 'function')
        instance.deliveryHandlers.push(handler);
    }
    crash: (res, report, callback) => {
      const defaults = { message: instance.messages.error, code: 400 };
      const fullReport = Object.assign({}, defaults, report);
      const handlers = [ callback, ...instance.crashHandlers ];
      return instance.respond(res, fullReport, handlers);
    },
    crashHandlers: [],
    onCrash: (handler) => {
      if (typeof handler === 'function')
        instance.crashHandlers.push(handler);
    }
  };

  return instance.initialize();
}

module.exports = Trolley;
