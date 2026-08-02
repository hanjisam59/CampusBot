const express = require("express");
const router = express.Router();
const faqs = require("../data");
const Query = require('../models/queryModel');
const { 
  processUserQuery, 
  translateResponse, 
  detectLanguage,
  getSupportedLanguages,
  isLanguageSupported 
} = require('../utils/simple-translator');

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set(['the','is','am','are','a','an','of','to','and','or','on','in','at','for','from','by','with','as','be','been','this','that','those','these','it','its','was','were','will','shall','do','does','did','how','what','when','where','which','who','whom','why']);

function tokenize(text) {
  return normalize(text).split(' ').filter((t) => t && !STOPWORDS.has(t));
}

function jaccardSimilarity(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection || 1;
  return intersection / union;
}

function computeMatchScore(query, item) {
  const qNorm = normalize(query);
  const itemText = `${item.question} ${(item.keywords || []).join(' ')}`;
  const iNorm = normalize(itemText);

  const substringScore = iNorm.includes(qNorm) || qNorm.includes(iNorm) ? 1 : 0;
  const keywordHit = (item.keywords || []).some((kw) => qNorm.includes(normalize(kw))) ? 1 : 0;
  const jaccard = jaccardSimilarity(tokenize(qNorm), tokenize(iNorm));

  // Weighted sum
  return 0.5 * jaccard + 0.3 * substringScore + 0.2 * keywordHit;
}

router.get("/", (req, res) => {
  res.json({ success: true, data: faqs });
});

// Get supported languages
router.get("/languages", (req, res) => {
  try {
    const languages = getSupportedLanguages();
    res.json({ success: true, languages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get supported languages" });
  }
});

// Detect language of input text
router.post("/detect-language", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }
    
    const detectedLang = await detectLanguage(text);
    res.json({ success: true, language: detectedLang });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to detect language" });
  }
});

router.post("/query", async (req, res) => {
  try {
    const { query, language, userEmail } = req.body || {};
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    // Process user query with translation
    const queryData = await processUserQuery(query, language);
    const { originalQuery, translatedQuery, detectedLang, userLang } = queryData;

    console.log(`Processing query: "${originalQuery}" (${detectedLang}) -> "${translatedQuery}" (en)`);

    // Find best matching FAQ using translated query
    let best = null;
    let bestScore = -1;
    for (const item of faqs) {
      const score = computeMatchScore(translatedQuery, item);
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    }

    // Require a minimum relevance threshold to avoid accidental matches
    const MIN_RELEVANCE = 0.3;
    const keywordHit = best ? (best.keywords || []).some((kw) => normalize(translatedQuery).includes(normalize(kw))) : false;
    const isSubstring = best ? (normalize(best.question).includes(normalize(translatedQuery)) || normalize(translatedQuery).includes(normalize(best.question))) : false;
    
    let answer;
    let matchedQuestion = null;

    if (!best || (bestScore < MIN_RELEVANCE && !keywordHit && !isSubstring)) {
      // Save to admin queue
      try {
        await Query.create({ 
          question: translatedQuery, 
          originalQuestion: originalQuery,
          detectedLanguage: detectedLang,
          userEmail: userEmail || null 
        });
      } catch (error) {
        console.error('Failed to save query to admin queue:', error);
      }
      
      answer = "Your query has been sent to the admin team. You'll be notified once it's resolved.";
    } else {
      answer = best.answer;
      matchedQuestion = best.question;
    }

    // Translate response back to user's language
    let translatedAnswer = answer;
    if (userLang && userLang !== 'en') {
      try {
        translatedAnswer = await translateResponse(answer, userLang);
        console.log(`Translated response: "${answer}" (en) -> "${translatedAnswer}" (${userLang})`);
      } catch (error) {
        console.error('Failed to translate response:', error);
        // Keep original English response if translation fails
      }
    }

    res.json({ 
      success: true, 
      answer: translatedAnswer,
      originalAnswer: answer,
      matchedQuestion: matchedQuestion,
      language: userLang,
      detectedLanguage: detectedLang,
      translated: userLang !== 'en'
    });
  } catch (err) {
    console.error('FAQ query error:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;


