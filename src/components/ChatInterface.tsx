import React, { useState, useRef, useEffect } from 'react';

import { SpeechInput } from './SpeechInput';
import { FileService, ProcessedDocument } from '../services/fileService';
import { ChatService } from '../services/chatService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'document' | 'document-query';
  document?: ProcessedDocument;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileService = new FileService();
  const chatService = new ChatService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDocumentProcessed = (document: ProcessedDocument) => {
    setCurrentDocument(document);
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `I've processed your ${document.metadata.type} document: "${document.metadata.title}". You can now ask questions about it.`,
        type: 'document'
      }
    ]);
  };

  const handleDocumentError = (error: Error) => {
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `Error processing document: ${error.message}`,
        type: 'text'
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      type: currentDocument ? 'document-query' : 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      let response: string;
      if (currentDocument) {
        response = await fileService.queryDocument(currentDocument, inputValue);
      } else {
        response = await chatService.processQuery(inputValue);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          type: currentDocument ? 'document-query' : 'text',
          document: currentDocument || undefined
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request.',
          type: 'text'
        }
      ]);
    }
  };

  const handleSpeechText = (text: string, language: string) => {
    setInputValue(text);
  };

  const handleSpeechError = (error: any) => {
    console.error('Speech recognition error:', error);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.type === 'document' && message.document && (
                <div className="mb-2 text-sm">
                  <strong>Document Type:</strong> {message.document.metadata.type}
                  <br />
                  <strong>Title:</strong> {message.document.metadata.title}
                  {message.document.metadata.date && (
                    <>
                      <br />
                      <strong>Date:</strong> {message.document.metadata.date}
                    </>
                  )}
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        {!currentDocument && (
          
        )}
        <div className="flex items-center space-x-4">
          <SpeechInput
            onTextChange={handleSpeechText}
            onError={handleSpeechError}
          />
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                currentDocument
                  ? "Ask a question about the document..."
                  : "Type your message..."
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}; 