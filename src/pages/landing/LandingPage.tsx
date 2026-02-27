import React, { useMemo, useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const trackPricingClick = () => {
    if (typeof window === 'undefined') return;
    (window as Window & { umami?: { track?: (eventName: string) => void } }).umami?.track?.(
      'taskluid_pricing_nav_click'
    );
  };

  // Compute values during render to prevent hydration mismatch
  const year = useMemo(() => new Date().getFullYear(), []);

  const highlights = [
    { icon: ListChecks, title: 'Kanban + list views', desc: 'Switch between board and list layouts to match how you work.' },
    { icon: Sparkles, title: 'AI task parsing', desc: 'Turn messy notes into clean, actionable tasks instantly.' },
    { icon: Users, title: 'Team collaboration', desc: 'Assign owners, leave comments, and keep everyone aligned.' },
    { icon: TrendingUp, title: 'Progress analytics', desc: 'Track velocity, blockers, and project health at a glance.' },
    { icon: Zap, title: 'Automations & templates', desc: 'Build repeatable workflows for recurring work.' },
    { icon: Code, title: 'API + webhooks', desc: 'Sync TaskLuid with the rest of your stack.' },
  ];

  const howItWorks = [
    {
      title: 'Onboard clients in seconds',
      desc: 'Create a workspace, invite your client, and start collaborating without the overhead.',
    },
    {
      title: 'Capture work from anywhere',
      desc: 'Email, meeting notes, Slack—turn any input into tasks without switching contexts.',
    },
    {
      title: 'Ship and get paid',
      desc: 'Track progress, share updates, and deliver work that keeps clients coming back.',
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
    { value: 'Minutes', label: 'To Get Started', icon: Zap },
    { value: 'Self-hosted', label: 'Option', icon: Server },
    { value: 'MIT License', label: 'Open source', icon: CheckCircle },
    { value: '40+', label: 'Core features', icon: Award },
  ];

  const testimonials = [
    {
      quote: "Notion was too slow. Trello was too simple. TaskLuid is just right for managing my client projects.",
      author: 'Sarah K.',
      role: 'Freelance Designer',
      avatar: 'SK',
    },
    {
      quote: "I tried Asana but spent more time managing my tasks than doing them. TaskLuid gets out of my way.",
      author: 'Marcus T.',
      role: 'Independent Developer',
      avatar: 'MT',
    },
    {
      quote: "Finally, a PM tool that respects my time. Simple when I need simple, powerful when I need power.",
      author: 'Jenny L.',
      role: 'Marketing Consultant',
      avatar: 'JL',
    },
  ];

  const trustBadges = [
    { icon: Lock, title: 'Privacy First', desc: 'Your data belongs to you' },
    { icon: Shield, title: 'Self-hostable', desc: 'Run on your own infrastructure' },
    { icon: Server, title: 'Open Source', desc: 'MIT licensed, auditable code' },
    { icon: Globe, title: 'Data Control', desc: 'Export or delete anytime' },
  ];

  const usedBy = [
    { name: 'Freelancers', type: 'Solo Pros' },
    { name: 'Small Agencies', type: 'Client Work' },
    { name: 'Indie Teams', type: 'Product' },
    { name: 'Consultants', type: 'Advisory' },
    { name: 'Design Studios', type: 'Creative' },
  ];

  const socialProof = ['Solo freelancers', 'Consultants', 'Agencies', 'Creators', 'Indie builders'];

  const productScreenshots = [
    {
      title: 'Clean Task Board',
      desc: 'Kanban view that stays out of your way',
      gradient: 'from-indigo-500/30 to-purple-500/30',
      icon: ListChecks,
      image: '/p1.jpeg',
    },
    {
      title: 'AI Task Parsing',
      desc: 'Turn messy notes into structured tasks instantly',
      gradient: 'from-emerald-500/30 to-indigo-500/30',
      icon: Sparkles,
      image: '/p2.jpeg',
    },
    {
      title: 'Team Collaboration',
      desc: 'Assign, comment, and track progress together',
      gradient: 'from-purple-500/30 to-pink-500/30',
      icon: Users,
      image: '/p3.jpeg',
    },
  ];

  const screenshotGallery = [
    {
      title: 'Project dashboard overview',
      desc: 'See priorities, owners, and progress in one view.',
      src: '/i1.jpg',
    },
    {
      title: 'Task detail + activity',
      desc: 'Conversation, checklists, and context alongside every task.',
      src: '/i4.jpg',
    },
    {
      title: 'Analytics & milestones',
      desc: 'Track velocity, deadlines, and team workload visually.',
      src: '/i7.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">TaskLuid</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/compare" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Compare
            </Link>
            <Link
              to="/pricing"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
              onClick={trackPricingClick}
            >
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
                to="/compare"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Compare
              </Link>
              <Link
                to="/pricing"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => {
                  trackPricingClick();
                  setIsMobileMenuOpen(false);
                }}
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

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 pt-14 pb-12">
        <div className="text-center max-w-3xl">
          {/* What's New */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-neutral-300">What&apos;s new: Simple pricing — Free + Pro (€10/mo or €8/mo annually)</span>
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
          <p className="text-xl text-gray-200 mb-2 max-w-2xl mx-auto">
            Powerful simplicity for freelancers and small teams.
          </p>
          <p className="text-lg text-indigo-300 mb-4 max-w-2xl mx-auto font-medium">
            Powerful without the bloat. Simple enough to start, scalable enough to grow.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            The Goldilocks zone between basic boards and enterprise bloat.{' '}
            <Link to="/compare" className="text-neutral-300 underline underline-offset-4 hover:text-white">
              See the comparison
            </Link>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-neutral-300 mb-8">
            <span className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60">Free plan included</span>
            <span className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60">Pro €10/mo (or €8/mo annually)</span>
            <Link to="/pricing" className="text-indigo-300 hover:text-indigo-200 transition-colors">
              See full pricing
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
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
          <p className="text-xs text-neutral-500 mb-10">
            Free plan available. Pro starts at <span className="text-neutral-300">€10/month</span> (or €8/month annually).{' '}
            <Link to="/pricing" className="text-neutral-200 underline underline-offset-4 hover:text-white">See full pricing</Link>.
          </p>

          {/* Hero Screenshot */}
          <div className="mb-10">
            <div className="relative mx-auto max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900/40 p-2 shadow-2xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
              <img
                src="/i1.jpg"
                alt="TaskLuid dashboard preview"
                className="relative w-full rounded-xl border border-neutral-800 object-cover"
                loading="lazy"
              />
            </div>
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

      {/* Comparison - TaskLuid vs Jira vs ClickUp vs Trello */}
      <section className="px-4 py-16 border-t border-neutral-900 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">TaskLuid vs Jira vs ClickUp vs Trello</p>
            <h2 className="text-3xl font-semibold">Powerful without the bloat</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              Built for freelancers, small agencies, and indie teams who need real project power without enterprise overhead.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Trello - Too Light */}
            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800 opacity-70">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">T</div>
                <h3 className="font-semibold text-neutral-400">Trello</h3>
              </div>
              <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Too Light</div>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Limited timelines and dependencies
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Hard to manage multiple clients
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Minimal reporting and analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Not built for growing teams
                </li>
              </ul>
            </div>
            {/* ClickUp - Feature Bloat */}
            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800 opacity-70">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">C</div>
                <h3 className="font-semibold text-neutral-400">ClickUp</h3>
              </div>
              <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Feature Bloat</div>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Too many views and settings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Slow onboarding for small teams
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Overkill for client work
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Feels heavy for day-to-day use
                </li>
              </ul>
            </div>
            {/* Jira - Enterprise Only */}
            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800 opacity-70">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">J</div>
                <h3 className="font-semibold text-neutral-400">Jira</h3>
              </div>
              <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Enterprise Only</div>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Complex workflows and admin overhead
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Built for large orgs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Heavy process for small teams
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Expensive at scale
                </li>
              </ul>
            </div>
            {/* TaskLuid - Just Right */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">TaskLuid</h3>
              </div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 mb-3">Just Right ✓</div>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> 40+ core features without clutter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Fast setup in minutes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Built for client work and indie teams
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Clean timelines, tasks, and collaboration
                </li>
              </ul>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {screenshotGallery.map((shot) => (
              <div
                key={shot.title}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl"
              >
                <div className="relative">
                  <img
                    src={shot.src}
                    alt={shot.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-1">{shot.title}</h3>
                  <p className="text-xs text-neutral-400">{shot.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Demo Preview */}
          <div className="relative mb-8 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/30">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
            <div className="p-4 sm:p-8">
              <img
                src="/i2.jpg"
                alt="TaskLuid dashboard preview"
                className="w-full rounded-xl border border-neutral-800 object-cover shadow-2xl"
                loading="lazy"
              />
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
                  <div className="w-full mb-4 rounded-lg border border-neutral-800 bg-neutral-950/60 overflow-hidden">
                    <img
                      src={screenshot.image}
                      alt={screenshot.title}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  </div>
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

      {/* Freelancer-Specific Features */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Built for how you work</p>
            <h2 className="text-3xl font-semibold">Freelancer + small-team features</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              Everything you need to manage client work—nothing you don't.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Multi-Client Workspaces</h3>
              <p className="text-sm text-neutral-400">Separate workspaces for each client. Keep projects organized and private.</p>
            </div>
            <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Client-Facing Timelines</h3>
              <p className="text-sm text-neutral-400">Share project timelines with clients. Set expectations and hit deadlines.</p>
            </div>
            <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">AI Task Parsing</h3>
              <p className="text-sm text-neutral-400">Paste client emails or notes. AI converts them into structured tasks instantly.</p>
            </div>
            <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Progress Reports</h3>
              <p className="text-sm text-neutral-400">Generate progress updates for clients in seconds. Keep them informed effortlessly.</p>
            </div>
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
                <span className="text-sm text-neutral-400">€0 / month</span>
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
                <div className="text-right">
                  <span className="text-sm text-neutral-300">€10 / month</span>
                  <p className="text-xs text-emerald-400">or €8 / month annually</p>
                </div>
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
