import axios from 'axios';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

type ConfidenceLevel = 'high' | 'medium' | 'low';
const confidenceOrder: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1
};

// Enhanced keyword extraction with intelligent categorization
export const extractKeywords = async (userQuery: string): Promise<{
  keywords: string[];
  category: 'legal' | 'general' | 'mixed';
  lawType: string | undefined;
  intent: string | undefined;
}> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent legal query analyzer that categorizes and extracts information from user queries.

Analyze the query for:
1. Legal keywords and section numbers
2. Query category (legal/general/mixed)
3. Specific law type (BNS/BNSS/BSA/IPC/CrPC/IEA)
4. User intent (definition/explanation/comparison/procedure)

Output JSON format:
{
  "keywords": ["keyword1", "keyword2"],
  "category": "legal|general|mixed",
  "lawType": "BNS|BNSS|BSA|IPC|CrPC|IEA|undefined",
  "intent": "definition|explanation|comparison|procedure|general|undefined"
}

Examples:
Input: "What is murder under BNS?"
Output: {
  "keywords": ["murder", "BNS"],
  "category": "legal",
  "lawType": "BNS",
  "intent": "definition"
}

Input: "How to file an FIR?"
Output: {
  "keywords": ["FIR", "file"],
  "category": "legal",
  "lawType": "BNSS",
  "intent": "procedure"
}

Input: "Hello, how are you?"
Output: {
  "keywords": [],
  "category": "general",
  "lawType": undefined,
  "intent": undefined
}`
          },
          {
            role: 'user',
            content: userQuery,
          }
        ],
        max_tokens: 150,
        temperature: 0.1,
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
    return {
      keywords: parsed.keywords || [],
      category: parsed.category || 'general',
      lawType: parsed.lawType || undefined,
      intent: parsed.intent || undefined
    };
  } catch (error) {
    console.error('Error extracting keywords from Groq API:', error);
    return {
      keywords: [],
      category: 'general',
      lawType: undefined,
      intent: undefined
    };
  }
};

// Enhanced language detection with support for multiple Indian languages
const detectLanguage = (userQuery: string): {
  language: 'hindi' | 'punjabi' | 'telugu' | 'malayalam' | 'english';
  confidence: number;
} => {
  // Check for native script characters first
  if (/[\u0900-\u097F]/.test(userQuery)) return { language: 'hindi', confidence: 1 };
  if (/[\u0A00-\u0A7F]/.test(userQuery)) return { language: 'punjabi', confidence: 1 };
  if (/[\u0C00-\u0C7F]/.test(userQuery)) return { language: 'telugu', confidence: 1 };
  if (/[\u0D00-\u0D7F]/.test(userQuery)) return { language: 'malayalam', confidence: 1 };

  // Enhanced word lists for each language written in English
  const languageKeywords = {
    punjabi: [
      // Basic words
      'ki', 'hai', 'ne', 'da', 'di', 'de', 'nu', 'te', 'vich', 'ton',
      'main', 'tu', 'asi', 'tussi', 'oh', 'eh', 'kive', 'kiddan', 'kiwe',
      'kithon', 'kitho', 'kina', 'kinna', 'kiwe', 'kiddan', 'kiwe', 'kithon',
      // Legal terms in Punjabi
      'kanoon', 'dhara', 'kanooni', 'mamla', 'faisla', 'adalat', 'nyayalay',
      'vakil', 'mudda', 'saboot', 'gawah', 'saza', 'jail', 'bail', 'warrant',
      'fir', 'thana', 'police', 'court', 'judge', 'judgment', 'appeal',
      'petition', 'case', 'hearing', 'trial', 'verdict', 'order'
    ],
    telugu: [
      // Basic words
      'em', 'undi', 'ledu', 'evaru', 'evadu', 'evariki', 'evarini',
      'nenu', 'meeru', 'vaadu', 'aame', 'vallu', 'idi', 'adi', 'evaru',
      'eppudu', 'ekkada', 'ela', 'enduku', 'entha', 'emi', 'evaru',
      // Legal terms in Telugu
      'kanoon', 'dhara', 'kanooni', 'mamla', 'faisla', 'adalat', 'nyayalay',
      'vakil', 'mudda', 'saboot', 'gawah', 'saza', 'jail', 'bail', 'warrant',
      'fir', 'thana', 'police', 'court', 'judge', 'judgment', 'appeal',
      'petition', 'case', 'hearing', 'trial', 'verdict', 'order'
    ],
    malayalam: [
      // Basic words
      'ente', 'ninte', 'avan', 'aval', 'avar', 'ithu', 'athu', 'evide',
      'engane', 'ethu', 'eppol', 'evide', 'ethra', 'ennu', 'eppozhum',
      'njan', 'ningal', 'avan', 'aval', 'avar', 'ithu', 'athu',
      // Legal terms in Malayalam
      'kanoon', 'dhara', 'kanooni', 'mamla', 'faisla', 'adalat', 'nyayalay',
      'vakil', 'mudda', 'saboot', 'gawah', 'saza', 'jail', 'bail', 'warrant',
      'fir', 'thana', 'police', 'court', 'judge', 'judgment', 'appeal',
      'petition', 'case', 'hearing', 'trial', 'verdict', 'order'
    ],
    hindi: [
      // Existing Hindi words list
      'ka', 'ki', 'ke', 'ko', 'se', 'me', 'par', 'aur', 'ya', 'nahi',
      'hai', 'hain', 'tha', 'the', 'ho', 'kya', 'kyaa', 'kripya', 'dhanyavaad',
      'namaste', 'aap', 'main', 'hum', 'tum', 'vo', 'ye', 'wo', 'kahan', 'kaise',
      'kab', 'kyon', 'kya', 'kaun', 'kis', 'kisi', 'kuch', 'bahut', 'thoda', 'zaroor',
      // Legal terms in Hindi
      'kanoon', 'dhara', 'kanooni', 'mamla', 'faisla', 'adalt', 'nyayalay',
      'vakil', 'mudda', 'saboot', 'gawah', 'saza', 'jail', 'bail', 'warrant',
      'fir', 'thana', 'police', 'court', 'judge', 'judgment', 'appeal',
      'petition', 'case', 'hearing', 'trial', 'verdict', 'order'
    ]
  };

  // Count matches for each language
  const words = userQuery.toLowerCase().split(/\s+/);
  const languageScores = Object.entries(languageKeywords).map(([lang, keywords]) => {
    const matches = words.filter(word => keywords.includes(word)).length;
    return {
      language: lang as 'hindi' | 'punjabi' | 'telugu' | 'malayalam',
      score: matches / words.length
    };
  });

  // Find the language with highest score
  const bestMatch = languageScores.reduce((best, current) => 
    current.score > best.score ? current : best
  , { language: 'hindi' as const, score: 0 });

  // Only return a language if confidence is high enough
  return {
    language: bestMatch.score > 0.3 ? bestMatch.language : 'english',
    confidence: bestMatch.score
  };
};

// Enhanced legal analysis with comprehensive law coverage
export const processLegalResponse = async (
  userQuery: string,
  matchedSections: any[],
  keywords: string[],
  conversationHistory: Array<{role: string, content: string}> = [],
  context: {
    category: string;
    lawType?: string;
    intent?: string;
  }
): Promise<string> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    // Enhanced language detection
    const { language, confidence } = detectLanguage(userQuery);
    const isIndianLanguage = language !== 'english';

    const analyzedSections = analyzeAllSections(matchedSections, userQuery, keywords);
    const topSections = analyzedSections.slice(0, 15);

    // Enhanced law type detection
    const lawTypeKeywords = {
      'BNS': ['bns', 'bharatiya nyaya', 'nyaya sanhita'],
      'BNSS': ['bnss', 'bharatiya nagarik', 'nagarik suraksha'],
      'BSA': ['bsa', 'bharatiya sakshya', 'sakshya adhiniyam'],
      'IPC': ['ipc', 'indian penal', 'penal code'],
      'CrPC': ['crpc', 'criminal procedure', 'code of criminal'],
      'IEA': ['iea', 'evidence act', 'indian evidence']
    };

    // Use detected law type from context if available
    const requestedLawType = context.lawType || Object.entries(lawTypeKeywords).find(([_, keywords]) =>
      keywords.some(k => keywords.some(lk => lk.includes(k.toLowerCase())))
    )?.[0];

    // Group sections by law type
    const newLawSections = topSections.filter(section => section.is_new_law);
    const oldLawSections = topSections.filter(section => !section.is_new_law);

    // If specific law type requested, prioritize those sections
    const requestedSections = requestedLawType 
      ? topSections.filter(section => section.law_type === requestedLawType)
      : [];

    // Enhanced section data with intent
    const sectionsData = topSections.map((section, index) => ({
      relevance_rank: index + 1,
      relevance_score: section.relevanceScore || 0,
      confidence_level: section.confidenceLevel,
      match_type: section.matchType,
      law_type: section.law_type,
      law_name: section.law_type === 'BNS' ? 'Bharatiya Nyaya Sanhita (BNS)' :
                section.law_type === 'BNSS' ? 'Bharatiya Nagarik Suraksha Sanhita (BNSS)' :
                section.law_type === 'BSA' ? 'Bharatiya Sakshya Adhiniyam (BSA)' :
                section.law_type === 'IPC' ? 'Indian Penal Code (IPC)' :
                section.law_type === 'CrPC' ? 'Code of Criminal Procedure (CrPC)' :
                'Indian Evidence Act (IEA)',
      chapter: section.law_type === 'BNS' || section.law_type === 'BNSS' || section.law_type === 'BSA'
        ? `${section.chapter_title} - ${section.chapter_name}`
        : `${section.chapter_title || 'Chapter'} ${section.chapter_number || ''} - ${section.chapter_name || ''}`.trim(),
      section_number: section.section_number,
      section_title: section.section_title,
      content: Array.isArray(section.content) ? section.content.join(' ') : section.content,
      keyword_matches: section.keywordMatches || [],
      is_requested_law: requestedLawType ? section.law_type === requestedLawType : false,
      intent_match: context.intent ? section.content.toLowerCase().includes(context.intent.toLowerCase()) : false
    }));

    // Build conversation context for the AI
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nCONVERSATION HISTORY (for context):\n${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}\n\n`
      : '';

    // Update the system prompt to include language-specific instructions
    const languageInstructions = {
      hindi: 'आप हिंदी में जवाब देंगे।',
      punjabi: 'ਤੁਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦੇਵੋਗੇ।',
      telugu: 'మీరు తెలుగులో సమాధానం ఇస్తారు.',
      malayalam: 'നിങ്ങൾ മലയാളത്തിൽ മറുപടി നൽകും.',
      english: 'You will respond in English.'
    };

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a comprehensive legal assistant specializing in Indian law, with expertise in both current and previous legal frameworks.

${languageInstructions[language]}

QUERY CONTEXT:
- Category: ${context.category}
- Law Type: ${context.lawType || 'Not specified'}
- Intent: ${context.intent || 'Not specified'}
- Language: ${language} (confidence: ${confidence.toFixed(2)})

PRIMARY FUNCTIONS:
1. Section-Specific Analysis:
   - Provide detailed analysis of sections from current laws (BNS, BNSS, BSA)
   - Compare with corresponding sections from previous laws (IPC, CrPC, IEA)
   - Explain legal implications and practical applications

2. Situational Guidance:
   - Help users understand legal implications of their situations
   - Guide through legal procedures and requirements
   - Explain rights, obligations, and potential legal remedies

3. General Legal Awareness:
   - Explain legal concepts and principles
   - Provide overview of legal frameworks
   - Clarify differences between old and new laws

CRITICAL INSTRUCTIONS:
1. You have access to ${matchedSections.length} total matching sections from ALL laws
2. Current law sections found: ${newLawSections.length} | Previous law sections found: ${oldLawSections.length}
${requestedLawType ? `3. User specifically requested information from ${requestedLawType} (${requestedSections.length} sections found)` : '3. No specific law type requested'}
4. Current laws (2023) replace previous laws:
   - BNS replaces IPC
   - BNSS replaces CrPC
   - BSA replaces IEA
5. Always prioritize sections from the specifically requested law type if mentioned
6. Otherwise, prioritize current law sections but show previous laws for comparison
7. Sections are ranked by relevance score and confidence level (high/medium/low)
8. Focus on HIGH confidence and TOP-RANKED sections that directly answer the question
9. Consider user intent (${context.intent || 'general'}) when formulating response

RESPONSE STRUCTURE:
${isIndianLanguage ? `
🎯 **कानूनी विश्लेषण:** [प्रासंगिक कानूनी संदर्भ के साथ सीधा उत्तर]

${requestedLawType ? `📖 **${requestedLawType} धारा:** [निर्धारित कानून के प्रावधानों पर ध्यान केंद्रित करें]` : `📖 **वर्तमान कानून:** [BNS/BNSS/BSA से वर्तमान प्रावधानों पर ध्यान केंद्रित करें]`}

${!requestedLawType ? `⚖️ **पूर्व कानून:** [IPC/CrPC/IEA से संबंधित पूर्व प्रावधान दिखाएं]` : ''}

🔄 **मुख्य परिवर्तन:** [यदि लागू हो तो महत्वपूर्ण अंतरों पर प्रकाश डालें]

💡 **व्यावहारिक मार्गदर्शन:** [व्यावहारिक प्रभाव और अगले कदमों की व्याख्या करें]` : `
🎯 **Legal Analysis:** [Direct answer with relevant legal context]

${requestedLawType ? `📖 **${requestedLawType} Section:** [Focus on the requested law's provisions]` : `📖 **Current Law:** [Focus on current applicable provisions from BNS/BNSS/BSA]`}

${!requestedLawType ? `⚖️ **Previous Law:** [Show corresponding previous provisions from IPC/CrPC/IEA]` : ''}

🔄 **Key Changes:** [Highlight significant differences if applicable]

💡 **Practical Guidance:** [Explain practical implications and next steps]`}

COMPARISON GUIDELINES:
- If specific law type requested, focus primarily on that law
- If both current and previous law sections exist, provide clear comparison
- Highlight section number changes (e.g., IPC 302 → BNS 103)
- Note changes in definitions, procedures, or punishments
- Make it clear which law is currently applicable
- If only one law has relevant sections, mention that explicitly

CONTEXT HANDLING:
- Use conversation history to understand references to previous topics
- Build upon previous responses for follow-up questions
- Maintain continuity while providing accurate legal information
- If clarification is needed, expand on previous context appropriately

PRIORITIZATION:
- If specific law type requested, prioritize those sections
- Otherwise, prioritize sections with confidence_level = 'high'
- Focus on current law sections first, then previous laws for comparison
- Emphasize sections with match_type = 'exact', 'title', or 'punishment'
- If asking about punishment/penalties, highlight those specific sections first
- Consider user intent when selecting and presenting information

${isIndianLanguage ? `
भाषा निर्देश / ਭਾਸ਼ਾ ਨਿਰਦੇਸ਼ / భాషా సూచనలు / ഭാഷാ നിർദ്ദേശങ്ങൾ:
- ${language === 'hindi' ? 'हिंदी में स्पष्ट और व्यावसायिक भाषा का प्रयोग करें' :
    language === 'punjabi' ? 'ਪੰਜਾਬੀ ਵਿੱਚ ਸਪਸ਼ਟ ਅਤੇ ਪੇਸ਼ੇਵਰ ਭਾਸ਼ਾ ਦੀ ਵਰਤੋਂ ਕਰੋ' :
    language === 'telugu' ? 'తెలుగులో స్పష్టమైన మరియు వృత్తిపరమైన భాషను ఉపయోగించండి' :
    'മലയാളത്തിൽ വ്യക്തവും തൊഴിൽപരവുമായ ഭാഷ ഉపയോഗിക്കുക'}
- ${language === 'hindi' ? 'कानूनी शब्दों का हिंदी अनुवाद प्रदान करें' :
    language === 'punjabi' ? 'ਕਾਨੂੰਨੀ ਸ਼ਬਦਾਂ ਦਾ ਪੰਜਾਬੀ ਅਨੁਵਾਦ ਪ੍ਰਦਾਨ ਕਰੋ' :
    language === 'telugu' ? 'చట్టపరమైన పదాలకు తెలుగు అనువాదం అందించండి' :
    'നിയമപരമായ പദങ്ങൾക്ക് മലയാളം വിവർത്തനം നൽകുക'}
- ${language === 'hindi' ? 'जटिल कानूनी अवधारणाओं को सरल हिंदी में समझाएं' :
    language === 'punjabi' ? 'ਜਟਿਲ ਕਾਨੂੰਨੀ ਸੰਕਲਪਾਂ ਨੂੰ ਸਰਲ ਪੰਜਾਬੀ ਵਿੱਚ ਸਮਝਾਓ' :
    language === 'telugu' ? 'సంక్లిష్టమైన చట్టపరమైన భావనలను సరళమైన తెలుగులో వివరించండి' :
    'സങ്കീർണ്ണമായ നിയമ ആശയങ്ങളെ ലളിതമായ മലയാളത്തിൽ വിശദീകരിക്കുക'}
- ${language === 'hindi' ? 'उत्तर को संरचित और आसानी से समझने योग्य बनाएं' :
    language === 'punjabi' ? 'ਜਵਾਬ ਨੂੰ ਬਣਤਰਬੱਧ ਅਤੇ ਸੌਖੀ ਸਮਝਣਯੋਗ ਬਣਾਓ' :
    language === 'telugu' ? 'సమాధానాన్ని నిర్మాణాత్మకంగా మరియు సులభంగా అర్థం చేసుకోగలిగేలా చేయండి' :
    'ഉത്തരം ഘടനാപരവും എളുപ്പം മനസ്സിലാക്കാൻ കഴിയുന്നതുമാക്കുക'}` : ''}`
          },
          {
            role: 'user',
            content: `${conversationContext}CURRENT USER QUERY: "${userQuery}"

Keywords Found: ${keywords.join(', ')}
${requestedLawType ? `\nSpecifically requested law type: ${requestedLawType}` : ''}
${context.intent ? `\nDetected intent: ${context.intent}` : ''}

Total Matching Sections: ${matchedSections.length}
Current Law Sections: ${newLawSections.length}
Previous Law Sections: ${oldLawSections.length}
${requestedLawType ? `Requested Law (${requestedLawType}) Sections: ${requestedSections.length}` : ''}
Top Sections for Analysis: ${topSections.length}

Relevant Legal Sections (ordered by relevance and confidence):
${JSON.stringify(sectionsData, null, 2)}

Please analyze all provided sections, ${requestedLawType ? `focusing primarily on ${requestedLawType} sections` : 'comparing current and previous laws where applicable'}, and focus your response on the highest-confidence, most relevant ones that directly answer the user's question. Use the conversation history to understand any references to previous topics and provide contextual continuity. ${requestedLawType ? `Remember to prioritize ${requestedLawType} sections.` : 'Remember to prioritize current laws while showing previous laws for comparison.'} ${isIndianLanguage ? 'Please provide the response in Hindi.' : ''}`
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
    const analysisNote = generateAnalysisNote(matchedSections.length, topSections.length, analyzedSections, newLawSections.length, oldLawSections.length, requestedLawType, requestedSections.length, language);
    aiResponse += `\n\n${analysisNote}`;

    return aiResponse;
  } catch (error) {
    console.error('Error processing legal response with AI:', error);
    const { language } = detectLanguage(userQuery);
    return formatSectionsEnhanced(matchedSections, keywords, userQuery, language);
  }
};

// Enhanced general response for non-legal queries with conversation context
export const getGeneralResponse = async (
  userQuery: string, 
  conversationHistory: Array<{role: string, content: string}> = [],
  context: {
    category: string;
    lawType?: string;
    intent?: string;
  }
): Promise<string> => {
  try {
    if (!API_KEY) throw new Error('GROQ API key is not configured');

    // Enhanced language detection
    const { language, confidence } = detectLanguage(userQuery);
    const isIndianLanguage = language !== 'english';

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are a comprehensive legal and civic information assistant specializing in Indian law and general legal guidance.

PRIMARY FUNCTIONS:
1. Legal Information:
   - Provide general information about Indian laws (BNS, BNSS, BSA, IPC, CrPC, IEA)
   - Explain legal concepts and procedures
   - Guide users through legal processes
   - Clarify differences between old and new laws

2. Situational Guidance:
   - Help users understand legal implications of their situations
   - Guide through legal procedures and requirements
   - Explain rights, obligations, and potential legal remedies
   - Provide practical next steps

3. General Legal Awareness:
   - Explain legal concepts and principles
   - Provide overview of legal frameworks
   - Clarify legal terminology
   - Offer general legal guidance

CONVERSATION HANDLING:
- Maintain context from previous messages
- Build upon previous responses for follow-up questions
- Provide seamless continuity between related topics
- Reference previous context when needed for clarification

RESPONSE GUIDELINES:
- Keep responses clear, concise, and well-structured
- Use professional but accessible language
- Avoid citing specific legal sections (handled by legal resolver)
- Focus on practical implications and next steps
- Provide actionable guidance when possible

TONE AND STYLE:
- Maintain a professional, authoritative tone
- Be clear and direct in explanations
- Use appropriate legal terminology
- Structure information logically
- End with clear next steps or follow-up options`
      }
    ];

    // Add conversation history if available
    if (conversationHistory.length > 0) {
      // Add the last few exchanges for context (limit to avoid token overflow)
      const recentHistory = conversationHistory.slice(-6); // Last 3 exchanges (6 messages)
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      });
    }

    // Add current user query
    messages.push({
      role: 'user',
      content: userQuery,
    });

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
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

// Enhanced unified processing with intelligent routing
export const processUnifiedQuery = async (
  userQuery: string,
  searchFunction: (keywords: string[]) => any[],
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> => {
  try {
    // Step 1: Enhanced keyword extraction with categorization
    const { keywords, category, lawType, intent } = await extractKeywords(userQuery);
    
    // Step 2: Route based on category and intent
    if (category === 'legal' || category === 'mixed') {
      const matchedSections = searchFunction(keywords);
      
      if (matchedSections.length > 0) {
        // Process with legal AI, now with enhanced context
        return await processLegalResponse(
          userQuery, 
          matchedSections, 
          keywords, 
          conversationHistory,
          {
            category,
            lawType,
            intent
          }
        );
      }
    }
    
    // Step 3: If no legal content found or general query, use enhanced general response
    return await getGeneralResponse(userQuery, conversationHistory, {
      category,
      lawType,
      intent
    });
    
  } catch (error) {
    console.error('Error in unified query processing:', error);
    
    // Enhanced fallback response
    try {
      return await getGeneralResponse(userQuery, conversationHistory, {
        category: 'general',
        lawType: undefined,
        intent: undefined
      });
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

const generateAnalysisNote = (
  total: number,
  topCount: number,
  all: any[],
  newLawCount: number,
  oldLawCount: number,
  requestedLawType?: string,
  requestedCount?: number,
  language?: 'hindi' | 'punjabi' | 'telugu' | 'malayalam' | 'english'
) => {
  const high = all.filter(s => s.confidenceLevel === 'high').length;
  const med = all.filter(s => s.confidenceLevel === 'medium').length;
  
  if (language && language !== 'english') {
    const languageInstructions = {
      hindi: {
        analysis: 'कानूनी विश्लेषण',
        sections: 'धाराएं',
        current: 'वर्तमान कानून',
        previous: 'पूर्व कानून',
        analyzed: 'विश्लेषित की गईं',
        high: 'उच्च',
        medium: 'मध्यम',
        confidence: 'विश्वसनीयता'
      },
      punjabi: {
        analysis: 'ਕਾਨੂੰਨੀ ਵਿਸ਼ਲੇਸ਼ਣ',
        sections: 'ਧਾਰਾਵਾਂ',
        current: 'ਮੌਜੂਦਾ ਕਾਨੂੰਨ',
        previous: 'ਪਿਛਲਾ ਕਾਨੂੰਨ',
        analyzed: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਗਿਆ',
        high: 'ਉੱਚ',
        medium: 'ਮੱਧਮ',
        confidence: 'ਭਰੋਸੇਯੋਗਤਾ'
      },
      telugu: {
        analysis: 'చట్టపరమైన విశ్లేషణ',
        sections: 'సెక్షన్లు',
        current: 'ప్రస్తుత చట్టం',
        previous: 'మునుపటి చట్టం',
        analyzed: 'విశ్లేషించబడ్డాయి',
        high: 'అధిక',
        medium: 'మధ్యస్థ',
        confidence: 'విశ్వసనీయత'
      },
      malayalam: {
        analysis: 'നിയമ വിശകലനം',
        sections: 'സെക്ഷനുകൾ',
        current: 'നിലവിലെ നിയമം',
        previous: 'മുൻ നിയമം',
        analyzed: 'വിശകലനം ചെയ്തു',
        high: 'ഉയർന്ന',
        medium: 'ഇടത്തരം',
        confidence: 'വിശ്വസനീയത'
      }
    };

    const lang = languageInstructions[language];
    let note = `📊 **${lang.analysis}:** सभी कानूनों से ${total} मिलान वाली ${lang.sections} मिलीं। `;
    note += `${newLawCount} ${lang.current} की ${lang.sections} और ${oldLawCount} ${lang.previous} की ${lang.sections} ${lang.analyzed}। `;
    note += `${high} ${lang.high} ${lang.confidence} और ${med} ${lang.medium} ${lang.confidence} ${lang.sections}।`;
    return note;
  }

  return `📊 **Legal Analysis:** Found ${total} matching sections across all laws. Analyzed ${newLawCount} current law sections and ${oldLawCount} previous law sections. ${high} high confidence and ${med} medium confidence sections.`;
};

const formatSectionsEnhanced = (
  sections: any[],
  keywords: string[],
  userQuery: string,
  language?: 'hindi' | 'punjabi' | 'telugu' | 'malayalam' | 'english'
) => {
  const analyzed = analyzeAllSections(sections, userQuery, keywords);
  const topSections = analyzed.slice(0, 10);
  const newLawSections = topSections.filter(section => section.is_new_law);
  const oldLawSections = topSections.filter(section => !section.is_new_law);

  if (language && language !== 'english') {
    const languageInstructions = {
      hindi: {
        search: 'कानूनी खोज परिणाम',
        analysis: 'विश्लेषण',
        sections: 'धाराएं',
        current: 'वर्तमान कानून',
        previous: 'पूर्व कानून',
        relevant: 'सबसे प्रासंगिक'
      },
      punjabi: {
        search: 'ਕਾਨੂੰਨੀ ਖੋਜ ਨਤੀਜੇ',
        analysis: 'ਵਿਸ਼ਲੇਸ਼ਣ',
        sections: 'ਧਾਰਾਵਾਂ',
        current: 'ਮੌਜੂਦਾ ਕਾਨੂੰਨ',
        previous: 'ਪਿਛਲਾ ਕਾਨੂੰਨ',
        relevant: 'ਸਭ ਤੋਂ ਸੰਬੰਧਿਤ'
      },
      telugu: {
        search: 'చట్టపరమైన శోధన ఫలితాలు',
        analysis: 'విశ్లేషణ',
        sections: 'సెక్షన్లు',
        current: 'ప్రస్తుత చట్టం',
        previous: 'మునుపటి చట్టం',
        relevant: 'అత్యంత సంబంధిత'
      },
      malayalam: {
        search: 'നിയമ തിരയൽ ഫലങ്ങൾ',
        analysis: 'വിശകലനം',
        sections: 'സെക്ഷനുകൾ',
        current: 'നിലവിലെ നിയമം',
        previous: 'മുൻ നിയമം',
        relevant: 'ഏറ്റവും പ്രസക്തമായ'
      }
    };

    const lang = languageInstructions[language];
    let response = `🔍 **${lang.search}**\n\n`;
    response += `📊 **${lang.analysis}:** कुल ${sections.length} ${lang.sections} मिलीं (${newLawSections.length} ${lang.current}, ${oldLawSections.length} ${lang.previous})। शीर्ष ${topSections.length} ${lang.relevant} ${lang.sections} दिखाई गई हैं:\n\n`;
    return response;
  }

  let response = `🔍 **Legal Search Results**\n\n`;
  response += `📊 **Analysis:** Found ${sections.length} total sections (${newLawSections.length} current law, ${oldLawSections.length} previous law). Showing top ${topSections.length} most relevant sections:\n\n`;
  return response;
};

export class ChatService {
  private readonly API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  private readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  public async processQuery(query: string): Promise<string> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful legal assistant. Provide clear, accurate, and professional responses about Indian laws.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process query');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }
}