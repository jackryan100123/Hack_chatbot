import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../ui/LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.chat'), path: '/chat' },
    { name: t('nav.downloads'), path: '/downloads' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary-800 font-bold text-xl"
          >
            <Shield className="h-8 w-8" />
            <span>{t('app.name')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : 'text-neutral-700 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <LanguageSelector />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-neutral-700 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium py-2 transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-neutral-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-neutral-200">
                <LanguageSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;