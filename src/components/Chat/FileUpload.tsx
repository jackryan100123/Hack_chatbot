import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface FileUploadProps {
  onFileProcessed: (document: ProcessedDocument) => void;
  onError: (error: Error) => void;
  onClose: () => void;
  isVisible: boolean;
}

interface ProcessedDocument {
  id: string;
  content: string;
  metadata: {
    type: 'complaint' | 'fir' | 'legal_document' | 'other';
    title: string;
    date?: string;
    caseNumber?: string;
    sections?: string[];
    keywords?: string[];
    summary?: string;
  };
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  onError, 
  onClose, 
  isVisible 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File): Promise<ProcessedDocument> => {
    try {
      console.log('Starting file processing:', { fileName: file.name, fileType: file.type });
      setUploading(true);
      setUploadProgress(10);
      setCurrentStep('Validating file...');

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.');
      }

      setUploadProgress(30);
      setCurrentStep('Extracting text...');

      // Extract text based on file type
      let extractedText = '';
      if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else {
        // For DOC/DOCX files, we'll use a simplified approach
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        throw new Error('No text content found in the document.');
      }

      console.log('Text extracted successfully:', { length: extractedText.length });

      setUploadProgress(50);
      setCurrentStep('Analyzing document...');

      // Analyze document content using AI
      const analysis = await analyzeDocumentContent(extractedText, file.name);
      console.log('Document analysis complete:', analysis);
      
      setUploadProgress(90);
      setCurrentStep('Finalizing...');

      const processedDocument: ProcessedDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: extractedText,
        metadata: analysis,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date()
      };

      console.log('Document processing complete:', processedDocument);
      setUploadProgress(100);
      setCurrentStep('Complete!');
      
      return processedDocument;

    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    } finally {
      setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
        setCurrentStep('');
      }, 1000);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('Starting PDF text extraction...');
      const arrayBuffer = await file.arrayBuffer();
      
      // Use PDF.js directly with the array buffer
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      console.log('PDF text extraction complete:', { length: fullText.length });
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  };

  const analyzeDocumentContent = async (text: string, fileName: string): Promise<ProcessedDocument['metadata']> => {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analyze this legal document and provide a comprehensive analysis. 

      Document Content:
      ${text}

      Please provide a JSON response with the following structure:
{
        "type": "complaint" | "fir" | "legal_document" | "other",
        "title": "descriptive title",
        "date": "extracted date if found",
  "caseNumber": "case number if found",
        "sections": ["relevant legal sections mentioned"],
        "keywords": ["important legal terms and concepts"],
        "summary": "concise 2-3 sentence summary of the document"
}

      Focus on:
      1. Identifying the document type accurately
      2. Extracting key legal information
      3. Summarizing the main points clearly
      4. Identifying relevant legal sections or provisions mentioned
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(responseText);
        return {
          type: parsed.type || 'other',
          title: parsed.title || fileName,
          date: parsed.date,
          caseNumber: parsed.caseNumber,
          sections: parsed.sections || [],
          keywords: parsed.keywords || extractBasicKeywords(text),
          summary: parsed.summary || 'Document analyzed successfully.'
        };
      } catch (parseError) {
        // If JSON parsing fails, use the raw response as summary
      return {
          type: 'other',
          title: fileName,
          keywords: extractBasicKeywords(text),
          summary: responseText || 'Document analyzed successfully.'
      };
      }
    } catch (error) {
      console.error('Error with AI analysis:', error);
      return {
        type: 'other',
        title: fileName,
        keywords: extractBasicKeywords(text),
        summary: 'Document uploaded successfully. AI analysis temporarily unavailable.'
      };
    }
  };

  const extractBasicKeywords = (text: string): string[] => {
    const legalTerms = [
      'fir', 'complaint', 'accused', 'complainant', 'witness', 'evidence',
      'section', 'ipc', 'bns', 'crpc', 'bnss', 'murder', 'theft', 'assault',
      'police', 'station', 'case', 'crime', 'investigation', 'arrest',
      'court', 'judge', 'bail', 'hearing', 'summons', 'warrant'
    ];

    const words = text.toLowerCase().split(/\s+/);
    return legalTerms.filter(term => 
      words.some(word => word.includes(term))
    ).slice(0, 10); // Limit to 10 keywords
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('File dropped:', { fileName: file.name, fileType: file.type });
    setError(null);

    try {
      const processedDocument = await processFile(file);
      console.log('File processed successfully, calling onFileProcessed');
      onFileProcessed(processedDocument);
    } catch (error) {
      console.error('Error in onDrop:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      onError(error as Error);
    }
  }, [onFileProcessed, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">
              Upload Legal Document
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!uploading ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-neutral-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              
              {isDragActive ? (
                <p className="text-blue-600 font-medium">
                  Drop the file here...
                </p>
              ) : (
                <div>
                  <p className="text-neutral-600 mb-2">
                    Drag & drop a legal document here, or click to select
                  </p>
                  <p className="text-sm text-neutral-500">
                    Supports PDF, DOC, DOCX, TXT files (max 10MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">{currentStep}</p>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-neutral-500 mt-2">{uploadProgress}%</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div className="text-sm text-neutral-600">
                <p className="font-medium mb-1">Supported Documents:</p>
                <ul className="text-xs space-y-1">
                  <li>• FIR copies and police reports</li>
                  <li>• Complaint letters and applications</li>
                  <li>• Legal notices and documents</li>
                  <li>• Court orders and judgments</li>
                  <li>• Legal contracts and agreements</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div className="text-sm text-red-600">
                  <p className="font-medium mb-1">Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUpload;