const suites=[
 './tests/analyzer.test.mjs','./tests/routing.test.mjs','./tests/resources.test.mjs',
 './tests/referrals.test.mjs','./tests/migration.test.mjs','./tests/timeline.test.mjs',
 './tests/i18n.test.mjs','./tests/export-import.test.mjs','./tests/api.test.mjs',
 './tests/handoffs.test.mjs','./tests/v4-storage.test.mjs','./tests/v4-auth.test.mjs',
 './tests/v4-case-service.test.mjs','./tests/v4-messages.test.mjs','./tests/v4-availability-sla.test.mjs',
 './tests/v4-api.test.mjs','./tests/v4-migration.test.mjs','./tests/v4-ui-contract.test.mjs','./tests/v4-e2e.test.mjs'
];
for(const suite of suites) await import(suite);
console.log(`Whole Story V4: ${suites.length} suites passed.`);
