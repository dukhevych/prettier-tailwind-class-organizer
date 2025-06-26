import { formatTailwindClasses, isLiteralString } from './formatTailwindClasses.js';
import * as prettierHtml from 'prettier/plugins/html';
import * as prettierBabel from 'prettier/plugins/babel';
import * as prettierEstree from 'prettier/plugins/estree';

/**
 * Prettier plugin for formatting Tailwind CSS classes
 * This plugin provides a standalone formatter that can be used with Prettier
 */
export default {
  parsers: {
    html: {
      ...prettierHtml.parsers.html,
      parse: (text, parsers, options) => {
        const ast = prettierHtml.parsers.html.parse(text, parsers, options);
        return transformHtmlAst(ast, options);
      },
      astFormat: 'html',
    },
    vue: {
      ...prettierHtml.parsers.vue,
      parse: (text, parsers, options) => {
        const ast = prettierHtml.parsers.vue.parse(text, parsers, options);
        return transformHtmlAst(ast, options);
      },
      astFormat: 'html',
    },
    babel: {
      ...prettierBabel.parsers.babel,
      parse: (text, parsers, options) => {
        const ast = prettierBabel.parsers.babel.parse(text, parsers, options);
        return transformJsxAst(ast, options);
      },
      astFormat: 'estree',
    },
    'babel-ts': {
      ...prettierBabel.parsers['babel-ts'],
      parse: (text, parsers, options) => {
        const ast = prettierBabel.parsers['babel-ts'].parse(text, parsers, options);
        return transformJsxAst(ast, options);
      },
      astFormat: 'estree',
    },
  },
  printers: {
    html: prettierHtml.printers.html,
    estree: prettierEstree.printers.estree,
  },
  options: {
    tailwindMultiline: {
      type: 'boolean',
      category: 'Tailwind',
      default: true,
      description: 'Format Tailwind classes in multiline mode'
    },
    tailwindGroupOrder: {
      type: 'string',
      category: 'Tailwind',
      default: '',
      description: 'Custom group order (comma-separated)'
    }
  }
};

/**
 * Standalone function to format HTML with Tailwind classes
 * This can be used independently of Prettier
 */
function formatHtmlWithTailwind(html, options = {}) {
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

function transformHtmlAst(ast, options) {
  if (!ast || typeof ast !== 'object') return ast;
  if (Array.isArray(ast)) return ast.map(node => transformHtmlAst(node, options));

  // HTML/Vue: element nodes
  if (ast.type === 'element' && ast.attributes) {
    ast.attributes = ast.attributes.map(attr => {
      if (attr.key === 'class' && isLiteralString(attr.value)) {
        attr.value = formatTailwindClasses(attr.value, { multiline: options.tailwindMultiline });
      }
      return attr;
    });
  }
  if (ast.children) {
    ast.children = ast.children.map(child => transformHtmlAst(child, options));
  }
  return ast;
}

function transformJsxAst(ast, options) {
  if (!ast || typeof ast !== 'object') return ast;
  if (Array.isArray(ast)) return ast.map(node => transformJsxAst(node, options));

  // JSX: className attributes
  if (ast.type === 'JSXAttribute' && ast.name && ast.name.name === 'className') {
    if (ast.value && ast.value.type === 'Literal' && isLiteralString(ast.value.value)) {
      ast.value.value = formatTailwindClasses(ast.value.value, { multiline: options.tailwindMultiline });
    }
  }
  // Recurse into children
  for (const key in ast) {
    if (ast[key] && typeof ast[key] === 'object') {
      ast[key] = transformJsxAst(ast[key], options);
    }
  }
  return ast;
} 