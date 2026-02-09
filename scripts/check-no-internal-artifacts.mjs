#!/usr/bin/env node
import { execSync } from 'node:child_process';

const blocked = ['docs/review/', 'docs/personas/', 'tasks/'];

function listChangedFiles() {
  const mode = process.argv[2] ?? 'staged';

  if (mode === 'staged') {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' });
  }

  if (mode === 'range') {
    const base = process.env.GITHUB_BASE_SHA || process.env.BASE_SHA;
    const head = process.env.GITHUB_SHA || process.env.HEAD_SHA || 'HEAD';

    if (!base) {
      throw new Error('Missing BASE_SHA/GITHUB_BASE_SHA for range mode');
    }

    return execSync(`git diff --name-only ${base}...${head}`, { encoding: 'utf8' });
  }

  throw new Error(`Unsupported mode: ${mode}`);
}

const changed = listChangedFiles()
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const offenders = changed.filter((p) => blocked.some((prefix) => p.startsWith(prefix)));

if (offenders.length > 0) {
  console.error('❌ Internal process artifacts are blocked:');
  offenders.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}

console.log('✅ Internal artifact guard passed.');
