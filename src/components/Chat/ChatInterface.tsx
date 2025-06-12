import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, MicOff, Trash, Upload, FileText } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Button from '../ui/Button';
import ChatMessage from './ChatMessage';
import FileUpload from './FileUpload';
import DocumentViewer from './DocumentViewer';
import TypingIndicator from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeechService } from '../../services/speechService';

// Custom type declarations for SpeechRecognition API
interface SpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
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

const ChatInterface: React.FC = () => {
  const { t } = useTranslation();
  const { 
    currentConversation, 
    currentDocument, 
    sendMessage, 
    loading, 
    clearConversation, 
    setCurrentDocument,
    queryDocument 
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechService = useRef(new SpeechService());

  useEffect(() => {
    setIsSpeechSupported(speechService.current.isSupported());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || loading) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleListening = async () => {
    if (!isSpeechSupported) {
      console.warn('Speech recognition not available');
      return;
    }

    try {
      if (isListening) {
        speechService.current.stopListening();
        setIsListening(false);
      } else {
        speechService.current.startListening(
          (result) => {
            setInputValue(prev => prev + result.text);
          },
          (error) => {
            console.error('Speech recognition error:', error);
            setIsListening(false);
          }
        );
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error with speech recognition:', error);
      setIsListening(false);
    }
  };

  const handleQueryDocument = async (query: string) => {
    console.log('Handling document query:', { query, currentDocument });
    if (!currentDocument) {
      console.error('No document is currently active');
      return;
    }
    
    setInputValue(query);
    try {
      await queryDocument(query);
    } catch (error) {
      console.error('Error querying document:', error);
      await sendMessage('I apologize, but I encountered an error while processing your question. Please try again.');
    }
  };

  const handleDocumentProcessed = async (document: ProcessedDocument) => {
    console.log('Document processed:', document);
    setShowFileUpload(false);
    setCurrentDocument(document);
    
    // Send a message about the processed document
    const message = `📄 **Document Uploaded Successfully!**\n\n**${document.metadata.title}**\n\n` +
      `**Type:** ${document.metadata.type.toUpperCase()}\n` +
      `**File:** ${document.fileName}\n` +
      (document.metadata.caseNumber ? `**Case Number:** ${document.metadata.caseNumber}\n` : '') +
      (document.metadata.date ? `**Date:** ${document.metadata.date}\n` : '') +
      (document.metadata.sections && document.metadata.sections.length > 0 ? 
        `**Legal Sections Found:** ${document.metadata.sections.join(', ')}\n` : '') +
      `\nYou can now ask questions about this document and I'll provide relevant legal analysis and applicable sections.`;
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending document processed message:', error);
    }
  };

  const handleFileError = (error: Error) => {
    console.error('File processing error:', error);
    setShowFileUpload(false);
    // You could show an error message to the user here
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRemoveDocument = () => {
    setCurrentDocument(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] bg-neutral-50 rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold">{t('app.name')}</h2>
          {currentDocument && (
            <div className="flex items-center space-x-2 bg-primary-700 px-3 py-1 rounded-full">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{currentDocument.metadata.type.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="!bg-transparent !text-white border-white hover:!bg-white/10"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => setShowFileUpload(!showFileUpload)}
          >
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!bg-transparent !text-white border-white hover:!bg-white/10"
            icon={<Trash className="h-4 w-4" />}
            onClick={clearConversation}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Document Viewer */}
      {currentDocument && (
        <DocumentViewer
          document={currentDocument}
          onClose={handleRemoveDocument}
          onQueryDocument={handleQueryDocument}
        />
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentConversation?.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLoading={loading && message === currentConversation.messages[currentConversation.messages.length - 1]}
          />
        ))}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentDocument 
                ? `Ask about your ${currentDocument.metadata.type}...`
                : t('chat.placeholder')
            }
            className="flex-1 resize-none border border-neutral-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={1}
            disabled={loading}
          />
          <div className="flex space-x-2">
            {isSpeechSupported && (
              <Button
                type="button"
                variant={isListening ? 'danger' : 'outline'}
                onClick={toggleListening}
                icon={isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                aria-label={isListening ? t('chat.listening') : t('chat.voice')}
                title={isListening ? 'Stop listening' : 'Start voice input'}
                disabled={loading}
              >
                {isListening ? 'Listening...' : ''}
              </Button>
            )}
            <Button
              type="submit"
              disabled={!inputValue.trim() || loading}
              isLoading={loading}
              icon={<Send className="h-5 w-5" />}
            >
              {t('chat.send')}
            </Button>
          </div>
        </form>
      </div>

      {/* File Upload Modal */}
      <FileUpload
        isVisible={showFileUpload}
        onFileProcessed={handleDocumentProcessed}
        onError={handleFileError}
        onClose={() => setShowFileUpload(false)}
      />
    </div>
  );
};

export default ChatInterface;