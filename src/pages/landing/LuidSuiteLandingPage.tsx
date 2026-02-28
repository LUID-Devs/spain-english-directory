import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Briefcase, FileText, ArrowRight, Sparkles } from 'lucide-react';

const LuidSuiteLandingPage = () => {
  const products = [
    {
      name: 'TaskLuid',
      description: 'Project management for freelancers and small teams',
      icon: Briefcase,
      features: ['Kanban boards', 'Task tracking', 'Team collaboration', 'AI task parsing'],
      link: '/',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      name: 'ResumeLuid',
      description: 'AI-powered resume builder and career tools',
      icon: FileText,
      features: ['AI resume writing', 'ATS optimization', 'Cover letters', 'Portfolio builder'],
      link: '/resumeluid',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'LuidKit',
      description: 'File conversion and productivity tools',
      icon: Sparkles,
      features: ['File conversion', 'PDF tools', 'Image optimization', 'Batch processing'],
      link: '/luidkit',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            Luid Suite
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Powerful tools for freelancers and small teams
          </p>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Everything you need to manage projects, build your resume, and convert files - all in one integrated platform.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.name}
                className="group relative p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${product.color} mb-6`}>
                  <product.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3">{product.name}</h3>

                {/* Description */}
                <p className="text-gray-400 mb-6">{product.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={product.link}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r ${product.color} text-white font-medium hover:opacity-90 transition-opacity`}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of freelancers using Luid Suite to streamline their workflow.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LuidSuiteLandingPage;
