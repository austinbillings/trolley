const statuses = require('./statuses')
const { camelCase } = require('../utils')

module.exports = Object.keys(statuses)
  .reduce((output, code) => (
    { ...output, [camelCase(statuses[code])]: code * 1  }
  ), {})
