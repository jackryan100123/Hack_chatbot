import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Message, Conversation } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { processUnifiedQuery } from '../services/chatService';
import bns from '../data/laws/bns.json';
import ipc from '../data/laws/ipc.json';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  createConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Enhanced search function with dual-law comprehensive relevance scoring
const searchSectionsByKeywords = (keywords: string[]) => {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const allSections: any[] = [];
  
  // Flatten all sections from BNS (current law)
  bns.forEach((chapter: any) => {
    if (chapter.sections) {
      chapter.sections.forEach((section: any) => {
        allSections.push({
          ...section,
          chapter_title: chapter.chapter_title,
          chapter_name: chapter.chapter_name,
          law_type: 'BNS'
        });
      });
    }
  });
  
  // Flatten all sections from IPC (previous law)
  ipc.forEach((section: any) => {
    allSections.push({
      ...section,
      section_number: section.Section,
      content: section.section_desc,
      chapter_number: section.chapter,
      chapter_title: section.chapter_title,
      law_type: 'IPC'
    });
  });
  
  // Enhanced scoring algorithm for both laws
  const scoredSections = allSections.map(section => {
    let score = 0;
    let hasMatch = false;
    let matchDetails = {
      titleMatches: 0,
      contentMatches: 0,
      exactMatches: 0,
      sectionNumberMatch: false
    };
    
    const sectionTitleLower = section.section_title?.toLowerCase() || '';
    const sectionContent = Array.isArray(section.content) 
      ? section.content.join(' ').toLowerCase() 
      : (section.content || '').toLowerCase();
    
    // 1. Check section title (highest priority)
    lowerKeywords.forEach(lk => {
      if (sectionTitleLower.includes(lk)) {
        hasMatch = true;
        matchDetails.titleMatches++;
        
        // Exact title match gets highest score
        if (sectionTitleLower === lk || sectionTitleLower.includes(`of ${lk}`) || sectionTitleLower.includes(`${lk} of`)) {
          score += 30;
          matchDetails.exactMatches++;
        }
        // Partial title match
        else if (sectionTitleLower.includes(lk)) {
          score += 20;
        }
        
        // Bonus for keyword at start or end of title
        if (sectionTitleLower.startsWith(lk) || sectionTitleLower.endsWith(lk)) {
          score += 10;
        }
      }
    });
    
    // 2. Check section content (medium priority)
    if (section.content) {
      const contentArray = Array.isArray(section.content) ? section.content : [section.content];
      contentArray.forEach((contentItem: string) => {
        const contentLower = contentItem.toLowerCase();
        lowerKeywords.forEach(lk => {
          if (contentLower.includes(lk)) {
            hasMatch = true;
            matchDetails.contentMatches++;
            
            // Base score for content match
            score += 8;
            
            // Bonus for multiple occurrences of same keyword
            const occurrences = (contentLower.match(new RegExp(lk, 'g')) || []).length;
            if (occurrences > 1) {
              score += Math.min(occurrences * 3, 15);
            }
            
            // Bonus for keyword in important context
            const importantContexts = ['punishment', 'shall be', 'defined', 'means', 'imprisonment', 'fine', 'penalty'];
            const hasImportantContext = importantContexts.some(context => 
              contentLower.includes(context) && contentLower.includes(lk)
            );
            if (hasImportantContext) {
              score += 12;
            }
          }
        });
      });
    }
    
    // 3. Check section number for exact matches
    lowerKeywords.forEach(lk => {
      if (section.section_number === lk || 
          `section ${section.section_number}` === lk.toLowerCase() ||
          lk.includes(section.section_number)) {
        score += 50;
        hasMatch = true;
        matchDetails.sectionNumberMatch = true;
      }
    });
    
    // 4. Multi-keyword bonus
    const uniqueMatchedKeywords = lowerKeywords.filter(lk => {
      const titleMatch = sectionTitleLower.includes(lk);
      const contentMatch = sectionContent.includes(lk);
      return titleMatch || contentMatch;
    });
    
    if (uniqueMatchedKeywords.length > 1) {
      score += Math.pow(uniqueMatchedKeywords.length, 2) * 5;
    }
    
    // 5. Chapter relevance bonus
    const chapterTitleLower = (section.chapter_title + ' ' + (section.chapter_name || '')).toLowerCase();
    lowerKeywords.forEach(lk => {
      if (chapterTitleLower.includes(lk)) {
        score += 5;
        hasMatch = true;
      }
    });
    
    // 6. Semantic relevance bonus
    const semanticMatches = getSemanticMatches(lowerKeywords, sectionTitleLower, sectionContent);
    score += semanticMatches * 3;
    if (semanticMatches > 0) hasMatch = true;
    
    // 7. BNS preference bonus (since it's the current law)
    if (section.law_type === 'BNS') {
      score += 3;
    }
    
    return { 
      ...section, 
      relevanceScore: score, 
      hasMatch,
      matchDetails,
      uniqueKeywordMatches: uniqueMatchedKeywords.length
    };
  })
  .filter(section => section.hasMatch)
  .sort((a, b) => {
    // First prioritize by relevance score
    const scoreDiff = b.relevanceScore - a.relevanceScore;
    if (Math.abs(scoreDiff) > 5) return scoreDiff;
    
    // Then by law type preference (BNS over IPC for same relevance)
    if (a.law_type !== b.law_type && Math.abs(scoreDiff) <= 5) {
      return a.law_type === 'BNS' ? -1 : 1;
    }
    
    // Finally by exact relevance score
    return scoreDiff;
  });
  
  return scoredSections;
};

// Semantic matching for related legal terms
const getSemanticMatches = (keywords: string[], title: string, content: string): number => {
  const semanticGroups = {
    'murder': ['kill', 'death', 'homicide', 'culpable', 'causing death', 'intentionally'],
    'theft': ['steal', 'dishonest', 'movable', 'property', 'dishonestly', 'taking'],
    'assault': ['hurt', 'grievous', 'simple', 'voluntarily', 'causing hurt', 'violence'],
    'criminal': ['offence', 'crime', 'punishment', 'penalty', 'guilty', 'liable'],
    'property': ['movable', 'immovable', 'ownership', 'possession', 'dishonest'],
    'conspiracy': ['agreement', 'common', 'intention', 'object', 'abetment'],
    'cheating': ['dishonest', 'deception', 'fraud', 'induce', 'deceive'],
    'defamation': ['reputation', 'imputation', 'harm', 'words', 'injure'],
    'kidnapping': ['abduction', 'wrongful', 'restraint', 'confinement'],
    'rape': ['sexual', 'consent', 'penetration', 'assault', 'intercourse'],
    'robbery': ['theft', 'extortion', 'force', 'fear', 'violence'],
    'bribery': ['corruption', 'gratification', 'illegal', 'public servant'],
    'forgery': ['false', 'document', 'signature', 'fraudulent', 'making'],
    'dowry': ['marriage', 'demand', 'harassment', 'death', 'cruelty'],
    'domestic': ['violence', 'cruelty', 'wife', 'husband', 'matrimonial']
  };
  
  let semanticScore = 0;
  const fullText = title + ' ' + content;
  
  keywords.forEach(keyword => {
    const relatedTerms = semanticGroups[keyword as keyof typeof semanticGroups];

    if (Array.isArray(relatedTerms)) {
      relatedTerms.forEach(relatedTerm => {
        if (fullText.includes(relatedTerm)) {
          semanticScore++;
        }
      });
    }
  });
  
  return semanticScore;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  const createConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      messages: [],
      title: 'New Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const welcomeMessage: Message = {
      id: uuidv4(),
      content: '⚖️ **Welcome to Legal Assistant!**\n\nI can help you with questions about Indian laws, particularly the Bharatiya Nyaya Sanhita (BNS) and Indian Penal Code (IPC). I can also answer general questions on any topic.\n\n**Examples of what you can ask:**\n- "What is section 1 about?"\n- "Tell me about definitions"\n- "What are the preliminary provisions?"\n- "Show me section 2"\n- "What is murder under BNS?"\n- "Compare murder in BNS and IPC"\n- "Tell me about theft"\n- "Differences between BNS and IPC"\n- "How does the weather affect crime rates?"\n- "What is artificial intelligence?"\n\nPlease ask your question!',
      role: 'assistant',
      timestamp: new Date(),
    };

    const initializedConversation = {
      ...newConversation,
      messages: [welcomeMessage],
    };

    setConversations([...conversations, initializedConversation]);
    setCurrentConversation(initializedConversation);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentConversation) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date(),
    };

    setCurrentConversation(updatedConversation);
    setConversations(conversations.map(conv =>
      conv.id === currentConversation.id ? updatedConversation : conv
    ));

    try {
      setLoading(true);
      
      // Use the unified processing function from chatService
      const responseContent = await processUnifiedQuery(content, searchSectionsByKeywords);

      const assistantMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      const conversationWithResponse = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setCurrentConversation(conversationWithResponse);
      setConversations(conversations.map(conv =>
        conv.id === currentConversation.id ? conversationWithResponse : conv
      ));
      
    } catch (error) {
      console.error('Failed to process message:', error);

      const errorMessage: Message = {
        id: uuidv4(),
        content: '❌ **System Error**\n\nSorry, there was an unexpected error processing your request. Please try again. If the problem persists, please contact support.',
        role: 'assistant',
        timestamp: new Date(),
      };

      const conversationWithError = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        updatedAt: new Date(),
      };

      setCurrentConversation(conversationWithError);
      setConversations(conversations.map(conv =>
        conv.id === currentConversation.id ? conversationWithError : conv
      ));
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    if (!currentConversation) return;

    const welcomeMessage: Message = {
      id: uuidv4(),
      content: '⚖️ **Welcome to Legal Assistant!**\n\nI can help you with questions about Indian laws, particularly the Bharatiya Nyaya Sanhita (BNS) and Indian Penal Code (IPC). I can also answer general questions on any topic.\n\n**Examples of what you can ask:**\n- "What is section 1 about?"\n- "Tell me about definitions"\n- "What are the preliminary provisions?"\n- "Show me section 2"\n- "What is murder under BNS?"\n- "Compare murder in BNS and IPC"\n- "Tell me about theft"\n- "Differences between BNS and IPC"\n- "How does the weather affect crime rates?"\n- "What is artificial intelligence?"\n\nPlease ask your question!',
      role: 'assistant',
      timestamp: new Date(),
    };

    const resetConversation = {
      ...currentConversation,
      messages: [welcomeMessage],
      updatedAt: new Date(),
    };

    setCurrentConversation(resetConversation);
    setConversations(conversations.map(conv =>
      conv.id === currentConversation.id ? resetConversation : conv
    ));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        loading,
        createConversation,
        sendMessage,
        clearConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};