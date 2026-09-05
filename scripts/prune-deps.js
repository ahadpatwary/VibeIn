#!/usr/bin/env node
/*
  prune-deps.js
  - Scans each workspace (apps/* and apps/services/*) using depcheck
  - For each workspace: uninstalls unused dependencies and installs missing dependencies (at latest)
  IMPORTANT: This script modifies package installations using npm workspaces. Run from repo root after: npm install
  It does NOT edit .ts files.
*/

const fs = require('fs');
const path = require('path');
const depcheck = require('depcheck');
const { execSync } = require('child_process');

function log(...args) { console.log('[prune-deps]', ...args); }

const repoRoot = process.cwd();
const workspaceGlobs = [
  path.join(repoRoot, 'apps', '*'),
  path.join(repoRoot, 'apps', 'services', '*')
];

function listWorkspaces() {
  const items = [];
  workspaceGlobs.forEach(g => {
    const parent = path.dirname(g);
    if (!fs.existsSync(parent)) return;
    const children = fs.readdirSync(parent, { withFileTypes: true });
    children.forEach(dirent => {
      if (!dirent.isDirectory()) return;
      const pkgPath = path.join(parent, dirent.name);
      const pkgJson = path.join(pkgPath, 'package.json');
      if (fs.existsSync(pkgJson)) items.push({ name: dirent.name, path: pkgPath, pkgJson });
    });
  });
  return items;
}

async function runDepcheck(targetPath) {
  return new Promise((resolve, reject) => {
    depcheck(targetPath, { ignoreBinPackage: false }, (unused) => {
      resolve(unused);
    });
  });
}

(async () => {
  const workspaces = listWorkspaces();
  if (!workspaces.length) {
    log('No workspaces found under apps/ or apps/services/.');
    process.exit(0);
  }

  let anyChanges = false;
  for (const ws of workspaces) {
    log('Scanning workspace:', ws.name, ws.path);
    try {
      const result = await runDepcheck(ws.path);
      const unusedDeps = result.dependencies || [];
      const unusedDev = result.devDependencies || [];
      const missing = result.missing || {};

      if (!Object.keys(result).length) {
        // depcheck returns object with keys; keep going
      }

      if (unusedDeps.length || unusedDev.length) {
        log(` Found unused deps in ${ws.name}:`, [...unusedDeps, ...unusedDev]);
        const toUninstall = [...unusedDeps, ...unusedDev];
        try {
          // Uninstall via npm workspace flag
          const rel = path.relative(repoRoot, ws.path).replace(/\\\\/g, '/');
          const cmd = `npm uninstall --workspace=${rel} ${toUninstall.join(' ')}`;
          log(' Running:', cmd);
          execSync(cmd, { stdio: 'inherit' });
          anyChanges = true;
        } catch (err) {
          log(' Error uninstalling for', ws.name, err.message);
        }
      } else {
        log(' No unused deps found in', ws.name);
      }

      const missingDeps = Object.keys(missing || {});
      if (missingDeps.length) {
        log(` Missing deps in ${ws.name}:`, missingDeps);
        try {
          // Install latest versions into the workspace (as dependencies)
          const rel = path.relative(repoRoot, ws.path).replace(/\\\\/g, '/');
          const cmd = `npm install --workspace=${rel} ${missingDeps.join(' ')} --save`;
          log(' Running:', cmd);
          execSync(cmd, { stdio: 'inherit' });
          anyChanges = true;
        } catch (err) {
          log(' Error installing missing deps for', ws.name, err.message);
        }
      } else {
        log(' No missing deps detected in', ws.name);
      }

    } catch (err) {
      log(' depcheck failed for', ws.name, err && err.message ? err.message : err);
    }
  }

  if (!anyChanges) {
    log('No changes applied. Workspaces already in sync.');
  } else {
    log('Finished applying changes. Run npm install at repo root if needed.');
  }
})();
