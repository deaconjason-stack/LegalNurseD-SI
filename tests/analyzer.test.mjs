import assert from 'node:assert/strict';
import { analyzeStoryV3 } from '../shared-analyzer.mjs';
import { createSignal, validateSignal, DOMAINS } from '../shared-schema.mjs';

const result = analyzeStoryV3('I missed my appointment because I had no ride and I am behind on rent.');
assert.equal(result.version, '3.0.0');
assert.ok(result.signals.some(s => s.domain === 'transportation'));
assert.ok(result.signals.some(s => s.domain === 'housing'));
assert.ok(result.signals.some(s => s.domain === 'financial_pressure'));
assert.ok(result.signals.every(s => ['low','medium','high'].includes(s.confidence)));
assert.ok(result.signals.every(s => s.status === 'active'));
assert.equal(result.urgent, false);

const s = createSignal({domain:'food',label:'needs food today'});
assert.equal(validateSignal(s), true);
assert.ok(DOMAINS.includes('faith_meaning'));

const second = analyzeStoryV3('I need a ride to the clinic.', {
  existingSignals: [{domain:'transportation',label:'needs transportation',status:'dismissed'}]
});
assert.equal(second.signals.filter(s => s.domain === 'transportation').length, 0);

const emergency = analyzeStoryV3('I have chest pain and cannot breathe, and I also need help with rent.');
assert.equal(emergency.urgent, true);
assert.ok(emergency.signals.some(s => s.domain === 'safety'));
console.log('analyzer tests passed');

// V2 compatibility regressions preserved during the V3 upgrade.
const {analyzeStory}=await import('../shared-analyzer.mjs');
const v2Care=analyzeStory("My mom can't get her medication refill because insurance denied it and I don't know who to call.");
assert.equal(v2Care.route.title,'Start with care navigation');
const v2Emergency=analyzeStory('I have chest pain and cannot breathe.');
assert.equal(v2Emergency.urgent,true);assert.equal(v2Emergency.route.title,'Get immediate help first');
const v2Faith=analyzeStory('I am struggling with faith and need prayer.');
assert.equal(v2Faith.route.title,'Start with a trusted spiritual or community person');assert.ok(v2Faith.note.includes('does not')&&v2Faith.note.includes('speak for God'));
