'use client';

import { useState } from 'react';

interface FilterSidebarProps {
  specialties: readonly string[];
  selectedSpecialty: string | null;
  onSpecialtyChange: (specialty: string | null) => void;
  selectedLanguage: string | null;
  onLanguageChange: (language: string | null) => void;
}

export default function FilterSidebar({
  specialties,
  selectedSpecialty,
  onSpecialtyChange,
  selectedLanguage,
  onLanguageChange,
}: FilterSidebarProps) {
  const languages = ['English', 'Spanish', 'French', 'German'];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'block' : 'hidden'
        } lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:w-64 flex-shrink-0`}
      >
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Specialty</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="specialty"
                checked={selectedSpecialty === null}
                onChange={() => onSpecialtyChange(null)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">All Specialties</span>
            </label>
            {specialties.map((specialty) => (
              <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="specialty"
                  checked={selectedSpecialty === specialty}
                  onChange={() => onSpecialtyChange(specialty)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 text-sm">{specialty}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Language</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="language"
                checked={selectedLanguage === null}
                onChange={() => onLanguageChange(null)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">All Languages</span>
            </label>
            {languages.map((language) => (
              <label key={language} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  checked={selectedLanguage === language}
                  onChange={() => onLanguageChange(language)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 text-sm">{language}</span>
              </label>
            ))}
          </div>
        </div>

        {(selectedSpecialty || selectedLanguage) && (
          <button
            onClick={() => {
              onSpecialtyChange(null);
              onLanguageChange(null);
            }}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Clear Filters
          </button>
        )}
      </aside>
    </>
  );
}
