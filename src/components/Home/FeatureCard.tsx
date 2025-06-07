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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card hoverable className="h-full">
        <div className="p-6">
          <div className="bg-primary-100 rounded-full p-3 inline-block mb-4 text-primary-600">
            {icon}
          </div>
          <h3 className="text-lg font-semibold mb-2 text-neutral-800">{title}</h3>
          <p className="text-neutral-600">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;