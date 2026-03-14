const { populateTemplate, compileTex } = require('../services/latexService');

const handleCompile = async (req, res, next) => {
  try {
    const { optimizedResume } = req.body;

    if (!optimizedResume || typeof optimizedResume !== 'object') {
      return res.status(400).json({ error: 'Invalid or missing resume JSON.' });
    }

    // Populate Jake's Resume template with the optimized JSON
    const texContent = populateTemplate(optimizedResume);

    // Compile to PDF via pdflatex
    const pdfBuffer = await compileTex(texContent);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="optimized_resume.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { handleCompile };
