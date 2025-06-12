import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, Bot, User, Globe } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface DocumentQueryProps {
  documentText: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Language = 'english' | 'hindi' | 'punjabi';

const languageLabels: Record<Language, string> = {
  english: 'English',
  hindi: 'हिंदी',
  punjabi: 'ਪੰਜਾਬੀ'
};

const DocumentQuery: React.FC<DocumentQueryProps> = ({ documentText }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const languageInstruction = selectedLanguage === 'english' 
        ? 'Please provide your response in English.'
        : selectedLanguage === 'hindi'
        ? 'कृपया अपना उत्तर हिंदी में दें।'
        : 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਜਵਾਬ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ।';

      const prompt = `You are a legal expert assistant. Based on the following document content and your knowledge of relevant laws, please provide a comprehensive answer to this question: ${userMessage}

Document content:
${documentText}

Instructions:
1. Analyze both the document content and relevant legal frameworks
2. Provide specific section numbers and references where applicable
3. Include relevant case laws or precedents if applicable
4. Explain the legal basis for your recommendations
5. Be specific and detailed in your response
6. If the document doesn't contain specific information, use your knowledge to provide relevant legal context
7. ${languageInstruction}

Please provide a well-structured response that combines document analysis with legal expertise.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error('Error querying document:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your question. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Ask Questions</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-gray-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
          >
            {Object.entries(languageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto pr-2">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-900 border border-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : 'Legal Assistant'}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">Legal Assistant</span>
              </div>
              <div className="mt-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask a question about the document... (${languageLabels[selectedLanguage]})`}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-blue-500 text-white rounded-xl px-4 py-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </motion.div>
  );
};

export default DocumentQuery; 