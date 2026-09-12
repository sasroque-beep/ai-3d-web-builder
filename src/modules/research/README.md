# Research

> Status: **in progress** — manual enrichment of existing companies/leads
> implemented (Issue #6), and a strategic business diagnosis built from that
> data implemented (Issue #8). Automated public-data collection (scraping,
> external APIs) and AI-generated diagnoses are still planned.

## Responsibility

Collect public information about a company and its leads, and turn it into a
structured business analysis the rest of the pipeline can consume.

## Implemented

- `types.ts` — `EnrichmentFieldKey` (`tradeName`, `businessHours`,
  `apparentAudience`, `differentiators`, `additionalInfo`),
  `EnrichmentStatus` (`confirmed` | `unverified` | `missing`),
  `EnrichmentFieldRecord`, `EnrichmentOverview`.
- `validation.ts` — field/status enum validation; a value is required unless
  the status is `missing`.
- `service.ts` — `createResearchService()`: `upsertField()` (one record per
  company + field key — later calls update the existing entry rather than
  duplicating it) and `getEnrichmentOverview()` (always returns all known
  field keys, synthesizing a `missing` placeholder for keys with no stored
  record yet).
- `actions.ts` — `upsertEnrichmentFieldAction`, the Next.js Server Action used
  by `src/app/leads/[id]/research`.

This is a manually-operated enrichment flow: the operator records what they
find (with a source and a confirmed/unverified/missing status) for a company
already registered by `../crm`. No scraping or external API integration is
implemented — `source` is a free-text field precisely so a future automated
collector can populate the same table without a schema change.

- `diagnosis/` — strategic business diagnosis built from a company's
  registration data (`../crm`) and its enrichment overview (above):
  `types.ts` (`DiagnosisFormInput`, `DiagnosisRecord`,
  `DigitalMaturityLevel`), `validation.ts`, `service.ts`
  (`checkDiagnosisEligibility()` — a diagnosis requires at least one
  `confirmed` enrichment field; `listMissingEnrichment()`;
  `createDiagnosisService()` with `upsertDiagnosis()`/`getDiagnosis()`), and
  `actions.ts` (`upsertDiagnosisAction`, used by
  `src/app/leads/[id]/diagnosis`). One diagnosis per company (upsert, no
  history yet). Segment, products, target audience and digital presence are
  read directly from the company record, never duplicated; "missing data" is
  computed from the enrichment overview, never stored. Entirely manual in
  this version — `generatedBy: "manual" | "ai"` reserves the field for a
  future AI-generated diagnosis without a schema change.

## Belongs here

- Public-data collectors and normalizers
- Business/competitor analysis logic
- Research result types and persistence contracts

## Does NOT belong here

- Strategy decisions (`../strategy`)
- Copy or design output
- UI screens (those live in `src/app`)

## Depends on

- `src/lib`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
