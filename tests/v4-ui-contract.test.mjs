import assert from 'node:assert/strict';
import {mergeConfirmedCase,caseFreshnessLabel,buildLocalSecretWarning} from '../public/modules/live-cases.js';
import {buildLiveCaseCardModel} from '../public/modules/views/live-case.js';
import {groupPartnerCases} from '../public/modules/views/partner-inbox.js';
import {buildNavigatorQueues} from '../public/modules/views/navigator.js';
import {HANDOFF_STATUSES,HANDOFF_OUTCOMES} from '../shared-handoffs.mjs';
import {t} from '../public/modules/i18n.js';
import {shouldCacheRequest} from '../public/sw.js';
const local={id:'c1',version:4,status:'accepted',accessSecret:'secret',lastSeenMessageAt:'2026-09-23T09:00:00Z',messageDraft:'hello',lastConfirmedAt:'2026-09-23T09:30:00Z'};
const server={id:'c1',version:5,status:'scheduled',ownerDisplayName:'Sarah',updatedAt:'2026-09-23T10:00:00Z'};
const merged=mergeConfirmedCase(local,server,{confirmedAt:'2026-09-23T10:01:00Z'}); assert.equal(merged.version,5); assert.equal(merged.accessSecret,'secret'); assert.equal(merged.messageDraft,'hello'); assert.equal(merged.lastSeenMessageAt,local.lastSeenMessageAt); assert.equal(mergeConfirmedCase(merged,{...server,version:3,status:'accepted'},{confirmedAt:'x'}).status,'scheduled');
assert.match(caseFreshnessLabel(merged,false),/Last confirmed/i);
const model=buildLiveCaseCardModel({status:'accepted',ownerDisplayName:'Sarah',nextAction:'Call the person',nextActionDueAt:'2026-09-25T14:00:00Z',lastConfirmedAt:'2026-09-23T12:00:00Z'},{online:false}); assert.match(model.statusText,/accepted/i); assert.match(model.freshnessText,/Last confirmed/i); assert.equal(model.ownerText,'Sarah');
const grouped=groupPartnerCases([{id:'1',status:'delivered',workflowFlags:[]},{id:'2',status:'accepted',workflowFlags:[]},{id:'3',status:'scheduled',workflowFlags:[{code:'next_action_overdue'}]},{id:'4',status:'closed',workflowFlags:[]}]); assert.equal(grouped.Incoming.length,1); assert.equal(grouped.Accepted.length,1); assert.equal(grouped['Needs Attention'].some(x=>x.id==='3'),true); assert.equal(grouped.Closed.length,1);
const queues=buildNavigatorQueues({liveCases:[{id:'a',status:'delivered',workflowFlags:[{code:'delivered_not_acknowledged'}]},{id:'b',status:'accepted',ownerPartnerUserId:null,workflowFlags:[]},{id:'c',status:'rejected',closedOutcome:'organization_declined',workflowFlags:[]},{id:'d',status:'closed',closedOutcome:'service_completed',personConfirmedOutcome:null,workflowFlags:[]}],resources:[]}); assert.equal(queues.awaitingAcknowledgement.length,1); assert.equal(queues.acceptedNoOwner.length,1); assert.equal(queues.rejectedNeedingAlternative.length,1); assert.equal(queues.awaitingPersonConfirmation.length,1); assert.equal(queues.overdueNextActions.some(x=>x.id==='d'),false);
assert.equal(shouldCacheRequest('https://example.test/api/v4/cases/c1'),false); assert.equal(shouldCacheRequest({url:'https://example.test/index.html',method:'GET',headers:new Headers({authorization:'Bearer x'})}),false); assert.equal(shouldCacheRequest('https://example.test/styles.css'),true);
assert.match(buildLocalSecretWarning([{status:'accepted',accessSecret:'x'}]),/cannot recover/i); assert.equal(buildLocalSecretWarning([{status:'closed',accessSecret:'x'}]),'');
for(const s of HANDOFF_STATUSES)assert.notEqual(t(`handoff.status.${s}`),`handoff.status.${s}`); for(const o of HANDOFF_OUTCOMES)assert.notEqual(t(`handoff.outcome.${o}`),`handoff.outcome.${o}`);
console.log('v4 ui contract tests passed');
// Final review UI contracts: secret fragments are cleared before redemption,
// partner cases expose assignment, people can explicitly answer info requests,
// and member availability is read-only.
const {readFile} = await import('node:fs/promises');
const loginSource=await readFile(new URL('../public/modules/views/partner-login.js',import.meta.url),'utf8');
assert.ok(loginSource.indexOf('history.replaceState') < loginSource.indexOf('await partnerClient.redeem'), 'magic-link fragment must be cleared before redeem');
const partnerCaseSource=await readFile(new URL('../public/modules/views/partner-case.js',import.meta.url),'utf8');
assert.match(partnerCaseSource,/assignSelf|partnerUserId/i);
assert.match(partnerCaseSource,/partnerClient\.messages/);
const liveCaseSource=await readFile(new URL('../public/modules/views/live-case.js',import.meta.url),'utf8');
assert.match(liveCaseSource,/shareRequestedInfo/);
const availabilityModule=await import('../public/modules/views/partner-availability.js');
assert.equal(availabilityModule.canManageAvailability({role:'partner_manager'}),true);
assert.equal(availabilityModule.canManageAvailability({role:'partner_member'}),false);
