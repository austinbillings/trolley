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
    crash: (res, { message = instance.messages.error, code = 400, obj = null }, callback) => {
      res.status(code).send({ message, code });
      const cause = { message, code, obj };
      if (callback) callback(cause);
      if (instance.crashHandlers.length)
        instance.crashHandlers.forEach(handler => handler(cause));
      return cause;
    }
    crashHandlers: [],
    onCrash: (handler) => {
      if (typeof handler === 'function')
        instance.crashHandlers.push(handler);
    }
  };

  return instance.initialize();
}

module.exports = Trolley;
