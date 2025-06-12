import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

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
    duration: 0.6,
    repeat: Infinity,
    repeatType: "reverse" as "reverse",
    ease: "easeInOut",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start space-x-3 max-w-[80%]"
    >
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-2 rounded-full border border-amber-200 flex-shrink-0">
        <Scale className="h-5 w-5 text-amber-600" />
      </div>
      <div className="bg-white border-2 border-amber-100 rounded-2xl rounded-tl-md p-4 shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            KanoonSarthi-AI
          </span>
          <span className="text-xs text-gray-500">is thinking...</span>
        </div>
        <div className="flex items-center space-x-1">
          <motion.div
            variants={dotVariants}
            initial="start"
            animate="end"
            transition={{ ...dotTransition, delay: 0 }}
            className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          />
          <motion.div
            variants={dotVariants}
            initial="start"
            animate="end"
            transition={{ ...dotTransition, delay: 0.2 }}
            className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          />
          <motion.div
            variants={dotVariants}
            initial="start"
            animate="end"
            transition={{ ...dotTransition, delay: 0.4 }}
            className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;