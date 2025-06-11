import React from 'react';
import { File, Calendar, Hash, Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

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

interface DocumentViewerProps {
  document: ProcessedDocument;
  onClose: () => void;
  onQueryDocument: (query: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  onClose, 
  onQueryDocument 
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'fir':
        return 'bg-red-100 text-red-800';
      case 'complaint':
        return 'bg-orange-100 text-orange-800';
      case 'legal_document':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'fir':
        return 'FIR';
      case 'complaint':
        return 'Complaint';
      case 'legal_document':
        return 'Legal Document';
      default:
        return 'Document';
    }
  };

  const suggestedQueries = [
    "What legal sections apply to this case?",
    "What are the charges mentioned in this document?",
    "What is the punishment for these offenses?",
    "What are the next legal steps?",
    "Compare this with BNS provisions"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-neutral-200 rounded-lg shadow-lg p-4 mb-4"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <File className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 mb-1">
              {document.metadata.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-neutral-600">
              <span>{document.fileName}</span>
              <span>•</span>
              <span>{formatFileSize(document.fileSize)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Document Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-neutral-500" />
            <span className="text-sm text-neutral-600">Type:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getDocumentTypeColor(document.metadata.type)}`}>
              {getDocumentTypeLabel(document.metadata.type)}
            </span>
          </div>
          
          {document.metadata.date && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">Date:</span>
              <span className="text-sm font-medium">{document.metadata.date}</span>
            </div>
          )}
          
          {document.metadata.caseNumber && (
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">Case Number:</span>
              <span className="text-sm font-medium">{document.metadata.caseNumber}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {document.metadata.sections && document.metadata.sections.length > 0 && (
            <div>
              <span className="text-sm text-neutral-600 block mb-1">Legal Sections:</span>
              <div className="flex flex-wrap gap-1">
                {document.metadata.sections.map((section, index) => (
                  <span
                    key={index}
                    className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {document.metadata.keywords && document.metadata.keywords.length > 0 && (
            <div>
              <span className="text-sm text-neutral-600 block mb-1">Keywords:</span>
              <div className="flex flex-wrap gap-1">
                {document.metadata.keywords.slice(0, 5).map((keyword, index) => (
                  <span
                    key={index}
                    className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="border-t border-neutral-200 pt-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">
          Suggested Questions:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestedQueries.map((query, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-left justify-start h-auto py-2 px-3"
              onClick={() => onQueryDocument(query)}
            >
              <span className="text-xs">{query}</span>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentViewer;