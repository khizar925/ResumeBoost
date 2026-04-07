const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
// const { v4: uuidv4 } = require('uuid');

const TEMPLATE_PATH = path.join(__dirname, '../templates/jakes_resume.tex');

/**
 * Escape special LaTeX characters in a plain-text string.
 */
function escapeLaTeX(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\[verify\]/g, '{\\color{red}[verify]}');
}

/**
 * Build the LaTeX experience section from the JSON array.
 */
function buildExperienceSection(experience = []) {
  return experience.map(job => {
    const bullets = (job.bullets || [])
      .map(b => `      \\resumeItem{${escapeLaTeX(b)}}`)
      .join('\n');
    return `    \\resumeSubheading
      {${escapeLaTeX(job.title)}}{${escapeLaTeX(job.dates)}}
      {${escapeLaTeX(job.company)}}{${escapeLaTeX(job.location)}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
  }).join('\n\n');
}

/**
 * Build the LaTeX education section from the JSON array.
 */
function buildEducationSection(education = []) {
  return education.map(edu => {
    const gpaLine = edu.gpa ? `GPA: ${escapeLaTeX(edu.gpa)}` : '';
    return `    \\resumeSubheading
      {${escapeLaTeX(edu.school)}}{${escapeLaTeX(edu.dates)}}
      {${escapeLaTeX(edu.degree)}}{${escapeLaTeX(edu.location)}}${gpaLine ? `\n      \\resumeItemListStart\n        \\resumeItem{${gpaLine}}\n      \\resumeItemListEnd` : ''}`;
  }).join('\n\n');
}

/**
 * Build the LaTeX projects section from the JSON array.
 */
function buildProjectsSection(projects = []) {
  if (!projects || projects.length === 0) return '';
  const items = projects.map(proj => {
    const bullets = (proj.bullets || [])
      .map(b => `      \\resumeItem{${escapeLaTeX(b)}}`)
      .join('\n');
    return `    \\resumeProjectHeading
      {\\textbf{${escapeLaTeX(proj.name)}} $|$ \\emph{${escapeLaTeX(proj.technologies)}}}{${escapeLaTeX(proj.dates)}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
  }).join('\n\n');
  return `%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd`;
}

/**
 * Populate the Jake's Resume .tex template with structured resume JSON.
 * @param {Object} resumeJson
 * @returns {string} populated .tex content
 */
function populateTemplate(resumeJson) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const {
    name = '',
    email = '',
    phone = '',
    linkedin = '',
    github = '',
    summary = '',
    skills = [],
    experience = [],
    education = [],
    projects = [],
  } = resumeJson;

  let tex = template;
  tex = tex.replace('{{NAME}}', escapeLaTeX(name));
  tex = tex.replace('{{PHONE}}', escapeLaTeX(phone));
  tex = tex.replace('{{EMAIL}}', escapeLaTeX(email));
  tex = tex.replace('{{LINKEDIN}}', escapeLaTeX(linkedin));
  tex = tex.replace('{{GITHUB}}', escapeLaTeX(github));
  tex = tex.replace('{{SUMMARY}}', escapeLaTeX(summary));
  tex = tex.replace('{{SKILLS}}', skills.map(s => escapeLaTeX(s)).join(', '));
  tex = tex.replace('{{EXPERIENCE}}', buildExperienceSection(experience));
  tex = tex.replace('{{EDUCATION}}', buildEducationSection(education));
  tex = tex.replace('{{PROJECTS}}', buildProjectsSection(projects));

  return tex;
}

/**
 * Compile a .tex string to PDF using pdflatex.
 * Returns a Buffer of the compiled PDF.
 * @param {string} texContent
 * @returns {Promise<Buffer>}
 */
function compileTex(texContent) {
  return new Promise((resolve, reject) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resumeboost-'));
    const texFile = path.join(tmpDir, 'resume.tex');
    const pdfFile = path.join(tmpDir, 'resume.pdf');

    fs.writeFileSync(texFile, texContent, 'utf8');

    // Run pdflatex twice to resolve references
    const pdflatexBin = process.env.PDFLATEX_PATH || 'pdflatex';
    const runPdflatex = (callback) => {
      execFile(
        pdflatexBin,
        ['-interaction=nonstopmode', '-output-directory', tmpDir, texFile],
        { timeout: 180000, cwd: tmpDir, shell: true },
        callback
      );
    };

    runPdflatex((err1, stdout1, stderr1) => {
      if (err1 && !fs.existsSync(pdfFile)) {
        const logFile = path.join(tmpDir, 'resume.log');
        let logOutput = '(no log file)';
        if (fs.existsSync(logFile)) {
          const lines = fs.readFileSync(logFile, 'utf8').split('\n');
          const errorLines = lines.filter(l => l.startsWith('!') || l.includes('Error') || l.includes('error'));
          logOutput = errorLines.length > 0
            ? errorLines.join('\n')
            : lines.slice(-60).join('\n');
        }
        cleanupDir(tmpDir);
        console.error('[LaTeX] First run failed:\nERR:', err1?.message, '\nLATEX ERRORS:\n', logOutput);
        return reject(Object.assign(
          new Error('PDF compilation failed. Check LaTeX content.'),
          { status: 500 }
        ));
      }

      // Second pass for correct page refs
      runPdflatex((err2, stdout2, stderr2) => {
        if (!fs.existsSync(pdfFile)) {
          cleanupDir(tmpDir);
          console.error('[LaTeX] Second run failed:\nSTDOUT:', stdout2, '\nSTDERR:', stderr2, '\nERR:', err2?.message);
          return reject(Object.assign(
            new Error('PDF compilation failed on second pass.'),
            { status: 500 }
          ));
        }

        const pdfBuffer = fs.readFileSync(pdfFile);
        cleanupDir(tmpDir);
        resolve(pdfBuffer);
      });
    });
  });
}

function cleanupDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    console.warn('[LaTeX] Cleanup warning:', e.message);
  }
}

module.exports = { populateTemplate, compileTex };
