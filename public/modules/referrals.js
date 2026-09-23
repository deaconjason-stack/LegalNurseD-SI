export {createReferral,transitionReferral,recordReferralOutcome,OUTCOMES,REFERRAL_STATUSES} from '../core/shared-referrals.mjs';
export const OUTCOME_LABELS={could_not_reach:'Could not reach',not_eligible:'Not eligible',no_availability:'No availability',wrong_service:'Wrong service',too_expensive:'Too expensive',transportation_barrier:'Transportation barrier',language_accessibility_barrier:'Language/accessibility barrier',declined_by_me:'Declined by me',other:'Other'};
export const LEGACY_REFERRAL_LABEL='Legacy local referral';
export const isLegacyReferral=r=>Boolean(r?.legacyLocalReferral)||!String(r?.id||'').startsWith('case_');
