import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900 text-white pt-16 pb-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIj48cGF0aCBkPSJtMCAwaDYwdjYwaC02MHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJtMCA2MGg2MG0tMzAtNjB2NjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9Ii4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-full">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('app.name')}</h3>
                <p className="text-amber-200 text-sm">{t('app.tagline')}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Advanced AI-powered legal assistant for the Indian legal system. Get instant access to legal codes, case analysis, and procedural guidance.
            </p>
            <div className="flex items-center space-x-2 text-amber-200">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Powered by AI Technology</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-amber-700 pb-2 text-amber-200">
              Quick Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>{t('nav.home')}</span>
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>{t('nav.chat')}</span>
                </Link>
              </li>
              <li>
                <Link to="/document-analysis" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>{t('nav.documentAnalysis')}</span>
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>{t('nav.downloads')}</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>{t('nav.contact')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-amber-700 pb-2 text-amber-200">
              Legal Framework
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>Bharatiya Nyaya Sanhita (BNS)</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>Bharatiya Nagarik Suraksha Sanhita</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>Bharatiya Sakshya Adhiniyam</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>Standard Operating Procedures</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>Legal Forms & Documents</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-amber-700 pb-2 text-amber-200">
              Emergency Support
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="bg-red-500 p-1 rounded-full mt-1">
                  <Phone className="h-3 w-3 text-white" />
                </div>
                <div>
                  <span className="text-red-300 font-bold text-lg">112</span>
                  <p className="text-gray-400 text-xs">National Emergency</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-pink-500 p-1 rounded-full mt-1">
                  <Phone className="h-3 w-3 text-white" />
                </div>
                <div>
                  <span className="text-pink-300 font-bold">1091</span>
                  <p className="text-gray-400 text-xs">Women Helpline</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-blue-500 p-1 rounded-full mt-1">
                  <Phone className="h-3 w-3 text-white" />
                </div>
                <div>
                  <span className="text-blue-300 font-bold">1930</span>
                  <p className="text-gray-400 text-xs">Cybercrime Helpline</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-amber-500 p-1 rounded-full mt-1">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div>
                  <span className="text-amber-300 text-sm">support@kanoon-sarthi.ai</span>
                  <p className="text-gray-400 text-xs">Technical Support</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-800 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} {t('app.name')}. {t('footer.rights')}
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-amber-300 transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-amber-300 transition-colors">
                {t('footer.terms')}
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-amber-300 font-medium">Made in India 🇮🇳</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 max-w-4xl mx-auto">
            {t('footer.disclaimer')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;