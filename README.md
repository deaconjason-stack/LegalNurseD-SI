# LegalNurseD SI — Portable MVP

LegalNurseD SI is a zero-cost, standalone demonstration of an evidence-linked legal nurse consulting workspace developed for MediSyncD Technologies, LLC.

## MVP capabilities

- Responsive command center and case workspace
- Synthetic long-term-care fall case
- Guided “Lexi” review assistant simulation
- Evidence-linked medical chronology
- Fact vs. reviewer-observation separation
- Clinical red-flag review prompts
- Record inventory and missing-record tracking
- Reviewer notes saved only in the local browser
- Draft attorney-ready case-review packet
- Print / Save-as-PDF export for the synthetic packet
- Installable progressive web app foundation with offline cache

## Run locally

Open `index.html` directly for the basic demo. For install/offline support, serve this folder from any static web server or deploy it to a static host.

## Zero-cost deployment choices

This repository is intentionally portable. It can be deployed to GitHub Pages, Cloudflare Pages, or another static host without changing the application architecture.

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

Built as a synthetic demonstration first so the product can be developed and shown safely before a compliant production architecture is introduced.
