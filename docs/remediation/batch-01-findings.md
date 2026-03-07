# Batch 01 Findings (Oldest 10 merged PRs with score 4/5)

Date: 2026-03-06

## Included PRs

- #9 feat: add end-to-end claim workflow #1067
- #1 feat: add API routes for professionals, search, contact
- #14 data: add Therapy in Barcelona - Task #1139
- #12 data: Add Madrid Healthcare Providers - Batch 1 (Task #1121)
- #3 feat: SEO-optimized combination pages for city+category pairs
- #2 feat: add database schema models #1057
- #6 feat: add claim listing workflow #1064
- #7 feat: add professional dashboard #1066
- #11 data: Add Madrid Doctors - Batch 1 (Task #1107)
- #13 data: Add Insurance category + Sanitas Expat provider

## Findings

- Build integrity: no reproducible build failure from this batch on current main.
- Seed integrity: duplicate `(name, city)` rows were still present and mapped to overlapping merged PR waves.
- Process defect confirmed: Greptile confidence gate previously trusted PR body score line, which allowed score-line edits to bypass unresolved issues.

## Remediation Implemented in this batch

- Removed duplicate seed files superseded by newer equivalent entries:
  - `data/seeds/1139-therapy-in-barcelona.sql`
  - `data/seeds/1269-lexidy-law-firm.sql`
  - `data/seeds/1297-turo-park-medical-barcelona.sql`
  - `data/seeds/1363-conesa-legal.sql`
- Removed duplicate row for `Unidad Médica Angloamericana` from:
  - `data/seeds/1365-esha-competitor-research.sql`
- Removed duplicate `International Doctor 24H` row from:
  - `data/seeds/1121-madrid-healthcare-providers-batch1.sql`
- Added deterministic seed integrity checker: `scripts/check-seed-integrity.js`
- Added CI workflow: `.github/workflows/ci-seed-integrity.yml` to enforce seed integrity + build
- Hardened Greptile gate: `.github/workflows/greptile-confidence-gate.yml` now reads confidence only from Greptile comments/reviews, not PR body

## Verification commands

- `npm run check:seed-integrity`
- `npm run build`
