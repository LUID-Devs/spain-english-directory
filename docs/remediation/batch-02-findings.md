# Batch 02 Findings (Next 10 oldest merged PRs with score 4/5)

Date: 2026-03-06

## Included PRs

- #15 feat: SEO city+category landing pages #1143
- #17 data: Add Turó Park Clinics - Healthcare - Madrid (Task #1145)
- #5 feat: end-to-end claim listing workflow #1067
- #10 data: Add 6 Real Estate Agent Listings - Barcelona (Task 1073)
- #4 feat: add homepage and search UI #1059
- #18 feat: SEO city+category landing pages #1143
- #21 feat: ESHA Directory competitor gap analysis #1239
- #20 feat: Doctoralia.es research and insights #1212
- #23 feat: Add Lexidy Law Firm - Legal - Barcelona/Madrid/Málaga #1269
- #19 feat: Add MedinAction healthcare provider #1238

## Confirmed Greptile Findings Addressed

- JSON-LD script injection risk due to unsafe `JSON.stringify(...)` output in page script tags.
- Admin claims endpoints and page had no authentication gate.
- Claim `relationship` value was not persisted in `/api/claims`.
- Turó Park seed row had Barcelona address but `city/province` set to Madrid.
- MedinAction seed phone used non-Spain country code `+39`.

## Remediation Implemented

- Added safe JSON-LD escaping in `app/[city]/[category]/page.tsx`.
- Added centralized admin API key auth helper: `lib/admin-auth.ts`.
- Enforced admin auth on:
  - `app/api/admin/claims/route.ts`
  - `app/api/admin/claims/[id]/route.ts`
  - `app/api/admin/claims/[id]/approve/route.ts`
  - `app/api/admin/claims/[id]/reject/route.ts`
- Added page-level admin key gate and authenticated request headers in `app/admin/claims/page.tsx`.
- Persisted and validated `relationship` in `app/api/claims/route.ts`.
- Added relationship field to claim types and claim form UI:
  - `types/index.ts`
  - `components/claims/ClaimModal.tsx`
- Corrected Turó Park city/province consistency:
  - `data/seeds/1145-turo-park-clinics.sql`
- Corrected MedinAction phone country code to Spain (`+34`):
  - `data/seeds/1238-medinaction-healthcare.sql`

## Verification commands

- `npm run build`
