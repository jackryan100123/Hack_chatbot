import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Scale } from 'lucide-react';

interface DocumentSummaryProps {
  summary: string;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ summary }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Document Summary</h2>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>AI Generated</span>
          </div>
          <div className="flex items-center space-x-1">
            <Scale className="h-4 w-4" />
            <span>Legal Analysis</span>
          </div>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentSummary; 