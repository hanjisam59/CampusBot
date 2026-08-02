const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const Upload = require("../models/uploadModel");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname) || ".pdf";
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/merge", upload.single("file"), async (req, res) => {
  try {
    const text = (req.body.knowledge || "").toString();
    if (!req.file) return res.status(400).json({ msg: "No PDF uploaded" });

    const originalPath = req.file.path;
    const originalBytes = fs.readFileSync(originalPath);
    const pdfDoc = await PDFDocument.load(originalBytes);

    // Create an appendix page with the provided text
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 40;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Simple text wrapping
    const words = text.replace(/\r\n/g, "\n").split(/\s+/);
    let x = margin;
    let y = height - margin;
    const maxWidth = width - margin * 2;

    function measure(text) {
      return font.widthOfTextAtSize(text, fontSize);
    }

    let line = "";
    for (const word of words) {
      if (word.includes("\n")) {
        const parts = word.split("\n");
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (part) {
            const tentative = line ? line + " " + part : part;
            if (measure(tentative) > maxWidth) {
              page.drawText(line, { x, y, size: fontSize, font });
              y -= fontSize * 1.4;
              line = part;
            } else {
              line = tentative;
            }
          }
          if (i < parts.length - 1) {
            page.drawText(line, { x, y, size: fontSize, font });
            y -= fontSize * 1.4;
            line = "";
          }
        }
      } else {
        const tentative = line ? line + " " + word : word;
        if (measure(tentative) > maxWidth) {
          page.drawText(line, { x, y, size: fontSize, font });
          y -= fontSize * 1.4;
          line = word;
        } else {
          line = tentative;
        }
      }
      if (y < margin + fontSize * 2) {
        page.drawText(line, { x, y, size: fontSize, font });
        line = "";
        // Add new page if overflow
        page = pdfDoc.addPage();
        y = height - margin;
      }
    }
    if (line) page.drawText(line, { x, y, size: fontSize, font });

    const mergedBytes = await pdfDoc.save();
    const mergedName = `merged_${path.basename(originalPath)}`;
    const mergedPath = path.join(uploadsDir, mergedName);
    fs.writeFileSync(mergedPath, mergedBytes);

    // Persist metadata
    const payload = {
      originalName: req.file.originalname,
      storedName: path.basename(originalPath),
      mergedName,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      knowledge: text,
    };
    const doc = await Upload.create(payload);
    console.log("Saved upload record:", { id: doc._id, ...payload });

    res.json({
      msg: "PDF merged with knowledge",
      id: doc._id,
      file: {
        original: path.basename(originalPath),
        merged: mergedName,
        url: `/uploads/${mergedName}`,
      },
    });
  } catch (err) {
    console.error("/api/upload/merge error:", err);
    res.status(500).json({ error: err.message });
  }
});

// List recent uploads
router.get("/", async (_req, res) => {
  try {
    const items = await Upload.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json({ uploads: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


