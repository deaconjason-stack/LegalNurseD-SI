# LegalNurseD SI — Evidence Intelligence Engine

LegalNurseD SI is a source-grounded medicolegal nursing review platform being developed by MediSyncD Technologies, LLC. The current public build is **Monumental Milestone 3** and remains a synthetic/de-identified prototype.

## Monumental Milestone 3 capabilities

- Multiple case workspaces
- Local-first PDF, TXT, MD, CSV and JSON evidence intake
- Browser-side PDF page text extraction using Mozilla PDF.js
- SHA-256 document fingerprints for provenance
- Page-level evidence indexing and citations
- Search across indexed record text
- Machine-surfaced clinical review prompts across falls, pain/functional change, neurologic monitoring, provider notification, transfer/escalation, pressure injury, medication, repositioning, change in condition, continence/toileting, elopement and abuse/neglect terminology
- Possible fall-time conflict prompts
- Neutral record-gap prompts when expected concepts are not located in the indexed record set
- Machine-extracted chronology candidates tied to source pages
- Human disposition workflow: retain for review, dismiss prompt, reset
- Reviewer identity and timestamp capture
- Evidence-aware Lexi retrieval with source citations
- Evidence ledger
- Timestamped local audit trail
- AES-GCM encrypted browser vault using a PBKDF2-derived key
- JSON review-bundle export
- Printable draft professional review packet
- Automated GitHub Pages deployment

## PDF processing

PDF processing occurs in the user's browser. The prototype loads Mozilla PDF.js from jsDelivr, then passes the selected file's local bytes to PDF.js for parsing. The application does not intentionally upload selected case files to GitHub or to an application server.

This version extracts embedded PDF text. **Scanned image-only PDFs requiring OCR are not yet supported.**

## Safety boundary

**Use synthetic or fully de-identified material only.** This public prototype is not configured as a production environment for protected health information, privileged legal material, HIPAA-regulated workflows, legal hold, enterprise identity, production key management, expert opinions, or autonomous legal conclusions.

LegalNurseD SI provides clinical record organization and decision support. It does not determine negligence, causation, liability, damages, standard of care, or legal strategy. Human clinical and legal review remains required.

Machine-surfaced prompts must be validated against the original source documents before professional use.

## Defensibility design

The product is being built around a core rule: **every material machine-surfaced item must lead back to evidence.** The M3 prototype therefore carries document fingerprints, file names, page numbers, machine-vs-human status, reviewer disposition, reviewer identity and audit events.

## Production roadmap

Before sensitive production use, the architecture should add:

1. Enterprise authentication, MFA/passkeys and role-based authorization
2. Tenant-isolated workspaces and server-side case persistence
3. HIPAA-appropriate hosting and BAAs where applicable
4. Encrypted object storage and managed key infrastructure
5. OCR for scanned records with page/image provenance
6. Immutable or tamper-evident audit logging
7. Attorney/LNC role workflows and final report sign-off
8. Controlled model inference with no client-data training by default
9. Retention, deletion, legal-hold and export governance
10. Jurisdiction/date-aware standards and policy research controls
11. Validation corpus using synthetic/de-identified cases
12. Independent security, privacy, clinical and legal review before production release

## Technology

- Static single-page web application
- GitHub Pages deployment
- Web Crypto API for local prototype encryption and hashing
- Mozilla PDF.js for browser-side PDF parsing
- No paid application hosting required for the public prototype

## Status

Current version: **Monumental Milestone 3 — Evidence Intelligence Engine**

The project is being developed synthetic-first so the workflow, provenance model and human-review controls can mature before sensitive healthcare or legal data is introduced.
