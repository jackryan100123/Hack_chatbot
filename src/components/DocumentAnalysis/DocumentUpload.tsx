import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Loader2, FileText, File, Scale, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface DocumentUploadProps {
  onDocumentAnalyzed: (text: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentAnalyzed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  };

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);

      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or text file.');
      }

      setUploadedFile(file);
      onDocumentAnalyzed(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      console.error('Error processing file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    await processFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl border-2 border-amber-100 p-8 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIj48cGF0aCBkPSJtMCAwaDYwdjYwaC02MHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJtMCA2MGg2MG0tMzAtNjB2NjAiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
        </div>

        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-full">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Legal Document Analysis</h2>
              <p className="text-amber-700">Upload your legal document for AI-powered analysis</p>
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden
              ${isDragActive 
                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 scale-105 shadow-lg' 
                : 'border-amber-300 hover:border-amber-500 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-4"
            >
              <Sparkles className="h-6 w-6 text-amber-400" />
            </motion.div>

            <div className="space-y-6">
              <div className="relative">
                <motion.div
                  animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="mx-auto"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-lg opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-full">
                      <Upload className="h-12 w-12 text-white mx-auto" />
                    </div>
                  </div>
                </motion.div>
                {isDragActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-full shadow-xl">
                      <Upload className="h-12 w-12 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="text-gray-700">
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                    <span className="text-lg font-medium">Analyzing your legal document...</span>
                  </div>
                ) : isDragActive ? (
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-amber-700">Drop your document here!</p>
                    <p className="text-amber-600">We'll analyze it with AI precision</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xl font-semibold text-gray-800">Upload Legal Document</p>
                    <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>PDF</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <File className="h-4 w-4" />
                        <span>TXT</span>
                      </span>
                      <span>Max 10MB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Analysis Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-full">
                  {uploadedFile.type === 'application/pdf' ? (
                    <FileText className="h-5 w-5 text-white" />
                  ) : (
                    <File className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <span className="text-green-800 font-semibold">{uploadedFile.name}</span>
                  <p className="text-sm text-green-600">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Successfully analyzed
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supported Documents Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200"
      >
        <div className="flex items-start space-x-3">
          <Scale className="h-6 w-6 text-amber-600 mt-1" />
          <div>
            <p className="font-semibold text-amber-800 mb-2">Supported Legal Documents</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-amber-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>FIR copies and police reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Legal notices and contracts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Court orders and judgments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Complaint letters and applications</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;