import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, MicOff, Trash } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Button from '../ui/Button';
import ChatMessage from './ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';

// Type declarations for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
}

const ChatInterface: React.FC = () => {
  const { t } = useTranslation();
  const { currentConversation, sendMessage, loading, clearConversation } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognitionInstance: SpeechRecognition = new SpeechRecognitionClass();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputValue(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      recognition?.stop();
    };
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

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const exampleQuestions = [
    t('chat.examples.questions.0'),
    t('chat.examples.questions.1'),
    t('chat.examples.questions.2'),
    t('chat.examples.questions.3'),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] bg-neutral-50 rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('app.name')}</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  className="text-left p-3 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors"
                  onClick={() => {
                    setInputValue(question);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
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
            <Button
              type="button"
              variant={isListening ? 'danger' : 'outline'}
              onClick={toggleListening}
              icon={isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              aria-label={isListening ? t('chat.listening') : t('chat.voice')}
              title={isListening ? t('chat.listening') : t('chat.voice')}
            >
              {isListening ? t('chat.listening') : ''}
            </Button>
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
    </div>
  );
};

export default ChatInterface;
