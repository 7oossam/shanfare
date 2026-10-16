import fs from 'fs';
import path from 'path';

const files = [
  'icons.mjs',
  'engine.mjs',
  'combos.mjs',
  'report.mjs',
  'audio.mjs',
  'view.mjs',
  'app.mjs'
];

let bundleParts = [];

for (const file of files) {
  const filePath = path.join('dist', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip all imports
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, '');
  content = content.replace(/import\s+[^;]+;/g, '');

  // Strip 'export ' keywords
  content = content.replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ');

  if (file === 'view.mjs') {
    content += '\nconst btn = button;\n';
  }

  bundleParts.push(`// --- ${file} ---\n` + content);
}

const bundledCode = `(function() {
  'use strict';
  ${bundleParts.join('\n\n')}
})();`;

// Write to dist/app.bundle.js
fs.writeFileSync(path.join('dist', 'app.bundle.js'), bundledCode, 'utf8');
console.log('Successfully created dist/app.bundle.js (', bundledCode.length, 'bytes)');

// Also write to dist/nexus/app.bundle.js
if (fs.existsSync(path.join('dist', 'nexus'))) {
  fs.writeFileSync(path.join('dist', 'nexus', 'app.bundle.js'), bundledCode, 'utf8');
}
