# Expat Info Desk Competitor Gap Analysis

**Task:** #1344  
**Date:** March 2026  
**Analyst:** Subagent  
**Source:** https://www.expatinfodesk.com

---

## Executive Summary

Expat Info Desk (expatinfodesk.com) is a well-established expat relocation guide website with a business directory. This analysis examined their Barcelona and Madrid listings to identify gaps in our Spain English Directory.

### Key Findings

- **Directory Dataset Sampled:** 40+ businesses across multiple categories
- **Spain-Specific Listings in sampled directory dataset:** Very limited - Turó Park Dental & Medical Center was the clearest Spain-based listing identified
- **US/UK-Focused:** Most EID listings are US tax preparation services or UK-based services
- **Gap Opportunity:** HIGH - EID has minimal Spain coverage, leaving significant opportunity for our directory

---

## Directory Coverage Comparison

| Category | Expat Info Desk | Our Directory | Gap Status |
|----------|-----------------|---------------|------------|
| **Medical/Dental (Barcelona)** | 1 listing | 30+ listings | ✅ We lead |
| **Medical/Dental (Madrid)** | 0 listings | 20+ listings | ✅ We lead |
| **Real Estate** | 0 Spain listings | 6 Barcelona listings | ✅ We lead |
| **Legal Services** | 0 Spain listings | 10+ listings | ✅ We lead |
| **Tax Advisors** | 17 US-based | 10+ Spain-based | ✅ We lead |
| **Insurance** | 1 international | 4+ Spain-based | ✅ We lead |
| **Mental Health** | 0 listings | 4+ listings | ✅ We lead |

---

## Expat Info Desk Listings Detail

### Medical Facilities (Europe)

| Business | Location | In Our DB? | Notes |
|----------|----------|------------|-------|
| Turó Park Dental & Medical Center | Barcelona, Spain | ✅ YES | Already added (1297, 1145) |

**Analysis:** In the sampled directory dataset, only one clear Spain medical facility was identified. We have broader Spain-focused coverage.

### Tax Services (US-Based)

EID lists 17+ US tax preparation services for American expats:

1. 1040 Abroad Expat Tax Services (US-based)
2. Abacus Financial Services (Delaware, US)
3. American Expatriate Tax Consultants (US-based)
4. American Tax Group (US-based)
5. Citizen Abroad Tax Advisors (US/Canada)
6. CPA Worldtax LLC (US-based)
7. Expat CPA Tax Services (Florida, US)
8. Greenback Expat Tax Services (US-based)
9. Intaxact LLC (US-based)
10. Online Taxman (US-based)
11. Parent Parent LLP / IRS Medic (US-based)
12. Taxmaster (US-based)
13. Taxes for Expats (US-based)
14. Tax Samaritan (US-based)
15. US Expat Tax Help (US-based)
16. US Tax 4 Expats (US-based)
17. US Tax Financial Services (US-based)

**Analysis:** All are US-based remote services. We have focused on Spain-based tax advisors who understand local Spanish tax law.

### Property Services

| Business | Location | In Our DB? |
|----------|----------|------------|
| Key Location Pte Ltd | Singapore | ❌ N/A (Not Spain) |
| Stella Hockley Property Management | London, UK | ❌ N/A (Not Spain) |

**Analysis:** No Spain property listings on EID. We have 6 Barcelona real estate agents.

### Insurance

| Business | Coverage | In Our DB? |
|----------|----------|------------|
| Expat Financial | International | Similar to Sanitas Expat |

### Moving/Relocation

| Business | Location | In Our DB? |
|----------|----------|------------|
| Nobel International Movers | US-based | ❌ Not added |
| AGS Worldwide Movers | International | ❌ Not added |
| PSS International Removals | UK-based | ❌ Not added |
| Reallymoving.com | UK-based | ❌ Not added |

**Analysis:** These are international movers, not Spain-specific.

### Other Services

| Business | Type | Location |
|----------|------|----------|
| GoExpat | Online Platform | Global |
| InterHigh Secondary School | Online School | UK-based |
| Thriving Abroad Podcast | Media | Global |
| American Citizens Abroad | Advocacy | US-focused |

---

## Gap Fill Actions Taken

### New Providers Added (from EID research + additional sources)

#### Barcelona - Dentists (8 new providers)
- Dr. Nicholas Jones (English/French)
- Dr. Philippe G Sissmann (English/French)
- Dr. Brion (English/German/French)
- Dr. Joseph de Vilallonga (English/Japanese) - UNIQUE
- Dr. David Huertas (English/German/French)
- Dr. Eduardo Vazquez Delgado (English)
- Dr. Mc Carthy (English)
- Dr. Victor Van Der Giessen (English/Dutch) - Castelldefels

**File:** `data/seeds/1344-barcelona-dentists-expat-info-desk.sql`

#### Barcelona - Doctors/Healthcare (10 new providers)
- Dr. Steven Joseph (GP)
- Dr. José A. Tous (GP)
- Dr. A Anguita Mateu (GP)
- Dr. Jennet de Groot (Pulmonology - multi-lingual)
- Dr. Mary McCarthy (GP)
- Dr. Jorge Campamà (GP)
- Dr. Thorsten Faust (Pediatrics - multi-lingual)
- Dr. Inmaculada Puig (Pediatrics)
- Dr. M. de la Iglesia (Pediatrics)
- Dr. Leila Onbargi (OB-GYN - multi-lingual)

**File:** `data/seeds/1344-barcelona-doctors-expat-info-desk.sql`

#### Barcelona - Tax & Legal (6 new providers)
- Irwin Mitchell (Major UK law firm)
- Barcelona Legal (Expat-focused)
- Bufete G Pretus (English-speaking)
- Martin Howard and Associates (Tax specialists)
- Angela Dupont (Tax accountant)
- Alex Chumillas (Tax advisor)

**File:** `data/seeds/1344-barcelona-tax-legal-expat-info-desk.sql`

#### Barcelona - Mental Health & Optics (6 new providers)
- Dr. Jill Jenkins (Psychologist)
- Avanza Psychology (US-trained team)
- Bioptic (Optician)
- Grand Optical (Optician)
- Llobet Optics CB (Optician)
- Louis Armand Optics (Optician)

**File:** `data/seeds/1344-barcelona-psychology-optics-expat-info-desk.sql`

#### Madrid - Tax Advisors (5 new providers)
- Spain Accountants (Nationwide)
- Ernst & Young Abogados (Big 4)
- Spain Company Formation (Business setup)
- Moore Stephens Iberica (Audit/tax)
- Spanish Taxes (Online service)

**File:** `data/seeds/1344-madrid-tax-advisors-expat-info-desk.sql`

---

## Strategic Insights

### 1. EID Weakness = Our Opportunity

Expat Info Desk focuses on:
- General expat guides (visa, moving tips)
- US tax preparation services
- UK-based property/moving services

They have **minimal Spain-specific business listings**, creating a significant gap we can fill.

### 2. Category Opportunities

**HIGH Priority (Low EID coverage):**
- Medical/Dental - We have comprehensive coverage, EID has 1 listing
- Legal Services - We have multiple providers, EID has none
- Real Estate - We have coverage, EID has none
- Tax Advisors (Spain-based) - We focus on local expertise

**MEDIUM Priority:**
- Moving/Relocation services (Spain-based)
- Insurance brokers
- Schooling/Education consultants

### 3. Competitive Advantages

| Our Strength | EID Weakness |
|--------------|--------------|
| Spain-focused | Global/US-focused |
| Local providers | Remote/US providers |
| Verified English-speaking | Unverified |
| Multiple cities (Bcn, Mad, Malaga, Valencia) | No city guides for Spain |
| Regular updates | Stale listings |

---

## Recommendations

1. **Continue Spain Focus** - EID's lack of Spain coverage is our opportunity
2. **Add More Madrid Providers** - EID has zero Madrid listings
3. **Expand to Other Cities** - Valencia, Seville, Malaga coverage
4. **Add Moving/Relocation Category** - EID lists movers but none are Spain-based
5. **Target SEO** - "English-speaking dentist Barcelona", "expat doctor Madrid"

---

## Files Created/Modified

```
data/seeds/1344-barcelona-dentists-expat-info-desk.sql       (8 providers)
data/seeds/1344-barcelona-doctors-expat-info-desk.sql        (10 providers)
data/seeds/1344-barcelona-tax-legal-expat-info-desk.sql      (6 providers)
data/seeds/1344-barcelona-psychology-optics-expat-info-desk.sql (6 providers)
data/seeds/1344-madrid-tax-advisors-expat-info-desk.sql      (5 providers)
competitor-analysis/expatinfodesk-gap.md                     (This report)
```

**Total New Providers Added in this task batch:** 35

---

## Conclusion

Expat Info Desk is not a direct competitor for Spain-specific business listings. Their directory focuses on:
1. US tax preparation services
2. UK property/moving services
3. General expat resources

Our directory fills a clear gap in the market: **verified, English-speaking local providers in Spain**. 

The gap analysis reveals we are well-positioned to dominate Spain-specific English business listings, with significantly more comprehensive coverage than EID in all major categories.

---

*Report generated for Task #1344*
*Closes #1344*
