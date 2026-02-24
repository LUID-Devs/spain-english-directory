import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Zap,
  CheckCircle,
  Sparkles,
  Heart,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  tooltip?: string;
}

const planFeatures: PlanFeature[] = [
  { name: 'Projects', free: 'Unlimited', pro: 'Unlimited' },
  { name: 'Tasks', free: 'Unlimited', pro: 'Unlimited' },
  { name: 'Team members', free: 'Up to 3', pro: 'Unlimited' },
  { name: 'Storage', free: '100 MB', pro: '10 GB' },
  { name: 'API access', free: false, pro: true },
  { name: 'Webhooks', free: false, pro: true },
  { name: 'Time tracking', free: 'Basic', pro: 'Advanced' },
  { name: 'Custom fields', free: '3 per project', pro: 'Unlimited' },
  { name: 'Analytics dashboard', free: 'Basic', pro: 'Advanced' },
  { name: 'Priority support', free: false, pro: true },
  { name: 'Export data (CSV, JSON)', free: true, pro: true },
  { name: 'AI task parsing', free: '10/month', pro: '500/month' },
  { name: 'Automation rules', free: false, pro: 'Unlimited' },
  { name: 'SSO / SAML', free: false, pro: 'Coming soon' },
];

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const monthlyPrice = 10;
  const annualPrice = 8; // per month when billed annually
  const annualSavings = ((monthlyPrice - annualPrice) * 12).toFixed(0);

  const handlePlanSelect = (plan: 'free' | 'pro') => {
    if (plan === 'free') {
      window.location.href = '/auth/register';
    } else {
      // Redirect to billing portal for Pro
      const billingUrl = import.meta.env.VITE_BILLING_URL || '/app/pricing';
      window.location.href = billingUrl;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">TaskLuid</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/features" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-white transition-colors">
              Pricing
            </Link>
            <Link to="/auth/login" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="text-sm px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-900 bg-black/95">
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link
                to="/features"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/auth/login"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="text-sm inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-neutral-400">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
            Start free, upgrade when you need more power. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-neutral-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-indigo-500"
            />
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-neutral-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                Save €{annualSavings}/year
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Free Plan */}
            <Card className="relative bg-neutral-900/50 border-neutral-800 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Free</h3>
                    <p className="text-sm text-neutral-500">For individuals & small teams</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">€0</span>
                  <span className="text-neutral-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    'Unlimited projects & tasks',
                    'Up to 3 team members',
                    '100 MB storage',
                    'Basic analytics',
                    'Email support',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-6 border-neutral-700 hover:bg-neutral-800"
                  onClick={() => handlePlanSelect('free')}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative bg-gradient-to-b from-indigo-950/50 to-neutral-900/50 border-indigo-500/30 overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-bl-lg">
                Most Popular
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Pro</h3>
                    <p className="text-sm text-neutral-500">For growing teams</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    €{isAnnual ? annualPrice : monthlyPrice}
                  </span>
                  <span className="text-neutral-500">/month</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-emerald-400">
                    €{annualPrice * 12} billed annually (save €{annualSavings})
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    'Everything in Free, plus:',
                    'Unlimited team members',
                    '10 GB storage',
                    'Advanced analytics & reports',
                    'API access & webhooks',
                    'Priority support',
                    '500 AI task parses/month',
                    'Unlimited automation rules',
                  ].map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-3 text-sm ${
                        idx === 0 ? 'text-indigo-400 font-medium' : 'text-neutral-300'
                      }`}
                    >
                      {idx === 0 ? (
                        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={() => handlePlanSelect('pro')}
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Compare all features</h2>
            <p className="text-neutral-400">Everything you need to know about our plans</p>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-neutral-800 bg-neutral-900/50">
              <div className="text-sm font-medium text-neutral-400">Feature</div>
              <div className="text-center text-sm font-medium text-neutral-400">Free</div>
              <div className="text-center text-sm font-medium text-indigo-400">Pro</div>
            </div>

            {/* Table Body */}
            {planFeatures.map((feature, idx) => (
              <div
                key={feature.name}
                className={`grid grid-cols-3 gap-4 p-4 ${
                  idx !== planFeatures.length - 1 ? 'border-b border-neutral-800/50' : ''
                } hover:bg-neutral-800/30 transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-300">{feature.name}</span>
                </div>
                <div className="text-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-neutral-600 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm text-neutral-400">{feature.free}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-neutral-600 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm text-indigo-400 font-medium">{feature.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I switch between monthly and annual billing?',
                a: 'Yes, you can switch at any time. If you switch to annual, you\'ll be charged the annual rate at your next billing cycle.',
              },
              {
                q: 'What happens when I hit the free plan limits?',
                a: 'You\'ll be prompted to upgrade to Pro. We\'ll never delete your data — you\'ll just need to upgrade to add more team members or access advanced features.',
              },
              {
                q: 'Is there a trial for the Pro plan?',
                a: 'No trial needed — the Free plan lets you explore most features. Upgrade to Pro when you\'re ready for the advanced features.',
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Absolutely. You can cancel at any time and you\'ll continue to have Pro access until the end of your billing period.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'If you\'re not satisfied, contact us within 14 days of your purchase for a full refund.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-neutral-800 pb-6 last:border-0">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-neutral-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-neutral-400 mb-8">
            Join thousands of teams shipping faster with TaskLuid.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-8"
              onClick={() => handlePlanSelect('free')}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-neutral-700 hover:bg-neutral-800 px-8"
              onClick={() => window.location.href = 'mailto:support@taskluid.com'}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">TaskLuid</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-neutral-300 transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-neutral-300 transition-colors">Cookies</Link>
          </div>
          <p className="text-sm text-neutral-600">
            © {new Date().getFullYear()} TaskLuid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
