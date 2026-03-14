#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

const { sequelize } = require('../models');

const ROOT = process.cwd();
const SEEDS_DIR = path.join(ROOT, 'data', 'seeds');

const UNSUPPORTED_PATTERNS = [
  /\bentry_tags\b/i,
  /\bhours\b/i,
  /\blanguages\b/i,
  /\baccepts_insurance\b/i,
  /\bhouse_calls\b/i,
  /\breferral_sources\b/i,
];

const COMPAT_REPLACEMENTS = [
  [/\bcreated_at\b/g, '"createdAt"'],
  [/\bupdated_at\b/g, '"updatedAt"'],
  [/\bspeaks_english\b/g, '"speaksEnglish"'],
  [/\benglish_level\b/g, '"englishLevel"'],
  [/\binsurance_accepted\b/g, '"insuranceAccepted"'],
  [/\bis_featured\b/g, '"isFeatured"'],
  [/\bis_verified\b/g, '"isVerified"'],
  [/\bis_claimed\b/g, '"isClaimed"'],
];

function normalizeSql(sql) {
  let normalized = sql;
  // Several legacy files escape apostrophes with backslashes (MySQL style).
  // PostgreSQL expects doubled apostrophes in string literals.
  normalized = normalized.replace(/\\'/g, "''");
  for (const [pattern, replacement] of COMPAT_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  normalized = expandSeedCteScope(normalized);
  return normalized;
}

function stripSqlLiteralsAndComments(sql) {
  // Remove block comments.
  let stripped = sql.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Remove line comments.
  stripped = stripped.replace(/--.*$/gm, ' ');
  // Remove single-quoted string literals.
  stripped = stripped.replace(/'(?:''|\\'|[^'])*'/g, "''");
  return stripped;
}

function isUnsupported(sql) {
  const sqlWithoutLiterals = stripSqlLiteralsAndComments(sql);
  return UNSUPPORTED_PATTERNS.some((pattern) => pattern.test(sqlWithoutLiterals));
}

function expandSeedCteScope(sql) {
  // Some seed files declare one CTE and then use it in two statements:
  // WITH seed (...) UPDATE ...; INSERT ... FROM seed;
  // The CTE only scopes to the first statement in PostgreSQL.
  const ctePrefixMatch = sql.match(/^(WITH\s+seed[\s\S]*?\)\s*)UPDATE\s+directory_entries/i);
  if (!ctePrefixMatch) {
    return sql;
  }

  const ctePrefix = ctePrefixMatch[1];
  const splitMatch = sql.match(/^(WITH\s+seed[\s\S]*?;\s*)(INSERT[\s\S]*FROM\s+seed[\s\S]*;)\s*$/i);
  if (!splitMatch) {
    return sql;
  }

  const firstStatement = splitMatch[1].trim();
  const secondStatement = splitMatch[2].trim();
  return `${firstStatement}\n\n${ctePrefix}${secondStatement}`;
}

function splitWithSeedStatements(sql) {
  const updateStart = sql.search(/\bUPDATE\s+directory_entries\b/i);
  if (updateStart === -1) {
    return null;
  }

  const insertStart = sql.search(/\bINSERT\s+INTO\s+directory_entries\b/i);
  if (insertStart === -1 || insertStart <= updateStart) {
    return null;
  }

  const cte = sql.slice(0, updateStart).trim();
  if (!/\bWITH\s+seed\b/i.test(cte)) {
    return null;
  }

  const updateStatement = `${sql.slice(updateStart, insertStart).trim().replace(/;+\s*$/, '')};`;
  const insertStatement = sql.slice(insertStart).trim();

  return [`${cte}\n${updateStatement}`, `${cte}\n${insertStatement}`];
}

async function main() {
  if (!fs.existsSync(SEEDS_DIR)) {
    throw new Error(`Seed directory not found: ${SEEDS_DIR}`);
  }

  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const summary = {
    total: files.length,
    applied: 0,
    skipped: 0,
    failed: 0,
  };

  const skipped = [];
  const failed = [];

  for (const file of files) {
    const fullPath = path.join(SEEDS_DIR, file);
    const rawSql = fs.readFileSync(fullPath, 'utf8');

    if (isUnsupported(rawSql)) {
      summary.skipped += 1;
      skipped.push({ file, reason: 'references legacy columns/tables not in current schema' });
      continue;
    }

    const sql = normalizeSql(rawSql);

    try {
      await sequelize.transaction(async (transaction) => {
        const splitStatements = splitWithSeedStatements(sql);
        if (splitStatements) {
          for (const statement of splitStatements) {
            await sequelize.query(statement, { transaction, raw: true });
          }
          return;
        }
        await sequelize.query(sql, { transaction, raw: true });
      });
      summary.applied += 1;
    } catch (error) {
      summary.failed += 1;
      failed.push({ file, error: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(`\nSQL seed summary: ${summary.applied}/${summary.total} applied, ${summary.skipped} skipped, ${summary.failed} failed.`);

  if (skipped.length > 0) {
    console.log('\nSkipped files:');
    for (const item of skipped) {
      console.log(`- ${item.file}: ${item.reason}`);
    }
  }

  if (failed.length > 0) {
    console.log('\nFailed files:');
    for (const item of failed) {
      console.log(`- ${item.file}: ${item.error}`);
    }
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('❌ SQL seed runner failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
