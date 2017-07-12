const path = require('path');

const Trolley = {
  persistence: {
    enabled: true,
    path: './',
    filename: 'trolley.log'
  },
  messages: require('./Messages'),
  crash (message = Trolley.messages.error, res, code = 400, obj = null) {
		const success = false;
		res.status(code).send({ success, message, code });
		zaq.err(message, obj);
	}

  err (message, obj) {
    zaq.err(message, obj);
    if (Trolley.config)
  }
};

module.exports = Trolley;
