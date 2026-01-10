import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
          Terms of Service
        </h1>

        <p className="text-neutral-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-neutral-300 leading-relaxed">
              By accessing or using Luid Suite applications (including TaskLuid, ResumeLuid, LuidKit, and other services),
              you agree to be bound by these Terms of Service. Luid Suite is operated by an independent developer.
            </p>
            <p className="text-neutral-300 leading-relaxed mt-4">
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-neutral-300 leading-relaxed">
              Luid Suite provides software-as-a-service (SaaS) productivity applications including task management,
              resume building, file conversion, and other tools. These services are provided "as is" and may be
              updated, modified, or discontinued at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">To use certain features, you must create an account. You agree to:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payment</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              Some features require a paid subscription through LuidHub. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Pay all fees associated with your subscription plan</li>
              <li>Provide valid payment information</li>
              <li>Authorize recurring charges based on your billing cycle</li>
            </ul>
            <p className="text-neutral-300 leading-relaxed mt-4">
              <strong>Cancellation:</strong> You may cancel your subscription at any time. Access continues until the end of your current billing period.
            </p>
            <p className="text-neutral-300 leading-relaxed mt-2">
              <strong>Refunds:</strong> We generally do not provide refunds. Please contact us if you have concerns about your subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Use our services for any illegal purposes</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Upload malicious content or code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use automated systems to access our services without permission</li>
              <li>Resell or redistribute our services without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <p className="text-neutral-300 leading-relaxed">
              All content, features, and functionality of Luid Suite are owned by the developer and are protected
              by copyright and other intellectual property laws. You retain ownership of any content you create
              using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Content</h2>
            <p className="text-neutral-300 leading-relaxed">
              You retain ownership of content you create using our services (tasks, projects, documents, etc.).
              By using our services, you grant us a limited license to store, process, and display your content
              solely for the purpose of providing our services to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-neutral-300 leading-relaxed">
              Our services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express
              or implied. We do not guarantee that our services will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-neutral-300 leading-relaxed">
              To the maximum extent permitted by law, the developer shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
              whether incurred directly or indirectly, or any loss of data, use, goodwill, or other
              intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
            <p className="text-neutral-300 leading-relaxed">
              We may suspend or terminate your access to our services at any time for violation of these terms
              or for any other reason. You may also close your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p className="text-neutral-300 leading-relaxed">
              We may update these Terms of Service from time to time. We will notify you of significant changes
              by posting a notice on our website or sending you an email. Continued use of our services after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p className="text-neutral-300 leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws, without regard
              to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p className="text-neutral-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfService;
