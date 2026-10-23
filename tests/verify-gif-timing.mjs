#!/usr/bin/env node
/** 核对实际内嵌 GIF 的时间、循环及压缩画面，避免加速时重编码或缩短开场。 */
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const original = readFileSync(new URL('../assets/source/nerv-boot-original.gif', import.meta.url));
const embedded = readFileSync(new URL('../assets/animations/nerv-boot.gif', import.meta.url));
function inspect(bytes) {
 let at = 13 + (bytes[10] & 128 ? 3 * 2 ** ((bytes[10] & 7) + 1) : 0), duration = 0, delay = 0, loop = null;
 const images = [], controls = [], header = bytes.subarray(0, at);
 const blocks = () => { for (;;) { const size = bytes[at++]; if (!size) return; at += size; assert(at <= bytes.length); } };
 while (at < bytes.length) {
  const begin = at, type = bytes[at++];
  if (type === 0x3b) break;
  if (type === 0x21) {
   const label = bytes[at++];
   if (label === 0xf9) { delay = bytes.readUInt16LE(at + 2) * 10; controls.push([bytes[at + 1], bytes[at + 4]]); }
   if (label === 0xff && bytes.subarray(at + 1, at + 12).toString() === 'NETSCAPE2.0') loop = bytes.readUInt16LE(at + 14);
   blocks();
  } else {
   assert.equal(type, 0x2c);
   const packed = bytes[at + 8]; at += 9;
   if (packed & 128) at += 3 * 2 ** ((packed & 7) + 1);
   at++; blocks(); images.push(bytes.subarray(begin, at)); duration += delay; delay = 0;
  }
 }
 return { images, controls, header, duration, loop };
}
const slow = inspect(original), fast = inspect(embedded);
assert.equal(fast.images.length, 48);
assert.equal(slow.duration, 3840);
assert.equal(fast.duration, 1920);
assert.equal(fast.loop, 0, '两倍速素材必须允许连续循环');
assert.deepEqual(fast.header, slow.header, '尺寸和全局调色板保持不变');
assert.deepEqual(fast.controls, slow.controls, '透明色和帧处置方式保持不变');
assert.deepEqual(fast.images, slow.images, '全部帧描述、调色板和压缩像素保持原字节');
assert.match(source, /durationMs: 3840, cycleDurationMs: 1920, playbackRate: 2/);
assert.match(source, /setTimeout\(emergencyScreen, BRAND_ASSETS\.durationMs\)/);
console.log('✓ GIF 48 帧无损保留，2 倍速单轮 1.92 秒，循环开场仍为 3.84 秒');
