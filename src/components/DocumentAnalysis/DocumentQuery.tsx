import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, Scale, User, Globe, Sparkles } from 'lucide-react';
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

      const prompt = `You are KanoonSarthi-AI, an expert legal assistant specializing in Indian law. Based on the following document content and your knowledge of relevant laws, please provide a comprehensive answer to this question: ${userMessage}

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
      className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl border-2 border-amber-100 p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIj48cGF0aCBkPSJtMCAwaDYwdjYwaC02MHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJtMCA2MGg2MG0tMzAtNjB2NjAiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-4"
      >
        <Sparkles className="h-6 w-6 text-amber-400" />
      </motion.div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ask Legal Questions</h2>
              <p className="text-amber-700">Get AI-powered answers about your document</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-amber-600" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="bg-white border-2 border-amber-200 text-amber-800 text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 px-3 py-2 font-medium"
            >
              {Object.entries(languageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto bg-gradient-to-b from-amber-50/50 to-white rounded-xl p-4 border border-amber-200">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Scale className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <p className="text-gray-600">Ask questions about your legal document to get detailed analysis and relevant legal insights.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-tr-md'
                    : 'bg-white border-2 border-amber-100 text-gray-900 rounded-tl-md shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Scale className="h-4 w-4 text-amber-600" />
                  )}
                  <span className="text-xs font-semibold">
                    {message.role === 'user' ? 'You' : 'KanoonSarthi-AI'}
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
              <div className="bg-white border-2 border-amber-100 rounded-2xl rounded-tl-md p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Scale className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">KanoonSarthi-AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  <span className="text-sm text-gray-600">Analyzing your question...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask a question about the document... (${languageLabels[selectedLanguage]})`}
            className="flex-1 rounded-xl border-2 border-amber-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl px-6 py-3 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default DocumentQuery;