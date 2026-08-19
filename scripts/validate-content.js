#!/usr/bin/env node
/**
 * Validates every encounter in content/ against SPEC-encounter.md §4
 * (authoring rules). Run via `npm run validate:content`.
 *
 * Checks:
 *   - test damage sums to exactly monster.hp
 *   - every encounter has a catch-all failureMap rule (empty match {})
 *   - every hint skeleton contains a blank (`___` or `# your code here`)
 *   - every encounter has 3–8 tests
 */
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const BLANK_PATTERNS = [/___/, /#\s*your code here/i];

function hasBlank(skeleton) {
  return BLANK_PATTERNS.some((re) => re.test(skeleton));
}

function isCatchAll(rule) {
  return rule && rule.match && Object.keys(rule.match).length === 0;
}

function validateEncounter(file, encounter) {
  const errors = [];
  const id = encounter.id ?? `(missing id in ${file})`;

  const tests = Array.isArray(encounter.tests) ? encounter.tests : [];
  const hp = encounter.monster?.hp;

  // Damage must sum to exactly monster.hp.
  const totalDamage = tests.reduce((sum, t) => sum + (Number(t.damage) || 0), 0);
  if (typeof hp !== 'number') {
    errors.push(`monster.hp is missing or not a number`);
  } else if (totalDamage !== hp) {
    errors.push(`test damage sums to ${totalDamage}, but monster.hp is ${hp}`);
  }

  // 3–8 tests.
  if (tests.length < 3 || tests.length > 8) {
    errors.push(`has ${tests.length} tests — must be between 3 and 8`);
  }

  // Catch-all failureMap rule.
  const failureMap = Array.isArray(encounter.failureMap) ? encounter.failureMap : [];
  if (!failureMap.some(isCatchAll)) {
    errors.push(`failureMap has no catch-all rule (a rule with an empty "match": {})`);
  }

  // Hint skeletons must contain blanks.
  const hintCards = Array.isArray(encounter.hintCards) ? encounter.hintCards : [];
  for (const card of hintCards) {
    if (typeof card.skeleton === 'string' && !hasBlank(card.skeleton)) {
      errors.push(`hintCard "${card.id}" has a skeleton with no blanks (use "___" or "# your code here")`);
    }
  }

  return { id, file, errors };
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`No content directory found at ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error(`No .json encounters found in ${CONTENT_DIR}`);
    process.exit(1);
  }

  let failed = 0;
  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    let encounter;
    try {
      encounter = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (err) {
      console.error(`✗ ${file}: invalid JSON — ${err.message}`);
      failed++;
      continue;
    }

    const { id, errors } = validateEncounter(file, encounter);
    if (errors.length === 0) {
      console.log(`✓ ${id} (${file})`);
    } else {
      failed++;
      console.error(`✗ ${id} (${file})`);
      for (const e of errors) console.error(`    - ${e}`);
    }
  }

  console.log('');
  if (failed > 0) {
    console.error(`validate:content failed — ${failed} of ${files.length} encounter(s) have errors.`);
    process.exit(1);
  }
  console.log(`validate:content passed — ${files.length} encounter(s) OK.`);
}

main();
