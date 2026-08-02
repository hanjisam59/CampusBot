const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { processPdf, validatePdfFile, getProcessingStats } = require("../utils/pdfProcessor");

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// PDF upload and summarization endpoint
router.post("/pdf-summarize", upload.single('pdf'), async (req, res) => {
  try {
    console.log('PDF upload request received');
    
    // Validate file
    const validation = validatePdfFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', ')
      });
    }

    const { language = 'en' } = req.body;
    console.log(`Processing PDF for language: ${language}`);

    // Read the uploaded file
    const pdfBuffer = fs.readFileSync(req.file.path);
    
    // Process the PDF
    const result = await processPdf(pdfBuffer, language);
    
    // Get processing statistics
    const stats = getProcessingStats(result.originalText);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    console.log('PDF processing completed successfully');
    
    res.json({
      success: true,
      summary: result.translatedSummary,
      originalSummary: result.summary,
      detectedLanguage: result.detectedLanguage,
      targetLanguage: language,
      translated: language !== 'en',
      pages: result.pages,
      stats: {
        wordCount: stats.wordCount,
        sentenceCount: stats.sentenceCount,
        characterCount: stats.characterCount
      },
      filename: req.file.originalname
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process PDF'
    });
  }
});

// Get supported languages for PDF processing
router.get("/languages", (req, res) => {
  try {
    const { getSupportedLanguages } = require('../utils/simple-translator');
    const languages = getSupportedLanguages();
    res.json({ success: true, languages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get supported languages" });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "PDF processing service is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
