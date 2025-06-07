import React from 'react';
import { Message } from '../../types';
import { Shield, User } from 'lucide-react';
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
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">$1</a>'
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex max-w-[80%] ${
          isUser
            ? 'bg-primary-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
            : 'bg-white border border-neutral-200 rounded-tl-lg rounded-tr-lg rounded-br-lg'
        } p-3 shadow-sm`}
      >
        <div className="flex-shrink-0 mr-3">
          {isUser ? (
            <div className="bg-white bg-opacity-20 p-1.5 rounded-full">
              <User className="h-5 w-5" />
            </div>
          ) : (
            <div className="bg-primary-100 p-1.5 rounded-full">
              <Shield className="h-5 w-5 text-primary-700" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div
            className={`text-sm ${
              isUser ? 'text-white' : 'text-neutral-800'
            }`}
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
          <div
            className={`text-xs mt-1 ${
              isUser ? 'text-primary-200' : 'text-neutral-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatMessage;