import axios from 'axios';

const API_KEY = process.env.GROQ_API_KEY;

// Language detection keywords
const LANGUAGE_KEYWORDS = {
  malayalam: [
    'namaskaram', 'sukhamano', 'vanakkam', 'nanni', 'kollam', 'poyi', 'varu',
    'എന്ത്', 'എങ്ങനെ', 'എവിടെ', 'എപ്പോൾ', 'എന്തുകൊണ്ട്', 'നമസ്കാരം', 'വണക്കം'
  ],
  punjabi: [
    'sat sri akal', 'ki haal', 'theek', 'changa', 'dhanyavaad', 'kiddan',
    'ਨਮਸਕਾਰ', 'ਧੰਨਵਾਦ', 'ਕਿਵੇਂ', 'ਕੀ', 'ਕਦੋਂ', 'ਕਿੱਥੇ', 'ਕਿਉਂ'
  ],
  telugu: [
    'namaskaram', 'bagunnara', 'dhanyavaadham', 'emundi', 'ela', 'eppudu',
    'నమస్కారం', 'ధన్యవాదాలు', 'ఎలా', 'ఎప్పుడు', 'ఎక్కడ', 'ఎందుకు'
  ],
  hindi: [
    'namaste', 'dhanyavaad', 'kaise', 'kya', 'kab', 'kahan', 'kyon',
    'नमस्ते', 'धन्यवाद', 'कैसे', 'क्या', 'कब', 'कहाँ', 'क्यों'
  ]
};

// Script conversion mapping
const SCRIPT_CONVERSION = {
  hindi: {
    'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ii': 'ई', 'u': 'उ', 'uu': 'ऊ',
    'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ',
    'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ng': 'ङ',
    'ch': 'च', 'chh': 'छ', 'j': 'ज', 'jh': 'झ', 'ny': 'ञ',
    't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
    'p': 'प', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
    'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'sh': 'श',
    's': 'स', 'h': 'ह', 'l_alt': 'ळ', 'ksh': 'क्ष', 'tr': 'त्र',
    'gy': 'ज्ञ'
  },
  punjabi: {
    // Gurmukhi script mapping
    'a': 'ਅ', 'aa': 'ਆ', 'i': 'ਇ', 'ii': 'ਈ', 'u': 'ਉ', 'uu': 'ਊ',
    'e': 'ਏ', 'ai': 'ਐ', 'o': 'ਓ', 'au': 'ਔ',
    'k': 'ਕ', 'kh': 'ਖ', 'g': 'ਗ', 'gh': 'ਘ', 'ng': 'ਙ',
    'ch': 'ਚ', 'chh': 'ਛ', 'j': 'ਜ', 'jh': 'ਝ', 'ny': 'ਞ',
    't': 'ਤ', 'th': 'ਥ', 'd': 'ਦ', 'dh': 'ਧ', 'n': 'ਨ',
    'p': 'ਪ', 'ph': 'ਫ', 'b': 'ਬ', 'bh': 'ਭ', 'm': 'ਮ',
    'y': 'ਯ', 'r': 'ਰ', 'l': 'ਲ', 'v': 'ਵ', 'sh': 'ਸ਼',
    's': 'ਸ', 'h': 'ਹ', 'l_alt': 'ਲ਼', 'ksh': 'ਕ੍ਸ਼', 'tr': 'ਤ੍ਰ',
    'gy': 'ਜ੍ਞ'
  },
  telugu: {
    // Telugu script mapping
    'a': 'అ', 'aa': 'ఆ', 'i': 'ఇ', 'ii': 'ఈ', 'u': 'ఉ', 'uu': 'ఊ',
    'e': 'ఏ', 'ai': 'ఐ', 'o': 'ఓ', 'au': 'ఔ',
    'k': 'క', 'kh': 'ఖ', 'g': 'గ', 'gh': 'ఘ', 'ng': 'ఙ',
    'ch': 'చ', 'chh': 'ఛ', 'j': 'జ', 'jh': 'ఝ', 'ny': 'ఞ',
    't': 'త', 'th': 'థ', 'd': 'ద', 'dh': 'ధ', 'n': 'న',
    'p': 'ప', 'ph': 'ఫ', 'b': 'బ', 'bh': 'భ', 'm': 'మ',
    'y': 'య', 'r': 'ర', 'l': 'ల', 'v': 'వ', 'sh': 'శ',
    's': 'స', 'h': 'హ', 'l_alt': 'ళ', 'ksh': 'క్ష', 'tr': 'త్ర',
    'gy': 'జ్ఞ'
  },
  malayalam: {
    // Malayalam script mapping
    'a': 'അ', 'aa': 'ആ', 'i': 'ഇ', 'ii': 'ഈ', 'u': 'ഉ', 'uu': 'ഊ',
    'e': 'ഏ', 'ai': 'ഐ', 'o': 'ഓ', 'au': 'ഔ',
    'k': 'ക', 'kh': 'ഖ', 'g': 'ഗ', 'gh': 'ഘ', 'ng': 'ങ',
    'ch': 'ച', 'chh': 'ഛ', 'j': 'ജ', 'jh': 'ഝ', 'ny': 'ഞ',
    't': 'ത', 'th': 'ഥ', 'd': 'ദ', 'dh': 'ധ', 'n': 'ന',
    'p': 'പ', 'ph': 'ഫ', 'b': 'ബ', 'bh': 'ഭ', 'm': 'മ',
    'y': 'യ', 'r': 'ര', 'l': 'ല', 'v': 'വ', 'sh': 'ശ',
    's': 'സ', 'h': 'ഹ', 'l_alt': 'ള', 'ksh': 'ക്ഷ', 'tr': 'ത്ര',
    'gy': 'ജ്ഞ'
  }
};

interface SpeechRecognitionResult {
  text: string;
  language: string;
  confidence: number;
  script: string;
}

export class SpeechService {
  private recognition: any;
  private isListening: boolean = false;
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognition();
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = async (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const text = result[0].transcript;
        const confidence = result[0].confidence;

        try {
          // Detect language using Groq API
          const detectedLanguage = await this.detectLanguage(text);
          
          // Convert to appropriate script
          const script = await this.convertToScript(text, detectedLanguage);

          if (this.onResultCallback) {
            this.onResultCallback({
              text: script,
              language: detectedLanguage,
              confidence,
              script
            });
          }
        } catch (error) {
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };
  }

  private detectLanguageFromKeywords(text: string): string {
    const lowerText = text.toLowerCase();
    let maxMatches = 0;
    let detectedLanguage = 'english';

    for (const [language, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
      const matches = keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        detectedLanguage = language;
      }
    }

    return detectedLanguage;
  }

  private async detectLanguage(text: string): Promise<string> {
    try {
      // First try keyword-based detection
      const keywordDetection = this.detectLanguageFromKeywords(text);
      if (keywordDetection !== 'english') {
        return keywordDetection;
      }

      // If no keywords found, use Groq API
      if (!API_KEY) throw new Error('GROQ API key is not configured');

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a language detection system specializing in Indian languages. Analyze the input text and determine if it's in Hindi, Punjabi, Telugu, Malayalam, or English.
Consider common words, phrases, and patterns in each language.
Output the language code only: 'hindi', 'punjabi', 'telugu', 'malayalam', or 'english'.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      console.error('Error detecting language:', error);
      return 'english';
    }
  }

  private async convertToScript(text: string, language: string): Promise<string> {
    if (language === 'english') return text;

    const scriptMap = SCRIPT_CONVERSION[language as keyof typeof SCRIPT_CONVERSION];
    if (!scriptMap) return text;

    // First, handle common words and phrases
    const commonPhrases = {
      malayalam: {
        'namaskaram': 'നമസ്കാരം',
        'sukhamano': 'സുഖമാണോ',
        'vanakkam': 'വണക്കം',
        'nanni': 'നന്ദി',
        'kollam': 'കൊള്ളാം',
        'poyi': 'പോയി',
        'varu': 'വരു'
      },
      punjabi: {
        'sat sri akal': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
        'ki haal': 'ਕੀ ਹਾਲ',
        'theek': 'ਠੀਕ',
        'changa': 'ਚੰਗਾ',
        'dhanyavaad': 'ਧੰਨਵਾਦ',
        'kiddan': 'ਕਿਦਾਂ'
      },
      telugu: {
        'namaskaram': 'నమస్కారం',
        'bagunnara': 'బాగున్నారా',
        'dhanyavaadham': 'ధన్యవాదాలు',
        'emundi': 'ఏముంది',
        'ela': 'ఎలా',
        'eppudu': 'ఎప్పుడు'
      },
      hindi: {
        'namaste': 'नमस्ते',
        'dhanyavaad': 'धन्यवाद',
        'kaise': 'कैसे',
        'kya': 'क्या',
        'kab': 'कब',
        'kahan': 'कहाँ',
        'kyon': 'क्यों'
      }
    };

    // Convert common phrases first
    let convertedText = text;
    const phrases = commonPhrases[language as keyof typeof commonPhrases];
    if (phrases) {
      for (const [roman, script] of Object.entries(phrases)) {
        const regex = new RegExp(roman, 'gi');
        convertedText = convertedText.replace(regex, script);
      }
    }

    // Then convert individual characters
    for (const [roman, script] of Object.entries(scriptMap)) {
      const regex = new RegExp(roman, 'gi');
      convertedText = convertedText.replace(regex, script);
    }

    return convertedText;
  }

  public startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: any) => void
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported'));
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.isListening = true;
    this.recognition.start();
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.onResultCallback = null;
      this.onErrorCallback = null;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }
} 