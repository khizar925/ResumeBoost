const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyPdfMagicBytes, extractTextFromPdf } = require('../services/pdfParser');
const { checkInjection } = require('../services/sanitizer');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '5') * 1024 * 1024;
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}.pdf`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  // MIME type check
  if (file.mimetype !== 'application/pdf') {
    return cb(Object.assign(new Error('Only PDF files are supported.'), { status: 400 }));
  }
  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('resume');

// Multer middleware wrapped to return proper JSON errors
const upload = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 5}MB.` });
      }
      return res.status(err.status || 400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
};

const handleUpload = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    // Magic bytes verification
    if (!verifyPdfMagicBytes(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Only PDF files are supported.' });
    }

    // Extract text
    const resumeText = await extractTextFromPdf(filePath);

    if (!resumeText || resumeText.length < 50) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Could not extract readable text from PDF. Please upload a text-based PDF.' });
    }

    // Injection filter on extracted resume text
    checkInjection(resumeText, 'resume');

    // Delete temp file after extraction
    fs.unlinkSync(filePath);

    return res.json({ resumeText });
  } catch (err) {
    // Clean up file on error
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    next(err);
  }
};

module.exports = { upload, handleUpload };
