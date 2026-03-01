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
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Mail,
} from 'lucide-react';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setNewsletterStatus('success');
      setEmail('');
    }
  };

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
    { icon: Star, title: 'Access all Luid apps', desc: 'One subscription unlocks every product in the Luid Suite.' },
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
    { value: '40+', label: 'Core features', icon: ListChecks },
    { value: 'Free Forever', label: 'Starter plan', icon: CheckCircle },
    { value: 'Pro', label: '€8/month', icon: Sparkles },
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
    { name: 'Consultants', type: 'Advisory' },
    { name: 'Design Studios', type: 'Creative' },
    { name: 'Dev Agencies', type: 'Service' },
    { name: 'Content Creators', type: 'Media' },
  ];

  const socialProof = ['Solo freelancers', 'Consultants', 'Agencies', 'Creators', 'Indie builders'];

  const faqItems = [
    {
      question: 'Is TaskLuid free to use?',
      answer: 'Yes! TaskLuid offers a free forever plan with unlimited projects, tasks, and up to 3 team members. You only pay when you need more features like unlimited team members, more storage, or AI credits.'
    },
    {
      question: 'Can I self-host TaskLuid?',
      answer: 'Yes, TaskLuid is open-source and MIT licensed. You can run it on your own infrastructure with full control over your data.'
    },
    {
      question: 'How does the AI task parsing work?',
      answer: 'Simply paste messy notes, emails, or meeting transcripts into TaskLuid. Our AI will automatically convert them into structured, actionable tasks with titles, descriptions, and priorities.'
    },
    {
      question: 'What are AI credits?',
      answer: 'AI credits are used for AI-powered features like task parsing, resume optimization, and file conversion. The free plan includes 10 credits/month, while Pro includes 500 credits/month.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Absolutely. Your data belongs to you. You can export your projects and tasks at any time in standard formats.'
    },
  ];

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
            <Link to="/suite" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Luid Suite
            </Link>
            <Link to="/resumeluid" className="text-sm text-neutral-400 hover:text-white transition-colors">
              ResumeLuid
            </Link>
            <Link to="/luidkit" className="text-sm text-neutral-400 hover:text-white transition-colors">
              LuidKit
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
                to="/suite"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Luid Suite
              </Link>
              <Link
                to="/resumeluid"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ResumeLuid
              </Link>
              <Link
                to="/luidkit"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                LuidKit
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
            <span className="text-sm text-neutral-300">Simple pricing: Start free, Pro at €8/month (billed annually)</span>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-neutral-400">Made with love by an independent developer</span>
          </div>

          <p className="text-sm text-neutral-500 mb-2">Part of Luid Suite</p>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            Project management that&apos;s just right for freelancers
          </h1>
          <p className="text-xl text-gray-200 mb-2 max-w-2xl mx-auto">
            Powerful simplicity for freelancers and small teams.
          </p>
          <p className="text-lg text-indigo-300 mb-2 max-w-2xl mx-auto font-medium">
            Powerful without the bloat.
          </p>
          <p className="text-lg text-indigo-300 mb-4 max-w-2xl mx-auto font-medium">
            Powerful without the bloat. Simple enough to start, scalable enough to grow.
          </p>
          <p className="text-sm text-neutral-400 mb-2">
            Built for freelancers, small agencies, and indie teams.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            Not too basic like Trello. Not too complex like Jira or ClickUp. Just right.{' '}
            <Link to="/compare" className="text-neutral-300 underline underline-offset-4 hover:text-white">
              See the comparison
            </Link>.
          </p>

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
            <span className="text-emerald-400 font-medium">Free forever</span> plan available. Pro: <span className="text-neutral-300">€8/month</span> (billed annually) or €10/month.{' '}
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
            <p className="text-sm text-neutral-500 mb-2">Built for freelancers (and small teams)</p>
            <h2 className="text-3xl font-semibold">The essentials to deliver client work</h2>
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

      {/* Comparison */}
      <section className="px-4 py-16 border-t border-neutral-900 bg-neutral-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Why TaskLuid</p>
            <h2 className="text-3xl font-semibold">Power without the bloat</h2>
            <p className="text-sm text-neutral-500 mt-2">
              Built for freelancers and small teams who need clarity, not complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Trello - Too Simple */}
            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800 opacity-70">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">T</div>
                <h3 className="font-semibold text-neutral-400">Trello</h3>
              </div>
              <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Too Simple</div>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-neutral-600" />
                  Built for large teams with complex processes
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-neutral-600" />
                  Hundreds of options before you can start
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Limited reporting for client updates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> No workflow automation
                </li>
              </ul>
            </div>
            {/* Jira - Too Heavy */}
            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800 opacity-70">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-sky-500/20 flex items-center justify-center text-xs font-bold text-sky-400">J</div>
                <h3 className="font-semibold text-neutral-400">Jira</h3>
              </div>
              <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Too Heavy</div>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  Focused on freelancers and small teams
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Admin overhead for small teams
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Too many workflows to manage
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Built for enterprise processes
                </li>
              </ul>
            </div>
            {/* ClickUp - Too Bloated */}
            <div className="p-6 rounded-xl bg-neutral-900/30 border border-neutral-800 opacity-70">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-pink-500/20 flex items-center justify-center text-xs font-bold text-pink-400">C</div>
                <h3 className="font-semibold text-neutral-400">ClickUp</h3>
              </div>
              <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Too Bloated</div>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Feature overload you never use
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Setup takes hours, not minutes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> Too many views and settings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span> More managing than doing
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
                  <span className="text-emerald-400">✓</span> Client projects with clear timelines
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Multiple workspaces per client
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Start in minutes, no setup required
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> 40+ core features, not 400
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-neutral-400">
            Bottom line: TaskLuid gives you the power you need — without the bloat you don&apos;t.
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
            <h2 className="text-3xl font-semibold">Freelancer-first features</h2>
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

      {/* Credit System Visual Explanation */}
      <section className="px-4 py-12 border-t border-neutral-900 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <p className="text-sm text-neutral-500 mb-2">How credits work</p>
            <h2 className="text-3xl font-semibold">AI credits included every month</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              Use credits for AI task parsing, resume building, and file conversion. 
              Unused credits roll over for up to 3 months.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-neutral-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Free Plan</h3>
                  <p className="text-sm text-neutral-500">€0/month</p>
                </div>
              </div>
              <div className="relative pt-6 pb-2">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-neutral-300">10</span>
                  <span className="text-sm text-neutral-500 mb-2">credits/mo</span>
                </div>
                <div className="mt-4 w-full bg-neutral-800 rounded-full h-2">
                  <div className="bg-neutral-600 h-2 rounded-full" style={{ width: '10%' }} />
                </div>
                <p className="text-xs text-neutral-500 mt-2">Perfect for trying out AI features</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Zap className="w-6 h-4 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Pro Plan</h3>
                  <p className="text-sm text-emerald-400">€8/month (annual)</p>
                </div>
              </div>
              <div className="relative pt-6 pb-2">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-white">500</span>
                  <span className="text-sm text-indigo-300 mb-2">credits/mo</span>
                </div>
                <div className="mt-4 w-full bg-neutral-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-indigo-300 mt-2">50x more credits for power users</p>
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-neutral-500">
            1 credit = 1 AI task parse, resume optimization, or file conversion
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-10">
            <p className="text-sm text-neutral-500 mb-2">Simple, transparent pricing</p>
            <h2 className="text-3xl font-semibold">Start free, upgrade when you need more</h2>
            <p className="text-sm text-neutral-500 mt-2">No hidden fees. Cancel anytime. All plans include core features.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Free</h3>
                </div>
                <span className="text-2xl font-bold text-neutral-300">€0</span>
              </div>
              <p className="text-sm text-neutral-400 mt-3">For individuals getting started with task management.</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Unlimited projects & tasks</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Up to 3 team members</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>100 MB storage</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>10 AI credits/month</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Community support</span></li>
              </ul>
              <Link
                to="/auth/register"
                className="mt-6 block w-full text-center px-6 py-3 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>
            <div className="p-6 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-bl-lg">
                Most Popular
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Pro</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">€8</span>
                  <span className="text-sm text-neutral-400">/mo</span>
                </div>
              </div>
              <p className="text-xs text-emerald-400 mt-1">Billed annually (€96/year) — or €10 month-to-month</p>
              <p className="text-sm text-neutral-400 mt-3">For growing teams who need more power and AI features.</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-200">
                <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" /><span>Everything in Free, plus:</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Unlimited team members</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>10 GB storage</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>500 AI credits/month</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Priority support</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>API access & webhooks</span></li>
              </ul>
              <Link
                to="/auth/register"
                className="mt-6 block w-full text-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
          <div className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              View full comparison
            </Link>
          </div>
          {/* Satisfaction Guarantee */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">30-day money-back guarantee — no questions asked</span>
          </div>
        </div>
      </section>

      {/* Luid Suite Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-2">Luid Suite</p>
          <h2 className="text-3xl font-semibold">One subscription. Every Luid app.</h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-2xl mx-auto">
            Move from planning to delivery with TaskLuid, ResumeLuid, and LuidKit—all included when you join the suite.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Link
              to="/landing"
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 text-left hover:border-neutral-700 transition-colors"
            >
              <p className="text-sm text-neutral-500">Project management</p>
              <h3 className="text-lg font-semibold">TaskLuid</h3>
            </Link>
            <Link
              to="/resumeluid"
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 text-left hover:border-neutral-700 transition-colors"
            >
              <p className="text-sm text-neutral-500">AI resume builder</p>
              <h3 className="text-lg font-semibold">ResumeLuid</h3>
            </Link>
            <Link
              to="/luidkit"
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 text-left hover:border-neutral-700 transition-colors"
            >
              <p className="text-sm text-neutral-500">File conversion</p>
              <h3 className="text-lg font-semibold">LuidKit</h3>
            </Link>
          </div>
          <div className="mt-6">
            <Link
              to="/suite"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-900 transition-all"
            >
              Explore the Luid Suite
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 border-t border-neutral-900 bg-gradient-to-b from-black via-neutral-950/30 to-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-4">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-neutral-300">Got questions?</span>
            </div>
            <h2 className="text-3xl font-semibold mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-neutral-500">Everything you need to know about TaskLuid</p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-900/70 transition-colors"
                >
                  <span className="font-medium text-white">{item.question}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500 mb-3">Still have questions?</p>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-900 transition-all"
            >
              Visit Help Center
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Stay in the loop</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Get productivity tips & updates</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-lg mx-auto">
            Join our newsletter for weekly tips on freelancing, productivity hacks, and new feature announcements. No spam, unsubscribe anytime.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 whitespace-nowrap"
            >
              {newsletterStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
          {newsletterStatus === 'success' && (
            <p className="mt-3 text-sm text-emerald-400">Thanks for subscribing! Check your inbox soon.</p>
          )}
          <p className="mt-4 text-xs text-neutral-600">
            By subscribing, you agree to our Privacy Policy. We respect your inbox.
          </p>
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
