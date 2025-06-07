import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../context/ChatContext';
import ChatInterface from '../components/Chat/ChatInterface';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentConversation, createConversation } = useChat();

  useEffect(() => {
    if (!currentConversation) {
      createConversation();
    }
  }, [currentConversation, createConversation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          {t('nav.chat')}
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Ask questions about BNS, BNSS, BSA, or any other legal information. You can type your query or use voice recognition.
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;