import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative bg-gradient-to-br from-primary-800 to-primary-900 text-white py-24 md:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjxwYXRoIGQ9Ik0zMCA0NGMwLTMuMyAyLjctNiA2LTZzNiAyLjcgNiA2LTIuNyA2LTYgNi02LTIuNy02LTZ6Ii8+PHBhdGggZD0iTTIwIjvPC9wYXRoPjwvZz48L2c+PC9zdmc+')] opacity-5"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-12 md:mb-0">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('home.hero.title')}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-primary-100 mb-8 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t('home.hero.subtitle')}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/chat">
                <Button 
                  size="lg" 
                  className="!bg-white !text-primary-700 hover:!bg-primary-50"
                  icon={<MessageSquare className="h-5 w-5" />}
                >
                  {t('home.hero.cta')}
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg shadow-xl overflow-hidden"
            >
              <div className="bg-primary-700 p-4 flex items-center">
                <div className="h-3 w-3 rounded-full bg-accent-500 mr-2"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <div className="flex-1 text-center text-white font-medium">Police Assistant</div>
              </div>
              <div className="p-6 bg-neutral-50">
                <div className="flex justify-start mb-4">
                  <div className="bg-primary-100 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-neutral-800">Welcome to Police Assistant! How can I help you today?</p>
                  </div>
                </div>
                <div className="flex justify-end mb-4">
                  <div className="bg-primary-600 text-white rounded-lg rounded-tr-none p-3 max-w-[80%]">
                    <p>What is section 43 of BNS?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-primary-100 rounded-lg rounded-tl-none p-3 max-w-[80%] animate-pulse">
                    <p className="text-neutral-800">Section 43 of Bharatiya Nyaya Sanhita (BNS) deals with...</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;