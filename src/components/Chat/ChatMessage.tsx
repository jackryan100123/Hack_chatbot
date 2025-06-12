import React from 'react';
import { Message } from '../../types';
import { Scale, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Function to convert markdown-like format in the message to HTML
  const formatMessage = (content: string) => {
    // Replace ** text ** with bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace URLs with anchor tags
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-amber-600 hover:underline">$1</a>'
    );
    
    // Replace bullet points
    formatted = formatted.replace(/^- (.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/<li>.*?<\/li>/gs, (match) => `<ul class="list-disc pl-5 mb-2">${match}</ul>`);
    
    // Replace line breaks with <br>
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    
    return formatted;
  };

  return (
    <div
      className={`flex ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex max-w-[85%] ${
          isUser
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl rounded-tr-md shadow-lg'
            : 'bg-white border-2 border-amber-100 rounded-2xl rounded-tl-md shadow-lg'
        } p-4 relative`}
      >
        <div className="flex-shrink-0 mr-3">
          {isUser ? (
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <User className="h-5 w-5" />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-2 rounded-full border border-amber-200">
              <Scale className="h-5 w-5 text-amber-600" />
            </div>
          )}
        </div>
        <div className="flex-1">
          {!isUser && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                KanoonSarthi-AI
              </span>
            </div>
          )}
          <div
            className={`text-sm leading-relaxed ${
              isUser ? 'text-white' : 'text-gray-800'
            }`}
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
          <div
            className={`text-xs mt-2 ${
              isUser ? 'text-amber-100' : 'text-gray-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
        
        {/* Message tail */}
        <div className={`absolute bottom-0 ${
          isUser 
            ? 'right-0 transform translate-x-1 translate-y-1' 
            : 'left-0 transform -translate-x-1 translate-y-1'
        }`}>
          <div className={`w-0 h-0 ${
            isUser
              ? 'border-l-[12px] border-l-orange-600 border-t-[12px] border-t-transparent'
              : 'border-r-[12px] border-r-white border-t-[12px] border-t-transparent'
          }`}></div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatMessage;