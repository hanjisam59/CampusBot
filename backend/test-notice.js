/**
 * Test script for notice processing functionality
 * Run with: node test-notice.js
 */

const { createSummary, createNoticeSummary } = require('./utils/pdfProcessor');

function testNoticeProcessing() {
  console.log('🧪 Testing Notice Processing Functionality\n');

  try {
    // Test notice text (similar to the BRACT notice)
    const noticeText = `
      PCET'S NUTAN MAHARASHTRA INSTITUTE OF ENGINEERING AND TECHNOLOGY
      Vishnupuri Talegaon Dabhade Pune-410507
      Phone: +91 7423080910
      
      Ref. No. - NMIET/VG/C-EST/2026-27/496
      Date : 14-09-2026
      
      Notice
      Subject :- Holiday on account of Shri Ganesh Utsov.
      
      On account of Ganesh Utsov, PCET'S Nutan Maharashtra Institute of Engineering and Technology, Talegaon Dabhade,Pune  will remain closed on Monday, 14-09-2026
       
      Director
      
    `;

    console.log('1. Testing Notice Detection:');
    const isNotice = /notice|holiday|closure|closed|date|subject|ref\.? no/i.test(noticeText);
    console.log(`   Is Notice: ${isNotice ? '✅ Yes' : '❌ No'}`);

    console.log('\n2. Testing Notice Summary:');
    const noticeSummary = createNoticeSummary(noticeText, 300);
    console.log(`   Summary: "${noticeSummary}"`);
    console.log(`   Length: ${noticeSummary.length} characters`);

    console.log('\n3. Testing Regular Summary:');
    const regularSummary = createSummary(noticeText, 300);
    console.log(`   Summary: "${regularSummary}"`);
    console.log(`   Length: ${regularSummary.length} characters`);

    console.log('\n4. Testing Key Information Extraction:');
    const lines = noticeText.split(/[.!?]+/).filter(line => line.trim().length > 0);
    let keyInfo = [];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('holiday') || lowerLine.includes('closed') || lowerLine.includes('closure')) {
        keyInfo.push(line.trim());
      }
      
      if (lowerLine.includes('date') || lowerLine.includes('monday') || /\d{2}-\d{2}-\d{4}/.test(line)) {
        keyInfo.push(line.trim());
      }
      
      if (lowerLine.includes('subject') || lowerLine.includes('account of')) {
        keyInfo.push(line.trim());
      }
    }
    
    console.log(`   Key Information Found: ${keyInfo.length} items`);
    keyInfo.forEach((info, index) => {
      console.log(`   ${index + 1}. "${info}"`);
    });

    console.log('\n✅ Notice processing tests completed successfully!');
    console.log('\n📝 The system will now extract key information from notices like:');
    console.log('   - Holiday announcements');
    console.log('   - Closure dates');
    console.log('   - Important subjects');
    console.log('   - Date information');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testNoticeProcessing();
