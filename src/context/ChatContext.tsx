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
      
      // Build conversation history for context (excluding the current user message)
      const conversationHistory = buildConversationHistory(updatedConversation.messages.slice(0, -1));
      
      let responseContent: string;
      
      // If there's a current document, include it in the context
      if (currentDocument) {
        responseContent = await processDocumentQuery(content, currentDocument, conversationHistory);
      } else {
        // Use the unified processing function with conversation context
        responseContent = await processUnifiedQuery(content, searchSectionsByKeywords, conversationHistory);
      }

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

  const queryDocument = async (query: string) => {
    if (!currentDocument) return;
    await sendMessage(query);
  };

  const processDocumentQuery = async (
    query: string, 
    document: ProcessedDocument, 
    conversationHistory: Array<{role: string, content: string}>
  ): Promise<string> => {
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!API_KEY) {
      return `Based on the uploaded document "${document.metadata.title}", I can see it's a ${document.metadata.type}. However, I need the GROQ API key to provide detailed analysis. Please check your environment configuration.`;
    }

    try {
      // Extract keywords from the document and query
      const documentKeywords = [
        ...(document.metadata.keywords || []),
        ...(document.metadata.sections || []),
        document.metadata.type,
        ...(document.metadata.caseNumber ? [document.metadata.caseNumber] : [])
      ];

      // Search for relevant legal sections
      const queryKeywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const allKeywords = [...new Set([...documentKeywords, ...queryKeywords])];
      const relevantSections = searchSectionsByKeywords(allKeywords);

      // Build conversation context
      const conversationContext = conversationHistory.length > 0 
        ? `\n\nCONVERSATION HISTORY (for context):\n${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}\n\n`
        : '';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a specialized legal assistant analyzing uploaded legal documents in the context of Indian law.

DOCUMENT CONTEXT:
- Document Type: ${document.metadata.type}
- Title: ${document.metadata.title}
- Case Number: ${document.metadata.caseNumber || 'Not specified'}
- Date: ${document.metadata.date || 'Not specified'}
- Identified Sections: ${document.metadata.sections?.join(', ') || 'None identified'}
- Keywords: ${document.metadata.keywords?.join(', ') || 'None identified'}

LEGAL SECTIONS AVAILABLE:
You have access to ${relevantSections.length} relevant legal sections from current laws (BNS, BNSS, BSA) and previous laws (IPC, CrPC, IEA).

RESPONSE GUIDELINES:
1. **Document Analysis**: Analyze the uploaded document in relation to the user's query
2. **Legal Mapping**: Map document content to relevant legal sections
3. **Practical Guidance**: Provide actionable legal advice based on the document
4. **Section References**: Cite specific legal sections that apply to the document
5. **Procedural Steps**: Suggest next steps based on the document type and content

RESPONSE STRUCTURE:
📄 **Document Analysis:** [Analysis of the uploaded document in context of the query]

⚖️ **Applicable Legal Sections:** [Relevant sections from BNS/BNSS/BSA and their applications]

🔍 **Case Assessment:** [Assessment of the legal situation based on the document]

📋 **Recommended Actions:** [Practical next steps and recommendations]

💡 **Additional Considerations:** [Important legal considerations and warnings]

Focus on providing practical, actionable legal guidance based on the specific document uploaded and the user's query.`
            },
            {
              role: 'user',
              content: `${conversationContext}UPLOADED DOCUMENT CONTENT (first 2000 characters):
${document.content.substring(0, 2000)}

USER QUERY: "${query}"

RELEVANT LEGAL SECTIONS:
${JSON.stringify(relevantSections.slice(0, 10), null, 2)}

Please analyze this document and answer the user's query with specific reference to applicable legal sections and practical guidance.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process document query');
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error processing document query:', error);
      return `I encountered an error while analyzing your document. However, I can see that you've uploaded a ${document.metadata.type} titled "${document.metadata.title}". Please try rephrasing your question or ask about specific aspects of the document.`;
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