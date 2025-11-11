import { createRequire } from 'module';
import { formatTailwindClasses, getTailwindClassGroups, isLiteralString } from './formatTailwindClasses.js';
import * as prettierHtml from 'prettier/plugins/html';
import * as prettierBabel from 'prettier/plugins/babel';
import * as prettierEstree from 'prettier/plugins/estree';
import { builders as docBuilders } from 'prettier/doc';

const { concat, hardline, indent, join, breakParent } = docBuilders;
const baseHtmlPrinter = prettierHtml.printers.html;
const require = createRequire(import.meta.url);
let sveltePlugin;
try {
  sveltePlugin = require('prettier-plugin-svelte');
} catch {
  sveltePlugin = null;
}
const resolvedSveltePlugin = sveltePlugin?.default && sveltePlugin.default.parsers ? sveltePlugin.default : sveltePlugin;
const baseSveltePrinter = resolvedSveltePlugin?.printers?.['svelte-ast'] ?? null;
const tailwindSveltePrinter = baseSveltePrinter
  ? createTailwindAwarePrinter(baseSveltePrinter, ['attributes'])
  : null;
if (tailwindSveltePrinter && resolvedSveltePlugin?.printers) {
  resolvedSveltePlugin.printers['svelte-ast'] = tailwindSveltePrinter;
}

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
    html: createTailwindAwarePrinter(baseHtmlPrinter, ['attrs']),
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
          multiline: options.tailwindMultiline !== false,
          tailwindGroupOrder: options.tailwindGroupOrder
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
  if (!ast || typeof ast !== 'object') {
    return ast;
  }
  if (Array.isArray(ast)) {
    return ast.map(node => transformHtmlAst(node, options));
  }

  if (Array.isArray(ast.attrs)) {
    ast.attrs.forEach((attr, index) => {
      ast.attrs[index] = transformHtmlAttribute(attr, options);
    });
  }
  if (Array.isArray(ast.attributes)) {
    ast.attributes.forEach((attr, index) => {
      ast.attributes[index] = transformHtmlAttribute(attr, options);
    });
  }
  if (Array.isArray(ast.children)) {
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
      ast.value.value = formatTailwindClasses(ast.value.value, {
        multiline: false,
        tailwindGroupOrder: options.tailwindGroupOrder
      });
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

function createTailwindAwarePrinter(basePrinter, attributeProps) {
  if (!basePrinter) return basePrinter;
  return {
    ...basePrinter,
    print(path, options, print) {
      const node = path.getValue();
      if (!hasAnyAttributes(node, attributeProps)) {
        return basePrinter.print(path, options, print);
      }
      const originalMap = path.map;
      path.map = function tailwindMap(callback, prop) {
        let docs = originalMap.call(this, callback, prop);
        if (attributeProps.includes(prop) && Array.isArray(node?.[prop])) {
          docs = docs.map((doc, index) => {
            const attrNode = node[prop][index];
            const tailwindDoc = buildTailwindAttributeDoc(attrNode, options);
            if (!tailwindDoc) {
              return doc;
            }
            const prefixDoc =
              Array.isArray(doc) &&
              doc.length > 0 &&
              typeof doc[0] === 'object' &&
              doc[0] !== null &&
              doc[0].type === 'line'
                ? doc[0]
                : null;
            return prefixDoc ? [prefixDoc, tailwindDoc] : tailwindDoc;
          });
        }
        return docs;
      };
      try {
        return basePrinter.print(path, options, print);
      } finally {
        path.map = originalMap;
      }
    },
  };
}

function hasAnyAttributes(node, attributeProps) {
  if (!node) return false;
  return attributeProps.some(prop => Array.isArray(node[prop]) && node[prop].length > 0);
}

function transformHtmlAttribute(attr, options) {
  if (!attr || typeof attr !== 'object') {
    return attr;
  }
  const attrName = readAttributeName(attr);
  if (attrName !== 'class') {
    return attr;
  }
  const rawValue = readAttributeValue(attr);
  if (!isPureLiteralClassValue(rawValue)) {
    return attr;
  }
  const groups = getTailwindClassGroups(rawValue, {
    tailwindGroupOrder: options.tailwindGroupOrder
  });
  if (!groups.length) {
    return attr;
  }
  writeAttributeValue(attr, groups.join(' '));
  return attr;
}

function readAttributeName(attr) {
  return attr?.name || attr?.rawName || attr?.key || null;
}

function readAttributeValue(attr) {
  if (typeof attr?.value === 'string') {
    return attr.value;
  }
  if (typeof attr?.value?.value === 'string') {
    return attr.value.value;
  }
  if (Array.isArray(attr?.value)) {
    const literalParts = [];
    for (const part of attr.value) {
      if (typeof part === 'string') {
        literalParts.push(part);
        continue;
      }
      if (part && typeof part === 'object') {
        // Svelte "Text" nodes expose .data (and .raw) while dynamic bindings have other types.
        if (typeof part.data === 'string' && (!part.type || part.type === 'Text')) {
          literalParts.push(part.data);
          continue;
        }
        if (typeof part.raw === 'string' && (!part.type || part.type === 'Text')) {
          literalParts.push(part.raw);
          continue;
        }
        if (process.env.DEBUG_TAILWIND === 'svelte-attr') {
          console.log('Non-text attribute part encountered:', part?.type || typeof part);
        }
        return null;
      }
      return null;
    }
    return literalParts.join('');
  }
  return null;
}

function writeAttributeValue(attr, value) {
  if (attr) {
    attr.value = value;
  }
}

function buildTailwindAttributeDoc(attr, options) {
  if (!isTailwindClassAttribute(attr)) {
    return null;
  }
  const classValue = readAttributeValue(attr);
  const groups = getTailwindClassGroups(classValue, {
    tailwindGroupOrder: options.tailwindGroupOrder
  });
  if (!groups.length) {
    return null;
  }
  const attrName = readAttributeName(attr) || 'class';
  if (options.tailwindMultiline === false) {
    return concat([attrName, '="', groups.join(' '), '"']);
  }
  const indentFragment = '  ';
  const groupedDoc = join(
    hardline,
    groups.map(group => concat([indentFragment, group]))
  );
  return concat([
    breakParent,
    attrName,
    '="',
    hardline,
    groupedDoc,
    hardline,
    '"',
  ]);
}

function isTailwindClassAttribute(attr) {
  if (readAttributeName(attr) !== 'class') {
    return false;
  }
  const value = readAttributeValue(attr);
  return isPureLiteralClassValue(value);
}

function isPureLiteralClassValue(value) {
  return typeof value === 'string' && value.length > 0 && !/[{}]/.test(value);
}
