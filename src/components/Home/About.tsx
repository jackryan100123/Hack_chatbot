import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Scale, Shield, Clock, Globe, Lock, Zap } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: "24/7 AI Support",
      description: "Always available to assist with legal queries"
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Multilingual Access",
      description: "Legal information in multiple Indian languages"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Instant Analysis",
      description: "Real-time document analysis and insights"
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Secure Platform",
      description: "End-to-end encryption for confidential queries"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Im0wIDBoMTAwdjEwMGgtMTAweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Im0wIDUwaDEwMG0tNTAtNTB2MTAwIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div
            className="w-full lg:w-1/2 mb-12 lg:mb-0 lg:pr-12"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-full mr-4">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {t('home.about.title')}
              </h2>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mb-8 rounded-full"></div>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {t('home.about.description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-lg text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="h-8 w-8 text-amber-200" />
                  <h3 className="text-2xl font-bold">Indian Legal Framework</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 rounded-full p-1 mt-1">
                      <div className="bg-amber-300 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-100">Bharatiya Nyaya Sanhita (BNS) 2023</span>
                      <p className="text-sm text-amber-200 mt-1">Modern replacement for the Indian Penal Code with updated provisions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 rounded-full p-1 mt-1">
                      <div className="bg-amber-300 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-100">Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023</span>
                      <p className="text-sm text-amber-200 mt-1">Comprehensive criminal procedure code for modern India</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 rounded-full p-1 mt-1">
                      <div className="bg-amber-300 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-100">Bharatiya Sakshya Adhiniyam (BSA) 2023</span>
                      <p className="text-sm text-amber-200 mt-1">Advanced evidence act for digital age legal proceedings</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 rounded-full p-1 mt-1">
                      <div className="bg-amber-300 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-100">Standard Operating Procedures (SOPs)</span>
                      <p className="text-sm text-amber-200 mt-1">Comprehensive guidelines for law enforcement operations</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-orange-500 p-4 rounded-full shadow-xl"
              >
                <Scale className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-full shadow-xl"
              >
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;