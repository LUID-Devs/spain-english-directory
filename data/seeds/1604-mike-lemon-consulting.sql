-- Task 1604: Add Mike Lemon Consulting - Accountancy/Tax - Marbella/Málaga
-- Data entry by subagent
-- English-speaking accountancy and tax services for UK expats in Marbella/Málaga area

INSERT INTO directory_entries (
    name,
    category,
    description,
    address,
    city,
    province,
    phone,
    email,
    website,
    speaks_english,
    is_featured,
    is_verified,
    is_claimed,
    created_at,
    updated_at
) VALUES (
    'Mike Lemon Consulting SL',
    'Tax/Accounting',
    'English-speaking accountancy and tax advisory firm serving UK expats in Marbella and the Málaga area. Specializes in both Spanish and UK taxation, serving as Registered Agents with HMRC for UK tax returns. Comprehensive services include Spanish tax form submissions (Personal Income Tax Modelo 100, Wealth Tax Modelo 714, Non-Resident Tax Modelo 210, Overseas Assets Form 720), VAT returns, Corporate Tax, autónomo registration, and vacation rental property tax advice. Also provides conveyancing services, Spanish wills preparation, insurance services, translation services, and holiday lettings registration assistance. Experienced team offering personalized support in English for foreign and non-resident clients living in or owning property in the Costa del Sol region.',
    'Los Faroles, 285A Calle Cordoba Urb.',
    'Marbella',
    'Málaga',
    '+34 952 199 007',
    'lemonsinspain@gmail.com',
    'https://www.lemon.consulting/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
