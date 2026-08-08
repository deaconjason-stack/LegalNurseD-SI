# LegalNurseD SI — Portable MVP

LegalNurseD SI is a zero-cost, standalone demonstration of an evidence-linked legal nurse consulting workspace developed for MediSyncD Technologies, LLC.

## MVP capabilities

- Responsive command center and case workspace
- Synthetic long-term-care fall case
- Guided “Lexi” review assistant simulation
- Evidence-linked medical chronology
- Clinical red-flag review prompts
- Record inventory and missing-record tracking
- Reviewer notes saved only in the local browser
- Draft attorney-ready case-review packet
- Print / Save-as-PDF export for the synthetic packet
- No build tools, paid hosting, or external application dependencies required

## Run locally

Open `index.html` directly in a modern browser. The current MVP is intentionally packaged as a single standalone file so it can be copied, demonstrated, and deployed almost anywhere.

## Zero-cost deployment choices

This repository is intentionally portable. It can be deployed to GitHub Pages, Cloudflare Pages, or another static host without changing the application.

## Safety boundary

**Synthetic data only.** This prototype is not configured for protected health information, privileged legal material, production security, HIPAA workflows, expert opinions, or autonomous legal conclusions. Do not upload or enter real medical records or identifiable patient information.

LegalNurseD SI is designed as professional decision support. It does not determine negligence, causation, liability, damages, or legal strategy. Human clinical and legal review remains required.

## Secure product roadmap

The production build should add:

1. Authentication and MFA
2. Tenant-isolated case workspaces
3. Encrypted record storage
4. OCR / document ingestion with page-level provenance
5. Evidence citations that always point back to source pages
6. Immutable audit events
7. Role-based approvals and report sign-off
8. Controlled AI processing with no training on client data
9. Retention, legal hold, and secure deletion controls
10. Jurisdiction-specific standards and professional governance

## Status

Current version: **Portable MVP v0.2**

The product is being built synthetic-first so we can demonstrate the workflow safely before introducing a compliant production architecture for sensitive healthcare and legal data.
