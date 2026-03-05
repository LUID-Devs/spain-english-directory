import { getCityBySlug } from './cities';
import { getCategoryBySlug } from './categories';

interface FAQ {
  question: string;
  answer: string;
}

const faqTemplates: Record<string, FAQ[]> = {
  doctors: [
    {
      question: 'Do I need private health insurance to see an English-speaking doctor?',
      answer: 'While Spain has a public healthcare system, many English-speaking doctors work in private clinics. Having private health insurance can provide access to a wider network of English-speaking healthcare providers, though some public hospitals in tourist areas also have English-speaking staff.',
    },
    {
      question: 'Can English-speaking doctors in Spain prescribe medications?',
      answer: 'Yes, licensed doctors in Spain can prescribe medications. Prescriptions (recetas) from Spanish doctors are valid at pharmacies throughout the country. Many medications available over-the-counter in other countries require prescriptions in Spain.',
    },
    {
      question: 'How do I make an appointment with an English-speaking doctor?',
      answer: 'Most English-speaking doctors offer online booking, phone appointments, or walk-in services. Many clinics catering to international patients have English-speaking reception staff who can help you schedule appointments and answer questions.',
    },
    {
      question: 'Are medical records from my home country accepted?',
      answer: 'Spanish doctors will review medical records from other countries, especially if translated. It is helpful to bring relevant medical history, test results, and current medication lists to your first appointment.',
    },
    {
      question: 'What qualifications do English-speaking doctors in Spain have?',
      answer: 'Doctors in Spain must complete medical school and residency training licensed by Spanish authorities. Many English-speaking doctors have additional international training or certifications from UK, US, or other English-speaking countries.',
    },
  ],
  lawyers: [
    {
      question: 'Do I need a Spanish lawyer for property purchase?',
      answer: 'While not legally required, using a Spanish lawyer for property transactions is highly recommended. They ensure proper due diligence, check for debts on the property, verify planning permissions, and protect your interests throughout the purchase process.',
    },
    {
      question: 'Can an English-speaking lawyer help with residency applications?',
      answer: 'Yes, immigration lawyers specializing in English-speaking clients can guide you through Spanish residency applications, including digital nomad visas, golden visas, and non-lucrative residency permits.',
    },
    {
      question: 'How are legal fees typically structured in Spain?',
      answer: 'Legal fees vary by service type. Some lawyers charge hourly rates, while others offer fixed fees for specific services like property purchases or residency applications. Always request a written fee agreement before engaging services.',
    },
    {
      question: 'Can English-speaking lawyers represent me in Spanish courts?',
      answer: 'Yes, qualified Spanish lawyers can represent clients in all Spanish courts regardless of the client\'s nationality. They must be registered with the local bar association (Colegio de Abogados) and can handle civil, criminal, and administrative proceedings.',
    },
    {
      question: 'Do I need separate lawyers for different legal matters?',
      answer: 'While many lawyers handle general practice, some specialize in specific areas like real estate, tax, or immigration. For complex matters, working with a specialist may be beneficial, though many English-speaking law firms offer comprehensive services.',
    },
  ],
  dentists: [
    {
      question: 'Is dental care in Spain comparable to the UK or US?',
      answer: 'Spanish dental care meets high European standards and is often more affordable than in the UK or US. Many dentists use modern equipment and techniques comparable to those in English-speaking countries, with some practices specifically catering to international patients.',
    },
    {
      question: 'Do I need dental insurance in Spain?',
      answer: 'Dental care is not typically covered by Spanish public health insurance. Private dental insurance or paying out-of-pocket are common options. Many English-speaking dentists offer payment plans or accept international dental insurance.',
    },
    {
      question: 'Can I get emergency dental care as a tourist?',
      answer: 'Yes, tourists can access emergency dental care throughout Spain. Many dentists offer emergency appointments for issues like toothaches, broken teeth, or lost fillings. It is advisable to keep travel insurance that covers dental emergencies.',
    },
    {
      question: 'Are dental records from my home country useful?',
      answer: 'Yes, bringing recent dental records and X-rays from your previous dentist can be very helpful. This information helps your new dentist understand your dental history and provide appropriate continuing care.',
    },
    {
      question: 'What cosmetic dentistry services are available?',
      answer: 'English-speaking dentists in Spain offer comprehensive cosmetic services including teeth whitening, veneers, dental implants, orthodontics, and smile makeovers. Many practices specialize in cosmetic treatments popular with international patients.',
    },
  ],
  accountants: [
    {
      question: 'Do I need to file taxes in Spain as a resident?',
      answer: 'Spanish tax residents must file annual income tax returns (IRPF). Generally, you are considered tax resident if you spend more than 183 days in Spain per year or have your main economic interests in the country. English-speaking accountants can help determine your residency status and filing obligations.',
    },
    {
      question: 'Can an English-speaking accountant help with UK/US tax obligations?',
      answer: 'Many English-speaking accountants in Spain specialize in international tax and can help coordinate your Spanish tax obligations with those in your home country, including understanding tax treaties that prevent double taxation.',
    },
    {
      question: 'What is the Modelo 720 foreign asset declaration?',
      answer: 'Spanish residents must declare overseas assets exceeding certain thresholds using Modelo 720. This includes bank accounts, investments, and property outside Spain. English-speaking accountants can help ensure compliance with this important reporting requirement.',
    },
    {
      question: 'How do VAT (IVA) rules work for businesses?',
      answer: 'Spain has various VAT (IVA) rates depending on goods and services. Businesses must charge appropriate IVA, file periodic returns, and comply with invoicing regulations. An English-speaking accountant can ensure your business meets all VAT obligations.',
    },
    {
      question: 'What accounting records do I need to keep?',
      answer: 'Businesses must maintain proper accounting records including invoices, receipts, and bank statements. Digital records are acceptable. An accountant can set up appropriate record-keeping systems and ensure you meet Spanish accounting requirements.',
    },
  ],
  therapists: [
    {
      question: 'Are therapy services confidential in Spain?',
      answer: 'Yes, therapy sessions are confidential in Spain. Licensed psychologists and therapists are bound by professional secrecy laws. Information shared in therapy cannot be disclosed without your consent, with limited exceptions for imminent safety concerns.',
    },
    {
      question: 'Can I get therapy in English through Spanish public health?',
      answer: 'Public mental health services in Spain are primarily in Spanish. For English-speaking therapy, private practitioners are typically the best option. Some private health insurance plans include mental health coverage for English-speaking therapists.',
    },
    {
      question: 'What types of therapy are available in English?',
      answer: 'English-speaking therapists in Spain offer various approaches including cognitive behavioral therapy (CBT), psychodynamic therapy, couples counseling, family therapy, mindfulness-based therapy, and coaching. Many therapists integrate multiple approaches.',
    },
    {
      question: 'How do I know if a therapist is qualified?',
      answer: 'In Spain, psychologists must be registered with the Official College of Psychologists (Colegio Oficial de Psicólogos). Look for therapists with proper credentials, relevant experience, and who are members of professional associations.',
    },
    {
      question: 'Can therapy help with expat adjustment issues?',
      answer: 'Absolutely. Many English-speaking therapists specialize in expat issues including culture shock, isolation, relationship stress from relocation, and identity challenges. They understand the unique stresses of living abroad and can provide valuable support.',
    },
  ],
  veterinarians: [
    {
      question: 'What vaccinations does my pet need in Spain?',
      answer: 'Dogs must have rabies vaccination and be registered with local authorities. Cats should also be vaccinated against rabies and common feline diseases. Your English-speaking veterinarian can advise on the complete vaccination schedule and legal requirements.',
    },
    {
      question: 'Can English-speaking vets help with pet relocation paperwork?',
      answer: 'Yes, veterinarians familiar with international pet travel can provide health certificates, vaccination records, and microchip documentation needed for pet travel within the EU or to other countries. They understand the specific requirements for different destinations.',
    },
    {
      question: 'Is pet insurance available in Spain?',
      answer: 'Yes, various pet insurance options are available in Spain, covering accidents, illnesses, and sometimes routine care. Many English-speaking veterinarians can recommend insurance providers and help you understand coverage options.',
    },
    {
      question: 'What emergency veterinary services are available?',
      answer: 'Most areas have 24-hour emergency veterinary clinics. English-speaking veterinarians can inform you about local emergency services and after-hours care options for your pets. Keep emergency contact numbers readily available.',
    },
    {
      question: 'Are there breed restrictions in Spain?',
      answer: 'Spain has regulations regarding potentially dangerous dog breeds (perros potencialmente peligrosos) that require special licensing, insurance, and handling. An English-speaking veterinarian can advise on whether these regulations apply to your dog.',
    },
  ],
  realtors: [
    {
      question: 'What fees are involved in buying property in Spain?',
      answer: 'Property purchase costs include transfer tax (6-10% depending on region), notary fees, registry fees, and legal fees. New constructions have VAT (IVA) at 10% instead of transfer tax. Your realtor can provide detailed cost breakdowns.',
    },
    {
      question: 'Do I need a Spanish bank account to buy property?',
      answer: 'While not strictly required, having a Spanish bank account makes property transactions much easier. It is necessary for direct debits for utilities and community fees. Most English-speaking realtors can recommend banks familiar with international clients.',
    },
    {
      question: 'What is the typical property buying process?',
      answer: 'The process usually involves: property search, making an offer, signing a reservation contract with a deposit, due diligence by your lawyer, signing the private purchase contract with 10% deposit, and finally signing the title deed at the notary.',
    },
    {
      question: 'Can foreigners buy property in Spain?',
      answer: 'Yes, there are no restrictions on foreign property ownership in Spain. Non-residents can freely purchase property and will need an NIE (foreigner identification number) to complete the transaction.',
    },
    {
      question: 'What is a community of owners (comunidad de propietarios)?',
      answer: 'Most apartments in Spain belong to a community of owners that maintains common areas and sets rules. Monthly community fees cover maintenance, insurance, and shared services. Your realtor can explain the specific community rules and fees for any property.',
    },
  ],
  mechanics: [
    {
      question: 'What is the ITV and how often is it required?',
      answer: 'The ITV (Inspección Técnica de Vehículos) is Spain\'s mandatory vehicle inspection, similar to the MOT in the UK. New cars need their first ITV after 4 years, then every 2 years until 10 years, and annually thereafter.',
    },
    {
      question: 'Can English-speaking mechanics work on all car brands?',
      answer: 'Most English-speaking mechanics are experienced with European and international vehicles commonly found in Spain. Some specialize in specific brands or types of vehicles. Check with the workshop about their experience with your particular make and model.',
    },
    {
      question: 'What should I do if my car breaks down in Spain?',
      answer: 'Most insurance policies include roadside assistance (asistencia en carretera). English-speaking mechanics can recommend reliable breakdown services. Keep your insurance documents and emergency numbers in your vehicle.',
    },
    {
      question: 'Are car parts for foreign vehicles available?',
      answer: 'Parts for most common international vehicles are available in Spain, though some specialized parts may need to be ordered. English-speaking mechanics often have experience sourcing parts for vehicles popular among the expat community.',
    },
    {
      question: 'What routine maintenance should I schedule?',
      answer: 'Regular maintenance typically includes oil changes every 15,000-20,000 km, brake inspections, tire rotations, and fluid checks. Your mechanic can create a maintenance schedule based on your vehicle and driving habits.',
    },
  ],
  hairdressers: [
    {
      question: 'Do I need to book appointments or can I walk in?',
      answer: 'Most English-speaking salons recommend booking appointments, especially for color services or with specific stylists. Some salons accept walk-ins for cuts, but appointments ensure you get your preferred time and stylist.',
    },
    {
      question: 'How do I communicate the style I want?',
      answer: 'Bringing photos of desired styles is very helpful. English-speaking hairdressers understand international terminology and trends. Be specific about length, color preferences, and any treatments your hair has had previously.',
    },
    {
      question: 'Are hair products used in Spain suitable for all hair types?',
      answer: 'Most salons carry international product lines suitable for diverse hair types. English-speaking hairdressers can recommend products for your specific hair needs and often stock brands familiar to international clients.',
    },
    {
      question: 'What is the typical cost for hair services?',
      answer: 'Prices vary by salon location and stylist experience. Generally, haircuts range from €20-60, color services from €50-150+, and treatments vary widely. English-speaking salons usually provide clear pricing before services.',
    },
    {
      question: 'Can I find stylists experienced with specific hair textures?',
      answer: 'Yes, many English-speaking salons have stylists experienced with diverse hair textures including curly, coily, and chemically treated hair. Ask about specific expertise when booking, especially for specialized services like keratin treatments or extensions.',
    },
  ],
  'fitness-trainers': [
    {
      question: 'Do I need a gym membership to work with a personal trainer?',
      answer: 'Not necessarily. Many personal trainers offer home visits, outdoor sessions, or work from private studios. Some trainers work through gyms requiring membership, while others operate independently. Discuss options when choosing a trainer.',
    },
    {
      question: 'What qualifications should I look for in a trainer?',
      answer: 'Look for internationally recognized certifications such as ACE, NASM, ACSM, or equivalent European qualifications. Many English-speaking trainers also have specialized certifications in areas like yoga, Pilates, or nutrition.',
    },
    {
      question: 'Can trainers help with nutrition planning?',
      answer: 'Many personal trainers offer basic nutrition guidance as part of their services. For detailed meal planning or medical nutrition therapy, they may refer you to a registered dietitian or nutritionist who speaks English.',
    },
    {
      question: 'What is the typical cost for personal training?',
      answer: 'Personal training rates vary by location and trainer experience, typically ranging from €40-100 per hour. Package deals often offer better rates. Group training sessions are usually more affordable per person.',
    },
    {
      question: 'Can I find trainers who specialize in specific goals or conditions?',
      answer: 'Yes, many English-speaking trainers specialize in areas like weight loss, strength training, rehabilitation, pre/post-natal fitness, sports performance, or working with seniors. Ask about specific expertise when selecting a trainer.',
    },
  ],
};

export const getFAQs = (categorySlug: string, citySlug: string): FAQ[] => {
  const category = faqTemplates[categorySlug];
  
  if (category) {
    return category;
  }
  
  // Fallback FAQs
  const city = getCityBySlug(citySlug);
  const categoryData = getCategoryBySlug(categorySlug);
  
  return [
    {
      question: `How do I find a reliable English-speaking ${categoryData?.singular.toLowerCase() || 'professional'} in ${city?.name || 'Spain'}?`,
      answer: `Our directory features verified English-speaking ${categoryData?.name.toLowerCase() || 'professionals'} throughout ${city?.name || 'the city'}. Look for reviews, credentials, and experience with international clients when making your choice.`,
    },
    {
      question: 'Are services typically more expensive for English-speaking clients?',
      answer: 'Generally, pricing is consistent regardless of language. However, some professionals catering specifically to international markets may charge rates comparable to their home countries. Always request quotes before engaging services.',
    },
    {
      question: 'Can I communicate via email or phone in English before booking?',
      answer: 'Yes, English-speaking professionals typically offer communication in English via email, phone, and often WhatsApp. This allows you to discuss your needs before committing to services.',
    },
    {
      question: 'What should I prepare for my first appointment?',
      answer: 'Prepare relevant documentation, a clear description of your needs, and any questions you have. Most professionals will explain their process and what to expect during initial consultations.',
    },
  ];
};
