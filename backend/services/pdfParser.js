const pdfParse = require('pdf-parse');
const fs = require('fs');

// Magic bytes for PDF: %PDF-
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);

/**
 * Verify the first 5 bytes of a file match the PDF magic bytes.
 * @param {string} filePath
 * @returns {boolean}
 */
function verifyPdfMagicBytes(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(5);
  fs.readSync(fd, buf, 0, 5, 0);
  fs.closeSync(fd);
  return buf.equals(PDF_MAGIC);
}

/**
 * Extract plain text from a PDF file.
 * @param {string} filePath — absolute path to PDF
 * @returns {Promise<string>} extracted text
 */
async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await pdfParse(dataBuffer);
  return result.text.trim();
}

module.exports = { verifyPdfMagicBytes, extractTextFromPdf };
