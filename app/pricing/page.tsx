'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap,
  Building2,
  MessageSquare,
  BarChart3,
  Globe,
  HeadphonesIcon,
  Star,
  ArrowRight
} from 'lucide-react';

interface Plan {
  name: string;
  price: number;
  interval: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Free Listing',
    price: 0,
    interval: 'month',
    description: 'Get discovered by English-speaking customers in Spain.',
    features: [
      { text: 'Basic business profile', included: true },
      { text: 'Appear in search results', included: true },
      { text: 'Contact information displayed', included: true },
      { text: 'Customer reviews', included: true },
      { text: 'Priority placement', included: false },
      { text: 'Lead notifications', included: false },
      { text: 'Analytics dashboard', included: false },
      { text: 'Verified badge', included: false },
      { text: 'Featured on homepage', included: false },
      { text: 'Dedicated support', included: false },
    ],
    cta: 'Claim Free Listing',
    ctaLink: '/admin/claims',
  },
  {
    name: 'Professional',
    price: 29,
    interval: 'month',
    description: 'Everything you need to grow your English-speaking clientele.',
    features: [
      { text: 'Everything in Free, plus:', included: true },
      { text: 'Priority placement in search', included: true },
      { text: 'Instant lead notifications', included: true },
      { text: 'Full analytics dashboard', included: true },
      { text: 'Verified business badge', included: true },
      { text: 'Featured on homepage', included: true },
      { text: 'Dedicated email support', included: true },
      { text: 'Custom business description', included: true },
      { text: 'Multiple location support', included: true },
      { text: 'API access', included: false },
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/dashboard',
    popular: true,
  },
];

const benefits = [
  { icon: Globe, text: 'Reach thousands of English-speaking expats' },
  { icon: Building2, text: 'Professional directory presence' },
  { icon: MessageSquare, text: 'Direct customer inquiries' },
  { icon: BarChart3, text: 'Track profile performance' },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const annualDiscount = 0.20; // 20% discount

  const getPrice = (plan: Plan) => {
    if (plan.price === 0) return 'Free';
    if (isAnnual) {
      const annualPrice = Math.round(plan.price * (1 - annualDiscount));
      return `€${annualPrice}`;
    }
    return `€${plan.price}`;
  };

  const getInterval = (plan: Plan) => {
    if (plan.price === 0) return 'forever';
    return isAnnual ? '/month, billed annually' : '/month';
  };

  const getAnnualSavings = (plan: Plan) => {
    if (plan.price === 0 || !isAnnual) return null;
    const monthlyCost = plan.price * 12;
    const annualCost = Math.round(plan.price * (1 - annualDiscount)) * 12;
    return monthlyCost - annualCost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--primary)]">España</span>
            <span className="text-lg font-medium text-foreground">English</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/search" 
              className="text-sm text-gray-600 hover:text-[var(--primary)] transition-colors"
            >
              Browse Directory
            </Link>
            <Link 
              href="/admin/claims" 
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
            >
              Claim Listing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Grow your English-speaking clientele
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the premier directory connecting English-speaking professionals with expats and international clients across Spain.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? 'bg-[var(--primary)]' : 'bg-gray-300'
              }`}
              aria-label="Toggle annual billing"
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-xl scale-105'
                    : 'bg-white border border-gray-200 hover:border-[var(--primary)]/50 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-[var(--secondary)] text-gray-900 text-sm font-medium rounded-full flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {getPrice(plan)}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-500'}`}>
                        {getInterval(plan)}
                      </span>
                    )}
                  </div>
                  {getAnnualSavings(plan) && (
                    <p className="text-green-400 text-sm mt-1">
                      Save €{getAnnualSavings(plan)}/year
                    </p>
                  )}
                </div>

                <Link
                  href={plan.ctaLink}
                  className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors mb-8 ${
                    plan.popular
                      ? 'bg-white text-[var(--primary)] hover:bg-gray-100'
                      : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                      ) : (
                        <X className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-white/40' : 'text-gray-300'}`} />
                      )}
                      <span className={`text-sm ${
                        feature.included
                          ? plan.popular ? 'text-white' : 'text-gray-700'
                          : plan.popular ? 'text-white/50' : 'text-gray-400'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Why professionals choose España English
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I start with a free listing?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! Every business starts with a free listing. You can upgrade to Professional at any time to unlock premium features.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                How do I receive leads from potential customers?
              </h3>
              <p className="text-gray-600 text-sm">
                Professional members receive instant email notifications when potential customers inquire about their services. Free listings can view inquiries in their dashboard.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my Professional subscription?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel anytime. Your Professional features will remain active until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What types of businesses can list?
              </h3>
              <p className="text-gray-600 text-sm">
                We welcome any business that serves English-speaking clients in Spain: healthcare providers, legal professionals, real estate agents, home services, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to reach more English-speaking clients?
          </h2>
          <p className="text-gray-600 mb-8">
            Join hundreds of professionals already growing their business with España English.
          </p>
          <Link
            href="/admin/claims"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            Claim Your Free Listing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} España English Directory. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/search" className="text-sm text-gray-500 hover:text-[var(--primary)] transition-colors">
              Browse Directory
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-[var(--primary)] transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
