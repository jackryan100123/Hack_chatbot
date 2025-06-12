import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Mic, Globe, FileText, Scale, Sparkles } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: t('home.features.search.title'),
      description: t('home.features.search.description'),
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: t('home.features.voice.title'),
      description: t('home.features.voice.description'),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t('home.features.multilingual.title'),
      description: t('home.features.multilingual.description'),
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t('home.features.downloads.title'),
      description: t('home.features.downloads.description'),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-lg"></div>
      </div>

      {/* Floating Legal Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
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
              y: [null, -15, 15, -15],
              rotate: [0, 360],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${15 + i * 25}%`,
              top: `${25 + i * 20}%`
            }}
          >
            <Scale className="h-5 w-5 text-amber-400" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span className="text-amber-700 font-semibold text-lg">Powerful Features</span>
            <Sparkles className="h-6 w-6 text-amber-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6">
            {t('home.features.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Additional Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-white/80 to-amber-50/80 backdrop-blur-sm rounded-3xl p-8 border border-amber-200 shadow-xl"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose KanoonSarthi-AI?</h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Experience the future of legal assistance with our comprehensive AI-powered platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/60 rounded-2xl border border-amber-100">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-full w-fit mx-auto mb-4">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">99.9% Accuracy</h4>
              <p className="text-sm text-gray-600">Precise legal information backed by comprehensive Indian law databases</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 rounded-2xl border border-amber-100">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Updates</h4>
              <p className="text-sm text-gray-600">Always current with the latest amendments and legal changes</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 rounded-2xl border border-amber-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-full w-fit mx-auto mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Multilingual Support</h4>
              <p className="text-sm text-gray-600">Access legal information in your preferred language</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;