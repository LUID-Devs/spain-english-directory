import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Book, MessageCircle, Mail, ArrowLeft, HelpCircle, Search, FileText } from 'lucide-react';

const HelpPage: React.FC = () => {
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
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
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
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

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
