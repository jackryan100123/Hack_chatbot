import axios from 'axios';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

type ConfidenceLevel = 'high' | 'medium' | 'low';
type LawType = 'BNS' | 'BNSS' | 'BSA' | 'IPC' | 'CrPC' | 'IEA';
type QueryIntent = 'punishment' | 'definition' | 'procedure' | 'comparison' | 'general' | 'specific_section' | 'sop_forms';

interface QueryAnalysis {
  keywords: string[];
  category: 'legal' | 'general' | 'mixed';
  primaryLaw: LawType | undefined;
  secondaryLaw: LawType | undefined;
  intent: QueryIntent;
  isComparison: boolean;
  specificSection: string | undefined;
  preferredLawType: 'current' | 'previous' | 'both';
}

interface EnhancedSection {
  law_type: LawType;
  section_number: string;
  section_title: string;
  content: string | string[];
  chapter_title?: string;
  chapter_name?: string;
  chapter_number?: string;
  is_new_law: boolean;
  relevanceScore: number;
  confidenceLevel: ConfidenceLevel;
  matchType: 'exact' | 'title' | 'punishment' | 'content' | 'section_number';
  keywordMatches: string[];
  intentMatch: boolean;
}

// Law mapping for comparison queries
const LAW_MAPPINGS = {
  'BNS': 'IPC',
  'BNSS': 'CrPC', 
  'BSA': 'IEA',
  'IPC': 'BNS',
  'CrPC': 'BNSS',
  'IEA': 'BSA'
};

// Enhanced keyword extraction with better intent detection
export const extractKeywords = async (userQuery: string): Promise<QueryAnalysis> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an advanced legal query analyzer for Indian laws. Analyze queries with precision to understand user intent.

CURRENT LAWS (2023):
- BNS (Bharatiya Nyaya Sanhita) - replaces IPC
- BNSS (Bharatiya Nagarik Suraksha Sanhita) - replaces CrPC  
- BSA (Bharatiya Sakshya Adhiniyam) - replaces IEA

PREVIOUS LAWS:
- IPC (Indian Penal Code) - replaced by BNS
- CrPC (Code of Criminal Procedure) - replaced by BNSS
- IEA (Indian Evidence Act) - replaced by BSA

INTENT DETECTION:
- punishment: queries about penalties, sentences, imprisonment, fines
- definition: queries about what constitutes a crime/offense
- procedure: queries about legal processes, filing, steps
- comparison: queries comparing old vs new laws or different sections
- specific_section: queries mentioning specific section numbers
- sop_forms: queries related to standard operating procedures (SOPs) or forms
- general: broad legal questions

LAW PREFERENCE LOGIC:
- Default to CURRENT laws (BNS/BNSS/BSA) unless specifically asked for old laws
- If user mentions both old and new laws, it's a comparison query
- If user specifically mentions IPC/CrPC/IEA, respect that choice
- If user asks about "current law" or "new law", prioritize BNS/BNSS/BSA

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
  "keywords": ["keyword1", "keyword2"],
  "category": "legal|general|mixed",
  "primaryLaw": "BNS|BNSS|BSA|IPC|CrPC|IEA|undefined",
  "secondaryLaw": "BNS|BNSS|BSA|IPC|CrPC|IEA|undefined",
  "intent": "punishment|definition|procedure|comparison|general|specific_section|sop_forms",
  "isComparison": true|false,
  "specificSection": "section_number|undefined",
  "preferredLawType": "current|previous|both"
}

DO NOT include any other text or explanation. ONLY output the JSON object.`
          },
          {
            role: 'user',
            content: `Analyze this query: "${userQuery}"

Examples for reference:
"What is punishment for murder?" → primaryLaw: "BNS", intent: "punishment", preferredLawType: "current"
"What is murder under IPC?" → primaryLaw: "IPC", intent: "definition", preferredLawType: "previous"  
"Compare murder punishment in BNS and IPC" → primaryLaw: "BNS", secondaryLaw: "IPC", intent: "comparison", isComparison: true
"Section 302 IPC" → primaryLaw: "IPC", intent: "specific_section", specificSection: "302"
"How to file FIR?" → primaryLaw: "BNSS", intent: "procedure", preferredLawType: "current"
"Do you have any forms?" -> intent: "sop_forms"
"Where can I find SOPs?" -> intent: "sop_forms"`
          }
        ],
        max_tokens: 200,
        temperature: 0.1,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Validate that the response is a valid JSON object
    if (!content || typeof content !== 'string' || !content.trim().startsWith('{')) {
      console.warn('Invalid JSON response from Groq API:', content);
      return performFallbackAnalysis(userQuery);
    }

    try {
      const parsed = JSON.parse(content);
      
      // Validate required fields
      if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
        console.warn('Invalid keywords in response:', parsed);
        return performFallbackAnalysis(userQuery);
      }

      return {
        keywords: parsed.keywords || [],
        category: parsed.category || 'general',
        primaryLaw: parsed.primaryLaw || undefined,
        secondaryLaw: parsed.secondaryLaw || undefined,
        intent: parsed.intent || 'general',
        isComparison: parsed.isComparison || false,
        specificSection: parsed.specificSection || undefined,
        preferredLawType: parsed.preferredLawType || 'current'
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return performFallbackAnalysis(userQuery);
    }
  } catch (error) {
    console.error('Error extracting keywords from Groq API:', error);
    return performFallbackAnalysis(userQuery);
  }
};

// Fallback analysis when API fails
const performFallbackAnalysis = (userQuery: string): QueryAnalysis => {
  const queryLower = userQuery.toLowerCase();
  
  // Extract keywords using simple text processing
  const commonWords = ['the', 'is', 'what', 'how', 'when', 'where', 'why', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const keywords = queryLower.split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10);

  // Detect intent
  let intent: QueryIntent = 'general';
  if (/punishment|penalty|sentence|imprisonment|fine|jail|prison/.test(queryLower)) {
    intent = 'punishment';
  } else if (/what is|define|definition|meaning/.test(queryLower)) {
    intent = 'definition';
  } else if (/how to|procedure|process|file|apply/.test(queryLower)) {
    intent = 'procedure';
  } else if (/compare|comparison|difference|vs|versus/.test(queryLower)) {
    intent = 'comparison';
  } else if (/section \d+/.test(queryLower)) {
    intent = 'specific_section';
  } else if (/sop|s\.o\.p\.|forms|documents|templates/.test(queryLower)) {
    intent = 'sop_forms';
  }

  // Detect law types
  let primaryLaw: LawType | undefined;
  let secondaryLaw: LawType | undefined;
  let preferredLawType: 'current' | 'previous' | 'both' = 'current';

  const lawMentions = {
    BNS: /\bbns\b|bharatiya nyaya/i.test(userQuery),
    BNSS: /\bbnss\b|bharatiya nagarik|nagarik suraksha/i.test(userQuery),
    BSA: /\bbsa\b|bharatiya sakshya|sakshya adhiniyam/i.test(userQuery),
    IPC: /\bipc\b|indian penal/i.test(userQuery),
    CrPC: /\bcrpc\b|criminal procedure/i.test(userQuery),
    IEA: /\biea\b|evidence act/i.test(userQuery)
  };

  const mentionedLaws = Object.entries(lawMentions)
    .filter(([_, mentioned]) => mentioned)
    .map(([law, _]) => law as LawType);

  if (mentionedLaws.length === 1) {
    primaryLaw = mentionedLaws[0];
    preferredLawType = ['BNS', 'BNSS', 'BSA'].includes(primaryLaw) ? 'current' : 'previous';
  } else if (mentionedLaws.length === 2) {
    [primaryLaw, secondaryLaw] = mentionedLaws;
    intent = 'comparison';
    preferredLawType = 'both';
  } else {
    // Infer based on context
    if (/murder|theft|assault|robbery/.test(queryLower)) primaryLaw = 'BNS';
    else if (/fir|arrest|investigation|bail/.test(queryLower)) primaryLaw = 'BNSS';
    else if (/evidence|witness|testimony/.test(queryLower)) primaryLaw = 'BSA';
  }

  // Extract specific section
  const sectionMatch = queryLower.match(/section (\d+)/);
  const specificSection = sectionMatch ? sectionMatch[1] : undefined;

    return {
    keywords,
    category: 'legal',
    primaryLaw,
    secondaryLaw,
    intent,
    isComparison: mentionedLaws.length > 1,
    specificSection,
    preferredLawType
  };
};

// Enhanced section scoring and ranking
const scoreSection = (
  section: any, 
  analysis: QueryAnalysis, 
  userQuery: string
): EnhancedSection => {
  const queryLower = userQuery.toLowerCase();
  const sectionTitle = (section.section_title || '').toLowerCase();
  const sectionContent = Array.isArray(section.content) 
    ? section.content.join(' ').toLowerCase() 
    : (section.content || '').toLowerCase();

  let score = 0;
  let confidenceLevel: ConfidenceLevel = 'low';
  let matchType: EnhancedSection['matchType'] = 'content';
  let keywordMatches: string[] = [];
  let intentMatch = false;

  // 1. Law type preference scoring
  if (analysis.primaryLaw && section.law_type === analysis.primaryLaw) {
    score += 50;
    confidenceLevel = 'high';
  } else if (analysis.preferredLawType === 'current' && ['BNS', 'BNSS', 'BSA'].includes(section.law_type)) {
    score += 30;
  } else if (analysis.preferredLawType === 'previous' && ['IPC', 'CrPC', 'IEA'].includes(section.law_type)) {
    score += 30;
  }

  // 2. Specific section number match
  if (analysis.specificSection && section.section_number === analysis.specificSection) {
    score += 100;
    confidenceLevel = 'high';
    matchType = 'section_number';
  }

  // 3. Keyword matching
  analysis.keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // Title matches (highest priority)
    if (sectionTitle.includes(keywordLower)) {
      keywordMatches.push(keyword);
      if (sectionTitle === keywordLower || sectionTitle.includes(`of ${keywordLower}`)) {
        score += 40;
        matchType = 'exact';
        confidenceLevel = 'high';
      } else {
        score += 25;
        matchType = matchType === 'content' ? 'title' : matchType;
      }
    }
    
    // Content matches
    else if (sectionContent.includes(keywordLower)) {
      keywordMatches.push(keyword);
      score += 10;
    }
  });

  // 4. Intent-based scoring
  switch (analysis.intent) {
    case 'punishment':
      const punishmentTerms = ['punishment', 'shall be punished', 'imprisonment', 'fine', 'death', 'rigorous imprisonment', 'simple imprisonment'];
      if (punishmentTerms.some(term => sectionContent.includes(term))) {
        score += 35;
        intentMatch = true;
        matchType = 'punishment';
        confidenceLevel = 'high';
      }
      break;
      
    case 'definition':
      if (sectionTitle.includes('definition') || sectionContent.includes('means') || sectionContent.includes('defined as')) {
        score += 30;
        intentMatch = true;
      }
      break;
      
    case 'procedure':
      const procedureTerms = ['procedure', 'process', 'shall', 'may', 'application', 'filing'];
      if (procedureTerms.some(term => sectionContent.includes(term))) {
        score += 25;
        intentMatch = true;
      }
      break;
    case 'sop_forms':
      const sopFormsTerms = ['sop', 's\.o\.p\.', 'forms', 'documents', 'templates'];
      if (sopFormsTerms.some(term => queryLower.includes(term))) {
        score += 10; // Small boost for these queries as the main response is informational
        intentMatch = true;
      }
      break;
  }

  // 5. Multiple keyword bonus
  if (keywordMatches.length > 1) {
    score += keywordMatches.length * 5;
  }

  // 6. Confidence level adjustment
  if (score >= 80) confidenceLevel = 'high';
  else if (score >= 40) confidenceLevel = 'medium';

  return {
    ...section,
    law_type: section.law_type,
    is_new_law: ['BNS', 'BNSS', 'BSA'].includes(section.law_type),
    relevanceScore: score,
    confidenceLevel,
    matchType,
    keywordMatches: Array.from(new Set(keywordMatches)),
    intentMatch
  };
};

// Enhanced section filtering and ranking
const filterAndRankSections = (
  sections: any[], 
  analysis: QueryAnalysis, 
  userQuery: string
): EnhancedSection[] => {
  // Score all sections
  const scoredSections = sections.map(section => 
    scoreSection(section, analysis, userQuery)
  );

  // Filter and sort
  let filteredSections = scoredSections;

  // For comparison queries, get sections from both laws
  if (analysis.isComparison && analysis.primaryLaw && analysis.secondaryLaw) {
    const primarySections = scoredSections.filter(s => s.law_type === analysis.primaryLaw);
    const secondarySections = scoredSections.filter(s => s.law_type === analysis.secondaryLaw);
    
    // Interleave sections from both laws
    filteredSections = [];
    const maxLength = Math.max(primarySections.length, secondarySections.length);
    for (let i = 0; i < maxLength; i++) {
      if (primarySections[i]) filteredSections.push(primarySections[i]);
      if (secondarySections[i]) filteredSections.push(secondarySections[i]);
    }
  } else {
    // For non-comparison queries, prioritize based on preference
    filteredSections = scoredSections.sort((a, b) => {
      // First by relevance score
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // Then by confidence level
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      if (b.confidenceLevel !== a.confidenceLevel) {
        return confidenceOrder[b.confidenceLevel] - confidenceOrder[a.confidenceLevel];
      }
      
      // Then by law preference
      if (analysis.preferredLawType === 'current') {
        if (a.is_new_law !== b.is_new_law) {
          return a.is_new_law ? -1 : 1;
        }
      } else if (analysis.preferredLawType === 'previous') {
        if (a.is_new_law !== b.is_new_law) {
          return a.is_new_law ? 1 : -1;
        }
      }
      
      return 0;
    });
  }

  return filteredSections;
};

// Enhanced response generation
export const processLegalResponse = async (
  userQuery: string,
  allSections: any[],
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    // 1. Analyze the query
    const analysis = await extractKeywords(userQuery);
    
    // 2. Filter and rank sections
    const rankedSections = filterAndRankSections(allSections, analysis, userQuery);
    
    // 3. Select top sections (limit based on query type)
    const maxSections = analysis.isComparison ? 10 : 8; // Reduced from 20/15 to 10/8
    const topSections = rankedSections.slice(0, maxSections);

    if (topSections.length === 0) {
      return "I couldn't find any relevant legal sections for your query. Please try rephrasing your question or provide more specific details.";
    }

    // 4. Prepare sections data for AI with content truncation
    const sectionsData = topSections.map((section, index) => ({
      rank: index + 1,
      law_type: section.law_type,
      law_name: getLawFullName(section.law_type),
      section_number: section.section_number,
      section_title: section.section_title,
      content: Array.isArray(section.content) 
        ? section.content.join(' ').substring(0, 500) // Truncate content to 500 chars
        : (section.content || '').substring(0, 500),
      relevance_score: section.relevanceScore,
      confidence_level: section.confidenceLevel,
      match_type: section.matchType,
      intent_match: section.intentMatch,
      is_new_law: section.is_new_law,
      keyword_matches: section.keywordMatches.slice(0, 5) // Limit to top 5 keyword matches
    }));

    // 5. Build conversation context (limit to last 2 messages)
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nCONVERSATION HISTORY:\n${conversationHistory.slice(-2).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}\n\n`
      : '';

    // 6. Prepare the prompt with reduced data
    const prompt = `You are an AI assistant specialized in Indian law analysis. Analyze the following query and relevant legal sections to provide a comprehensive response.

USER QUERY: "${userQuery}"

RELEVANT SECTIONS:
${sectionsData.map(section => `
📜 ${section.law_name} - Section ${section.section_number}
Title: ${section.section_title}
Content: ${section.content}
Relevance: ${section.relevance_score} (${section.confidence_level} confidence)
`).join('\n')}${conversationContext}

Provide a detailed response that:
1. Directly answers the user's question using information from the relevant sections
2. Cites specific section numbers when referencing laws
3. Explains legal concepts in clear, simple language
4. Highlights key points and practical implications
5. If comparing laws, clearly show differences and current applicability

Format your response with appropriate markdown headings and bullet points for clarity.`;

    // 7. Make the API request with reduced max_tokens
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert legal assistant specializing in Indian law. Provide clear, accurate, and well-structured responses using markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000, // Reduced from default
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    return aiResponse || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

  } catch (error) {
    console.error('Error processing legal response:', error);
    return "I apologize, but I encountered an error while processing your legal query. Please try rephrasing your question or try again later.";
  }
};

// Helper function to get full law names
const getLawFullName = (lawType: LawType): string => {
  const lawNames = {
    'BNS': 'Bharatiya Nyaya Sanhita (BNS) 2023',
    'BNSS': 'Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023',
    'BSA': 'Bharatiya Sakshya Adhiniyam (BSA) 2023',
    'IPC': 'Indian Penal Code (IPC) 1860',
    'CrPC': 'Code of Criminal Procedure (CrPC) 1973',
    'IEA': 'Indian Evidence Act (IEA) 1872'
  };
  return lawNames[lawType] || lawType;
};

// Generate analysis footer
const generateAnalysisFooter = (sections: EnhancedSection[], analysis: QueryAnalysis): string => {
  const highConfidence = sections.filter(s => s.confidenceLevel === 'high').length;
  const mediumConfidence = sections.filter(s => s.confidenceLevel === 'medium').length;
  const currentLaw = sections.filter(s => s.is_new_law).length;
  const previousLaw = sections.filter(s => !s.is_new_law).length;

  return `📊 **Analysis Summary:** Found ${sections.length} relevant sections | ${highConfidence} high confidence, ${mediumConfidence} medium confidence | ${currentLaw} current law sections, ${previousLaw} previous law sections | Intent: ${analysis.intent} | Query type: ${analysis.isComparison ? 'Comparison' : 'Standard'}`;
};

// Enhanced general response function
const getGeneralResponse = async (userQuery: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert legal assistant specializing in Indian law. Provide clear, helpful responses about legal concepts, procedures, and general legal information.

When explaining legal concepts:
1. Use simple, clear language
2. Provide practical examples
3. Explain both current and previous laws when relevant
4. Include relevant section numbers when applicable
5. Format your response with markdown for better readability

Current Laws (2023):
- BNS (Bharatiya Nyaya Sanhita) - replaced IPC
- BNSS (Bharatiya Nagarik Suraksha Sanhita) - replaced CrPC
- BSA (Bharatiya Sakshya Adhiniyam) - replaced IEA

Previous Laws:
- IPC (Indian Penal Code) - replaced by BNS
- CrPC (Code of Criminal Procedure) - replaced by BNSS
- IEA (Indian Evidence Act) - replaced by BSA`
          },
          {
            role: 'user',
            content: `Please explain: "${userQuery}"

${conversationHistory.length > 0 ? `\nConversation context:\n${conversationHistory.slice(-2).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}` : ''}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error) {
    console.error('Error generating general response:', error);
    return "I apologize, but I encountered an error. Please try again or rephrase your question.";
  }
};

// Main processing function
export const processUnifiedQuery = async (
  userQuery: string,
  searchFunction: (keywords: string[]) => any[],
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> => {
  try {
    // Step 1: Analyze the query
    const analysis = await extractKeywords(userQuery);
    
    // Step 2: Search for relevant sections
    const allSections = searchFunction(analysis.keywords);
    
    // Step 3: Route based on analysis
    if (analysis.category === 'legal' && allSections.length > 0) {
      return await processLegalResponse(userQuery, allSections, conversationHistory);
    }
    
    // Step 4: Handle general queries or when no specific sections found
    return await getGeneralResponse(userQuery, conversationHistory);
    
  } catch (error) {
    console.error('Error in unified query processing:', error);
    return "I apologize, but I encountered an error while processing your query. Please try again or rephrase your question.";
  }
};

// Export the enhanced ChatService class
export class ChatService {
  private readonly API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  private readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  public async processQuery(
    query: string, 
    searchFunction: (keywords: string[]) => any[],
    conversationHistory: Array<{role: string, content: string}> = []
  ): Promise<string> {
    return await processUnifiedQuery(query, searchFunction, conversationHistory);
  }
}