import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-primary-400" />
              <h3 className="text-xl font-bold">{t('app.name')}</h3>
            </div>
            <p className="text-neutral-400 mb-4">
              {t('app.tagline')}
            </p>
            <p className="text-neutral-400">
              {t('footer.disclaimer')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-neutral-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-neutral-400 hover:text-white transition-colors">
                  {t('nav.chat')}
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="text-neutral-400 hover:text-white transition-colors">
                  {t('nav.downloads')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-400 hover:text-white transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-neutral-700 pb-2">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-400 hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Cybercrime Portal
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Official Police Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-neutral-700 pb-2">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary-400 mr-2 mt-0.5" />
                <span className="text-neutral-400">Emergency: 112</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary-400 mr-2 mt-0.5" />
                <span className="text-neutral-400">Women Helpline: 1091</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-primary-400 mr-2 mt-0.5" />
                <span className="text-neutral-400">support@policeassistant.gov.in</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-400 mr-2 mt-0.5" />
                <span className="text-neutral-400">Police Headquarters, New Delhi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 text-center text-neutral-500 text-sm">
          <p>
            &copy; {currentYear} {t('app.name')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;