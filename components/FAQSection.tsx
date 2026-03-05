interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  cityName: string;
  categoryName: string;
}

export default function FAQSection({ faqs, cityName, categoryName }: FAQSectionProps) {
  // Generate FAQPage schema
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="mt-12 pt-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions about {categoryName} in {cityName}
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6"
              itemScope
              itemType="https://schema.org/Question"
            >
              <h3 className="font-semibold text-gray-900 mb-2" itemProp="name">
                {faq.question}
              </h3>
              <div itemScope itemType="https://schema.org/Answer">
                <p className="text-gray-600 leading-relaxed" itemProp="text">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
