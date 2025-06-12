import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card hoverable className="h-full bg-gradient-to-br from-white to-amber-50 border-2 border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="p-8 text-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-4 inline-block mb-6 text-white shadow-lg"
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
          <p className="text-gray-700 leading-relaxed">{description}</p>
          
          {/* Decorative Element */}
          <div className="mt-6 w-12 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;