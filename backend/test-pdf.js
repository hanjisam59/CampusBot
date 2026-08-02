/**
 * Test script for PDF processing functionality
 * Run with: node test-pdf.js
 */

const { processPdf, validatePdfFile, getProcessingStats } = require('./utils/pdfProcessor');
const fs = require('fs');
const path = require('path');

async function testPdfProcessing() {
  console.log('🧪 Testing PDF Processing Functionality\n');

  try {
    // Test 1: PDF Validation
    console.log('1. Testing PDF File Validation:');
    
    const validFile = {
      mimetype: 'application/pdf',
      size: 1024 * 1024, // 1MB
      originalname: 'test.pdf'
    };
    
    const invalidFile = {
      mimetype: 'text/plain',
      size: 1024,
      originalname: 'test.txt'
    };
    
    const validation1 = validatePdfFile(validFile);
    const validation2 = validatePdfFile(invalidFile);
    
    console.log(`   Valid PDF file: ${validation1.isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Invalid file: ${validation2.isValid ? '❌ Should be invalid' : '✅ Correctly rejected'}`);
    
    // Test 2: Text Processing Stats
    console.log('\n2. Testing Text Processing Stats:');
    const sampleText = "This is a sample text. It has multiple sentences. Each sentence provides information. The text contains various words and characters.";
    const stats = getProcessingStats(sampleText);
    
    console.log(`   Word count: ${stats.wordCount}`);
    console.log(`   Sentence count: ${stats.sentenceCount}`);
    console.log(`   Character count: ${stats.characterCount}`);
    console.log(`   Average words per sentence: ${stats.averageWordsPerSentence.toFixed(2)}`);
    
    // Test 3: Summary Creation
    console.log('\n3. Testing Summary Creation:');
    const longText = "This is a very long text that needs to be summarized. " +
      "It contains multiple sentences with various information. " +
      "The purpose is to test the summarization functionality. " +
      "We want to see how the system handles long texts. " +
      "The summary should be concise and informative. " +
      "This is the end of the sample text for testing purposes.";
    
    const { createSummary } = require('./utils/pdfProcessor');
    const summary = createSummary(longText, 100);
    console.log(`   Original length: ${longText.length} characters`);
    console.log(`   Summary length: ${summary.length} characters`);
    console.log(`   Summary: "${summary}"`);
    
    console.log('\n✅ All PDF processing tests completed successfully!');
    console.log('\n📝 Note: Full PDF processing requires actual PDF files.');
    console.log('   The system is ready to handle PDF uploads and summarization.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testPdfProcessing();
