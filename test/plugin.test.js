import { createRequire } from 'module';
import prettier from 'prettier';
import { formatTailwindClasses, isLiteralString } from '../formatTailwindClasses.js';
import { formatHtmlWithTailwind } from '../formatHtmlWithTailwind.js';
import plugin from '../plugin.js';

const require = createRequire(import.meta.url);
const prettierPluginSvelte = require('prettier-plugin-svelte');
const { formatHtmlWithTailwind: pluginFormatHtmlWithTailwind } = plugin;
const resolvedSveltePlugin = prettierPluginSvelte.default ?? prettierPluginSvelte;

describe('Tailwind Group Prettier Plugin', () => {
  describe('formatTailwindClasses', () => {
    test('should group and sort basic classes', () => {
      const input = 'p-2 text-white flex bg-blue-500 justify-center';
      const expected = '\n  flex justify-center\n  p-2\n  text-white\n  bg-blue-500\n';
      expect(formatTailwindClasses(input)).toBe(expected);
    });

    test('should handle state variants correctly', () => {
      const input = 'hover:bg-blue-500 bg-blue-300 text-white hover:text-gray-100';
      const expected = '\n  hover:text-gray-100 text-white\n  bg-blue-300 hover:bg-blue-500\n';
      expect(formatTailwindClasses(input)).toBe(expected);
    });

    test('should handle empty or whitespace-only input', () => {
      expect(formatTailwindClasses('')).toBe('');
      expect(formatTailwindClasses('   ')).toBe('   ');
      expect(formatTailwindClasses(null)).toBe(null);
    });

    test('should handle single class', () => {
      const input = 'flex';
      const expected = '\n  flex\n';
      expect(formatTailwindClasses(input)).toBe(expected);
    });

    test('should handle unknown classes in "other" group', () => {
      const input = 'custom-class flex another-custom';
      const expected = '\n  flex\n  another-custom custom-class\n';
      expect(formatTailwindClasses(input)).toBe(expected);
    });

    test('should respect multiline option', () => {
      const input = 'p-2 text-white flex';
      const expected = 'flex p-2 text-white';
      expect(formatTailwindClasses(input, { multiline: false })).toBe(expected);
    });
  });

  describe('isLiteralString', () => {
    test('should identify literal strings', () => {
      expect(isLiteralString('class-name')).toBe(true);
      expect(isLiteralString('')).toBe(true);
      expect(isLiteralString('p-2 text-white')).toBe(true);
    });

    test('should reject dynamic expressions', () => {
      expect(isLiteralString('{dynamicClass}')).toBe(false);
      expect(isLiteralString('${template}')).toBe(false);
      expect(isLiteralString('{foo && "bar"}')).toBe(false);
      expect(isLiteralString('`${baseClass} ${conditionalClass}`')).toBe(false);
    });
  });

  describe('HTML formatting', () => {
    test('should format class attributes in HTML', () => {
      const input = '<div class="p-2 text-white flex bg-blue-500 justify-center" id="main" />';
      const expected = '<div class="flex justify-center\n  p-2\n  text-white\n  bg-blue-500" id="main" />';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });

    test('should skip dynamic class attributes', () => {
      const input = '<div class="{dynamicClass}" id="main" />';
      const expected = '<div class="{dynamicClass}" id="main" />';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });

    test('should preserve other attributes', () => {
      const input = '<div class="flex p-2" id="main" data-test="value" />';
      const expected = '<div class="flex\n  p-2" id="main" data-test="value" />';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });

    test('should handle self-closing tags', () => {
      const input = '<img class="w-10 h-10 rounded-full" src="avatar.jpg" />';
      const expected = '<img class="h-10 w-10\n  rounded-full" src="avatar.jpg" />';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });
  });

  describe('Vue formatting', () => {
    test('should format class attributes in Vue templates', () => {
      const input = '<template><div class="p-2 text-white flex bg-blue-500 justify-center" id="main" /></template>';
      const expected = '<template><div class="flex justify-center\n  p-2\n  text-white\n  bg-blue-500" id="main" /></template>';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });

    test('should skip Vue dynamic class bindings', () => {
      const input = '<template><div :class="{ active: isActive }" id="main" /></template>';
      const expected = '<template><div :class="{ active: isActive }" id="main" /></template>';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });
  });

  describe('Idempotency', () => {
    test('should be idempotent - multiple runs produce same result', () => {
      const input = '<div class="p-2 text-white flex bg-blue-500 justify-center" id="main" />';
      const firstRun = formatHtmlWithTailwind(input);
      const secondRun = formatHtmlWithTailwind(firstRun);
      expect(secondRun).toBe(firstRun);
    });

    test('should be idempotent with complex classes', () => {
      const input = '<div class="hover:bg-blue-500 bg-blue-300 text-white hover:text-gray-100 flex justify-center p-4" />';
      const firstRun = formatHtmlWithTailwind(input);
      const secondRun = formatHtmlWithTailwind(firstRun);
      expect(secondRun).toBe(firstRun);
    });
  });

  describe('Edge cases', () => {
    test('should handle classes with multiple spaces', () => {
      const input = '<div class="  p-2   text-white  flex  " />';
      const expected = '<div class="flex\n  p-2\n  text-white" />';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });

    test('should handle mixed case classes', () => {
      const input = '<div class="FLEX p-2 TEXT-white" />';
      const expected = '<div class="p-2\n  FLEX TEXT-white" />';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });

    test('should handle classes with special characters', () => {
      const input = '<div class="w-1/2 h-full bg-gradient-to-r from-blue-500 to-purple-600" />';
      const expected = '<div class="h-full w-1/2\n  bg-gradient-to-r from-blue-500 to-purple-600" />';
      expect(formatHtmlWithTailwind(input)).toBe(expected);
    });
  });

  describe('Plugin options', () => {
    test('should respect tailwindMultiline option', () => {
      const input = '<div class="p-2 text-white flex" />';
      const expected = '<div class="flex p-2 text-white" />';
      expect(formatHtmlWithTailwind(input, { tailwindMultiline: false })).toBe(expected);
    });
  });

  describe('Prettier integration', () => {
    const formatWithPlugin = (source, config = {}) =>
      prettier.format(source, {
        parser: 'html',
        plugins: [plugin],
        ...config,
      });

    test('produces multiline grouped classes in HTML output', async () => {
      const input = '<div class="p-2 text-white flex bg-blue-500 justify-center"></div>';
      const result = await formatWithPlugin(input);
      expect(result).toContain(
        [
          'class="',
          '    flex justify-center',
          '    p-2',
          '    text-white',
          '    bg-blue-500',
          '  "',
        ].join('\n')
      );
    });

    test('respects tailwindMultiline=false during formatting', async () => {
      const input = '<div class="p-2 text-white flex bg-blue-500 justify-center"></div>';
      const result = await formatWithPlugin(input, { tailwindMultiline: false });
      expect(result).toContain('class="flex justify-center p-2 text-white bg-blue-500"');
      expect(result).toMatch(/class="[^"\n]+"/);
    });
  });

  describe('Svelte integration', () => {
    const formatSvelte = (source, config = {}) =>
      prettier.format(source, {
        parser: 'svelte',
        plugins: [plugin, resolvedSveltePlugin],
        ...config,
      });

    test('formats class attributes in Svelte markup', async () => {
      const input = '<div class="p-2 text-white flex bg-blue-500 justify-center">{count}</div>';
      const result = await formatSvelte(input);
      expect(result).toContain(
        [
          'class="',
          '    flex justify-center',
          '    p-2',
          '    text-white',
          '    bg-blue-500',
          '  "',
        ].join('\n')
      );
    });

    test('respects tailwindMultiline=false for Svelte', async () => {
      const input = '<div class="p-2 text-white flex bg-blue-500 justify-center">{count}</div>';
      const result = await formatSvelte(input, { tailwindMultiline: false });
      expect(result).toContain('class="flex justify-center p-2 text-white bg-blue-500"');
    });

    test('leaves dynamic class expressions untouched', async () => {
      const input = `<div class="foo {bar ? 'baz' : ''} qux">{count}</div>`;
      const result = await formatSvelte(input);
      expect(result).toContain(`class="foo {bar ? 'baz' : ''} qux"`);
    });
  });
});
