# Batch 05 Findings (Next merged PRs with actionable 4/5-review issues)

Date: 2026-03-06

## Targeted PRs in this batch

- #78 strategy: MovingToBarcelona competitor analysis #1373
- #95 content: language barrier insight #1390
- #97 research: Expat Info Desk competitor analysis #1344
- #108 competitor analysis: Expat Info Desk gap report #1344
- #111 content/research: Barcelona doctor Reddit insights #1337

## Confirmed fixes applied

- Removed unsupported absolute framing in language-barrier content and aligned wording to evidence-based ranges:
  - `content/insights/1390-language-barrier-english-speakers-spain.md`
  - Updated title and replaced absolute "0% outside cities" phrasing with non-absolute wording.
- Converted over-strong recommendation language to measured statements based on sampled Reddit threads:
  - `content/insights/1337-english-doctor-barcelona-reddit-recommendation.md`
  - Replaced "clear favorite"/"only practice" claims with "frequently recommended" phrasing.
- Corrected stale 2025 research metadata:
  - `research/reddit-barcelona-doctors.md` (`Research Date`, `Research Completed`, `Next Review`)
  - `research/competitors/expat-info-desk-analysis.md` (`Analysis Date`)
- Resolved cross-file inconsistency in Expat Info Desk reporting scope and counts:
  - `competitor-analysis/expat-info-desk-gap-analysis.md`
  - `competitor-analysis/expatinfodesk-gap.md`
  - Standardized to "sampled dataset"/"candidate set" language instead of conflicting hard totals.

## Notes

- This batch intentionally prioritizes deterministic documentation defects (unsupported absolutes, stale metadata, and internal inconsistency) that were likely to trigger confidence-score penalties.

## Verification commands

- `npm run check:seed-integrity`
- `npm run build`
