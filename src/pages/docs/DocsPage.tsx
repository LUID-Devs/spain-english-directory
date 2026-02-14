import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Book, FileText, Code, Zap, Shield, Users, BarChart3, ArrowRight } from 'lucide-react';

const DocsPage: React.FC = () => {
  const docSections = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of TaskLuid and set up your first project.',
      links: [
        { text: 'Quick Start Guide', href: '#' },
        { text: 'Creating Your First Project', href: '#' },
        { text: 'Inviting Team Members', href: '#' },
        { text: 'Understanding the Dashboard', href: '#' },
      ]
    },
    {
      icon: FileText,
      title: 'Task Management',
      description: 'Everything you need to know about creating and managing tasks.',
      links: [
        { text: 'Creating Tasks', href: '#' },
        { text: 'Task Priorities & Status', href: '#' },
        { text: 'Assigning Tasks', href: '#' },
        { text: 'Task Comments & Activity', href: '#' },
      ]
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together effectively with your team.',
      links: [
        { text: 'Team Management', href: '#' },
        { text: 'Roles & Permissions', href: '#' },
        { text: 'Organization Settings', href: '#' },
        { text: 'Invitations & Access', href: '#' },
      ]
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Automate your workflow and save time.',
      links: [
        { text: 'Automation Rules', href: '#' },
        { text: 'Triggers & Actions', href: '#' },
        { text: 'Custom Workflows', href: '#' },
        { text: 'Integration Webhooks', href: '#' },
      ]
    },
    {
      icon: BarChart3,
      title: 'Reporting & Analytics',
      description: 'Track progress and gain insights into your work.',
      links: [
        { text: 'Workload Dashboard', href: '#' },
        { text: 'Timeline View', href: '#' },
        { text: 'Goal Tracking', href: '#' },
        { text: 'Mission Control', href: '#' },
      ]
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Integrate TaskLuid with your tools and workflows.',
      links: [
        { text: 'API Overview', href: '#' },
        { text: 'Authentication', href: '#' },
        { text: 'Endpoints', href: '#' },
        { text: 'Rate Limits', href: '#' },
      ]
    },
  ];

  const quickLinks = [
    { title: 'Keyboard Shortcuts', description: 'Speed up your workflow', href: '#' },
    { title: 'Import & Export', description: 'Move data in and out', href: '#' },
    { title: 'Security', description: 'How we keep your data safe', href: '/privacy' },
    { title: 'Pricing', description: 'Plans and billing', href: '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
          <Link to="/" className="text-lg font-semibold">
            TaskLuid
          </Link>
          <Link 
            to="/help" 
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Help Center
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 text-center border-b border-gray-900">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Book className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Documentation
          </h1>
          <p className="text-gray-400 text-lg">
            Everything you need to know about using TaskLuid effectively.
          </p>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{section.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                      >
                        {link.text}
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="px-4 py-12 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.href}
                className="p-4 rounded-lg bg-gray-900/30 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all"
              >
                <h3 className="font-medium text-white mb-1">{link.title}</h3>
                <p className="text-sm text-gray-500">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Help CTA */}
      <section className="px-4 py-12 border-t border-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
          <p className="text-gray-400 mb-6">
            Can't find what you're looking for? Visit our Help Center or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/help"
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              Visit Help Center
            </Link>
            <a
              href="mailto:support@taskluid.com"
              className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
            >
              Contact Support
            </a>
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
            <Link to="/help" className="text-gray-500 hover:text-gray-400 transition-colors">
              Help
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

export default DocsPage;
