import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Globe,
} from 'lucide-react';

const LuidSuiteLandingPage: React.FC = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  const products = [
    {
      name: 'TaskLuid',
      description: 'Project management, AI task parsing, and collaboration in one place.',
      href: '/landing',
      accent: 'from-indigo-500 to-purple-500',
      icon: CheckCircle,
    },
    {
      name: 'ResumeLuid',
      description: 'AI resume builder with professional templates and smart guidance.',
      href: '/resumeluid',
      accent: 'from-emerald-500 to-teal-500',
      icon: Sparkles,
    },
    {
      name: 'LuidKit',
      description: 'Private, fast file conversion with 50+ formats supported.',
      href: '/luidkit',
      accent: 'from-slate-500 to-slate-300',
      icon: Layers,
    },
  ];

  const suiteBenefits = [
    {
      icon: Users,
      title: 'One account, all apps',
      description: 'Access every Luid app with one login and unified billing.',
    },
    {
      icon: Zap,
      title: 'Workflows that connect',
      description: 'Move from planning to hiring to delivery without context switching.',
    },
    {
      icon: Shield,
      title: 'Privacy-first by design',
      description: 'No trackers, no data resale, and full control of your information.',
    },
    {
      icon: Globe,
      title: 'Built for global teams',
      description: 'Ship faster across time zones with tools designed to stay in sync.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/suite" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Luid Suite</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/landing" className="text-sm text-neutral-400 hover:text-white transition-colors">
              TaskLuid
            </Link>
            <Link to="/resumeluid" className="text-sm text-neutral-400 hover:text-white transition-colors">
              ResumeLuid
            </Link>
            <Link to="/luidkit" className="text-sm text-neutral-400 hover:text-white transition-colors">
              LuidKit
            </Link>
            <Link to="/pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex-1 px-4 pt-16 pb-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-neutral-300">All-in-one tools for modern teams</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Everything you need in the
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Luid Suite</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-8">
            Stop juggling disconnected tools. Luid Suite brings task management, hiring prep, and file workflows into one cohesive experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/landing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              Explore TaskLuid
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all"
            >
              View Suite Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.name}
              to={product.href}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 hover:border-neutral-700 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.accent} flex items-center justify-center mb-4`}>
                <product.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-white">{product.name}</h3>
              <p className="text-sm text-neutral-400">{product.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm text-neutral-500 mb-2">Why Luid Suite</p>
            <h2 className="text-3xl font-semibold">One subscription. One workflow.</h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-2xl mx-auto">
              Get everything you need to plan, execute, and deliver without stitching together separate services.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {suiteBenefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
                <benefit.icon className="w-5 h-5 text-emerald-400 mb-3" />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-neutral-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of freelancers using Luid Suite to streamline their workflow.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-800/50 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500" suppressHydrationWarning>
            &copy; {year} Luid Suite
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-neutral-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-neutral-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-neutral-400 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LuidSuiteLandingPage;
