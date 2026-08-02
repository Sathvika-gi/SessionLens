const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)){
    fs.mkdirSync(iconsDir);
}

// 1x1 transparent PNG base64 data
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

// Write placeholders for 16, 48, 128 icons
fs.writeFileSync(path.join(iconsDir, 'icon16.png'), buffer);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), buffer);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), buffer);

console.log('Icons generated successfully in extension/icons/');
