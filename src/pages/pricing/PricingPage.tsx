import React from 'react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
          Choose Your Plan
        </h1>
        <p className="text-gray-300 mb-12 max-w-2xl mx-auto">
          Select the perfect plan for your team's needs. All plans include core features with flexible upgrade options.
        </p>
        <div className="text-center mt-8">
          <Link 
            to="/auth/login" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
        <p className="text-gray-400 mt-4">This is the pricing page. Content to be migrated from Next.js pages.</p>
      </div>
    </div>
  );
};

export default PricingPage;