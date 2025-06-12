import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Message, Conversation } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { processUnifiedQuery } from '../services/chatService';
import bns from '../data/laws/bns.json';
import ipc from '../data/laws/ipc.json';
import bnss from '../data/laws/bnss.json';
import bsa from '../data/laws/bsa.json';
import crpc from '../data/laws/crpc.json';
import iea from '../data/laws/iea.json';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
    summary?: string;
  };
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentDocument: ProcessedDocument | null;
  loading: boolean;
  createConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  setCurrentDocument: (document: ProcessedDocument | null) => void;
  queryDocument: (query: string) => Promise<void>;
  messages: Array<{ role: string; content: string }>;
  setActiveDocument: (document: { id: string; name: string; content: string; summary: string }) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Enhanced search function with comprehensive law coverage
const searchSectionsByKeywords = (keywords: string[]) => {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const allSections: any[] = [];
  
  // Helper function to add sections from any law file
  const addSectionsFromLaw = (lawData: any, lawType: string, isNewLaw: boolean) => {
    if (Array.isArray(lawData)) {
      lawData.forEach((item: any) => {
        if (item.sections) {
          item.sections.forEach((section: any) => {
            allSections.push({
              ...section,
              chapter_title: item.chapter_title,
              chapter_name: item.chapter_name,
              law_type: lawType,
              is_new_law: isNewLaw
            });
          });
        } else if (item.Section) {
          // Handle IPC/CrPC/IEA format
          allSections.push({
            ...item,
            section_number: item.Section,
            content: item.section_desc,
            chapter_number: item.chapter,
            chapter_title: item.chapter_title,
            law_type: lawType,
            is_new_law: isNewLaw
          });
        }
      });
    }
  };

  // Add sections from all law files
  addSectionsFromLaw(bns, 'BNS', true);
  addSectionsFromLaw(bnss, 'BNSS', true);
  addSectionsFromLaw(bsa, 'BSA', true);
  addSectionsFromLaw(ipc, 'IPC', false);
  addSectionsFromLaw(crpc, 'CrPC', false);
  addSectionsFromLaw(iea, 'IEA', false);
  
  // Enhanced scoring algorithm for all laws
  const scoredSections = allSections.map(section => {
    let score = 0;
    let hasMatch = false;
    let matchDetails = {
      titleMatches: 0,
      contentMatches: 0,
      exactMatches: 0,
      sectionNumberMatch: false,
      semanticMatches: 0,
      lawTypeMatch: false
    };
    
    const sectionTitleLower = section.section_title?.toLowerCase() || '';
    const sectionContent = Array.isArray(section.content) 
      ? section.content.join(' ').toLowerCase() 
      : (section.content || '').toLowerCase();
    
    // Check for specific law type request in keywords
    const lawTypeKeywords = {
      'bns': ['bns', 'bharatiya nyaya', 'nyaya sanhita'],
      'bnss': ['bnss', 'bharatiya nagarik', 'nagarik suraksha'],
      'bsa': ['bsa', 'bharatiya sakshya', 'sakshya adhiniyam'],
      'ipc': ['ipc', 'indian penal', 'penal code'],
      'crpc': ['crpc', 'criminal procedure', 'code of criminal'],
      'iea': ['iea', 'evidence act', 'indian evidence']
    };

    // Check if user specifically requested a law type
    const requestedLawType = Object.entries(lawTypeKeywords).find(([_, keywords]) =>
      keywords.some(k => lowerKeywords.some(lk => lk.includes(k.toLowerCase())))
    )?.[0].toUpperCase();

    // If specific law type requested, boost score for matching sections
    if (requestedLawType && section.law_type === requestedLawType) {
      score += 100; // Significant boost for matching requested law type
      matchDetails.lawTypeMatch = true;
      hasMatch = true;
    }
    
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
    
    // 2. Check section content
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
            
            // Bonus for multiple occurrences
            const occurrences = (contentLower.match(new RegExp(lk, 'g')) || []).length;
            if (occurrences > 1) {
              score += Math.min(occurrences * 3, 15);
            }
            
            // Bonus for important context
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
    
    // 3. Check section number
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
    
    // 5. Chapter relevance
    const chapterTitleLower = (section.chapter_title + ' ' + (section.chapter_name || '')).toLowerCase();
    lowerKeywords.forEach(lk => {
      if (chapterTitleLower.includes(lk)) {
        score += 5;
        hasMatch = true;
      }
    });
    
    // 6. Semantic relevance
    const semanticMatches = getSemanticMatches(lowerKeywords, sectionTitleLower, sectionContent);
    score += semanticMatches * 3;
    matchDetails.semanticMatches = semanticMatches;
    if (semanticMatches > 0) hasMatch = true;
    
    // 7. New law preference bonus (only if no specific law type requested)
    if (!requestedLawType && section.is_new_law) {
      score += 5;
    }
    
    return { 
      ...section, 
      relevanceScore: score, 
      hasMatch,
      matchDetails,
      uniqueKeywordMatches: uniqueMatchedKeywords.length,
      requestedLawType: requestedLawType
    };
  })
  .filter(section => section.hasMatch)
  .sort((a, b) => {
    // First prioritize by law type match if requested
    if (a.requestedLawType || b.requestedLawType) {
      if (a.law_type === a.requestedLawType && b.law_type !== b.requestedLawType) return -1;
      if (b.law_type === b.requestedLawType && a.law_type !== a.requestedLawType) return 1;
    }
    
    // Then by relevance score
    const scoreDiff = b.relevanceScore - a.relevanceScore;
    if (Math.abs(scoreDiff) > 5) return scoreDiff;
    
    // Then by law type preference (new laws over old laws for same relevance)
    if (a.is_new_law !== b.is_new_law && Math.abs(scoreDiff) <= 5) {
      return a.is_new_law ? -1 : 1;
    }
    
    // Finally by exact relevance score
    return scoreDiff;
  });
  
  return scoredSections;
};

// Enhanced semantic matching with more legal terms
const getSemanticMatches = (keywords: string[], title: string, content: string): number => {
  const semanticGroups = {
    // Criminal Law Terms
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
    'domestic': ['violence', 'cruelty', 'wife', 'husband', 'matrimonial'],
    
    // Procedural Terms
    'arrest': ['apprehend', 'detain', 'custody', 'police', 'warrant'],
    'bail': ['release', 'bond', 'surety', 'anticipatory', 'regular'],
    'trial': ['proceedings', 'evidence', 'witness', 'prosecution', 'defense'],
    'appeal': ['higher court', 'challenge', 'review', 'revision'],
    'witness': ['testimony', 'deposition', 'examination', 'cross-examination'],
    'evidence': ['proof', 'document', 'testimony', 'material', 'circumstantial'],
    
    // General Legal Terms
    'jurisdiction': ['territorial', 'subject matter', 'pecuniary', 'concurrent'],
    'limitation': ['time limit', 'period', 'barred', 'prescribed'],
    'procedure': ['process', 'steps', 'method', 'manner', 'way'],
    'rights': ['entitlement', 'privilege', 'claim', 'interest', 'protection'],
    'duties': ['obligation', 'responsibility', 'liability', 'accountability']
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

// Helper function to build conversation history for AI context
const buildConversationHistory = (messages: Message[]): Array<{role: string, content: string}> => {
  // Exclude the welcome message and get the last 6 messages (3 exchanges) for context
  const conversationMessages = messages.filter(msg => 
    !msg.content.includes('Welcome to Legal Assistant!')
  );
  
  // Get recent messages for context (limit to avoid token overflow)
  const recentMessages = conversationMessages.slice(-6);
  
  return recentMessages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
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
      content: '⚖️ **Welcome to Legal Assistant!**\n\nI can help you with questions about Indian laws, particularly the Bharatiya Nyaya Sanhita (BNS) and Indian Penal Code (IPC). I can also analyze uploaded legal documents like FIRs and complaints.\n\n**Examples of what you can ask:**\n- "What is section 1 about?"\n- "Tell me about definitions"\n- "What are the preliminary provisions?"\n- "What is murder under BNS?"\n- "Compare murder in BNS and IPC"\n- "Tell me about theft"\n- "Differences between BNS and IPC"\n\n**Document Analysis:**\n- Upload FIRs, complaints, or legal documents\n- Ask questions about uploaded documents\n- Get relevant legal sections for your case\n\nI maintain conversation context, so you can ask follow-up questions that reference our previous discussion!\n\nPlease ask your question or upload a document!',
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
    if (loading) return;

    console.log('Sending message:', content);
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setLoading(true);
    
    // Update conversations with user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversation?.id
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    try {
      let aiResponseContent: string;
      if (currentDocument) {
        // If a document is uploaded, query the document
        aiResponseContent = await processDocumentQuery(
          content,
          currentDocument,
          buildConversationHistory(currentConversation?.messages || [])
        );
      } else {
        // Otherwise, use the unified chat service
        aiResponseContent = await processUnifiedQuery(
          content,
          searchSectionsByKeywords,
          buildConversationHistory(currentConversation?.messages || [])
        );
      }

      console.log('AI Response received:', aiResponseContent);

      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      // Update conversations with AI response
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversation?.id
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      );

      // Update current conversation
      setCurrentConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, aiMessage],
          updatedAt: new Date(),
        };
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'I apologize, but I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      // Update conversations with error message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversation?.id
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );

      // Update current conversation with error message
      setCurrentConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, errorMessage],
          updatedAt: new Date(),
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const queryDocument = async (query: string) => {
    console.log('Querying document:', { query, currentDocument });
    if (!currentDocument) {
      console.error('No document is currently active');
      return;
    }

    // Create a user message for the query
    const userMessage: Message = {
      id: uuidv4(),
      content: query,
      role: 'user',
      timestamp: new Date(),
    };

    // Update conversations with user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversation?.id
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    // Update current conversation
    setCurrentConversation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        updatedAt: new Date(),
      };
    });

    try {
      const aiResponseContent = await processDocumentQuery(
        query,
        currentDocument,
        buildConversationHistory(currentConversation?.messages || [])
      );

      console.log('Document query response received:', aiResponseContent);

      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      // Update conversations with AI response
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversation?.id
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      );

      // Update current conversation
      setCurrentConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, aiMessage],
          updatedAt: new Date(),
        };
      });

    } catch (error) {
      console.error('Error querying document:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'I apologize, but I encountered an error while processing your question. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      // Update conversations with error message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversation?.id
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );

      // Update current conversation with error message
      setCurrentConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, errorMessage],
          updatedAt: new Date(),
        };
      });
    }
  };

  const processDocumentQuery = async (
    query: string, 
    document: ProcessedDocument, 
    conversationHistory: Array<{role: string, content: string}>
  ): Promise<string> => {
    console.log('Processing document query:', { query, documentId: document.id });
    if (!GEMINI_API_KEY) throw new Error('Gemini API key is not configured');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI assistant specialized in analyzing legal documents and answering questions based on their content.

Document Title: ${document.metadata.title}
Document Type: ${document.metadata.type}
Document Summary: ${document.metadata.summary || 'No summary available.'}

Full Document Content:
\`\`\`
${document.content.substring(0, 2000)}
\`\`\`

User Query: "${query}"

Based on the provided document content and the user's query, provide a detailed response that:
1. Directly answers the user's question using information from the document
2. References specific parts of the document when relevant
3. Identifies any legal sections or provisions mentioned
4. Provides context and explanation for legal terms or concepts
5. If the query cannot be answered from the document, clearly state this and suggest what information might be needed

Conversation history for context (latest first):
${conversationHistory.slice(-3).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}`;

    try {
      console.log('Sending prompt to AI:', prompt.substring(0, 200) + '...');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      });
      const response = await result.response;
      const text = response.text();
      if (!text) {
        throw new Error('Empty response from AI for document query.');
      }
      console.log('Received AI response:', text.substring(0, 200) + '...');
      return text;
    } catch (error) {
      console.error('Error querying document with AI:', error);
      throw new Error('Failed to query document: ' + (error as Error).message);
    }
  };

  const clearConversation = () => {
    if (!currentConversation) return;

    const welcomeMessage: Message = {
      id: uuidv4(),
      content: '⚖️ **Welcome to Legal Assistant!**\n\nI can help you with questions about Indian laws, particularly the Bharatiya Nyaya Sanhita (BNS) and Indian Penal Code (IPC). I can also analyze uploaded legal documents like FIRs and complaints.\n\n**Examples of what you can ask:**\n- "What is section 1 about?"\n- "Tell me about definitions"\n- "What are the preliminary provisions?"\n- "What is murder under BNS?"\n- "Compare murder in BNS and IPC"\n- "Tell me about theft"\n- "Differences between BNS and IPC"\n\n**Document Analysis:**\n- Upload FIRs, complaints, or legal documents\n- Ask questions about uploaded documents\n- Get relevant legal sections for your case\n\nI maintain conversation context, so you can ask follow-up questions that reference our previous discussion!\n\nPlease ask your question or upload a document!',
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
    
    // Clear current document when clearing conversation
    setCurrentDocument(null);
  };

  const setActiveDocument = (document: { id: string; name: string; content: string; summary: string }) => {
    console.log('Setting active document:', document);
    const processedDoc: ProcessedDocument = {
      id: document.id,
      content: document.content,
      metadata: {
        type: 'legal_document',
        title: document.name,
        summary: document.summary
      },
      fileName: document.name,
      fileSize: 0,
      uploadedAt: new Date()
    };
    setCurrentDocument(processedDoc);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        currentDocument,
        loading,
        createConversation,
        sendMessage,
        clearConversation,
        setCurrentDocument,
        queryDocument,
        messages: currentConversation?.messages || [],
        setActiveDocument,
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