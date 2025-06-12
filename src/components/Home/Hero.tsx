import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageSquare, Scale, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background with Indian Law Theme */}
      <div className="absolute inset-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900"></div>
        
        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Im0wIDBoMTAwdjEwMGgtMTAweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Im0wIDUwaDEwMG0tNTAtNTB2MTAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] animate-pulse"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 0,
                opacity: 0.1
              }}
              animate={{ 
                y: [null, -20, 20, -20],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ 
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`
              }}
            >
              <Scale className="h-8 w-8 text-amber-300" />
            </motion.div>
          ))}
        </div>

        {/* Geometric Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-lg"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen py-20">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-amber-100 text-sm font-medium">AI-Powered Legal Assistant</span>
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  {t('home.hero.title')}
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-amber-100 mb-8 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {t('home.hero.subtitle')}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/chat">
                  <Button 
                    size="lg" 
                    className="!bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!from-amber-600 hover:!to-orange-700 !text-white !border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 !px-8 !py-4"
                    icon={<MessageSquare className="h-5 w-5" />}
                  >
                    {t('home.hero.cta')}
                  </Button>
                </Link>
                <Link to="/document-analysis">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20 backdrop-blur-sm !px-8 !py-4"
                  >
                    Analyze Documents
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-300">1000+</div>
                  <div className="text-sm text-amber-100">Legal Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-300">24/7</div>
                  <div className="text-sm text-amber-100">AI Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-300">3+</div>
                  <div className="text-sm text-amber-100">Languages</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
            >
              {/* 3D Chat Interface Preview */}
              <div className="relative transform perspective-1000 rotate-y-12">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center text-white font-medium">KanoonSarthi-AI</div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="p-6 bg-gradient-to-b from-gray-50 to-white min-h-[400px]">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg rounded-tl-none p-4 max-w-[80%] border border-amber-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Scale className="h-4 w-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">KanoonSarthi-AI</span>
                        </div>
                        <p className="text-gray-800">🙏 Welcome! I can help you with Indian legal queries. What would you like to know?</p>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className="flex justify-end mb-4"
                    >
                      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg rounded-tr-none p-4 max-w-[80%]">
                        <p>What are the provisions for cybercrime under BNS?</p>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg rounded-tl-none p-4 max-w-[80%] border border-amber-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Scale className="h-4 w-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">KanoonSarthi-AI</span>
                        </div>
                        <p className="text-gray-800">Under BNS 2023, cybercrime provisions are covered in Chapter XI...</p>
                        <div className="flex space-x-1 mt-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Floating Elements around Chat */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-orange-500 p-3 rounded-full shadow-lg"
                >
                  <Scale className="h-6 w-6 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-full shadow-lg"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;