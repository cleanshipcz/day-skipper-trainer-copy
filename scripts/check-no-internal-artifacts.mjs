#!/usr/bin/env node
import { execSync } from 'node:child_process';

const blocked = [
  'docs/review/',
  'docs/personas/',
  'tasks/',
];

const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const offenders = staged.filter((p) => blocked.some((b) => p.startsWith(b)));

if (offenders.length) {
  console.error('❌ Internal process artifacts are blocked from commits:');
  for (const f of offenders) console.error(` - ${f}`);
  console.error('\nMove these files outside the repo workspace or unstage them.');
  process.exit(1);
}

console.log('✅ No blocked internal artifacts in staged changes.');
