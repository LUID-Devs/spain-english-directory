# Expat Info Desk - Competitor Analysis

**Research Date:** March 2026  
**Source:** https://www.expatinfodesk.com/  
**Related Issue:** #1344

---

## Executive Summary

Expat Info Desk is an established international relocation guide service offering on-demand digital books for popular expat destinations. Their Spain coverage focuses primarily on **Madrid** and **Barcelona**, with Valencia mentioned but not having a dedicated city guide. This analysis examines their directory structure, categorization approach, and vetting process for service provider listings.

---

## 1. Directory Structure Analysis

### 1.1 URL Architecture

Expat Info Desk uses a hierarchical, SEO-friendly URL structure:

```
/destinations/
├── spain/                              # Country overview
├── madrid/                             # City landing page
│   ├── language/                       # Language schools
│   ├── medical-facilities/
│   │   └── health-coverage/
│   └── resources/
│       └── websites/                   # Curated resource lists
├── barcelona/                          # City landing page
│   ├── visas/                          # Visa information
│   ├── medical-facilities/
│   │   └── doctors-and-hospital/
│   │       └── best-facilities/        # Vetted provider listings
│   └── resources/
│       └── websites/
└── [other-cities/]                     # Other global destinations
```

### 1.2 Navigation Pattern

- **Top-level:** Country overview (e.g., `/destinations/spain/`)
- **Second-level:** City-specific landing pages (e.g., `/destinations/madrid/`)
- **Third-level:** Category pages (e.g., `/destinations/barcelona/medical-facilities/`)
- **Fourth-level:** Sub-category detail pages (e.g., `/doctors-and-hospital/best-facilities/`)

---

## 2. Categorization Approach

### 2.1 Primary Categories Identified

Based on the Barcelona and Madrid guides, EID organizes content into these main categories:

| Category | Subcategories | Content Type |
|----------|--------------|--------------|
| **Medical Facilities** | Hospitals, Doctors, Pediatricians, Dental, Optics, Psychology, OB/GYN | Vetted provider listings |
| **Resources** | Websites, Classifieds, Government | Curated links with descriptions |
| **Language** | Language Schools | Educational institutions |
| **Visas** | Visa & Residency Information | Process documentation |
| **Living Guides** | Housing, Transportation, Cost of Living | Relocation advice |

### 2.2 Medical Provider Categorization (Deep Dive)

The Barcelona medical facilities page demonstrates a **specialty-based taxonomy**:

1. **Hospitals** (split by type)
   - Public Hospitals
   - Private Hospitals (with English-speaking staff)

2. **General Practitioners**
   - Individual doctor listings with languages spoken

3. **Specialists by Field**
   - Pediatricians
   - Obstetrics and Gynecology
   - Dental Care
   - Optics
   - Psychologists

### 2.3 Listing Format for Providers

Each provider entry follows a consistent template:

```
- Dr. [Name] ([Languages spoken, comma-separated])
  [Specialty note if applicable]
  [Address]
  [Phone number]
  [Email or website - optional]
```

**Example:**
```
- Dr. Jennet de Groot (Spanish, English, Dutch, French, German) specializing in pulmonology
  c/Vilana, 12. Despacho 161 (Centro Medico Teknon)
  Tel: 933 933 161
```

---

## 3. Vetting Process Analysis

### 3.1 Observable Vetting Criteria

Based on provider listings, EID appears to use the following vetting standards:

| Criterion | Evidence | Implementation |
|-----------|----------|----------------|
| **Language Capability** | Explicit language tags | Required - "All names listed here speak English" |
| **Location Verification** | Full addresses provided | Physical address required |
| **Contact Validation** | Phone numbers listed | Multiple contact methods preferred |
| **Specialty Certification** | Specialization noted | For specialists, field of expertise required |
| **Training Credentials** | "US-trained" noted for psychologists | Professional training background when relevant |

### 3.2 Quality Indicators

1. **Language Proficiency:** Primary filter - all listings explicitly note English capability
2. **Professional Credentials:** Specializations and training backgrounds highlighted
3. **Location Context:** Hospital affiliations noted (e.g., "Centro Medico Teknon")
4. **Contact Accessibility:** Direct phone numbers provided, not just general facility lines

### 3.3 What's NOT Included

Notable absences from listings that suggest exclusion criteria:
- ❌ No pricing information
- ❌ No patient reviews/ratings
- ❌ No insurance acceptance details
- ❌ No appointment booking links
- ❌ Limited photos or media

---

## 4. Content Strategy Observations

### 4.1 Voice and Tone

- **Written by expats, for expats** - emphasized throughout
- **Honest, practical advice** - "We don't skirt around difficult issues"
- **Regularly updated** - claimed, though update frequency unclear

### 4.2 Content Depth

- City guides are **comprehensive relocation manuals**, not just directories
- Mix of **practical information** (addresses, phone numbers) and **narrative content** (city overviews, cultural context)
- **Integration of services** with lifestyle advice

### 4.3 Resource Page Strategy

Resource pages (`/resources/websites/`) include:
- Curated external links
- Brief descriptive annotations
- Categorization by type (Government, City Guides, Classifieds)
- Mix of official and community resources

---

## 5. Strengths of EID Model

1. **Comprehensive Coverage** - Each city guide covers full relocation lifecycle
2. **Vetted Listings** - Explicit criteria for inclusion (especially language)
3. **Hierarchical Organization** - Intuitive drill-down from country → city → category → provider
4. **Expert Authorship** - Claims expat-written content for authenticity
5. **Consistent Formatting** - Standardized listing templates aid readability

---

## 6. Weaknesses/Gaps Identified

1. **Limited Spain Coverage** - Only Madrid and Barcelona have dedicated guides; Valencia referenced but not covered
2. **Static Listings** - No reviews, ratings, or user feedback mechanisms visible
3. **Update Frequency** - Claims regular updates but no visible timestamps
4. **Limited Provider Details** - No insurance info, pricing, or availability
5. **No Search Functionality** - Appears to rely on browse-only navigation

---

## 7. Recommendations for Spain English Directory

### 7.1 Structural Recommendations

| EID Approach | Our Adaptation | Rationale |
|--------------|----------------|-----------|
| `/destinations/{city}/` | `/cities/{city}/` | Clearer intent for city-specific content |
| Category subdirectories | Category tags/filters | More flexible for multi-city providers |
| Deep hierarchy | Flatter structure + filters | Better UX for service discovery |

### 7.2 Categorization Strategy

**Adopt EID's specialty-based taxonomy** for healthcare:
- Primary Care / General Practitioners
- Pediatricians
- Dental Care
- Optics / Vision
- Mental Health (Psychologists, Psychiatrists)
- Women's Health (OB/GYN)
- Specialists by field

**Expand beyond EID's model** with:
- Legal services (immigration lawyers, tax advisors)
- Financial services (banks, insurance, accountants)
- Real estate agents
- Pet services (veterinarians, groomers)
- Home services (contractors, cleaners)

### 7.3 Vetting Process Recommendations

**Minimum Vetting Standards (inspired by EID):**

1. **Language Verification**
   - Self-reported English capability
   - Optional: brief phone/email verification

2. **Professional Credentials**
   - License verification for regulated professions (medical, legal)
   - Professional association membership

3. **Contact Validation**
   - Working phone number
   - Responsive email or web presence

4. **Location Confirmation**
   - Physical address in Spain
   - Service area specification

**Enhanced Vetting (beyond EID):**

5. **Review System**
   - User ratings and reviews
   - Response rate tracking

6. **Insurance & Pricing**
   - Optional: insurance acceptance info
   - Optional: pricing transparency

7. **Verification Badges**
   - "Verified" for completed vetting
   - "Community Recommended" for highly-rated providers

### 7.4 Content Recommendations

1. **Provider Listings:**
   - Start with EID's concise format
   - Add: specialties, service areas, insurance acceptance
   - Add: user ratings and review count

2. **City Guides:**
   - Create dedicated guides for Madrid, Barcelona, Valencia (filling EID's gap)
   - Include: neighborhood guides, cost of living, cultural tips

3. **Resource Pages:**
   - Curated external resources per city
   - Government services, expat communities, events

---

## 8. Competitive Differentiation

**Where we can surpass EID:**

| Feature | EID | Our Opportunity |
|---------|-----|-----------------|
| **Coverage** | Madrid, Barcelona only | Full Spain coverage including Valencia, Seville, Malaga |
| **Updates** | Claimed, not visible | Real-time updates, user-suggested edits |
| **Reviews** | None | Community reviews and ratings |
| **Search** | Browse-only | Full-text search with filters |
| **Interactivity** | Static listings | Appointment booking, messaging |
| **Pricing Info** | None | Optional provider-submitted pricing |
| **Mobile** | Unknown | Mobile-first design |

---

## 9. Implementation Priorities

### Phase 1: Foundation (MVP)
- [ ] Implement EID-style category taxonomy
- [ ] Create city-specific landing pages (Madrid, Barcelona, Valencia)
- [ ] Basic vetting: language capability + contact validation
- [ ] Standardized listing format

### Phase 2: Enhancement
- [ ] Add review/rating system
- [ ] Expand to additional cities
- [ ] Add advanced filtering
- [ ] Provider claim/verification flow

### Phase 3: Differentiation
- [ ] Appointment booking integration
- [ ] Community features
- [ ] Mobile app
- [ ] AI-powered recommendations

---

## 10. Conclusion

Expat Info Desk provides an excellent baseline model for city-specific expat service directories. Their **categorization taxonomy** and **minimum vetting standards** (especially language verification) are sound practices to adopt. 

However, their **limited Spain coverage** (only Madrid and Barcelona) and **static, non-interactive listings** present clear opportunities for differentiation. By expanding to Valencia and other Spanish cities, adding community features like reviews, and maintaining rigorous vetting standards, the Spain English Directory can establish itself as the premier resource for English-speaking services throughout Spain.

---

## Appendix: Data Sources

- Main site: https://www.expatinfodesk.com/
- Madrid guide: https://www.expatinfodesk.com/destinations/madrid/
- Barcelona guide: https://www.expatinfodesk.com/destinations/barcelona/
- Barcelona medical facilities: https://www.expatinfodesk.com/destinations/barcelona/medical-facilities/doctors-and-hospital/best-facilities/
- Madrid resources: https://www.expatinfodesk.com/destinations/madrid/resources/websites/
- Barcelona resources: https://www.expatinfodesk.com/destinations/barcelona/resources/websites/
- Spain overview: https://www.expatinfodesk.com/destinations/spain/
