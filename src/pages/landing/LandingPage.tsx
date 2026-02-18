import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Zap,
  Shield,
  Heart,
  MessageCircle,
  Code,
  Sparkles,
  Users,
  BarChart3,
  Calendar,
  BadgeCheck,
} from 'lucide-react';

const LandingPage = () => {
  // Compute values during render to prevent hydration mismatch
  const year = useMemo(() => new Date().getFullYear(), []);

  const highlights = [
    { icon: Sparkles, title: 'AI-assisted workflows', desc: 'Turn notes into tasks and keep momentum.' },
    { icon: Users, title: 'Team-ready', desc: 'Assign work, add context, and stay aligned.' },
    { icon: BarChart3, title: 'Clear progress', desc: 'Track priorities, blockers, and outcomes fast.' },
    { icon: Calendar, title: 'Timelines that stick', desc: 'Deadlines and milestones that actually help.' },
    { icon: Shield, title: 'Privacy-first', desc: 'Your data stays yours, always.' },
    { icon: Code, title: 'API + webhooks', desc: 'Integrate TaskLuid with your stack.' },
  ];

  const howItWorks = [
    {
      title: 'Capture work in seconds',
      desc: 'Log tasks, attach context, and assign owners without the overhead.',
    },
    {
      title: 'Prioritize with clarity',
      desc: 'Group by status, milestones, or deadlines to keep the team aligned.',
    },
    {
      title: 'Ship with momentum',
      desc: 'Track progress, remove blockers, and close the loop faster.',
    },
  ];

  const trustPoints = [
    { icon: Heart, text: 'Crafted with care by an indie developer' },
    { icon: CheckCircle, text: 'No VC funding, no feature bloat' },
    { icon: MessageCircle, text: 'Direct, responsive support' },
  ];

  const socialProof = ['Indie teams', 'Solo builders', 'Remote-first crews', 'Product studios'];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 pt-14 pb-12">
        <div className="text-center max-w-3xl">
          {/* What's New */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-neutral-300">What&apos;s new: Simple pricing — Free + Pro (EUR 10/mo)</span>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-neutral-400">Made with love by an independent developer</span>
          </div>

          <p className="text-sm text-neutral-500 mb-2">Part of Luid Suite</p>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            TaskLuid
          </h1>
          <p className="text-xl text-gray-200 mb-4 max-w-2xl mx-auto">
            The lightweight project hub for teams who want to ship without the bloat.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            Free to start. Upgrade when you need more power.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-indigo-500/20"
            >
              Get Started Free
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              View Pricing
            </Link>
            <Link
              to="/auth/login"
              className="w-full sm:w-auto px-8 py-4 border border-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wide text-neutral-500 mb-10">
            {socialProof.map((item) => (
              <span key={item} className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60">
                {item}
              </span>
            ))}
          </div>

          {/* Indie Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trustPoints.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                <item.icon className="w-4 h-4 text-emerald-500" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Why teams switch</p>
            <h2 className="text-3xl font-semibold">Everything you need — nothing you don&apos;t</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((feature, idx) => (
              <div
                key={idx}
                className="text-left p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">How it works</p>
            <h2 className="text-3xl font-semibold">A simple flow from idea to done</h2>
            <p className="text-sm text-neutral-500 mt-2">Keep the workflow lightweight without losing accountability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Step {idx + 1}</div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-10">
            <p className="text-sm text-neutral-500 mb-2">Simple pricing</p>
            <h2 className="text-3xl font-semibold">Start free, upgrade when you grow</h2>
            <p className="text-sm text-neutral-500 mt-2">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Free</h3>
                <span className="text-sm text-neutral-400">EUR 0 / month</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">Perfect for personal task management.</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />Basic tasks and projects</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />Workspace collaboration</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />Community support</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">TaskLuid Pro</h3>
                <span className="text-sm text-neutral-300">EUR 10 / month</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">Monthly credits and premium workflows.</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-300" />Higher credit allowance</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-300" />AI task parsing</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-300" />Priority support</li>
              </ul>
            </div>
          </div>
          <div className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </section>

      {/* Personal Commitment */}
      <section className="px-4 py-12 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-lg text-neutral-300 italic mb-4">
            "I built TaskLuid because I was tired of bloated project management tools.
            This is software made by a human, for humans."
          </blockquote>
          <p className="text-sm text-neutral-500">— The Developer</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500" suppressHydrationWarning>
            &copy; {year} Luid Suite
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-neutral-400 hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-neutral-400 hover:text-gray-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-neutral-400 hover:text-gray-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
