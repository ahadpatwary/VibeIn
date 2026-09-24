#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import readline from 'node:readline';

const ZERO_SHA = '0000000000000000000000000000000000000000';
const DEFAULT_BRANCHES = ['origin/main', 'origin/master', 'origin/develop'];

// Any change matching these invalidates the "affected" assumption for the
// whole repo — filter-based detection is skipped and we run everything.
const ROOT_INVALIDATING_PATTERNS = [
   /^package\.json$/,
   /^package-lock\.json$/,
   /^turbo\.json$/,
   /^tsconfig\.base\.json$/,
   /^tsconfig\.json$/,
   /^\.eslintrc.*$/,
   /^eslint\.config\.(js|cjs|mjs|ts)$/,
   /^\.prettierrc.*$/,
   /^prettier\.config\.(js|cjs|mjs)$/,
   /^\.husky\//,
];

function sh(cmd) {
   return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function run(cmd, args) {
   const result = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
   return result.status ?? 1;
}

async function readStdinLines() {
   const rl = readline.createInterface({ input: process.stdin, terminal: false });
   const lines = [];
   for await (const line of rl) {
      if (line.trim()) lines.push(line.trim());
   }
   return lines;
}

function resolveBaseSha(localSha, remoteSha) {
   if (remoteSha && remoteSha !== ZERO_SHA) return remoteSha;

   // New branch / new remote ref — try to find a sane merge-base.
   for (const candidate of DEFAULT_BRANCHES) {
      try {
         return sh(`git merge-base ${candidate} ${localSha}`);
      } catch {
         // candidate branch not available locally, try next
      }
   }
   // Nothing to compare against — validate everything, safest fallback.
   return null;
}

function getChangedFiles(base, head) {
   try {
      const out = sh(`git diff --name-only ${base}..${head}`);
      return out ? out.split('\n') : [];
   } catch {
      return null; // unknown diff -> caller must fall back to full validation
   }
}

function hasRootInvalidatingChange(files) {
   return files.some((f) => ROOT_INVALIDATING_PATTERNS.some((re) => re.test(f)));
}

async function main() {
   const lines = await readStdinLines();

   if (lines.length === 0) {
      console.log('No refs to validate.');
      return 0;
   }

   for (const line of lines) {
      const [localRef, localSha, , remoteSha] = line.split(' ');

      if (!localSha || localSha === ZERO_SHA) {
         // Branch deletion — nothing to validate.
         continue;
      }

      const base = resolveBaseSha(localSha, remoteSha);
      const changedFiles = base ? getChangedFiles(base, localSha) : null;

      let taskArgs;
      if (!base || changedFiles === null) {
         console.log(
            `\n[pre-push] ${localRef}: no reliable diff base found — running FULL validation.`,
         );
         taskArgs = ['run', 'lint', 'typecheck', 'test', 'build'];
      } else if (hasRootInvalidatingChange(changedFiles)) {
         console.log(
            `\n[pre-push] ${localRef}: root-level config changed — running FULL validation.`,
         );
         taskArgs = ['run', 'lint', 'typecheck', 'test', 'build'];
      } else if (changedFiles.length === 0) {
         console.log(`\n[pre-push] ${localRef}: no changes in range — skipping.`);
         continue;
      } else {
         console.log(
            `\n[pre-push] ${localRef}: validating affected projects for range ${base}...${localSha}`,
         );
         taskArgs = [
            'run',
            'lint',
            'typecheck',
            'test',
            'build',
            `--filter=...[${base}...${localSha}]`,
         ];
      }

      const code = run('npx', ['turbo', ...taskArgs, '--output-logs=new-only']);

      if (code !== 0) {
         console.error(`\n✗ Validation failed for ${localRef}. Push blocked.`);
         console.error(`  Reproduce locally: npx turbo ${taskArgs.join(' ')}`);
         process.exit(code);
      }
   }

   console.log('\n✓ All affected projects passed. Proceeding with push.');
   return 0;
}

main().catch((err) => {
   console.error('[pre-push] Unexpected error:', err);
   process.exit(1);
});
