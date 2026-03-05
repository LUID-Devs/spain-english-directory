import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-spain-red rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="font-bold text-xl text-white">
                Spain<span className="text-spain-red">English</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              Connecting expats with English-speaking professionals across Spain.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="hover:text-spain-red transition-colors">
                  Find Professionals
                </Link>
              </li>
              <li>
                <Link href="#categories" className="hover:text-spain-red transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-spain-red transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-spain-red" />
                <span>hello@spainenglish.directory</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-spain-red" />
                <span>Spain</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Spain English Directory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
