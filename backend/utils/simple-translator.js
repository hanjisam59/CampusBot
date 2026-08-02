/**
 * Simple Translation Utility
 * 
 * A lightweight translation solution using free public APIs
 * without external dependencies
 */

// Supported languages with their codes and names
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ml': 'Malayalam',
  'kn': 'Kannada',
  'gu': 'Gujarati',
  'mr': 'Marathi',
  'pa': 'Punjabi',
  'or': 'Odia',
  'as': 'Assamese',
  'ne': 'Nepali',
  'si': 'Sinhala',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  'be': 'Belarusian',
  'mk': 'Macedonian',
  'sq': 'Albanian',
  'sr': 'Serbian',
  'bs': 'Bosnian',
  'mt': 'Maltese',
  'is': 'Icelandic',
  'ga': 'Irish',
  'cy': 'Welsh',
  'eu': 'Basque',
  'ca': 'Catalan',
  'gl': 'Galician'
};

// Simple in-memory cache for translations
const translationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Simple language detection based on character patterns
 * @param {string} text - The text to analyze
 * @returns {string} - The detected language code
 */
function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return 'en';
  }

  // Simple pattern-based detection
  const patterns = {
    'zh': /[\u4e00-\u9fff]/,
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
    'ko': /[\uac00-\ud7af]/,
    'ar': /[\u0600-\u06ff]/,
    'hi': /[\u0900-\u097f]/,
    'bn': /[\u0980-\u09ff]/,
    'ta': /[\u0b80-\u0bff]/,
    'te': /[\u0c00-\u0c7f]/,
    'ml': /[\u0d00-\u0d7f]/,
    'kn': /[\u0c80-\u0cff]/,
    'gu': /[\u0a80-\u0aff]/,
    'pa': /[\u0a00-\u0a7f]/,
    'th': /[\u0e00-\u0e7f]/,
    'ru': /[\u0400-\u04ff]/,
    'el': /[\u0370-\u03ff]/,
    'he': /[\u0590-\u05ff]/
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  // Check for common words in different languages
  const commonWords = {
    'es': /\b(hola|gracias|por favor|sí|no|buenos|días|noche|mañana|tarde)\b/i,
    'fr': /\b(bonjour|merci|s'il vous plaît|oui|non|bon|jour|nuit|matin|après-midi)\b/i,
    'de': /\b(hallo|danke|bitte|ja|nein|guten|tag|nacht|morgen|nachmittag)\b/i,
    'it': /\b(ciao|grazie|per favore|sì|no|buon|giorno|notte|mattina|pomeriggio)\b/i,
    'pt': /\b(olá|obrigado|por favor|sim|não|bom|dia|noite|manhã|tarde)\b/i,
    'hi': /\b(नमस्ते|धन्यवाद|कृपया|हाँ|नहीं|अच्छा|दिन|रात|सुबह|शाम)\b/i,
    'ar': /\b(مرحبا|شكرا|من فضلك|نعم|لا|جيد|يوم|ليل|صباح|مساء)\b/i
  };

  for (const [lang, pattern] of Object.entries(commonWords)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  return 'en'; // Default to English
}

/**
 * Translate text using LibreTranslate API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @returns {Promise<{text: string}>} - Translation result
 */
async function translateWithLibreTranslate(text, targetLang, sourceLang = 'auto') {
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: text, 
        source: sourceLang === 'auto' ? 'auto' : sourceLang, 
        target: targetLang, 
        format: 'text' 
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.translatedText) {
        return { text: data.translatedText };
      }
    }
  } catch (error) {
    console.warn('LibreTranslate failed:', error.message);
  }
  return { text };
}

/**
 * Translate text using MyMemory API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @returns {Promise<{text: string}>} - Translation result
 */
async function translateWithMyMemory(text, targetLang, sourceLang = 'en') {
  try {
    const langPair = sourceLang === 'auto' ? `en|${targetLang}` : `${sourceLang}|${targetLang}`;
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`
    );
    
    if (response.ok) {
      const data = await response.json();
      const translatedText = data?.responseData?.translatedText;
      if (translatedText) {
        return { text: translatedText };
      }
    }
  } catch (error) {
    console.warn('MyMemory failed:', error.message);
  }
  return { text };
}

/**
 * Translate text with fallback mechanisms
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @returns {Promise<{text: string}>} - Translation result
 */
async function translateWithFallback(text, targetLang, sourceLang = 'auto') {
  // Check cache first
  const cacheKey = `${text}_${sourceLang}_${targetLang}`;
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    const result = { text };
    translationCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  // Try LibreTranslate first
  let result = await translateWithLibreTranslate(text, targetLang, sourceLang);
  
  // If LibreTranslate fails, try MyMemory
  if (!result.text || result.text === text) {
    result = await translateWithMyMemory(text, targetLang, sourceLang);
  }

  // Cache the result
  translationCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
}

/**
 * Translate text from source language to target language
 * @param {string} text - The text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional, auto-detect if not provided)
 * @returns {Promise<{text: string, detectedLang?: string}>} - Translation result
 */
async function translateText(text, targetLang, sourceLang = null) {
  if (!text || text.trim().length === 0) {
    return { text: '', detectedLang: sourceLang || 'en' };
  }

  let detectedLang = sourceLang;
  if (!sourceLang) {
    detectedLang = detectLanguage(text);
  }

  const translationResult = await translateWithFallback(text, targetLang, detectedLang);
  
  return {
    text: translationResult.text,
    detectedLang: detectedLang
  };
}

/**
 * Process chatbot query with translation
 * @param {string} userQuery - User's query
 * @param {string} userLanguage - User's preferred language (optional)
 * @returns {Promise<{originalQuery: string, translatedQuery: string, detectedLang: string, userLang: string}>}
 */
async function processUserQuery(userQuery, userLanguage = null) {
  if (!userQuery || userQuery.trim().length === 0) {
    return {
      originalQuery: '',
      translatedQuery: '',
      detectedLang: 'en',
      userLang: userLanguage || 'en'
    };
  }

  const detectedLang = userLanguage || detectLanguage(userQuery);
  const translationResult = await translateText(userQuery, 'en', detectedLang);
  
  return {
    originalQuery: userQuery,
    translatedQuery: translationResult.text,
    detectedLang: translationResult.detectedLang,
    userLang: detectedLang
  };
}

/**
 * Translate chatbot response back to user's language
 * @param {string} response - Bot's response in English
 * @param {string} userLanguage - User's language
 * @returns {Promise<string>} - Translated response
 */
async function translateResponse(response, userLanguage) {
  if (!response || !userLanguage || userLanguage === 'en') {
    return response;
  }

  const translationResult = await translateText(response, userLanguage, 'en');
  return translationResult.text;
}

/**
 * Get supported languages
 * @returns {Object} - Object with language codes and names
 */
function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Check if a language is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} - True if language is supported
 */
function isLanguageSupported(langCode) {
  return langCode && SUPPORTED_LANGUAGES.hasOwnProperty(langCode);
}

/**
 * Get language name from code
 * @param {string} langCode - Language code
 * @returns {string} - Language name or code if not found
 */
function getLanguageName(langCode) {
  return SUPPORTED_LANGUAGES[langCode] || langCode;
}

/**
 * Clear translation cache
 */
function clearCache() {
  translationCache.clear();
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
function getCacheStats() {
  return {
    size: translationCache.size,
    maxAge: CACHE_TTL,
    entries: Array.from(translationCache.keys()).slice(0, 10)
  };
}

module.exports = {
  detectLanguage,
  translateText,
  translateWithFallback,
  getSupportedLanguages,
  isLanguageSupported,
  getLanguageName,
  processUserQuery,
  translateResponse,
  clearCache,
  getCacheStats,
  SUPPORTED_LANGUAGES
};
