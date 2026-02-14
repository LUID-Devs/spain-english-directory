import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield, Heart, MessageCircle, Code } from 'lucide-react';

const LandingPage = () => {
  // Compute values during render to prevent hydration mismatch
  const year = useMemo(() => new Date().getFullYear(), []);

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Built for speed, not bloat' },
    { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours' },
    { icon: Code, title: 'Open Integration', desc: 'API & webhooks included' },
  ];

  const indieValues = [
    { icon: Heart, text: 'Crafted with care by an indie developer' },
    { icon: CheckCircle, text: 'No VC funding, no bloatware' },
    { icon: MessageCircle, text: 'Direct, responsive support' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 pt-16 pb-12">
        <div className="text-center max-w-2xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 mb-6">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-neutral-400">Made with love by an independent developer</span>
          </div>

          <p className="text-sm text-neutral-500 mb-2">Part of Luid Suite</p>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            TaskLuid
          </h1>
          <p className="text-lg text-gray-300 mb-4 max-w-lg mx-auto">
            A modern task management platform designed to help you organize, track, and complete projects efficiently.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            No corporate nonsense. Just a tool that works.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-indigo-500/20"
            >
              Get Started Free
            </Link>
            <Link
              to="/auth/login"
              className="w-full sm:w-auto px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Indie Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {indieValues.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                <item.icon className="w-4 h-4 text-emerald-500" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400">{feature.desc}</p>
              </div>
            ))}
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
          <p className="text-sm text-neutral-500">
            — The Developer
          </p>
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