'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-spain-red rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">ES</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Spain<span className="text-spain-red">English</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/search" className="text-gray-600 hover:text-spain-red transition-colors">
              Find Professionals
            </Link>
            <Link href="#categories" className="text-gray-600 hover:text-spain-red transition-colors">
              Categories
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-spain-red transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-spain-red"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link
                href="/search"
                className="text-gray-600 hover:text-spain-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Professionals
              </Link>
              <Link
                href="#categories"
                className="text-gray-600 hover:text-spain-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-spain-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
