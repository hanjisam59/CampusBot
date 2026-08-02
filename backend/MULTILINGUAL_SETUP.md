# Multilingual Chatbot Setup Guide

This guide explains how to set up and use the multilingual translation functionality in the CampusMitra chatbot.

## Features

- **Automatic Language Detection**: Detects the language of user input automatically
- **50+ Language Support**: Supports major world languages including English, Spanish, French, German, Hindi, Chinese, Japanese, Korean, Arabic, and many Indian languages
- **Real-time Translation**: Translates user queries to English for processing and responses back to user's language
- **Fallback Mechanisms**: Multiple translation services ensure reliability
- **Caching**: Translation results are cached for improved performance
- **Language Selection**: Users can manually select their preferred language

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install @vitalets/google-translate-api node-fetch
```

### 2. Backend Configuration

The translation functionality is implemented in `backend/utils/translator.js` and integrated into the FAQ routes.

#### Key Components:

- **Language Detection**: Uses Google Translate API to detect input language
- **Translation Services**: 
  - Primary: Google Translate (unofficial API)
  - Fallback 1: LibreTranslate (free public API)
  - Fallback 2: MyMemory (free translation service)
- **Caching**: In-memory cache for translation results (24-hour TTL)

#### API Endpoints:

- `GET /api/faq/languages` - Get supported languages
- `POST /api/faq/detect-language` - Detect language of input text
- `POST /api/faq/query` - Enhanced with translation support

### 3. Frontend Integration

The frontend has been updated to support:

- **Language Selection**: Enhanced language toggle with 50+ languages
- **Automatic Language Detection**: Detects user's language preference
- **Translated Responses**: Displays responses in user's selected language
- **Language Persistence**: Remembers user's language choice

## Usage

### For Users:

1. **Automatic Detection**: The system automatically detects your language when you type
2. **Manual Selection**: Use the language toggle (🌐) to select your preferred language
3. **Seamless Experience**: Ask questions in your language and receive answers in the same language

### For Developers:

#### Backend Usage:

```javascript
const { 
  detectLanguage, 
  translateText, 
  processUserQuery, 
  translateResponse 
} = require('./utils/translator');

// Detect language
const lang = await detectLanguage("Hola, ¿cómo estás?");
console.log(lang); // "es"

// Translate text
const result = await translateText("Hello", "es");
console.log(result.text); // "Hola"

// Process user query
const queryData = await processUserQuery("¿Cuál es el horario?", "es");
console.log(queryData.translatedQuery); // "What is the schedule?"

// Translate response
const translatedResponse = await translateResponse("The schedule is...", "es");
console.log(translatedResponse); // "El horario es..."
```

#### Frontend Usage:

```javascript
import { useAppStore } from '../store/appStore';

function MyComponent() {
  const { language, setLanguage, supportedLanguages } = useAppStore();
  
  // Get current language
  console.log(language); // "en"
  
  // Change language
  setLanguage("es");
  
  // Get supported languages
  console.log(supportedLanguages); // { en: "English", es: "Español", ... }
}
```

## Supported Languages

The system supports 50+ languages including:

### Major Languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Russian (ru)
- Portuguese (pt)
- Italian (it)

### Indian Languages:
- Hindi (hi)
- Bengali (bn)
- Tamil (ta)
- Telugu (te)
- Malayalam (ml)
- Kannada (kn)
- Gujarati (gu)
- Marathi (mr)
- Punjabi (pa)
- Odia (or)
- Assamese (as)
- Nepali (ne)

### Other Languages:
- Thai (th)
- Vietnamese (vi)
- Indonesian (id)
- Malay (ms)
- Filipino (tl)
- Turkish (tr)
- Polish (pl)
- Dutch (nl)
- Swedish (sv)
- Danish (da)
- Norwegian (no)
- Finnish (fi)
- And many more...

## Configuration

### Environment Variables

No additional environment variables are required. The system uses free public APIs.

### Customization

#### Adding New Languages:

1. Update `SUPPORTED_LANGUAGES` in `backend/utils/translator.js`
2. Add language to frontend fallback list in `LanguageToggle.jsx`

#### Modifying Translation Services:

Edit the `translateWithFallback` function in `translator.js` to add or modify translation services.

#### Cache Configuration:

Modify `CACHE_TTL` in `translator.js` to change cache duration (default: 24 hours).

## Troubleshooting

### Common Issues:

1. **Translation Fails**: The system has multiple fallback services, so this is rare
2. **Language Not Detected**: Defaults to English
3. **Slow Performance**: Check network connection; translations are cached
4. **Unsupported Language**: Add to `SUPPORTED_LANGUAGES` list

### Debug Mode:

Enable debug logging by checking console output for translation logs.

## Performance Considerations

- **Caching**: Translation results are cached for 24 hours
- **Fallback Services**: Multiple services ensure high availability
- **Async Processing**: All translations are handled asynchronously
- **Memory Usage**: Cache size is limited by TTL expiration

## Security Notes

- Uses only free, public translation APIs
- No API keys required
- No sensitive data is sent to translation services
- User queries are processed locally first, then translated

## Future Enhancements

- Redis cache for production environments
- Custom translation models
- Offline translation support
- Language-specific FAQ content
- Voice input/output support
- Translation quality metrics

## Support

For issues or questions about the multilingual functionality:

1. Check the console logs for error messages
2. Verify network connectivity
3. Test with different languages
4. Check if translation services are available

The system is designed to be robust and fallback gracefully when services are unavailable.
