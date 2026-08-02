/**
 * Multilingual Translation Utility
 * 
 * This module provides comprehensive translation functionality for the CampusMitra chatbot.
 * It supports language detection, translation to/from multiple languages, and fallback mechanisms.
 * 
 * Features:
 * - Automatic language detection
 * - Translation using multiple free services (Google Translate, LibreTranslate, MyMemory)
 * - Fallback mechanisms for reliability
 * - Support for 50+ languages
 * - Caching for improved performance
 */

const translateG = (...args) => import('google-translate-api-x').then(m => m.default(...args));
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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

// Simple in-memory cache for translations (in production, use Redis or similar)
const translationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Detect the language of the input text
 * @param {string} text - The text to analyze
 * @returns {Promise<string>} - The detected language code
 */
async function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return 'en';
  }

  try {
    // Use Google Translate API for language detection
    const result = await translateG(text, { to: 'en' });
    return result.from.language.iso || 'en';
  } catch (error) {
    console.warn('Language detection failed:', error.message);
    return 'en'; // Default to English
  }
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

  // Check cache first
  const cacheKey = `${text}_${sourceLang || 'auto'}_${targetLang}`;
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  let detectedLang = sourceLang;
  let translatedText = text;

  // If source language is not provided, detect it
  if (!sourceLang) {
    detectedLang = await detectLanguage(text);
  }

  // If source and target are the same, return original text
  if (detectedLang === targetLang) {
    const result = { text, detectedLang };
    translationCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  // Try multiple translation services with fallback
  const translationResult = await translateWithFallback(text, targetLang, detectedLang);
  
  const result = {
    text: translationResult.text,
    detectedLang: detectedLang
  };

  // Cache the result
  translationCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
}

/**
 * Translate text using multiple services with fallback mechanism
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @returns {Promise<{text: string}>} - Translation result
 */
async function translateWithFallback(text, targetLang, sourceLang = 'auto') {
  // 1) Google Translate API (unofficial) - Most reliable
  try {
    const result = await translateG(text, { 
      from: sourceLang === 'auto' ? undefined : sourceLang, 
      to: targetLang 
    });
    if (result && result.text) {
      return { text: result.text };
    }
  } catch (error) {
    console.warn('Google Translate failed:', error.message);
  }

  // 2) LibreTranslate public API
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

  // 3) MyMemory fallback
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

  // 4) Final fallback - return original text
  console.warn('All translation services failed, returning original text');
  return { text };
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

  // Detect language if not provided
  const detectedLang = userLanguage || await detectLanguage(userQuery);
  
  // Translate to English for processing
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
    entries: Array.from(translationCache.keys()).slice(0, 10) // First 10 entries
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
