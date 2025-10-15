
import React from 'react';
import { LANGUAGES } from '../constants';
import type { Language } from '../types';

interface LanguageFilterProps {
  selectedLanguages: Language[];
  onLanguageChange: (language: Language) => void;
}

export const LanguageFilter: React.FC<LanguageFilterProps> = ({ selectedLanguages, onLanguageChange }) => {
  return (
    <div className="w-full px-2">
      <p className="text-center text-gray-400 mb-3">Select Languages</p>
      <div className="flex flex-wrap justify-center gap-2">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
              selectedLanguages.includes(lang)
                ? 'bg-[#1DB954] text-white border-[#1DB954]'
                : 'bg-transparent text-gray-300 border-gray-500 hover:bg-gray-700 hover:border-gray-400'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};
