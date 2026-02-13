import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  Calendar,
  Layout,
  Bell,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Layout,
    title: 'Intuitive Task Management',
    description: 'Organize tasks with drag-and-drop simplicity. Create projects, set priorities, and track progress in real-time.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly. Assign tasks, share updates, and keep everyone aligned with built-in team features.'
  },
  {
    icon: Zap,
    title: 'AI-Powered Automation',
    description: 'Let AI handle the routine. Auto-assign tasks, generate summaries, and get smart recommendations.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Your data is protected with bank-level encryption, SSO support, and compliance with SOC 2 standards.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Gain insights with detailed reports. Track productivity, identify bottlenecks, and optimize workflows.'
  },
  {
    icon: Calendar,
    title: 'Timeline & Scheduling',
    description: 'Visualize project timelines with Gantt charts. Plan sprints, set milestones, and never miss a deadline.'
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Stay informed without the noise. Customizable alerts keep you updated on what matters most.'
  },
  {
    icon: CheckCircle2,
    title: 'Goal Tracking',
    description: 'Set and track OKRs. Connect daily tasks to big-picture objectives and measure success.'
  }
];

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent">
            TaskLuid
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-neutral-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/auth/login" className="text-neutral-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              to="/auth/register" 
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">
              ship faster
            </span>
          </h1>
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            TaskLuid combines powerful project management with AI assistance to help teams of all sizes deliver their best work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Built for modern teams who need to move fast without breaking things.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-neutral-700 transition-colors">
                  <feature.icon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Join thousands of teams already using TaskLuid to manage their work more effectively.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} TaskLuid. Part of Luid Suite.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-neutral-400 hover:text-gray-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-neutral-400 hover:text-gray-400 transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-neutral-400 hover:text-gray-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
