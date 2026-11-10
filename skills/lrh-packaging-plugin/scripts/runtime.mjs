#!/usr/bin/env node
// Copyright (c) 2026 HRJ-lrh. MIT. Upstream Agent Motion has its own license.
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync, renameSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

export const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const lock = JSON.parse(readFileSync(path.join(skillRoot, 'runtime.lock.json'), 'utf8'));
export function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true,
    stdio: capture ? 'pipe' : 'inherit', timeout: 30 * 60 * 1000 });
  if (result.error || result.status !== 0) throw new Error(`${path.basename(command)} failed: ${result.error?.message || result.stderr || result.status}`);
  return result.stdout;
}
export function verifyArchive(bytes) {
  if (bytes.length !== lock.bytes || createHash('sha256').update(bytes).digest('hex') !== lock.sha256)
    throw new Error('Runtime archive checksum/size mismatch. Nothing will be extracted or executed.');
}
export function inspectEngine(engine) {
  const required = ['AGENTS.md', 'LICENSE', 'package.json', 'package-lock.json', 'serve.mjs',
    'scripts/bootstrap.mjs', 'scripts/doctor.mjs', 'scripts/browser.mjs', 'scripts/media-tools.mjs',
    '.agents/skills/motion-craft/SKILL.md', '.agents/skills/srt-reference-to-three/SKILL.md'];
  const missing = required.filter(p => !existsSync(path.join(engine, p)));
  if (missing.length) throw new Error(`Incomplete Agent Motion directory: ${missing.join(', ')}`);
  const pkg = JSON.parse(readFileSync(path.join(engine, 'package.json'), 'utf8'));
  if (pkg.name !== 'agent-motion') throw new Error('Selected directory is not an Agent Motion project.');
  const receiptPath = path.join(engine, 'LRH-SOURCE.json');
  const receipt = existsSync(receiptPath) ? JSON.parse(readFileSync(receiptPath, 'utf8')) : null;
  return { engine, package: pkg.name, pinnedSource: receipt?.commit === lock.commit,
    claimedCommit: receipt?.commit || null, note: 'Presence/provenance only; run doctor and the demo to test execution. Local edits are not certified by this receipt.' };
}
async function fetchEngine(engine, archive) {
  if (existsSync(engine)) throw new Error('Destination already exists. Reuse it with check/setup, or choose a new directory. No files were overwritten.');
  mkdirSync(path.dirname(engine), { recursive: true });
  const staging = mkdtempSync(path.join(path.dirname(engine), '.lrh-fetch-'));
  try {
    const bundled = path.join(skillRoot, 'assets', lock.archive);
    const local = archive || (existsSync(bundled) ? bundled : null);
    let bytes;
    if (local) bytes = readFileSync(local);
    else {
      console.log(`Downloading pinned Agent Motion source: ${lock.url}`);
      const response = await fetch(lock.url, { signal: AbortSignal.timeout(10 * 60 * 1000) });
      if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}. Use the full release ZIP or --archive with the matching release asset.`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
    verifyArchive(bytes);
    const packed = path.join(staging, 'runtime.tar.gz');
    writeFileSync(packed, bytes);
    const listing = run('tar', ['-tzf', packed], undefined, true).trim().split(/\r?\n/);
    if (listing.some(p => !p.startsWith('agent-motion/') || p.includes('\\') || p.split('/').includes('..')))
      throw new Error('Unexpected archive paths.');
    run('tar', ['-xzf', packed, '-C', staging]);
    const unpacked = path.join(staging, 'agent-motion');
    inspectEngine(unpacked);
    const receipt = JSON.parse(readFileSync(path.join(unpacked, 'LRH-SOURCE.json'), 'utf8'));
    if (receipt.commit !== lock.commit) throw new Error('Unexpected source revision.');
    for (const file of receipt.files) {
      const data = readFileSync(path.join(unpacked, file.path));
      if (data.length !== file.bytes || createHash('sha256').update(data).digest('hex') !== file.sha256)
        throw new Error(`Source verification failed: ${file.path}`);
    }
    renameSync(unpacked, engine);
    console.log(JSON.stringify(inspectEngine(engine), null, 2));
    console.log('Source is ready. Read LICENSE and docs/getting-started.md before setup. Dependencies are not yet installed.');
  } finally { rmSync(staging, { recursive: true, force: true }); }
}
export async function main(args = process.argv.slice(2)) {
  if (!args.length || args.includes('--help')) {
    console.log('Usage: node scripts/runtime.mjs fetch|check|setup --engine PATH [--archive FILE]\nfetch: verifies and extracts pinned source (no execution).\ncheck: validates project files and runs upstream doctor.\nsetup: runs upstream bootstrap (downloads dependencies, browser, Python and matting model).\nRequires Node 22+; fetch also requires system tar. Existing directories are never replaced.\nAgent Motion is separately licensed for noncommercial use; commercial use requires upstream authorization.');
    return;
  }
  if (Number(process.versions.node.split('.')[0]) < lock.nodeMajorMinimum) throw new Error('Node.js 22+ is required.');
  const command = args[0];
  if (!['fetch', 'check', 'setup'].includes(command)) throw new Error('Unknown command. Use --help.');
  const options = {};
  for (let i = 1; i < args.length; i += 2) {
    if (!['--engine', '--archive'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Invalid arguments. Use --help.');
    if (options[args[i]]) throw new Error('Duplicate option.');
    options[args[i]] = args[i + 1];
  }
  if (!options['--engine']) throw new Error('Specify --engine PATH; no private/local path is assumed.');
  if (command !== 'fetch' && options['--archive']) throw new Error('--archive only applies to fetch.');
  const engine = path.resolve(options['--engine']);
  if (command === 'fetch') return fetchEngine(engine, options['--archive']);
  console.log(JSON.stringify(inspectEngine(engine), null, 2));
  run(process.execPath, [path.join(engine, 'scripts', command === 'setup' ? 'bootstrap.mjs' : 'doctor.mjs'),
    ...(command === 'check' ? ['--matting'] : [])], engine);
}
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)))
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
