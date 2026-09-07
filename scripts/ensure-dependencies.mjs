import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const marker = path.join(root, 'node_modules', '.site-dependencies');

export function dependencyFingerprint(manifest, lockfile, runtime = process.version) {
  const pkg = JSON.parse(manifest);
  return createHash('sha256').update(JSON.stringify({
    dependencies: pkg.dependencies, devDependencies: pkg.devDependencies,
    optionalDependencies: pkg.optionalDependencies, engines: pkg.engines,
    runtime, platform: process.platform, architecture: process.arch,
  })).update(lockfile).digest('hex');
}

async function ensureDependencies() {
  const [manifest, lockfile] = await Promise.all([
    readFile(path.join(root, 'package.json'), 'utf8'), readFile(path.join(root, 'package-lock.json'), 'utf8'),
  ]);
  const fingerprint = dependencyFingerprint(manifest, lockfile);
  if (process.argv.includes('--record')) {
    await mkdir(path.dirname(marker), { recursive: true });
    await writeFile(marker, fingerprint);
    return;
  }
  const installed = await readFile(marker, 'utf8').catch(() => '');
  if (installed === fingerprint) return;
  console.log('Installing the locked project dependencies for this checkout…');
  // Use the npm already supplied by devenv; this script has no npm dependencies.
  const result = spawnSync('npm', ['ci'], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  await writeFile(marker, fingerprint);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await ensureDependencies();
}
