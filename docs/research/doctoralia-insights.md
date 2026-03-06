# Task 1212: Doctoralia.es Research Insights

Data compiled from platform analysis and market research  
Date: March 2026

---

## KEY INSIGHTS FOR DIRECTORY STRATEGY

### 1. DOCTORALIA SCALE (Spain)

| Metric | Value |
|--------|-------|
| Total professionals | 105,179+ |
| Madrid | ~25,000+ professionals |
| Barcelona | ~20,000+ professionals |
| Valencia | ~8,000+ professionals |
| Sevilla | ~5,000+ professionals |
| Other cities | ~46,000+ professionals |

### 2. TOP SPECIALTIES BY SEARCH VOLUME

Priority categories for English-speaking directory:

1. Psychology (Psicólogo) - Highest demand
2. Gynecology (Ginecólogo)
3. Traumatology (Traumatólogo)
4. Dermatology (Dermatólogo)
5. Psychiatry (Psiquiatra)
6. Dentistry (Dentista)
7. General Medicine (Médico general)
8. ENT (Otorrino)
9. Ophthalmology (Oftalmólogo)
10. Urology (Urólogo)

### 3. COMPETITIVE PRICING BENCHMARKS

Based on Doctoralia listings:

| Service | Price Range |
|---------|-------------|
| General consultation | €50-100 |
| Online consultation | €45-75 |
| Specialist visit | €70-150 |
| Psychologist session | €60-100 |
| Dentist checkup | €50-80 |

### 4. ENGLISH-SPEAKER GAPS IDENTIFIED

Doctoralia limitations we can address:

- ❌ No mandatory English verification
- ❌ Language info self-reported and inconsistent
- ❌ No international insurance filter
- ❌ Limited expat-specific categorization
- ❌ No telemedicine-for-expats highlighting

### 5. TARGET PROVIDER PROFILE

High-value providers to recruit:

- Free-tier Doctoralia users (want visibility)
- Premium users at international clinics
- Psychologists (highest demand specialty)
- Online consultation providers
- Providers in Madrid/Barcelona (highest volume)

### 6. STRATEGIC RECOMMENDATIONS

Action items for directory growth:

1. **Cross-reference** top-rated Doctoralia providers
2. **Verify** English-speaking status via direct outreach
3. **Focus** initial recruitment on psychology/dentistry/GPs
4. **Target** Madrid/Barcelona first (proven demand)
5. **Offer** complementary listings to Doctoralia free users
6. **Emphasize** verification + expat focus as differentiators

### 7. MARKET VALIDATION

Doctoralia's 105K+ providers proves:

- ✅ Strong demand for online healthcare discovery in Spain
- ✅ Patients actively searching for specialists online
- ✅ Providers willing to pay for visibility (€80+/month premium)
- ✅ Online booking is now expected standard

### 8. DOCPLANNER GROUP CONTEXT

Parent company metrics:

- **13 countries** across Europe & Latin America
- **1.8 million** professionals using platform daily
- **65 million** patients served monthly (global)
- **Offices:** Amsterdam, Barcelona, Warsaw, Istanbul, Rome, etc.

---

## SQL Data Schema (Reference)

```sql
-- Example schema for storing Doctoralia-derived insights

CREATE TABLE IF NOT EXISTS doctoralia_insights (
    id SERIAL PRIMARY KEY,
    specialty VARCHAR(100) NOT NULL,
    specialty_es VARCHAR(100),
    estimated_listings INTEGER,
    online_consultation BOOLEAN DEFAULT FALSE,
    expat_priority VARCHAR(20) CHECK (expat_priority IN ('Critical', 'High', 'Medium', 'Low')),
    avg_consultation_price_eur DECIMAL(6,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data insertion template
INSERT INTO doctoralia_insights 
    (specialty, specialty_es, estimated_listings, online_consultation, expat_priority, avg_consultation_price_eur)
VALUES 
    ('Psychology', 'Psicólogo', 15000, TRUE, 'Critical', 75.00),
    ('Gynecology', 'Ginecólogo', 8000, TRUE, 'High', 85.00),
    ('Dentistry', 'Dentista', 12000, TRUE, 'High', 65.00),
    ('General Medicine', 'Médico general', 7000, TRUE, 'Critical', 60.00);

-- Query to find high-priority specialties for recruitment
SELECT 
    specialty,
    specialty_es,
    estimated_listings,
    expat_priority,
    avg_consultation_price_eur
FROM doctoralia_insights
WHERE expat_priority IN ('Critical', 'High')
ORDER BY estimated_listings DESC;
```

---

*Research compiled for Task #1212 - Spain English Directory Strategy*
