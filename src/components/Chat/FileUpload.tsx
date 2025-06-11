import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

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
  };
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  onError, 
  onClose, 
  isVisible 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const processFile = async (file: File): Promise<ProcessedDocument> => {
    try {
      setUploading(true);
      setUploadProgress(10);

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

      setUploadProgress(60);

      // Analyze document content using AI
      const analysis = await analyzeDocumentContent(extractedText);
      
      setUploadProgress(90);

      const processedDocument: ProcessedDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: extractedText,
        metadata: analysis,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date()
      };

      setUploadProgress(100);
      return processedDocument;

    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For now, we'll return a placeholder. In a real implementation,
    // you would use a PDF parsing library like pdf-parse or PDF.js
    return `[PDF Content from ${file.name}]\n\nThis is a placeholder for PDF text extraction. In a production environment, this would contain the actual extracted text from the PDF file.`;
  };

  const analyzeDocumentContent = async (text: string): Promise<ProcessedDocument['metadata']> => {
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!API_KEY) {
      // Fallback analysis without AI
      return {
        type: 'other',
        title: 'Uploaded Document',
        keywords: extractBasicKeywords(text)
      };
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a legal document analyzer specializing in Indian legal documents. Analyze the provided text and extract:

1. Document type (complaint, fir, legal_document, or other)
2. Document title/subject
3. Case number (if any)
4. Relevant legal sections mentioned (BNS, IPC, CrPC, etc.)
5. Key legal terms and concepts
6. Date (if mentioned)

Return a JSON object with this structure:
{
  "type": "complaint|fir|legal_document|other",
  "title": "document title or subject",
  "date": "date if found",
  "caseNumber": "case number if found",
  "sections": ["section1", "section2"],
  "keywords": ["keyword1", "keyword2"]
}

Focus on identifying:
- FIR numbers, complaint numbers
- Legal sections (IPC 302, BNS 103, etc.)
- Crime types (murder, theft, assault, etc.)
- Legal procedures mentioned
- Parties involved (complainant, accused, etc.)`
            },
            {
              role: 'user',
              content: `Analyze this legal document:\n\n${text.substring(0, 3000)}` // Limit text to avoid token limits
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      
      return {
        type: analysis.type || 'other',
        title: analysis.title || 'Uploaded Document',
        date: analysis.date,
        caseNumber: analysis.caseNumber,
        sections: analysis.sections || [],
        keywords: analysis.keywords || extractBasicKeywords(text)
      };

    } catch (error) {
      console.error('Error analyzing document with AI:', error);
      return {
        type: 'other',
        title: 'Uploaded Document',
        keywords: extractBasicKeywords(text)
      };
    }
  };

  const extractBasicKeywords = (text: string): string[] => {
    const legalTerms = [
      'fir', 'complaint', 'accused', 'complainant', 'witness', 'evidence',
      'section', 'ipc', 'bns', 'crpc', 'bnss', 'murder', 'theft', 'assault',
      'police', 'station', 'case', 'crime', 'investigation', 'arrest'
    ];

    const words = text.toLowerCase().split(/\s+/);
    return legalTerms.filter(term => 
      words.some(word => word.includes(term))
    );
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);

    try {
      const processedDocument = await processFile(file);
      onFileProcessed(processedDocument);
    } catch (error) {
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
    maxSize: 10 * 1024 * 1024 // 10MB
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
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!uploading ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              
              {isDragActive ? (
                <p className="text-primary-600 font-medium">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-600 mb-2">Processing document...</p>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUpload;