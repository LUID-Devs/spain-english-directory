import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

const PrivacyPolicy = () => {
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
              <Shield className="w-5 h-5 text-white" />
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
          Privacy Policy
        </h1>

        <p className="text-neutral-400 mb-8" suppressHydrationWarning>Last updated: {lastUpdated}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-neutral-300 leading-relaxed">
              Luid Suite is operated by an independent developer. This Privacy Policy explains how we collect, use,
              and protect your personal information when you use TaskLuid and other Luid Suite applications.
            </p>
            <p className="text-neutral-300 leading-relaxed mt-4">
              For any privacy-related questions or concerns, please contact us at:{' '}
              <a href="mailto:alaindimabuyo@luiddevelopers.com" className="text-blue-400 hover:text-blue-300">
                alaindimabuyo@luiddevelopers.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
              <li><strong>Usage Data:</strong> Information about how you use our services, including tasks created, projects managed, and feature usage</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Cookies:</strong> We use cookies and similar technologies to improve your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Provide and maintain our services</li>
              <li>Process your transactions and manage your subscription</li>
              <li>Send you important updates about the service</li>
              <li>Improve and personalize your experience</li>
              <li>Respond to your requests and support inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
            <p className="text-neutral-300 leading-relaxed">
              Your data is stored securely using industry-standard encryption and security practices.
              We use reputable cloud service providers to host our services. While we strive to protect
              your personal information, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (e.g., payment processors, hosting providers)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="text-neutral-300 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:alaindimabuyo@luiddevelopers.com" className="text-blue-400 hover:text-blue-300">
                alaindimabuyo@luiddevelopers.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
            <p className="text-neutral-300 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide
              you services. If you delete your account, we will delete your personal data within 30 days,
              except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-neutral-300 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-neutral-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="text-neutral-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
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

export default PrivacyPolicy;
