const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const walk = directory => fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
const html = read('index.html');
assert.equal(html, read('midnight_delivery.html'), 'HTML entry points must be byte-for-byte synchronized');
const scripts = walk('scripts').filter(filename => filename.endsWith('.js'));
for (const filename of scripts) {
  new vm.Script(read(filename), { filename });
  execFileSync(process.execPath, ['--check', path.join(root, filename)], { stdio: 'pipe' });
}
const loaded = [];
for (const entry of ['index.html', 'midnight_delivery.html']) {
  for (const [block, attributes, body] of read(entry).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const source = attributes.match(/\bsrc=["']([^"']+)["']/);
    if (source) {
      assert.ok(!/^https?:/.test(source[1]), 'Boot scripts must be local');
      const filename = source[1].split('?')[0];
      assert.ok(fs.existsSync(path.join(root, filename)), `Missing script ${filename}`);
      if (entry === 'index.html') loaded.push(read(filename));
    } else new vm.Script(body, { filename: `${entry}:inline` });
  }
}
new vm.Script(loaded.join('\n'), { filename: 'combined-global-scripts' });
const firstParty = scripts.filter(filename => !filename.includes('/vendor/'));
const forbidden = /\b(?:gacha|bet|casino|gambling|PS5|Ichiraku|Doge|Kung[ -]?Fu[ -]?Panda)\b/i;
for (const filename of ['index.html', 'midnight_delivery.html', ...firstParty, ...walk('styles')]) {
  assert.ok(!forbidden.test(read(filename)), `Forbidden competition string in ${filename}: ${read(filename).match(forbidden)?.[0]}`);
}
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
const allMarkup = html + firstParty.map(read).join('\n');
const generatedIds = [...allMarkup.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
const knownIds = new Set(generatedIds);
let audited = 0;
let dynamic = 0;
for (const filename of firstParty) {
  const source = read(filename);
  for (const match of source.matchAll(/getElementById\(\s*(['"])([^'"\n]+)\1\s*\)/g)) {
    assert.ok(knownIds.has(match[2]), `${filename}: missing DOM ID ${match[2]}`);
    audited++;
  }
  dynamic += [...source.matchAll(/getElementById\(/g)].length - [...source.matchAll(/getElementById\(\s*(['"])([^'"\n]+)\1\s*\)/g)].length;
}
console.log(`PASS static verification: ${scripts.length} scripts, synchronized entries, competition strings, ${audited} literal DOM references (${dynamic} dynamic references checked during browser exercise)`);
require('./database.js').verify(root);
if (!process.argv.includes('--static')) require('./smoke.js').run(root).catch(error => { console.error(error); process.exitCode = 1; });
