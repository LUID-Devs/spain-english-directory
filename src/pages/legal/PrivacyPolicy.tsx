import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/landing" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-white">Luid Suite</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>

        <p className="text-neutral-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

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
