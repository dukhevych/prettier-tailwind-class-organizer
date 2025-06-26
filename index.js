const plugin = require('./plugin');
const { formatTailwindClasses, isLiteralString, GROUP_MAP, GROUP_ORDER } = require('./formatTailwindClasses');

module.exports = {
  ...plugin,
  formatTailwindClasses,
  isLiteralString,
  GROUP_MAP,
  GROUP_ORDER
}; 