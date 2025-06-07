import axios from 'axios';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

type ConfidenceLevel = 'high' | 'medium' | 'low';
const confidenceOrder: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1
};

// Enhanced keyword extraction to detect both legal and general queries
export const extractKeywords = async (userQuery: string): Promise<string[]> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a tool that extracts **only direct keywords or section numbers present in the user input** that are related to Indian law.

Extract keywords for:
- BNS (Bharatiya Nyaya Sanhita) and IPC (Indian Penal Code) references
- Legal terms like: murder, theft, assault, rape, kidnapping, cheating, defamation, etc.
- Legal procedures: FIR, arrest, warrant, bail, detention, remand, etc.
- Section numbers: "Section 101", "BNS 103", "IPC 302", etc.
- Legal concepts: punishment, penalty, imprisonment, fine, etc.

Output a JSON like: { "keywords": ["sedition", "Section 101", "murder"] } and nothing else.

If the user query has NO legal keywords or sections (e.g., casual chat, general questions, greetings), return:
{ "keywords": [] }

Never add anything not explicitly in the user's input. No guessing, no interpretation.`
          },
          {
            role: 'user',
            content: userQuery,
          }
        ],
        max_tokens: 60,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
      throw new Error('Invalid keyword format from Groq response.');
    }

    return parsed.keywords;
  } catch (error) {
    console.error('Error extracting keywords from Groq API:', error);
    return [];
  }
};

// Enhanced legal analysis with BNS and IPC comparison
export const processLegalResponse = async (
  userQuery: string,
  matchedSections: any[],
  keywords: string[]
): Promise<string> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    const analyzedSections = analyzeAllSections(matchedSections, userQuery, keywords);
    const topSections = analyzedSections.slice(0, 15);

    const bnsSections = topSections.filter(section => section.law_type === 'BNS');
    const ipcSections = topSections.filter(section => section.law_type === 'IPC');

    const sectionsData = topSections.map((section, index) => ({
      relevance_rank: index + 1,
      relevance_score: section.relevanceScore || 0,
      confidence_level: section.confidenceLevel,
      match_type: section.matchType,
      law_type: section.law_type,
      law_name: section.law_type === 'BNS' ? 'Bharatiya Nyaya Sanhita (BNS)' : 'Indian Penal Code (IPC)',
      chapter: section.law_type === 'BNS' 
        ? `${section.chapter_title} - ${section.chapter_name}` 
        : `${section.chapter_title || 'Chapter'} ${section.chapter_number || ''} - ${section.chapter_name || ''}`.trim(),
      section_number: section.section_number,
      section_title: section.section_title,
      content: Array.isArray(section.content) ? section.content.join(' ') : section.content,
      keyword_matches: section.keywordMatches || []
    }));

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a legal assistant helping users understand Indian law, specifically the Bharatiya Nyaya Sanhita (BNS) and Indian Penal Code (IPC).

CRITICAL INSTRUCTIONS:
1. You have access to ${matchedSections.length} total matching sections from BOTH BNS and IPC
2. BNS sections found: ${bnsSections.length} | IPC sections found: ${ipcSections.length}
3. BNS is the NEW law (2023) that replaces IPC (old law)
4. Always prioritize BNS sections as they are current, but show IPC for comparison
5. Sections are ranked by relevance score and confidence level (high/medium/low)
6. Focus on HIGH confidence and TOP-RANKED sections that directly answer the question

RESPONSE STRUCTURE:
🎯 **Answer:** [Direct answer prioritizing BNS but mentioning IPC changes]

📖 **Current Law (BNS):** [Focus on BNS sections - these are what apply now]

⚖️ **Previous Law (IPC):** [Show corresponding IPC sections for comparison]

🔄 **Key Changes:** [Highlight major differences between BNS and IPC if both exist]

💡 **Practical Information:** [What this means in simple terms, focusing on current BNS provisions]

COMPARISON GUIDELINES:
- If both BNS and IPC sections exist for the same topic, compare them
- Highlight section number changes (e.g., IPC 302 → BNS 103)
- Note any changes in punishment, definitions, or procedures
- Make it clear which law is currently applicable (BNS)
- If only one law has relevant sections, mention that explicitly

PRIORITIZATION:
- Prioritize sections with confidence_level = 'high'
- Focus on BNS sections first, then IPC for comparison
- Emphasize sections with match_type = 'exact', 'title', or 'punishment'
- If asking about punishment/penalties, highlight those specific sections first`
          },
          {
            role: 'user',
            content: `User Query: "${userQuery}"

Keywords Found: ${keywords.join(', ')}

Total Matching Sections: ${matchedSections.length}
BNS Sections: ${bnsSections.length}
IPC Sections: ${ipcSections.length}
Top Sections for Analysis: ${topSections.length}

Relevant Legal Sections (ordered by relevance and confidence):
${JSON.stringify(sectionsData, null, 2)}

Please analyze all provided sections, compare BNS and IPC where applicable, and focus your response on the highest-confidence, most relevant ones that directly answer the user's question. Remember to prioritize current BNS law while showing IPC for comparison.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.1,
        top_p: 0.85,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let aiResponse = response.data.choices[0].message.content;
    const analysisNote = generateAnalysisNote(matchedSections.length, topSections.length, analyzedSections, bnsSections.length, ipcSections.length);
    aiResponse += `\n\n${analysisNote}`;

    return aiResponse;
  } catch (error) {
    console.error('Error processing legal response with AI:', error);
    return formatSectionsEnhanced(matchedSections, keywords, userQuery);
  }
};

// Enhanced general response for non-legal queries
export const getGeneralResponse = async (userQuery: string): Promise<string> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant with knowledge of both general topics and Indian civic awareness. 

Provide informative, accurate responses to user queries. If the question has any connection to Indian law, legal procedures, or civic matters, you can mention relevant general information but avoid citing specific legal sections (as those are handled separately).

Keep responses helpful, concise, and well-structured. Use a friendly and professional tone.`,
          },
          {
            role: 'user',
            content: userQuery,
          },
        ],
        max_tokens: 1200,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting general response from Groq:', error);
    return 'Sorry, I could not process your query at the moment. Please try again.';
  }
};

// NEW: Unified processing function that tries legal first, then general
export const processUnifiedQuery = async (
  userQuery: string,
  searchFunction: (keywords: string[]) => any[]
): Promise<string> => {
  try {
    // Step 1: Extract keywords to check for legal content
    const keywords = await extractKeywords(userQuery);
    
    // Step 2: If legal keywords found, try legal search
    if (keywords.length > 0) {
      const matchedSections = searchFunction(keywords);
      
      // Step 3: If legal sections found, process with legal AI
      if (matchedSections.length > 0) {
        return await processLegalResponse(userQuery, matchedSections, keywords);
      }
    }
    
    // Step 4: If no legal content found, use general AI response
    return await getGeneralResponse(userQuery);
    
  } catch (error) {
    console.error('Error in unified query processing:', error);
    
    // Fallback to general response on error
    try {
      return await getGeneralResponse(userQuery);
    } catch (fallbackError) {
      console.error('Error in fallback general response:', fallbackError);
      return 'I apologize, but I encountered an error while processing your query. Please try rephrasing your question or try again later.';
    }
  }
};

const analyzeAllSections = (sections: any[], userQuery: string, keywords: string[]) => {
  const queryLower = userQuery.toLowerCase();
  const keywordsLower = keywords.map(k => k.toLowerCase());

  return sections.map(section => {
    let enhancedScore = section.relevanceScore || 0;
    let confidenceLevel: ConfidenceLevel = 'low';
    let matchType = 'content';
    let keywordMatches: string[] = [];

    const sectionTitle = section.section_title?.toLowerCase() || '';
    const sectionContent = Array.isArray(section.content)
      ? section.content.join(' ').toLowerCase()
      : (section.content || '').toLowerCase();

    // Keyword matching in title
    keywordsLower.forEach(keyword => {
      if (sectionTitle.includes(keyword)) {
        keywordMatches.push(keyword);
        if (sectionTitle === keyword || sectionTitle.includes(`of ${keyword}`) || sectionTitle.includes(`${keyword} of`)) {
          enhancedScore += 25;
          confidenceLevel = 'high';
          matchType = 'exact';
        } else {
          enhancedScore += 15;
          confidenceLevel = confidenceLevel === 'low' ? 'medium' : confidenceLevel;
          matchType = matchType === 'content' ? 'title' : matchType;
        }
      }
    });

    // Punishment-related query detection
    const punishmentTerms = ['punishment', 'penalty', 'sentence', 'imprisonment', 'fine', 'years', 'death'];
    const isPunishmentQuery = punishmentTerms.some(term => queryLower.includes(term));
    if (isPunishmentQuery && punishmentTerms.some(term => sectionContent.includes(term))) {
      enhancedScore += 20;
      confidenceLevel = 'high';
      matchType = 'punishment';
    }

    // Multiple keyword matches bonus
    const uniqueMatches = [...new Set(keywordMatches)];
    if (uniqueMatches.length > 1) {
      enhancedScore += uniqueMatches.length * 8;
      confidenceLevel = 'high';
    }

    // Section number exact match
    const sectionNumberMatch = queryLower.match(/section\s+(\d+)/);
    if (sectionNumberMatch && section.section_number === sectionNumberMatch[1]) {
      enhancedScore += 50;
      confidenceLevel = 'high';
      matchType = 'exact';
    }

    // BNS preference bonus (since it's the current law)
    if (section.law_type === 'BNS') {
      enhancedScore += 5;
    }

    // Confidence level adjustment
    if (enhancedScore >= 60) confidenceLevel = 'high';
    else if (enhancedScore >= 30) confidenceLevel = 'medium';

    return {
      ...section,
      relevanceScore: enhancedScore,
      confidenceLevel,
      matchType,
      keywordMatches: uniqueMatches
    };
  }).sort((a, b) => {
    // First sort by confidence level
    const confidenceDiff = confidenceOrder[b.confidenceLevel as ConfidenceLevel] - confidenceOrder[a.confidenceLevel as ConfidenceLevel];
    if (confidenceDiff !== 0) return confidenceDiff;
    
    // Then by BNS preference
    if (a.law_type !== b.law_type) {
      return a.law_type === 'BNS' ? -1 : 1;
    }
    
    // Finally by relevance score
    return b.relevanceScore - a.relevanceScore;
  });
};

const generateAnalysisNote = (total: number, selected: number, all: any[], bnsCount: number, ipcCount: number) => {
  const high = all.filter(s => s.confidenceLevel === 'high').length;
  const med = all.filter(s => s.confidenceLevel === 'medium').length;
  
  let note = `📊 **Legal Analysis:** Found ${total} matching sections from both BNS and IPC laws. `;
  note += `Analyzed ${bnsCount} BNS sections and ${ipcCount} IPC sections. `;
  
  if (high > 0) {
    note += `${high} high-confidence matches`;
    if (med > 0) note += ` and ${med} medium-confidence matches`;
    note += '. Response prioritized current BNS law with IPC comparison.';
  } else if (med > 0) {
    note += `${med} medium-confidence matches found. Response covers the most relevant sections from both laws.`;
  } else {
    note += `Showing top ${selected} most relevant sections from comprehensive analysis.`;
  }
  
  if (bnsCount > 0 && ipcCount > 0) {
    note += ' Both current (BNS) and previous (IPC) provisions analyzed.';
  } else if (bnsCount > 0) {
    note += ' Results show current BNS provisions only.';
  } else if (ipcCount > 0) {
    note += ' Results show previous IPC provisions only.';
  }
  
  return note;
};

const formatSectionsEnhanced = (sections: any[], keywords: string[], userQuery: string) => {
  const analyzed = analyzeAllSections(sections, userQuery, keywords);
  const topSections = analyzed.slice(0, 10);
  
  const bnsSections = topSections.filter(section => section.law_type === 'BNS');
  const ipcSections = topSections.filter(section => section.law_type === 'IPC');

  let response = `🔍 **Legal Search Results**\n\n`;
  response += `📊 **Analysis:** Found ${sections.length} total sections (${bnsSections.length} BNS, ${ipcSections.length} IPC). Showing top ${topSections.length} most relevant:\n\n`;

  // Show BNS sections first
  if (bnsSections.length > 0) {
    response += `## 📖 **Current Law - Bharatiya Nyaya Sanhita (BNS)**\n\n`;
    bnsSections.forEach((section, index) => {
      const content = Array.isArray(section.content) ? section.content.join(' ') : section.content;
      response += `**${index + 1}. BNS Section ${section.section_number}** (${section.confidenceLevel} confidence)\n`;
      response += `**Title:** ${section.section_title}\n`;
      response += `**Chapter:** ${section.chapter_title} - ${section.chapter_name}\n`;
      if (section.keywordMatches?.length) {
        response += `**Matches:** ${section.keywordMatches.join(', ')}\n`;
      }
      response += `**Content:** ${content.substring(0, 300)}${content.length > 300 ? '...' : ''}\n\n`;
    });
  }

  // Show IPC sections for comparison
  if (ipcSections.length > 0) {
    response += `## ⚖️ **Previous Law - Indian Penal Code (IPC)**\n\n`;
    ipcSections.forEach((section, index) => {
      const content = Array.isArray(section.content) ? section.content.join(' ') : section.content;
      response += `**${index + 1}. IPC Section ${section.section_number}** (${section.confidenceLevel} confidence)\n`;
      response += `**Title:** ${section.section_title}\n`;
      if (section.chapter_title) {
        response += `**Chapter:** ${section.chapter_title}${section.chapter_name ? ' - ' + section.chapter_name : ''}\n`;
      }
      if (section.keywordMatches?.length) {
        response += `**Matches:** ${section.keywordMatches.join(', ')}\n`;
      }
      response += `**Content:** ${content.substring(0, 300)}${content.length > 300 ? '...' : ''}\n\n`;
    });
  }

  if (bnsSections.length > 0 && ipcSections.length > 0) {
    response += `\n🔄 **Note:** BNS is the current law that replaced IPC. The sections above show both current provisions (BNS) and previous provisions (IPC) for comparison.\n`;
  }

  return response;
};