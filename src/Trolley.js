const fs = require('fs');
const pathUtils = require('path');

const Trolley = function ({ enabled = true, path = './', filename = 'trolley.log' } = {}) {
  const trolley = {
    log: null,
    messages: require('./Messages'),
    initialize: () => {
      trolley.log = enabled ? fs.createWriteStream(pathUtils.join(path, filename), { flags: 'a' }) : null;
    },
    setMessages: (messages) => {
      trolley.messages = Object.assign({}, trolley.messages, messages);
    },
    logger: (line) => {
      if (trolley.log) trolley.log.write(line + '\n');
    },
    crash: (res, { message = trolley.messages.error, code = 400, obj = null }) => {
      const success = false;
      res.status(code).send({ success, message, code });
      return { message, code, obj };
    }
  };

  trolley.initialize();
  return trolley;
}

module.exports = Trolley;
