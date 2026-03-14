const { optimizeResume } = require('../services/llmService');
const { sanitizeJobDescription, checkInjection } = require('../services/sanitizer');

const JD_MAX_CHARS = parseInt(process.env.JD_MAX_CHARS || '5000');

const handleOptimize = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Invalid or missing resume text.' });
    }

    // Sanitize and validate job description
    const cleanJD = sanitizeJobDescription(jobDescription, JD_MAX_CHARS);

    // Injection filter on both inputs before LLM call
    checkInjection(resumeText, 'resume');
    checkInjection(cleanJD, 'jobDescription');

    const optimizedJson = await optimizeResume(resumeText, cleanJD);

    return res.json({ optimizedResume: optimizedJson });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleOptimize };
