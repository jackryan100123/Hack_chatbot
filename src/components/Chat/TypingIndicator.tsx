import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator: React.FC = () => {
  const dotVariants = {
    start: {
      y: "0%",
    },
    end: {
      y: "100%",
    },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as "reverse",
    ease: "easeInOut",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 max-w-[80%]"
    >
      <div className="flex items-center space-x-2 mb-2">
        <img src="/logo.svg" alt="AI Assistant" className="h-4 w-4" />
        <span className="text-xs font-medium">Legal Assistant</span>
      </div>
      <div className="flex items-center space-x-[2px] mt-2">
        <motion.span
          variants={dotVariants}
          transition={{ ...dotTransition, delay: 0 }}
          className="block w-[6px] h-[6px] bg-gray-500 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          transition={{ ...dotTransition, delay: 0.2 }}
          className="block w-[6px] h-[6px] bg-gray-500 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          transition={{ ...dotTransition, delay: 0.4 }}
          className="block w-[6px] h-[6px] bg-gray-500 rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default TypingIndicator; 