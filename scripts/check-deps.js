#!/usr/bin/env node

/**
 * check-deps.js
 *
 * Scans each workspace using depcheck.
 *
 * IMPORTANT:
 * - Does NOT install dependencies.
 * - Does NOT uninstall dependencies.
 * - Does NOT modify package.json.
 * - Does NOT modify package-lock.json.
 *
 * It only reports:
 *   - unused dependencies
 *   - unused devDependencies
 *   - missing dependencies
 */

const fs = require('fs');
const path = require('path');
const depcheck = require('depcheck');

function log(...args) {
   console.log('[deps-check]', ...args);
}

const repoRoot = process.cwd();

const workspaceParents = [path.join(repoRoot, 'apps'), path.join(repoRoot, 'apps', 'services')];

function listWorkspaces() {
   const workspaces = [];

   for (const parent of workspaceParents) {
      if (!fs.existsSync(parent)) {
         continue;
      }

      const entries = fs.readdirSync(parent, {
         withFileTypes: true,
      });

      for (const entry of entries) {
         if (!entry.isDirectory()) {
            continue;
         }

         const workspacePath = path.join(parent, entry.name);
         const packageJsonPath = path.join(workspacePath, 'package.json');

         if (!fs.existsSync(packageJsonPath)) {
            continue;
         }

         workspaces.push({
            name: entry.name,
            path: workspacePath,
            packageJson: packageJsonPath,
         });
      }
   }

   return workspaces;
}

function runDepcheck(targetPath) {
   return new Promise((resolve, reject) => {
      depcheck(
         targetPath,
         {
            ignoreBinPackage: false,
         },
         (result) => {
            resolve(result);
         },
      );
   });
}

(async () => {
   const workspaces = listWorkspaces();

   if (!workspaces.length) {
      log('No workspaces found.');
      process.exit(0);
   }

   let hasProblems = false;

   for (const workspace of workspaces) {
      console.log('\n----------------------------------------');
      log(`Checking: ${workspace.name}`);
      console.log('----------------------------------------');

      try {
         const result = await runDepcheck(workspace.path);

         const unusedDependencies = result.dependencies ?? [];

         const unusedDevDependencies = result.devDependencies ?? [];

         const missingDependencies = result.missing ?? {};

         const hasUnused = unusedDependencies.length > 0 || unusedDevDependencies.length > 0;

         const hasMissing = Object.keys(missingDependencies).length > 0;

         if (!hasUnused && !hasMissing) {
            log('✓ Dependencies look clean.');
            continue;
         }

         hasProblems = true;

         if (unusedDependencies.length > 0) {
            console.log('\nUnused dependencies:');

            for (const dependency of unusedDependencies) {
               console.log(`  - ${dependency}`);
            }
         }

         if (unusedDevDependencies.length > 0) {
            console.log('\nUnused devDependencies:');

            for (const dependency of unusedDevDependencies) {
               console.log(`  - ${dependency}`);
            }
         }

         if (hasMissing) {
            console.log('\nMissing dependencies:');

            for (const dependency of Object.keys(missingDependencies)) {
               console.log(`  - ${dependency}`);
            }
         }
      } catch (error) {
         hasProblems = true;

         log(`Failed to check ${workspace.name}:`, error?.message ?? error);
      }
   }

   console.log('\n========================================');

   if (hasProblems) {
      log('Dependency issues detected.');
      log('No files were modified.');
      process.exit(1);
   }

   log('All workspaces passed dependency check.');
   process.exit(0);
})();
