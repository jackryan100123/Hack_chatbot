import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

      const prompt = `Please provide a comprehensive summary of the following document:\n\n${text}`;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Document Analysis</h1>
          <p className="mt-2 text-gray-600">
            Upload a document to get an AI-powered summary and ask questions about its content
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <DocumentUpload onDocumentAnalyzed={analyzeDocument} />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
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