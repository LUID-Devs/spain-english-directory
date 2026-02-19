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
  MessageSquare,
  Headphones,
  ListChecks,
  Star,
  Lock,
  Server,
  Globe,
  TrendingUp,
  Award,
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

  const intakeSteps = [
    {
      icon: Headphones,
      title: 'Capture real conversations',
      desc: 'Drop in call transcripts, chats, and support tickets in one place.',
    },
    {
      icon: MessageSquare,
      title: 'AI tags pain points',
      desc: 'The agent surfaces themes, sentiment, and urgency automatically.',
    },
    {
      icon: ListChecks,
      title: 'Convert insights to tasks',
      desc: 'Create prioritized tasks with source context attached.',
    },
  ];

  // Trust & Social Proof Data
  const trustPoints = [
    { icon: Heart, text: 'Crafted with care by an indie developer' },
    { icon: CheckCircle, text: 'No VC funding, no feature bloat' },
    { icon: MessageCircle, text: 'Direct, responsive support' },
  ];

  const stats = [
    { value: 'Growing', label: 'Community', icon: Users },
    { value: 'Self-hosted', label: 'Option', icon: Server },
    { value: 'MIT License', label: 'Open source', icon: CheckCircle },
    { value: 'Active', label: 'Development', icon: Star },
  ];

  const testimonials = [
    {
      quote: "Simple, focused, and exactly what I needed. No bloat, no complexity—just task management that works.",
      author: 'Early Adopter',
      role: 'Indie Developer',
      avatar: 'EA',
    },
    {
      quote: "The AI task parsing is genuinely useful. I paste my messy notes and it organizes them instantly.",
      author: 'Beta Tester',
      role: 'Product Builder',
      avatar: 'BT',
    },
    {
      quote: "Love that I can self-host it. My data stays on my own servers and I control everything.",
      author: 'Self-hosted User',
      role: 'Privacy-focused Team',
      avatar: 'SH',
    },
  ];

  const trustBadges = [
    { icon: Lock, title: 'Privacy First', desc: 'Your data belongs to you' },
    { icon: Shield, title: 'Self-hostable', desc: 'Run on your own infrastructure' },
    { icon: Server, title: 'Open Source', desc: 'MIT licensed, auditable code' },
    { icon: Globe, title: 'Data Control', desc: 'Export or delete anytime' },
  ];

  const usedBy = [
    { name: 'Indie Hackers', type: 'Community' },
    { name: 'Open Source Teams', type: 'Developers' },
    { name: 'Small Agencies', type: 'Service' },
    { name: 'Bootstrapped Startups', type: 'Product' },
    { name: 'Remote Teams', type: 'Distributed' },
  ];

  const socialProof = ['Indie teams', 'Solo builders', 'Remote-first crews', 'Product studios'];

  const productScreenshots = [
    {
      title: 'Clean Task Board',
      desc: 'Kanban view that stays out of your way',
      gradient: 'from-indigo-500/30 to-purple-500/30',
      icon: ListChecks,
    },
    {
      title: 'AI Task Parsing',
      desc: 'Turn messy notes into structured tasks instantly',
      gradient: 'from-emerald-500/30 to-indigo-500/30',
      icon: Sparkles,
    },
    {
      title: 'Team Collaboration',
      desc: 'Assign, comment, and track progress together',
      gradient: 'from-purple-500/30 to-pink-500/30',
      icon: Users,
    },
  ];

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

      {/* Stats Bar - Social Proof */}
      <section className="px-4 py-10 border-t border-neutral-900 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5 text-indigo-400" />
                  <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Product Screenshots / Demo */}
      <section className="px-4 py-16 border-t border-neutral-900 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">See it in action</p>
            <h2 className="text-3xl font-semibold">Built for focus, designed for flow</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              A clean interface that gets out of your way. No clutter, no steep learning curve.
            </p>
          </div>

          {/* Main Demo Preview */}
          <div className="relative mb-8 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/30">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
            <div className="p-4 sm:p-8">
              {/* Mock Dashboard UI */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
                {/* Mock Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-800/50 text-xs text-neutral-400">
                      <div className="w-3 h-3 rounded bg-indigo-500/50" />
                      TaskLuid Dashboard
                    </div>
                  </div>
                </div>
                {/* Mock Content */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Sidebar Mock */}
                  <div className="hidden lg:block space-y-2">
                    <div className="h-8 w-32 rounded bg-neutral-800/50" />
                    <div className="h-6 w-24 rounded bg-neutral-800/30 mt-4" />
                    <div className="h-6 w-28 rounded bg-neutral-800/30" />
                    <div className="h-6 w-20 rounded bg-neutral-800/30" />
                    <div className="h-6 w-24 rounded bg-neutral-800/30" />
                  </div>
                  {/* Main Content Mock */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 w-32 rounded bg-neutral-800/50" />
                      <div className="h-8 w-24 rounded bg-indigo-500/30" />
                    </div>
                    {/* Task Cards Mock */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
                        <div className="w-4 h-4 rounded border-2 border-emerald-500/50" />
                        <div className="flex-1 h-4 w-48 rounded bg-neutral-700/50" />
                        <div className="h-5 w-16 rounded-full bg-indigo-500/20" />
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
                        <div className="w-4 h-4 rounded border-2 border-amber-500/50" />
                        <div className="flex-1 h-4 w-64 rounded bg-neutral-700/50" />
                        <div className="h-5 w-20 rounded-full bg-purple-500/20" />
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
                        <div className="w-4 h-4 rounded border-2 border-neutral-600" />
                        <div className="flex-1 h-4 w-40 rounded bg-neutral-700/50" />
                        <div className="h-5 w-14 rounded-full bg-emerald-500/20" />
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
                        <div className="w-4 h-4 rounded border-2 border-neutral-600" />
                        <div className="flex-1 h-4 w-56 rounded bg-neutral-700/50" />
                        <div className="h-5 w-16 rounded-full bg-amber-500/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productScreenshots.map((screenshot, idx) => (
              <div
                key={idx}
                className="group relative p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700 transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${screenshot.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-neutral-700">
                    <screenshot.icon className="w-5 h-5 text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{screenshot.title}</h3>
                  <p className="text-sm text-neutral-400">{screenshot.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-800 transition-all duration-300"
            >
              Try it free — no credit card required
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Social Proof */}
      <section className="px-4 py-16 border-t border-neutral-900 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-4">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-neutral-300">Loved by indie teams</span>
            </div>
            <h2 className="text-3xl font-semibold">What our users say</h2>
            <p className="text-sm text-neutral-500 mt-2">Real feedback from real teams shipping real products.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-neutral-300 mb-6 text-sm leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.author}</p>
                    <p className="text-xs text-neutral-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges - Security & Compliance */}
      <section className="px-4 py-12 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm text-neutral-500 mb-2">Your data is safe with us</p>
            <h2 className="text-2xl font-semibold">Enterprise-grade security</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center hover:bg-neutral-900/50 transition-colors"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 flex items-center justify-center">
                  <badge.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{badge.title}</h3>
                <p className="text-xs text-neutral-500">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Used By - Company Social Proof */}
      <section className="px-4 py-10 border-t border-neutral-900 bg-neutral-950/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-6">Trusted by innovative teams</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {usedBy.map((company, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-indigo-300">
                    {company.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-neutral-300">{company.name}</p>
                  <p className="text-xs text-neutral-500">{company.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Conversation Intake */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-sm text-neutral-500 mb-2">New AI workflow</p>
            <h2 className="text-3xl font-semibold">AI agent for customer conversation intake</h2>
            <p className="text-sm text-neutral-500 mt-3 max-w-xl">
              Centralize customer feedback from calls, chats, and tickets. The agent summarizes the signal and spins up
              tasks your team can act on.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-neutral-500">
              {['Calls', 'Chats', 'Emails', 'Tickets', 'Feedback forms'].map((item) => (
                <span key={item} className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-800 transition-all duration-300"
              >
                Start intake workflow
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {intakeSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-sm text-neutral-400">{step.desc}</p>
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
          {/* Satisfaction Guarantee */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">30-day money-back guarantee — no questions asked</span>
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
      <footer className="border-t border-neutral-800">
        {/* Luid Suite Cross-Promotion */}
        <div className="py-8 px-4 bg-gradient-to-r from-neutral-900/50 via-neutral-900/30 to-neutral-900/50">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm text-neutral-500 mb-4">Also part of the Luid Suite</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
              <a
                href="https://resumeluid.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors group"
              >
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">ResumeLuid</p>
                  <p className="text-xs text-neutral-500">AI-powered resume builder</p>
                </div>
              </a>
              <a
                href="https://fileconvertpro.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors group"
              >
                <span className="text-lg">🔄</span>
                <div>
                  <p className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">FileConvertPro</p>
                  <p className="text-xs text-neutral-500">Universal file conversion</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="py-6 px-4 border-t border-neutral-800/50">
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
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
