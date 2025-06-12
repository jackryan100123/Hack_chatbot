import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Scale, Sparkles } from 'lucide-react';
import DocumentUpload from '../components/DocumentAnalysis/DocumentUpload';
import DocumentSummary from '../components/DocumentAnalysis/DocumentSummary';
import DocumentQuery from '../components/DocumentAnalysis/DocumentQuery';

const DocumentAnalysis: React.FC = () => {
  const [documentText, setDocumentText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (text: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `As KanoonSarthi-AI, a specialized legal assistant for Indian law, please provide a comprehensive analysis of the following legal document:

${text}

Please provide:
1. Document type and classification
2. Key legal points and provisions
3. Relevant Indian legal sections (BNS, BNSS, BSA, IPC, CrPC, etc.)
4. Important dates, parties, and case details (if applicable)
5. Legal implications and recommendations
6. Summary of main issues and potential legal actions

Format your response in a clear, structured manner that would be helpful for legal professionals and citizens alike.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();
      
      setSummary(summary);
      setDocumentText(text);
    } catch (err: any) {
      console.error('Document analysis error:', err);
      
      // Handle rate limit errors
      if (err?.message?.includes('429')) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        setError('Failed to analyze document. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-lg"></div>
      </div>

      {/* Floating Legal Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
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
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`
            }}
          >
            <Scale className="h-6 w-6 text-amber-400" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-full">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Legal Document Analysis
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Upload your legal documents and get comprehensive AI-powered analysis with relevant Indian law references and expert insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <DocumentUpload onDocumentAnalyzed={analyzeDocument} />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-red-500 p-2 rounded-full">
                    <Scale className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">Analysis Error</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-64 bg-gradient-to-br from-white to-amber-50 rounded-2xl border-2 border-amber-100"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-full mx-auto mb-4"
                  >
                    <Scale className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-lg font-semibold text-gray-800">Analyzing your legal document...</p>
                  <p className="text-amber-700">This may take a few moments</p>
                </div>
              </motion.div>
            ) : (
              <>
                {summary && <DocumentSummary summary={summary} />}
                {documentText && <DocumentQuery documentText={documentText} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;