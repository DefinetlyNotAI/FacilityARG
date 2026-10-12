const fs = require('fs');
const path = require('path');

// === CONFIG ===
const inputPath = './If facility was a map.png';  // Replace with your image path

// === READ FILE ===
const buffer = fs.readFileSync(inputPath);

// === CONVERT TO BASE64 ===
const base64 = buffer.toString('base64');

// === CONVERT BASE64 TO HEX ===
// Step 1: decode base64 to raw binary
const base64Buffer = Buffer.from(base64, 'base64');

// Step 2: convert binary to hex
const hex = base64Buffer.toString('hex');

// === OPTIONAL: WRITE TO FILE ===
fs.writeFileSync('If facility was a map_base64.txt', base64);
fs.writeFileSync('If facility was a map_hex.txt', hex);
