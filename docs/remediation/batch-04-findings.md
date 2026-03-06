# Batch 04 Findings (Next merged PRs with actionable 4/5-review issues)

Date: 2026-03-06

## Targeted PRs in this batch

- #30 feat: add My Lawyer in Spain legal service #1328
- #31 feat: add English-Speaking-Doctor.es online healthcare #1325
- #34 docs: Valencia doctor shortage research #1329
- #109 strategy: Doctor English proficiency Reddit insight #1401
- #135 strategy: Expat.com competitor analysis #1414

## Confirmed fixes applied

- Replaced non-standard `city/province` values for nationwide/online seeds with indexable city values:
  - `data/seeds/1328-my-lawyer-spain.sql` (`Nationwide` -> `Madrid/Madrid`, address notes nationwide service)
  - `data/seeds/1325-english-speaking-doctor-online.sql` (`Online/Spain` -> `Madrid/Madrid`)
- Corrected stale research dates from 2025 to 2026:
  - `docs/research/valencia-doctor-shortage.md`
  - `docs/research/valencia-healthcare-strategy.md`
  - `research/reddit-doctor-english-b1.md`
- Aligned category coverage consistency in Expat.com competitor analysis:
  - `competitor-analysis/expat-com-gap-analysis.md` (`Healthcare` coverage `Moderate` -> `Limited`)

## Notes

- Several historical Greptile remarks in this range were PR-scope/process comments (out-of-scope file bundling, missing PR closes references) that do not map to a deterministic repo-state defect and were therefore not force-edited.

## Verification commands

- `npm run check:seed-integrity`
- `npm run build`
