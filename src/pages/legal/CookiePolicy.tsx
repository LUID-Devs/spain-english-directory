import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Menu, X } from 'lucide-react';

const CookiePolicy = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastUpdated = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Luid Suite</span>
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Cookie Policy
        </h1>

        <p className="text-neutral-400 mb-8" suppressHydrationWarning>Last updated: {lastUpdated}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. What Are Cookies</h2>
            <p className="text-neutral-300 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website.
              They help us provide you with a better experience by remembering your preferences
              and understanding how you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Cookies</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">We use cookies for the following purposes:</p>

            <h3 className="text-xl font-medium text-white mt-6 mb-3">Essential Cookies</h3>
            <p className="text-neutral-300 leading-relaxed">
              These cookies are necessary for the website to function and cannot be switched off.
              They are usually set in response to actions you take, such as logging in or setting preferences.
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mt-2">
              <li>Session management and authentication</li>
              <li>Security tokens</li>
              <li>User preferences (theme, language)</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-6 mb-3">Functional Cookies</h3>
            <p className="text-neutral-300 leading-relaxed">
              These cookies enable enhanced functionality and personalization.
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mt-2">
              <li>Remembering your settings and preferences</li>
              <li>Storing your workspace selections</li>
              <li>Maintaining your session state</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-6 mb-3">Analytics Cookies</h3>
            <p className="text-neutral-300 leading-relaxed">
              These cookies help us understand how visitors interact with our website by collecting
              information anonymously.
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mt-2">
              <li>Pages visited and time spent</li>
              <li>Features used</li>
              <li>Error tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Third-Party Cookies</h2>
            <p className="text-neutral-300 leading-relaxed">
              We may use third-party services that set their own cookies. These include:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4 mt-4">
              <li><strong>Authentication providers:</strong> For secure login (e.g., Google Sign-In)</li>
              <li><strong>Payment processors:</strong> For subscription management</li>
              <li><strong>Analytics services:</strong> To understand service usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Managing Cookies</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Browser settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
              <li><strong>Device settings:</strong> Your device may have settings to control tracking</li>
            </ul>
            <p className="text-neutral-300 leading-relaxed mt-4">
              Note: Disabling essential cookies may affect the functionality of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Cookie Duration</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">We use two types of cookies based on duration:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Local Storage</h2>
            <p className="text-neutral-300 leading-relaxed">
              In addition to cookies, we may use local storage to store data on your device.
              This includes preferences and cached data to improve performance. Local storage
              data persists until cleared by you or the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Updates to This Policy</h2>
            <p className="text-neutral-300 leading-relaxed">
              We may update this Cookie Policy from time to time. Changes will be posted on this
              page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Us</h2>
            <p className="text-neutral-300 leading-relaxed">
              If you have questions about our use of cookies, please contact us:
            </p>
            <p className="text-neutral-300 mt-4">
              <strong>Email:</strong>{' '}
              <a href="mailto:alaindimabuyo@luiddevelopers.com" className="text-blue-400 hover:text-blue-300">
                alaindimabuyo@luiddevelopers.com
              </a>
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <Link
            to="/landing"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicy;
