import { createRequire } from 'module';
import { formatTailwindClasses, getTailwindClassGroups, isLiteralString } from './formatTailwindClasses.js';
import * as prettierHtml from 'prettier/plugins/html';
import * as prettierBabel from 'prettier/plugins/babel';
import * as prettierEstree from 'prettier/plugins/estree';
import { builders as docBuilders } from 'prettier/doc';
import { parseExpression } from '@babel/parser';
import babelGenerator from '@babel/generator';

const { concat, hardline, indent, join, breakParent } = docBuilders;
const generate = babelGenerator.default || babelGenerator;
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
        if (attributeProps.includes(prop) && Array.isArray(node?.[prop])) {
          node[prop].forEach(attrNode => {
            if (readAttributeName(attrNode) === 'class') {
              formatSvelteMixedClassAttribute(attrNode, options);
            }
          });
        }
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
  if (attrName === 'class') {
    const rawValue = readAttributeValue(attr);
    if (isPureLiteralClassValue(rawValue)) {
      const groups = getTailwindClassGroups(rawValue, {
        tailwindGroupOrder: options.tailwindGroupOrder
      });
      if (!groups.length) {
        return attr;
      }
      writeAttributeValue(attr, groups.join(' '));
      return attr;
    }
    formatSvelteMixedClassAttribute(attr, options);
    return attr;
  }
  if (isVueClassBindingAttributeName(attrName)) {
    formatVueClassBindingAttribute(attr, options);
  }
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

function formatSvelteMixedClassAttribute(attr, options) {
  if (!Array.isArray(attr?.value)) {
    return false;
  }
  const hasDynamicPart = attr.value.some(part => readSvelteTextPart(part) == null);
  if (!hasDynamicPart) {
    return false;
  }
  let changed = false;
  for (let index = 0; index < attr.value.length; index += 1) {
    const part = attr.value[index];
    const textValue = readSvelteTextPart(part);
    if (textValue == null) {
      continue;
    }
    const formatted = formatClassTextChunk(textValue, options);
    if (!formatted || formatted === textValue) {
      continue;
    }
    changed = true;
    if (typeof part === 'string') {
      attr.value[index] = formatted;
    } else if (part && typeof part === 'object') {
      if (typeof part.raw === 'string') {
        part.raw = formatted;
      }
      if (typeof part.data === 'string') {
        part.data = formatted;
      }
    }
  }
  return changed;
}

function readSvelteTextPart(part) {
  if (typeof part === 'string') {
    return part;
  }
  if (!part || typeof part !== 'object') {
    return null;
  }
  if (typeof part.data === 'string' && (!part.type || part.type === 'Text')) {
    return part.data;
  }
  if (typeof part.raw === 'string' && (!part.type || part.type === 'Text')) {
    return part.raw;
  }
  return null;
}

function formatClassTextChunk(text, options) {
  if (typeof text !== 'string') {
    return null;
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.replace(/\s+/g, ' ');
  const groups = getTailwindClassGroups(normalized, {
    tailwindGroupOrder: options.tailwindGroupOrder,
  });
  if (!groups.length) {
    return null;
  }
  const formatted = groups.join(' ');
  if (formatted === normalized) {
    return null;
  }
  const leading = text.match(/^\s*/)?.[0] ?? '';
  const trailing = text.match(/\s*$/)?.[0] ?? '';
  return `${leading}${formatted}${trailing}`;
}

function isVueClassBindingAttributeName(name) {
  if (!name) {
    return false;
  }
  return name === ':class' || name === 'v-bind:class';
}

function formatVueClassBindingAttribute(attr, options) {
  const rawValue = readAttributeValue(attr);
  if (typeof rawValue !== 'string') {
    return false;
  }
  const expressionSource = rawValue.trim();
  if (!expressionSource) {
    return false;
  }
  let ast;
  try {
    ast = parseExpression(expressionSource, {
      plugins: ['typescript', 'jsx', 'classProperties', 'optionalChaining'],
    });
  } catch {
    return false;
  }
  let changed = false;
  if (ast.type === 'ArrayExpression') {
    changed = formatVueArrayExpression(ast, options);
  } else if (ast.type === 'ObjectExpression') {
    changed = formatVueObjectExpression(ast, options);
  } else {
    return false;
  }
  if (!changed) {
    return false;
  }
  const generated = collapseExpressionWhitespace(generate(ast).code);
  writeAttributeValue(attr, generated);
  return true;
}

function formatVueArrayExpression(ast, options) {
  if (!Array.isArray(ast.elements) || !ast.elements.length) {
    return false;
  }
  const segments = [];
  let current = null;
  ast.elements.forEach((element, index) => {
    if (isSimpleStringLiteralNode(element)) {
      if (!current) {
        current = { start: index, nodes: [] };
      }
      current.nodes.push(element);
    } else if (current) {
      segments.push(current);
      current = null;
    }
  });
  if (current) {
    segments.push(current);
  }
  if (!segments.length) {
    return false;
  }
  const updates = [];
  segments.forEach(segment => {
    const allTokens = segment.nodes
      .map(node => splitClassTokens(getStringLiteralNodeValue(node)))
      .flat();
    if (!allTokens.length) {
      return;
    }
    const groups = getTailwindClassGroups(allTokens.join(' '), {
      tailwindGroupOrder: options.tailwindGroupOrder,
    });
    const orderedTokens = flattenTailwindGroups(groups);
    if (!orderedTokens.length || arraysEqual(orderedTokens, allTokens)) {
      return;
    }
    const replacements = orderedTokens.map(token => createStringLiteralNode(token));
    updates.push({
      start: segment.start,
      count: segment.nodes.length,
      replacements,
    });
  });
  if (!updates.length) {
    return false;
  }
  updates
    .sort((a, b) => b.start - a.start)
    .forEach(update => {
      ast.elements.splice(update.start, update.count, ...update.replacements);
    });
  return true;
}

function formatVueObjectExpression(ast, options) {
  if (!Array.isArray(ast.properties) || !ast.properties.length) {
    return false;
  }
  const segments = [];
  let current = null;
  ast.properties.forEach((property, index) => {
    if (isLiteralClassProperty(property)) {
      if (!current) {
        current = { start: index, items: [] };
      }
      current.items.push({
        prop: property,
        className: getPropertyClassName(property),
      });
    } else if (current) {
      segments.push(current);
      current = null;
    }
  });
  if (current) {
    segments.push(current);
  }
  if (!segments.length) {
    return false;
  }
  const updates = [];
  segments.forEach(segment => {
    const classNames = segment.items.map(item => item.className);
    if (!classNames.every(Boolean)) {
      return;
    }
    const groups = getTailwindClassGroups(classNames.join(' '), {
      tailwindGroupOrder: options.tailwindGroupOrder,
    });
    const ordered = flattenTailwindGroups(groups);
    if (!ordered.length || arraysEqual(ordered, classNames)) {
      return;
    }
    const buckets = new Map();
    segment.items.forEach(item => {
      if (!buckets.has(item.className)) {
        buckets.set(item.className, []);
      }
      buckets.get(item.className).push(item.prop);
    });
    const replacements = [];
    ordered.forEach(className => {
      const queue = buckets.get(className);
      if (queue && queue.length) {
        replacements.push(queue.shift());
      }
    });
    if (replacements.length === segment.items.length) {
      updates.push({
        start: segment.start,
        count: segment.items.length,
        replacements,
      });
    }
  });
  if (!updates.length) {
    return false;
  }
  updates
    .sort((a, b) => b.start - a.start)
    .forEach(update => {
      ast.properties.splice(update.start, update.count, ...update.replacements);
    });
  return true;
}

function isSimpleStringLiteralNode(node) {
  if (!node) {
    return false;
  }
  if (node.type === 'StringLiteral') {
    return true;
  }
  if (node.type === 'TemplateLiteral') {
    return node.expressions.length === 0;
  }
  return false;
}

function getStringLiteralNodeValue(node) {
  if (!node) {
    return '';
  }
  if (node.type === 'StringLiteral') {
    return node.value || '';
  }
  if (node.type === 'TemplateLiteral' && node.quasis.length === 1) {
    return node.quasis[0].value.cooked || '';
  }
  return '';
}

function createStringLiteralNode(value) {
  return {
    type: 'StringLiteral',
    value,
    extra: {
      rawValue: value,
      raw: JSON.stringify(value),
    },
  };
}

function isLiteralClassProperty(prop) {
  if (!prop || prop.type !== 'ObjectProperty' || prop.computed) {
    return false;
  }
  const key = prop.key;
  if (key.type === 'Identifier') {
    return true;
  }
  if (key.type === 'StringLiteral') {
    return true;
  }
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0) {
    return true;
  }
  return false;
}

function getPropertyClassName(prop) {
  const key = prop.key;
  if (key.type === 'Identifier') {
    return key.name;
  }
  if (key.type === 'StringLiteral') {
    return key.value;
  }
  if (key.type === 'TemplateLiteral' && key.quasis.length === 1) {
    return key.quasis[0].value.cooked || '';
  }
  return '';
}

function splitClassTokens(value) {
  if (!value) {
    return [];
  }
  return value
    .trim()
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean);
}

function flattenTailwindGroups(groups) {
  const tokens = [];
  groups.forEach(group => {
    tokens.push(...splitClassTokens(group));
  });
  return tokens;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function collapseExpressionWhitespace(code) {
  return code.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
}
