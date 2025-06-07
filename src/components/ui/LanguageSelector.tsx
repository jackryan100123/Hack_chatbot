import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1 text-neutral-700 hover:text-primary-600 transition-colors"
      aria-label={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
    >
      <Globe className="h-5 w-5" />
      <motion.span
        key={language}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.2 }}
        className="font-medium"
      >
        {language === 'en' ? 'EN' : 'हिंदी'}
      </motion.span>
    </button>
  );
};

export default LanguageSelector;