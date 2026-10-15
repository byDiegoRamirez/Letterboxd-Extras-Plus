// Cross-platform replacement for build.bat
// Usage: node build.js chrome|firefox
//
// Assembles dist/<target>/ from:
//   common/          shared extension files
//   user.js/build/   the rollup-built letterboxd-extras.user.js
//   <target>/        the browser-specific manifest and files

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const target = process.argv[2];
if (target !== 'chrome' && target !== 'firefox') {
	console.error('Usage: node build.js chrome|firefox');
	process.exit(1);
}

const sourceDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(sourceDir, 'dist', target);
const userJsDir = join(sourceDir, 'user.js', 'build');

if (!existsSync(join(userJsDir, 'letterboxd-extras.user.js'))) {
	console.error(`Missing ${join(userJsDir, 'letterboxd-extras.user.js')} - run rollup first (npm run build-${target}).`);
	process.exit(1);
}

// Clean previous build
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const skipNodeModules = src => !src.split(/[\\/]/).includes('node_modules');
cpSync(join(sourceDir, 'common'), distDir, { recursive: true, filter: skipNodeModules });
cpSync(userJsDir, distDir, { recursive: true });
cpSync(join(sourceDir, target), distDir, { recursive: true });

console.log(`Build complete: ${distDir}`);
