import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div
            className="w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-12"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold text-neutral-800">
                {t('home.about.title')}
              </h2>
            </div>
            <div className="w-20 h-1 bg-primary-600 mb-6"></div>
            <p className="text-neutral-700 text-lg leading-relaxed mb-6">
              {t('home.about.description')}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                <h3 className="font-semibold text-primary-800 mb-1">24/7 Support</h3>
                <p className="text-sm text-neutral-600">Always available to assist officers on duty</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                <h3 className="font-semibold text-primary-800 mb-1">Offline Access</h3>
                <p className="text-sm text-neutral-600">Essential information available without internet</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                <h3 className="font-semibold text-primary-800 mb-1">Regular Updates</h3>
                <p className="text-sm text-neutral-600">Always current with the latest legal information</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                <h3 className="font-semibold text-primary-800 mb-1">Secure Platform</h3>
                <p className="text-sm text-neutral-600">End-to-end encryption for confidential queries</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="bg-primary-800 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Key Legal Resources</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-white rounded-full p-1 mr-3 mt-0.5">
                      <div className="bg-primary-600 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-medium">Bharatiya Nyaya Sanhita (BNS)</span>
                      <p className="text-sm text-primary-200">Replaces the Indian Penal Code (IPC)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-white rounded-full p-1 mr-3 mt-0.5">
                      <div className="bg-primary-600 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-medium">Bharatiya Nagarik Suraksha Sanhita (BNSS)</span>
                      <p className="text-sm text-primary-200">Replaces the Code of Criminal Procedure (CrPC)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-white rounded-full p-1 mr-3 mt-0.5">
                      <div className="bg-primary-600 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-medium">Bharatiya Sakshya Adhiniyam (BSA)</span>
                      <p className="text-sm text-primary-200">Replaces the Indian Evidence Act</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-white rounded-full p-1 mr-3 mt-0.5">
                      <div className="bg-primary-600 rounded-full h-2 w-2"></div>
                    </div>
                    <div>
                      <span className="font-medium">Standard Operating Procedures (SOPs)</span>
                      <p className="text-sm text-primary-200">Guidelines for various police operations</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent-500 rounded-lg -z-10"></div>
              <div className="absolute -left-4 -top-4 w-16 h-16 bg-primary-300 rounded-lg -z-10"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;