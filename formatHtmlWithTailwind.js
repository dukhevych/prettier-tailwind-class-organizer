import { formatTailwindClasses, isLiteralString } from './formatTailwindClasses.js';

export function formatHtmlWithTailwind(html, options = {}) {
  // Simple regex to find and replace class attributes
  return html.replace(
    /class=["']([^"']+)["']/g,
    (match, classValue) => {
      if (isLiteralString(classValue)) {
        const formattedClasses = formatTailwindClasses(classValue, {
          multiline: options.tailwindMultiline !== false
        });
        // If multiline is false, we need to convert the multiline output to single line
        const finalClasses = options.tailwindMultiline === false 
          ? formattedClasses.replace(/\s*\n\s*/g, ' ').trim()
          : formattedClasses.trim();
        return `class="${finalClasses}"`;
      }
      return match;
    }
  );
} 