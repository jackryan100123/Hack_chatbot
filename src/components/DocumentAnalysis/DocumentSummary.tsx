import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Scale, Sparkles } from 'lucide-react';

interface DocumentSummaryProps {
  summary: string;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ summary }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl border-2 border-amber-100 p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIj48cGF0aCBkPSJtMCAwaDYwdjYwaC02MHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJtMCA2MGg2MG0tMzAtNjB2NjAiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-4"
      >
        <Sparkles className="h-6 w-6 text-amber-400" />
      </motion.div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-full">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Legal Analysis</h2>
              <p className="text-amber-700">Comprehensive document summary</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800 font-medium">AI Generated</span>
            </div>
            <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
              <Scale className="h-4 w-4 text-orange-600" />
              <span className="text-orange-800 font-medium">Legal Analysis</span>
            </div>
          </div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200 relative overflow-hidden">
            {/* Content Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjZjU5ZTBiIiBvcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2IpIi8+PC9zdmc+')]"></div>
            </div>
            
            <div className="relative">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                {summary}
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Key Points Extracted</span>
            </div>
            <p className="text-xs text-gray-600">Important legal elements identified</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Legal Context</span>
            </div>
            <p className="text-xs text-gray-600">Relevant laws and sections referenced</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">AI Insights</span>
            </div>
            <p className="text-xs text-gray-600">Intelligent analysis and recommendations</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentSummary;