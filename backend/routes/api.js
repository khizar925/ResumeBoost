const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const optimizeController = require('../controllers/optimizeController');
const compileController = require('../controllers/compileController');

// POST /api/upload — accepts PDF + job description, returns extracted text
router.post('/upload', uploadController.upload, uploadController.handleUpload);

// POST /api/optimize — accepts resumeText + jobDescription, returns XYZ-optimized JSON
router.post('/optimize', optimizeController.handleOptimize);

// POST /api/compile — accepts optimized JSON, returns compiled PDF
router.post('/compile', compileController.handleCompile);

module.exports = router;
