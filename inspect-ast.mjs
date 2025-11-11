import { parse } from 'svelte/compiler';
import fs from 'node:fs';
const source = fs.readFileSync('test/test.svelte','utf8');
const ast = parse(source, { filename: 'test/test.svelte' });
function findAttr(node, name) {
  if (!node || !node.attributes) return null;
  return node.attributes.find(attr => attr.name === name);
}
const target = ast.html.children.find(node => node.name === 'div' && node.attributes?.some(attr => attr.name === 'class' && Array.isArray(attr.value) && attr.value.some(v => v.type === 'MustacheTag')));
console.log(JSON.stringify(findAttr(target, 'class'), null, 2));
