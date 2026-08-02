/**
 * PDF Processing Utility
 * 
 * This module handles PDF text extraction, summarization, and translation
 * for the CampusMitra PDF upload feature.
 */

const pdfParse = require('pdf-parse');
const { translateText, detectLanguage } = require('./simple-translator');

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<{text: string, pages: number, info: object}>} - Extracted text and metadata
 */
async function extractTextFromPdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Create a summary of the extracted text with special handling for notices
 * @param {string} text - Extracted text from PDF
 * @param {number} maxLength - Maximum length of summary
 * @returns {string} - Generated summary
 */
function createSummary(text, maxLength = 500) {
  if (!text || text.trim().length === 0) {
    return 'No text content found in the PDF.';
  }

  // Clean and normalize text
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();

  // Check if this is a notice or formal document
  const isNotice = /notice|holiday|closure|closed|date|subject|ref\.? no/i.test(cleanText);
  
  if (isNotice) {
    return createNoticeSummary(cleanText, maxLength);
  }

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // Simple summarization logic for regular documents
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 3) {
    return cleanText.substring(0, maxLength) + '...';
  }

  // Take first few sentences and last few sentences
  const firstSentences = sentences.slice(0, 2);
  const lastSentences = sentences.slice(-2);
  
  let summary = firstSentences.join('. ') + '. ';
  
  if (summary.length < maxLength * 0.7) {
    summary += '... ' + lastSentences.join('. ') + '.';
  }

  // Ensure summary doesn't exceed max length
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength) + '...';
  }

  return summary;
}

/**
 * Create a summary specifically for notices and formal documents
 * @param {string} text - Extracted text from PDF
 * @param {number} maxLength - Maximum length of summary
 * @returns {string} - Generated notice summary
 */
function createNoticeSummary(text, maxLength = 500) {
  // Extract key information from notices
  const lines = text.split(/[.!?]+/).filter(line => line.trim().length > 0);
  
  let keyInfo = [];
  let subject = '';
  let date = '';
  let mainMessage = '';
  
  // Look for important information
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Extract subject
    if (lowerLine.includes('subject') && lowerLine.includes('holiday')) {
      subject = line.trim();
    }
    
    // Extract date information
    if (lowerLine.includes('monday') || lowerLine.includes('tuesday') || 
        lowerLine.includes('wednesday') || lowerLine.includes('thursday') || 
        lowerLine.includes('friday') || lowerLine.includes('saturday') || 
        lowerLine.includes('sunday') || /\d{2}-\d{2}-\d{4}/.test(line)) {
      date = line.trim();
    }
    
    // Extract main message about closure/holiday
    if (lowerLine.includes('closed') || lowerLine.includes('holiday') || 
        lowerLine.includes('remain closed') || lowerLine.includes('will be closed')) {
      mainMessage = line.trim();
    }
  }
  
  // Create a focused summary
  let summary = '';
  
  if (subject) {
    summary += subject + '. ';
  }
  
  if (mainMessage) {
    summary += mainMessage + '. ';
  }
  
  if (date && !summary.includes(date)) {
    summary += 'Date: ' + date + '. ';
  }
  
  // If we have a good summary, use it
  if (summary.trim().length > 0) {
    // Clean up the summary
    summary = summary.replace(/\s+/g, ' ').trim();
    
    // Ensure it doesn't exceed max length
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength) + '...';
    }
    
    return summary;
  }
  
  // Fallback to regular summarization
  return createSummary(text, maxLength);
}

/**
 * Process PDF: extract text, create summary, and translate
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} targetLanguage - Target language for summary
 * @returns {Promise<{originalText: string, summary: string, translatedSummary: string, detectedLanguage: string, pages: number}>}
 */
async function processPdf(pdfBuffer, targetLanguage = 'en') {
  try {
    console.log('Starting PDF processing...');
    
    // Extract text from PDF
    const { text, pages, info } = await extractTextFromPdf(pdfBuffer);
    console.log(`Extracted text from ${pages} pages`);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in the PDF');
    }

    // Detect language of extracted text
    const detectedLanguage = await detectLanguage(text);
    console.log(`Detected language: ${detectedLanguage}`);

    // Create summary
    const summary = createSummary(text);
    console.log(`Created summary (${summary.length} characters)`);
    
    // Translate summary if target language is not English
    let translatedSummary = summary;
    if (targetLanguage !== 'en') {
      console.log(`Translating summary to ${targetLanguage}...`);
      const translationResult = await translateText(summary, targetLanguage, 'en');
      translatedSummary = translationResult.text;
      console.log('Translation completed');
    }

    return {
      originalText: text,
      summary: summary,
      translatedSummary: translatedSummary,
      detectedLanguage: detectedLanguage,
      pages: pages,
      info: info
    };

  } catch (error) {
    console.error('PDF processing error:', error);
    throw error;
  }
}

/**
 * Get PDF processing statistics
 * @param {string} text - Extracted text
 * @returns {object} - Processing statistics
 */
function getProcessingStats(text) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    characterCount: text.length,
    averageWordsPerSentence: words.length / sentences.length || 0
  };
}

/**
 * Validate PDF file
 * @param {object} file - Multer file object
 * @returns {object} - Validation result
 */
function validatePdfFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  if (file.mimetype !== 'application/pdf') {
    errors.push('File must be a PDF document');
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    errors.push('File size must be less than 10MB');
  }

  if (file.size < 1024) { // 1KB minimum
    errors.push('File appears to be empty or corrupted');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  extractTextFromPdf,
  createSummary,
  createNoticeSummary,
  processPdf,
  getProcessingStats,
  validatePdfFile
};
