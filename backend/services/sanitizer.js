const sanitizeHtml = require('sanitize-html');

// Prompt injection patterns to detect and reject
const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|all)\s+instructions?/i,
  /you\s+are\s+now\s+/i,
  /disregard\s+(your\s+)?(role|instructions?|previous)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?a\s+/i,
  /forget\s+(everything|all|your)\s+/i,
  /new\s+instructions?:/i,
  /system\s*:/i,
  /\[SYSTEM\]/i,
  /<\|.*?\|>/i,           // <|im_start|> style tokens
  /\[\[INST\]\]/i,        // Llama instruction tokens
  /###\s*instruction/i,
  /override\s+(previous|prior|all)\s+/i,
  /jailbreak/i,
  /prompt\s+injection/i,
  /do\s+not\s+follow/i,
  /bypass\s+(your\s+)?(safety|filter|restriction)/i,
  /you\s+must\s+now\s+/i,
  /from\s+now\s+on\s+you\s+/i,
];

// Binary/base64 blob detector: high ratio of non-printable or non-ASCII chars
function looksLikeBinaryBlob(text) {
  const nonPrintable = (text.match(/[^\x09\x0A\x0D\x20-\x7E]/g) || []).length;
  return nonPrintable / text.length > 0.1;
}

/**
 * Sanitize job description:
 *  1. Strip HTML/scripts
 *  2. Enforce character limit
 *  3. Check for binary blobs
 *  4. Check for prompt injection patterns
 * @param {string} text
 * @param {number} maxChars
 * @returns {string} sanitized text
 * @throws {Error} with user-facing message on violation
 */
function sanitizeJobDescription(text, maxChars = 5000) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw Object.assign(new Error('Job description is required.'), { status: 400 });
  }

  // Strip HTML tags/scripts
  const stripped = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });

  if (stripped.length > maxChars) {
    throw Object.assign(
      new Error(`Job description exceeds the maximum of ${maxChars} characters.`),
      { status: 400 }
    );
  }

  if (looksLikeBinaryBlob(stripped)) {
    throw Object.assign(
      new Error('Invalid input detected. Please paste plain text only.'),
      { status: 400 }
    );
  }

  return stripped;
}

/**
 * Run prompt injection filter on any text (resume or JD).
 * Logs the violation and throws if a pattern is detected.
 * @param {string} text
 * @param {string} label — label for logs (e.g. "resume", "jobDescription")
 */
function checkInjection(text, label = 'input') {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      console.warn(`[InjectionFilter] Injection pattern detected in ${label}:`, pattern.toString());
      throw Object.assign(
        new Error('Invalid input detected. Please paste plain text only.'),
        { status: 400 }
      );
    }
  }
}

module.exports = { sanitizeJobDescription, checkInjection };
