const plugin = require('./plugin.js');
const prettier = require('prettier');
(async () => {
  const input = '<div class="relative text-[var(--rating-text-color)]">';
  const output = await prettier.format(input, { parser: 'html', plugins: [plugin] });
  console.log(output);
})();
