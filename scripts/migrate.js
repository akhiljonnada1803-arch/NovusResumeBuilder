#!/usr/bin/env node
/**
 * Novus Resume AI — Database Migration Runner
 *
 * This script reads all migration files and prints them in order
 * with copy-paste instructions for the Supabase SQL editor.
 *
 * Usage:
 *   node scripts/migrate.js            → Print all pending migrations
 *   node scripts/migrate.js --check    → Check which migrations are pending
 *
 * For automated CI, use the Supabase CLI:
 *   supabase db push --db-url $DATABASE_URL
 */

const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.join(__dirname, "..", "supabase", "migrations");

const MIGRATION_ORDER = [
  "20260830000000_phase_a_schema.sql",
  "20260901000000_portfolio_import.sql",
  "20260902000000_sync_architecture.sql",
  "20260903000000_career_analytics.sql",
  "20261001000000_interview_sessions.sql",
  "20261002000000_interview_scorecards.sql",
];

const INSTRUCTIONS = `
╔══════════════════════════════════════════════════════════════════╗
║          NOVUS RESUME AI — DATABASE MIGRATION GUIDE             ║
╚══════════════════════════════════════════════════════════════════╝

To apply these migrations:

  OPTION A (Supabase Dashboard — Recommended for first-time setup)
  ─────────────────────────────────────────────────────────────────
  1. Go to https://supabase.com/dashboard
  2. Open your project → SQL Editor
  3. Run each migration file below IN ORDER (copy/paste each block)

  OPTION B (Supabase CLI — Recommended for CI/CD)
  ─────────────────────────────────────────────────────────────────
  supabase link --project-ref YOUR_PROJECT_REF
  supabase db push

  OPTION C (Direct psql)
  ─────────────────────────────────────────────────────────────────
  psql $DATABASE_URL < supabase/migrations/<filename>.sql

`;

function run() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");

  console.log(INSTRUCTIONS);

  let allFound = true;

  MIGRATION_ORDER.forEach((filename, index) => {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const exists = fs.existsSync(filepath);

    if (!exists) {
      console.error(`  ❌ Missing: ${filename}`);
      allFound = false;
      return;
    }

    if (checkOnly) {
      console.log(`  ✅ Found [${index + 1}/${MIGRATION_ORDER.length}]: ${filename}`);
      return;
    }

    const sql = fs.readFileSync(filepath, "utf-8");
    const divider = "─".repeat(70);

    console.log(`\n${divider}`);
    console.log(`  [${index + 1}/${MIGRATION_ORDER.length}] ${filename}`);
    console.log(divider);
    console.log(sql);
  });

  if (checkOnly) {
    if (allFound) {
      console.log(`\n  ✅ All ${MIGRATION_ORDER.length} migration files are present.\n`);
    } else {
      console.log("\n  ❌ Some migration files are missing. Check the supabase/migrations directory.\n");
      process.exit(1);
    }
  } else {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`  ✅ ${MIGRATION_ORDER.length} migration(s) listed above. Apply them in order.`);
    console.log(`${"─".repeat(70)}\n`);
  }
}

run();
