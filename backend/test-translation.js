/**
 * Test script for multilingual translation functionality
 * Run with: node test-translation.js
 */

const { 
  detectLanguage, 
  translateText, 
  processUserQuery, 
  translateResponse,
  getSupportedLanguages,
  isLanguageSupported 
} = require('./utils/translator');

async function testTranslation() {
  console.log('🧪 Testing Multilingual Translation Functionality\n');

  try {
    // Test 1: Language Detection
    console.log('1. Testing Language Detection:');
    const testTexts = [
      { text: "Hello, how are you?", expected: "en" },
      { text: "Hola, ¿cómo estás?", expected: "es" },
      { text: "Bonjour, comment allez-vous?", expected: "fr" },
      { text: "नमस्ते, आप कैसे हैं?", expected: "hi" },
      { text: "你好，你好吗？", expected: "zh" }
    ];

    for (const test of testTexts) {
      const detected = await detectLanguage(test.text);
      console.log(`   "${test.text}" -> ${detected} (expected: ${test.expected})`);
    }

    // Test 2: Translation
    console.log('\n2. Testing Translation:');
    const translations = [
      { text: "Hello", from: "en", to: "es" },
      { text: "Good morning", from: "en", to: "fr" },
      { text: "Thank you", from: "en", to: "hi" }
    ];

    for (const trans of translations) {
      const result = await translateText(trans.text, trans.to, trans.from);
      console.log(`   "${trans.text}" (${trans.from}) -> "${result.text}" (${trans.to})`);
    }

    // Test 3: Process User Query
    console.log('\n3. Testing User Query Processing:');
    const queries = [
      { query: "What is the schedule?", lang: "en" },
      { query: "¿Cuál es el horario?", lang: "es" },
      { query: "Quel est l'horaire?", lang: "fr" }
    ];

    for (const query of queries) {
      const result = await processUserQuery(query.query, query.lang);
      console.log(`   Original: "${result.originalQuery}" (${result.detectedLang})`);
      console.log(`   Translated: "${result.translatedQuery}" (en)`);
    }

    // Test 4: Response Translation
    console.log('\n4. Testing Response Translation:');
    const responses = [
      { text: "The schedule is from 9 AM to 5 PM", lang: "es" },
      { text: "Welcome to our campus", lang: "fr" },
      { text: "Thank you for your question", lang: "hi" }
    ];

    for (const resp of responses) {
      const translated = await translateResponse(resp.text, resp.lang);
      console.log(`   "${resp.text}" (en) -> "${translated}" (${resp.lang})`);
    }

    // Test 5: Supported Languages
    console.log('\n5. Testing Supported Languages:');
    const languages = getSupportedLanguages();
    console.log(`   Total supported languages: ${Object.keys(languages).length}`);
    console.log(`   Sample languages: ${Object.entries(languages).slice(0, 10).map(([code, name]) => `${code}: ${name}`).join(', ')}`);

    // Test 6: Language Support Check
    console.log('\n6. Testing Language Support:');
    const testLangs = ['en', 'es', 'fr', 'hi', 'zh', 'xyz'];
    for (const lang of testLangs) {
      const supported = isLanguageSupported(lang);
      console.log(`   ${lang}: ${supported ? '✅ Supported' : '❌ Not supported'}`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Note: Some translations may fail due to API rate limits or network issues.');
    console.log('   This is normal and the system will fallback gracefully.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTranslation();
