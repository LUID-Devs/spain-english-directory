import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Book, MessageCircle, Mail, ArrowLeft, HelpCircle, Search, FileText, Menu, X } from 'lucide-react';

const HelpPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const faqs = [
    {
      question: 'How do I create a new task?',
      answer: 'You can create a new task by clicking the "+" button in the sidebar, using the keyboard shortcut "C", or clicking "New Task" from the dashboard. Fill in the task details and click Save.'
    },
    {
      question: 'How do I invite team members?',
      answer: 'Go to the Teams page from the sidebar, click "Invite Member", and enter their email address. They\'ll receive an invitation to join your organization.'
    },
    {
      question: 'Can I assign tasks to multiple people?',
      answer: 'Yes! When creating or editing a task, you can assign it to multiple team members. Each assignee will be notified and can track their progress.'
    },
    {
      question: 'What is Mission Control?',
      answer: 'Mission Control is your AI-powered command center. It shows agent activity, task assignments, and real-time updates across your projects.'
    },
    {
      question: 'How do I set task priorities?',
      answer: 'Tasks can be set to Urgent, High, Medium, or Low priority. Use the priority dropdown when creating a task or change it from the task detail view.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, TaskLuid uses industry-standard encryption and security practices. We use AWS Cognito for authentication and all data is encrypted in transit and at rest.'
    }
  ];

  const supportOptions = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Browse our comprehensive guides and API documentation.',
      link: '/docs',
      linkText: 'View Docs'
    },
    {
      icon: MessageCircle,
      title: 'Community',
      description: 'Join our community forum to ask questions and share tips.',
      link: '#',
      linkText: 'Coming Soon'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Reach out to our support team for personalized help.',
      link: 'mailto:support@taskluid.com',
      linkText: 'Email Us'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-neutral-900 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">TaskLuid</span>
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
            <Link to="/docs" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Docs
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
                to="/docs"
                className="text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
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
      <section className="px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            How Can We Help?
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search Placeholder */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              readOnly
            />
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="px-4 py-12 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Get Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportOptions.map((option, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <option.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{option.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{option.description}</p>
                <Link
                  to={option.link}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                  {option.linkText} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="px-4 py-12 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-gray-900/30 border border-gray-800">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">⚡</span> Quick Actions
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-400">Create new task</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">C</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Command palette</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">Cmd+K</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Create task (alt)</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">Cmd+Shift+T</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Focus search</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">/</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Show shortcuts help</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">?</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-900/30 border border-gray-800">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <span className="text-indigo-400">→</span> Navigation (G + key)
              </h3>
              <p className="text-sm text-gray-500 mb-4">Press G then another key to navigate</p>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-400">Dashboard</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">G → D</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">G → P</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Tasks</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">G → T</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Triage</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">G → I</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Mission Control</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">G → C</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-12 border-t border-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl bg-gray-900/30 border border-gray-800"
              >
                <h3 className="font-medium text-white mb-2 flex items-start gap-3">
                  <span className="text-indigo-400">Q:</span>
                  {faq.question}
                </h3>
                <p className="text-gray-400 text-sm pl-6">
                  <span className="text-emerald-400">A:</span> {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 py-12 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Quick Links</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/features" 
              className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors text-gray-300"
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors text-gray-300"
            >
              Pricing
            </Link>
            <Link 
              to="/docs" 
              className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors text-gray-300"
            >
              Documentation
            </Link>
            <Link 
              to="/privacy" 
              className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors text-gray-300"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} TaskLuid
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/docs" className="text-gray-500 hover:text-gray-400 transition-colors">
              Documentation
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpPage;
