import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  FileCode,
  ArrowRight,
  Upload,
  Lock,
  Clock,
  Globe,
  Server,
  CheckCircle,
  Menu,
  X,
} from 'lucide-react';

const LuidKitLandingPage = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Supported file formats
  const fileFormats = [
    {
      category: 'Documents',
      icon: FileText,
      formats: ['PDF', 'DOCX', 'TXT', 'RTF', 'ODT'],
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
    },
    {
      category: 'Images',
      icon: Image,
      formats: ['JPG', 'PNG', 'WEBP', 'GIF', 'SVG', 'BMP', 'TIFF'],
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
    },
    {
      category: 'Spreadsheets',
      icon: FileSpreadsheet,
      formats: ['XLSX', 'CSV', 'ODS', 'XLS'],
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-400',
    },
    {
      category: 'Presentations',
      icon: Presentation,
      formats: ['PPTX', 'ODP', 'PPT'],
      color: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-400',
    },
    {
      category: 'Code & Data',
      icon: FileCode,
      formats: ['JSON', 'XML', 'YAML', 'HTML', 'MD'],
      color: 'from-rose-500/20 to-red-500/20',
      iconColor: 'text-rose-400',
    },
  ];

  // Key features
  const features = [
    {
      icon: Upload,
      title: 'Drag & Drop',
      desc: 'Simply drag files into your browser. No software to install.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Cloud-powered conversion completes in seconds, not minutes.',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      desc: 'Files are encrypted in transit and auto-deleted after 1 hour.',
    },
    {
      icon: Globe,
      title: 'Works Everywhere',
      desc: 'Convert on any device with a browser — Windows, Mac, Linux, mobile.',
    },
    {
      icon: Server,
      title: 'Batch Processing',
      desc: 'Convert multiple files at once. Save hours of manual work.',
    },
    {
      icon: Clock,
      title: '24/7 Available',
      desc: 'No queues, no waiting. Convert whenever you need to.',
    },
  ];

  // How it works steps
  const steps = [
    {
      step: '01',
      title: 'Upload Your File',
      desc: 'Drag and drop or click to select. We support 50+ file formats.',
    },
    {
      step: '02',
      title: 'Choose Output Format',
      desc: 'Pick from our extensive list of compatible formats.',
    },
    {
      step: '03',
      title: 'Download & Go',
      desc: 'Get your converted file instantly. No email required.',
    },
  ];

  // Trust points
  const trustPoints = [
    { icon: '♥', iconClass: 'text-rose-500', text: 'Made with care by an indie developer' },
    { icon: '✓', iconClass: 'text-emerald-500', text: 'No subscription traps, no hidden fees' },
    { icon: '🛡', iconClass: 'text-emerald-500', text: 'Your files never leave secure servers' },
  ];

  // Use cases
  const useCases = ['Designers', 'Developers', 'Students', 'Office workers', 'Creators'];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">LuidKit</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">
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

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 pt-14 pb-12">
        <div className="text-center max-w-3xl">
          {/* What's New */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <span className="w-4 h-4 text-emerald-400">✓</span>
            <span className="text-sm text-neutral-300">Free tier available — No credit card required</span>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <span className="w-4 h-4 text-rose-500">♥</span>
            <span className="text-sm text-neutral-400">Part of Luid Suite</span>
          </div>

          <p className="text-sm text-neutral-500 mb-2">File Convert Pro</p>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            LuidKit
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-4 max-w-2xl mx-auto font-medium">
            The file converter that actually respects your privacy.
          </p>
          <p className="text-base text-neutral-400 mb-8 max-w-xl mx-auto">
            No ads. No tracking. No sketchy data practices. Just fast, reliable file conversion—because your files are none of our business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/convert"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-indigo-500/20"
            >
              Start Converting Free
            </Link>
            <a
              href="#formats"
              className="w-full sm:w-auto px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              View Supported Formats
            </a>
          </div>

          {/* Use Cases */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wide text-neutral-500 mb-10">
            {useCases.map((item) => (
              <span key={item} className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60">
                {item}
              </span>
            ))}
          </div>

          {/* Trust Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trustPoints.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                <span className={`w-4 h-4 ${item.iconClass}`}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supported Formats Section */}
      <section id="formats" className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Universal Compatibility</p>
            <h2 className="text-3xl font-semibold">50+ File Formats Supported</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              Documents, images, spreadsheets, presentations, code files—convert whatever you need, whenever you need it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fileFormats.map((format, idx) => (
              <div
                key={idx}
                className="text-left p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className={`w-12 h-12 mb-4 rounded-lg bg-gradient-to-br ${format.color} flex items-center justify-center`}>
                  <format.icon className={`w-6 h-6 ${format.iconColor}`} />
                </div>
                <h3 className="font-semibold text-white mb-3">{format.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {format.formats.map((f) => (
                    <span key={f} className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-neutral-500 mb-2">Why LuidKit</p>
            <h2 className="text-3xl font-semibold">Privacy-first by design</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl mx-auto">
              While other converters harvest your data, we delete it. No accounts required, no tracking, no nonsense.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="w-10 h-10 mb-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-indigo-400" />
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
            <h2 className="text-3xl font-semibold">Convert in 3 Easy Steps</h2>
            <p className="text-sm text-neutral-500 mt-2">No learning curve. No technical knowledge required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors relative"
              >
                <div className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Step {step.step}</div>
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

      {/* Pricing Section */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-10">
            <p className="text-sm text-neutral-500 mb-2">Simple Pricing</p>
            <h2 className="text-3xl font-semibold">Start Free, Upgrade When You Need</h2>
            <p className="text-sm text-neutral-500 mt-2">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Free</h3>
                <span className="text-sm text-neutral-400">EUR 0 / month</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">Perfect for occasional conversions.</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Up to 10 conversions/day</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Files up to 10MB</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>All file formats</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>1-hour file retention</li>
              </ul>
              <Link
                to="/convert"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-all"
              >
                Get Started Free
              </Link>
            </div>
            <div className="p-6 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro</h3>
                <span className="text-sm text-neutral-300">EUR 10 / month</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">For power users and professionals.</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                <li className="flex items-center gap-2"><span className="text-indigo-300">⚡</span>Unlimited conversions</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">⚡</span>Files up to 100MB</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">⚡</span>Priority processing</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">⚡</span>24-hour file retention</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">⚡</span>Batch conversion</li>
              </ul>
              <Link
                to="/auth/register"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
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
          <h2 className="text-3xl font-bold mb-4">Ready to convert your first file?</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Join thousands of users who trust LuidKit for their file conversion needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/convert"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-indigo-500/20"
            >
              Start Converting Free
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

      {/* Personal Commitment */}
      <section className="px-4 py-12 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-lg text-neutral-300 italic mb-4">
            "I built LuidKit because I was tired of file converters that bombard you with ads,
            install malware, or sell your data. This is clean, fast, and actually respects your privacy."
          </blockquote>
          <p className="text-sm text-neutral-500">— The Developer</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500" suppressHydrationWarning>
            &copy; {year} LuidKit — Part of Luid Suite
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

export default LuidKitLandingPage;
