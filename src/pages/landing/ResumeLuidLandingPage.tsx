import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  CheckCircle,
  Award,
  Globe,
  Lock,
  Clock,
  Menu,
  X,
  Star,
  Briefcase,
  GraduationCap,
  User,
  Building2,
  ArrowRight,
  Download,
  Share2,
} from 'lucide-react';

const ResumeLuidLandingPage = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Key features for resume builder
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Writing',
      desc: 'Get smart suggestions for bullet points, summaries, and skills based on your experience.',
    },
    {
      icon: Zap,
      title: 'ATS-Friendly Templates',
      desc: 'Professional designs that pass Applicant Tracking Systems and impress recruiters.',
    },
    {
      icon: Award,
      title: 'ATS Score Feedback',
      desc: 'See real-time compatibility scores against job descriptions and fix gaps instantly.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      desc: 'Your data is encrypted and never sold. Export and delete anytime with full control.',
    },
    {
      icon: Globe,
      title: 'Multi-Format Export',
      desc: 'Download as PDF, DOCX, or plain text. Perfect for any application method.',
    },
    {
      icon: Clock,
      title: 'Build in Minutes',
      desc: 'Intuitive interface with smart defaults. Create a professional resume in under 10 minutes.',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      desc: 'Generate a shareable link or download directly. Send to employers however you prefer.',
    },
    {
      icon: Star,
      title: 'Access all Luid apps',
      desc: 'One subscription unlocks every product in the Luid Suite.',
    },
  ];

  // How it works steps
  const steps = [
    {
      step: '01',
      title: 'Choose a Template',
      desc: 'Pick from professionally designed, ATS-optimized resume templates.',
    },
    {
      step: '02',
      title: 'Fill Your Details',
      desc: 'Add your experience, education, and skills. AI helps polish your content.',
    },
    {
      step: '03',
      title: 'Download & Apply',
      desc: 'Export as PDF or DOCX and start applying to your dream jobs.',
    },
  ];

  // Use cases
  const useCases = [
    { icon: Briefcase, title: 'Job Seekers', desc: 'Stand out in competitive markets' },
    { icon: GraduationCap, title: 'Students', desc: 'Create your first professional resume' },
    { icon: User, title: 'Career Changers', desc: 'Highlight transferable skills effectively' },
    { icon: Building2, title: 'Freelancers', desc: 'Showcase projects and expertise' },
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "Land a position at a top tech company.",
      author: 'Software Engineer',
      role: 'Career Changer',
      stars: 5,
    },
    {
      quote: "The AI suggestions helped me articulate my experience way better than I could on my own.",
      author: 'Marketing Manager',
      role: 'Recent Hire',
      stars: 5,
    },
    {
      quote: "Finally, a resume builder that doesn't require a subscription just to download my own resume.",
      author: 'Recent Graduate',
      role: 'First Job Seeker',
      stars: 5,
    },
  ];

  // Trust points
  const trustPoints = [
    { icon: CheckCircle, text: 'Free tier with no credit card required' },
    { icon: Lock, text: 'Your data belongs to you, always' },
    { icon: Award, text: 'Templates designed by HR professionals' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">ResumeLuid</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/suite" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Luid Suite
            </Link>
            <Link to="/landing" className="text-sm text-neutral-400 hover:text-white transition-colors">
              TaskLuid
            </Link>
            <Link to="/luidkit" className="text-sm text-neutral-400 hover:text-white transition-colors">
              LuidKit
            </Link>
            <Link to="/auth/login" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth/sign-up"
              className="text-sm px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
            >
              Build Your Resume
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
                to="/suite"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Luid Suite
              </Link>
              <Link
                to="/landing"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                TaskLuid
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
                to="/auth/sign-up"
                className="text-sm inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Build Your Resume
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
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-neutral-300">Now with AI-powered writing assistance</span>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm text-neutral-400">Part of Luid Suite</span>
          </div>

          <p className="text-sm text-neutral-500 mb-2">AI Resume Builder</p>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent mb-6">
            ResumeLuid
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-4 max-w-2xl mx-auto font-medium">
            Build a resume that gets you hired.
          </p>
          <p className="text-base text-neutral-400 mb-8 max-w-xl mx-auto">
            AI-powered resume builder with professional templates, smart suggestions, and ATS-optimized formatting. 
            Free to start — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/auth/sign-up"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
            >
              Create Your Resume Free
            </Link>
            <a
              href="#templates"
              className="w-full sm:w-auto px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              View Templates
            </a>
          </div>

          {/* Trust Points */}
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

      {/* Stats Bar */}
      <section className="px-4 py-10 border-t border-neutral-900 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">10K+</div>
              <p className="text-sm text-neutral-500">Resumes Created</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">15+</div>
              <p className="text-sm text-neutral-500">Professional Templates</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">98%</div>
              <p className="text-sm text-neutral-500">ATS Pass Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">4.9★</div>
              <p className="text-sm text-neutral-500">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Why ResumeLuid</p>
            <h2 className="text-3xl font-semibold">Everything you need to stand out</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              Professional tools and AI assistance to help you land your dream job.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
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
            <p className="text-sm text-neutral-500 mb-2">Simple Process</p>
            <h2 className="text-3xl font-semibold">Build your resume in 3 easy steps</h2>
            <p className="text-sm text-neutral-500 mt-2">No design skills needed. No complicated software.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors relative"
              >
                <div className="text-xs uppercase tracking-widest text-emerald-400 mb-3">Step {step.step}</div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400">{step.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-neutral-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Built For</p>
            <h2 className="text-3xl font-semibold">Who is ResumeLuid for?</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              Whether you're just starting out or advancing your career, we've got you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <useCase.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{useCase.title}</h3>
                <p className="text-sm text-neutral-400">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 border-t border-neutral-900 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-4">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-neutral-300">Loved by job seekers</span>
            </div>
            <h2 className="text-3xl font-semibold">What our users say</h2>
            <p className="text-sm text-neutral-500 mt-2">Real stories from real people who got hired.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-neutral-300 mb-6 text-sm leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-semibold text-white">
                    {t.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
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

      {/* Templates Preview */}
      <section id="templates" className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Professional Templates</p>
            <h2 className="text-3xl font-semibold">ATS-optimized designs</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              Clean, professional templates that work with applicant tracking systems and impress recruiters.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Modern', 'Professional', 'Minimal'].map((template, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden hover:border-neutral-700 transition-all"
              >
                <div className="aspect-[3/4] bg-neutral-800/50 p-4">
                  {/* Mock Resume Preview */}
                  <div className="h-full bg-neutral-900 rounded-lg p-4 space-y-3">
                    <div className="h-4 w-1/2 bg-neutral-700 rounded" />
                    <div className="h-3 w-3/4 bg-neutral-800 rounded" />
                    <div className="pt-2 space-y-2">
                      <div className="h-2 w-full bg-neutral-800 rounded" />
                      <div className="h-2 w-5/6 bg-neutral-800 rounded" />
                      <div className="h-2 w-4/5 bg-neutral-800 rounded" />
                    </div>
                    <div className="pt-2">
                      <div className="h-3 w-1/3 bg-neutral-700 rounded mb-2" />
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-neutral-800 rounded" />
                        <div className="h-2 w-5/6 bg-neutral-800 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-neutral-800">
                  <h3 className="font-semibold text-white">{template}</h3>
                  <p className="text-sm text-neutral-500">Clean & Professional</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-10">
            <p className="text-sm text-neutral-500 mb-2">Simple Pricing</p>
            <h2 className="text-3xl font-semibold">Start free, upgrade when ready</h2>
            <p className="text-sm text-neutral-500 mt-2">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Free</h3>
                <span className="text-sm text-neutral-400">EUR 0 / month</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">Perfect for creating your first resume.</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />1 resume</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />Basic templates</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />PDF export</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" />AI suggestions</li>
              </ul>
              <Link
                to="/auth/sign-up"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-all"
              >
                Get Started Free
              </Link>
            </div>
            <div className="p-6 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro</h3>
                <span className="text-sm text-neutral-300">EUR 8 / month</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">For serious job seekers.</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" />Unlimited resumes</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" />All premium templates</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" />PDF + DOCX export</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" />Advanced AI writing</li>
                <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" />Cover letter builder</li>
              </ul>
              <Link
                to="/auth/sign-up"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to land your dream job?</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who've boosted their careers with ResumeLuid.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth/sign-up"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
            >
              Create Your Resume Free
            </Link>
            <Link
              to="/landing"
              className="w-full sm:w-auto px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              Explore TaskLuid
            </Link>
          </div>
        </div>
      </section>

      {/* Luid Suite Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-2">Luid Suite</p>
          <h2 className="text-3xl font-semibold">All your work tools, finally together.</h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-2xl mx-auto">
            ResumeLuid is part of the Luid Suite, giving you access to TaskLuid and LuidKit in one subscription.
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

      {/* Personal Commitment */}
      <section className="px-4 py-12 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-lg text-neutral-300 italic mb-4">
            "I built ResumeLuid because I believe everyone deserves a professional resume 
            without paying expensive designers or struggling with complex software."
          </blockquote>
          <p className="text-sm text-neutral-500">— The Developer</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500" suppressHydrationWarning>
            &copy; {year} ResumeLuid — Part of Luid Suite
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

export default ResumeLuidLandingPage;
