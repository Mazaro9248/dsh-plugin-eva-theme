#!/usr/bin/env node
/** Check local Markdown targets after moves; historical prose is allowed. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const walk = dir => readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : entry.name.endsWith('.md') ? [join(dir, entry.name)] : []);
const files = [...readdirSync(root).filter(name => name.endsWith('.md')).map(name => join(root, name)), ...walk(join(root, 'docs'))];
let links = 0; const failures = [];
for (const file of files) {
 const source = readFileSync(file, 'utf8').replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '');
 for (const match of source.matchAll(/\]\(([^\n]+?)\)/g)) {
  const target = match[1].trim().replace(/^<(.+)>$/, '$1').split(/\s+["']/)[0];
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(target)) continue;
  links++;
  const path = resolve(dirname(file), decodeURIComponent(target.split(/[?#]/)[0]));
  if (!path.startsWith(root) || !existsSync(path)) failures.push(`${file.slice(root.length)} → ${target}`);
 }
 if (/\/Users\/xupengcheng\//.test(source)) failures.push(`${file.slice(root.length)} 包含维护者个人绝对路径`);
}
if (failures.length) throw new Error('文档检查失败：\n' + failures.join('\n'));
console.log(`✓ ${files.length} 份 Markdown、${links} 个本地链接通过检查`);
