import { formatTailwindClasses, isLiteralString, GROUP_MAP, GROUP_ORDER } from '../formatTailwindClasses.js';

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

  test('should respect custom group order option', () => {
    const input = 'text-white flex bg-blue-500';
    const expected = '\n  bg-blue-500\n  flex\n  text-white\n';
    expect(
      formatTailwindClasses(input, {
        tailwindGroupOrder: 'colors,layout,typography,spacing'
      })
    ).toBe(expected);
  });

  test('should handle classes with multiple spaces', () => {
    const input = '  p-2   text-white  flex  ';
    const expected = '\n  flex\n  p-2\n  text-white\n';
    expect(formatTailwindClasses(input)).toBe(expected);
  });

  test('should handle mixed case classes', () => {
    const input = 'FLEX p-2 TEXT-white';
    const expected = '\n  p-2\n  FLEX TEXT-white\n';
    expect(formatTailwindClasses(input)).toBe(expected);
  });

  test('should handle classes with special characters', () => {
    const input = 'w-1/2 h-full bg-gradient-to-r from-blue-500 to-purple-600';
    const expected = '\n  h-full w-1/2\n  bg-gradient-to-r from-blue-500 to-purple-600\n';
    expect(formatTailwindClasses(input)).toBe(expected);
  });

  test('should be idempotent', () => {
    const input = 'p-2 text-white flex bg-blue-500 justify-center';
    const firstRun = formatTailwindClasses(input);
    const secondRun = formatTailwindClasses(firstRun);
    expect(secondRun).toBe(firstRun);
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

describe('Constants', () => {
  test('should export GROUP_MAP', () => {
    expect(GROUP_MAP).toBeDefined();
    expect(typeof GROUP_MAP).toBe('object');
    expect(GROUP_MAP.layout).toContain('flex');
    expect(GROUP_MAP.spacing).toContain('p-');
  });

  test('should export GROUP_ORDER', () => {
    expect(GROUP_ORDER).toBeDefined();
    expect(Array.isArray(GROUP_ORDER)).toBe(true);
    expect(GROUP_ORDER).toContain('layout');
    expect(GROUP_ORDER).toContain('other');
  });
}); 
