import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Gauge, Sparkles, XCircle } from 'lucide-react';

const simplicitySignals = [
  'Does it reduce steps for a common workflow?',
  'Can a new user understand it in under 60 seconds?',
  'Is there a measurable outcome (ship faster, fewer handoffs)?',
  'Does it replace a tool instead of adding another?',
];

const ComparePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent">
            TaskLuid
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/features" className="text-neutral-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-neutral-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/auth/login" className="text-neutral-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <header className="px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-3">Powerful Simplicity</p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">The Goldilocks zone between basic boards and enterprise bloat.</h1>
          <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
            TaskLuid is built for freelancers and small teams who need real project power without the overhead.
            More capable than basic tools. Far simpler than enterprise monsters.
          </p>
        </div>
      </header>

      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Too Simple</div>
            <h2 className="text-xl font-semibold text-neutral-200 mb-4">Basic Boards</h2>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> Shallow workflows and limited views</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> Hard to track multiple clients</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> Little reporting or accountability</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> No real automation support</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/30">
            <div className="text-xs uppercase tracking-wider text-emerald-400 mb-3">Just Right</div>
            <h2 className="text-xl font-semibold text-white mb-4">TaskLuid</h2>
            <ul className="space-y-3 text-sm text-neutral-200">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> Timelines, priorities, and client workspaces</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> AI-assisted intake without complexity</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> Built-in automation and templates</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> Clear reporting that doesn’t overwhelm</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <div className="text-xs uppercase tracking-wider text-red-400 mb-3">Too Complex</div>
            <h2 className="text-xl font-semibold text-neutral-200 mb-4">Enterprise Suites</h2>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> Steep learning curve and heavy setup</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> Feature overload you never use</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> Admin overhead for small teams</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5" /> Too much configuration before work begins</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Gauge className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-semibold">Simplicity Score</h2>
          </div>
          <p className="text-neutral-400 mb-6 max-w-3xl">
            Every new feature must earn its place. We score features by impact, clarity, and effort saved —
            so TaskLuid stays powerful without the clutter.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simplicitySignals.map((signal) => (
              <div key={signal} className="flex items-start gap-3 p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5" />
                <p className="text-sm text-neutral-300">{signal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Focus on the work — not the tool.</h2>
          <p className="text-neutral-400 mb-8">
            TaskLuid keeps your team in the sweet spot: fast to learn, powerful to use, and always intentional.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="px-4 py-10 border-t border-neutral-900 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} TaskLuid. Part of Luid Suite.
      </footer>
    </div>
  );
};

export default ComparePage;
