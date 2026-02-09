#!/usr/bin/env node
import { execSync } from 'node:child_process';

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
  console.log('✅ Git hooks path set to .githooks');
} catch {
  console.log('ℹ️ Skipped git hooks setup (not a git worktree).');
}
