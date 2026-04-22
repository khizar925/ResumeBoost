const express = require('express');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');
const uploadController = require('../controllers/uploadController');
const optimizeController = require('../controllers/optimizeController');
const compileController = require('../controllers/compileController');

const optimizeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Daily limit reached. You can optimize 3 resumes per 24 hours.' },
});

// POST /api/upload — accepts PDF + job description, returns extracted text
router.post('/upload', uploadController.upload, uploadController.handleUpload);

// POST /api/optimize — accepts resumeText + jobDescription, returns XYZ-optimized JSON
router.post('/optimize', optimizeLimiter, optimizeController.handleOptimize);

// POST /api/compile — accepts optimized JSON, returns compiled PDF
router.post('/compile', compileController.handleCompile);

module.exports = router;
