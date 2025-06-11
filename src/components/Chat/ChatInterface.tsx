import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, MicOff, Trash, Upload } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Button from '../ui/Button';
import ChatMessage from './ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';

import { FileService, ProcessedDocument } from '../../services/fileService';
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

const ChatInterface: React.FC = () => {
  const { t } = useTranslation();
  const { currentConversation, sendMessage, loading, clearConversation } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileService = useRef(new FileService());
  const speechService = useRef(new SpeechService());

  useEffect(() => {
    setIsSpeechSupported(speechService.current.isSupported());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    await sendMessage(inputValue);
    setInputValue('');
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

  const handleDocumentProcessed = async (document: ProcessedDocument) => {
    setShowFileUpload(false);
    const message = `Document processed: ${document.metadata.title} (${document.metadata.type})`;
    await sendMessage(message);
  };

  const handleFileError = (error: Error) => {
    console.error('File processing error:', error);
    setShowFileUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] bg-neutral-50 rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('app.name')}</h2>
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

      

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {currentConversation?.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ChatMessage message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* If no messages, show example questions */}
        {(!currentConversation || currentConversation.messages.length <= 1) && (
          <div className="mt-6">
            <h3 className="text-center text-neutral-600 font-medium mb-4">
              {t('chat.examples.title')}
            </h3>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="border-t border-neutral-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
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
        
        {/* Show warning if speech recognition is not supported */}
        {!isSpeechSupported && (
          <p className="text-sm text-neutral-500 mt-2 text-center">
            Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;