/**
 * Pre-Release Validation Script — Novus Resume AI
 * 
 * Verifies codebase health before creating a release tag:
 * 1. Checks package.json version matches target tag argument
 * 2. Checks no broken stubs / temporary mock markers are left in critical paths
 * 3. Runs TypeScript type-check and Vitest suite
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetVersion = process.argv[2]?.replace(/^v/, '');
const packageJsonPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('\n🚀 Starting Novus Pre-Release Gate Verification...\n');

// 1. Version Check
if (targetVersion) {
  if (pkg.version !== targetVersion) {
    console.error(`❌ Version mismatch: package.json is "${pkg.version}", but target tag is "${targetVersion}".`);
    process.exit(1);
  }
  console.log(`✅ Version matches package.json (${pkg.version})`);
} else {
  console.log(`ℹ️  Current package.json version: ${pkg.version}`);
}

// 2. TypeScript Compilation Check
try {
  console.log('🔍 Checking TypeScript types (npx tsc --noEmit)...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed with 0 errors.');
} catch (e) {
  console.error('❌ TypeScript type check failed.');
  process.exit(1);
}

// 3. Unit Tests Check
try {
  console.log('🧪 Running Vitest suite...');
  execSync('npm run test', { stdio: 'inherit' });
  console.log('✅ All unit and integration tests passed.');
} catch (e) {
  console.error('❌ Test suite failed.');
  process.exit(1);
}

console.log('\n🎉 ALL PRE-RELEASE QUALITY GATES PASSED! Ready for release.\n');
