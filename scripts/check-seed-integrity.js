#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SEEDS_DIR = path.join(ROOT, 'data', 'seeds');

function normalize(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function unescapeSql(value) {
  return value.replace(/''/g, "'");
}

function main() {
  if (!fs.existsSync(SEEDS_DIR)) {
    console.error(`Seed directory not found: ${SEEDS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const rowsByNameCity = new Map();

  const rowRegex = /^\('((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',/;

  for (const file of files) {
    const fullPath = path.join(SEEDS_DIR, file);
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');

    lines.forEach((line, index) => {
      const match = line.match(rowRegex);
      if (!match) return;

      const name = unescapeSql(match[1]);
      const city = unescapeSql(match[5]);
      const key = `${normalize(name)}::${normalize(city)}`;

      const arr = rowsByNameCity.get(key) || [];
      arr.push({ file, line: index + 1, name, city });
      rowsByNameCity.set(key, arr);
    });
  }

  const duplicates = [...rowsByNameCity.entries()].filter(([, rows]) => rows.length > 1);

  if (duplicates.length > 0) {
    console.error('Seed integrity check failed: duplicate (name, city) entries found.');
    for (const [, rows] of duplicates) {
      const exemplar = rows[0];
      console.error(`\n- ${exemplar.name} | ${exemplar.city}`);
      rows.forEach((row) => {
        console.error(`  - ${row.file}:${row.line}`);
      });
    }
    process.exit(1);
  }

  console.log(`Seed integrity check passed for ${files.length} files.`);
}

main();
