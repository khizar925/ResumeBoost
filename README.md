# ResumeBoost 🚀

ResumeBoost is an AI-powered ATS resume optimizer that helps job seekers rewrite their resumes using the **Google XYZ Method**.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini (1.5 Flash)
- **PDF Generation**: LaTeX (pdflatex)

## 🚀 Getting Started

### 1. Prerequisites

You must have `pdflatex` installed on your system.
```bash
sudo apt-get install -y texlive-latex-recommended texlive-fonts-recommended texlive-latex-extra
```

### 2. Setup

1. **Clone the repository** (if you're pulling this from a repo).
2. **Install dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```

### 3. Run the Application

You need to run both the backend and the frontend servers.

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

## 🔒 Security

This project implements:
- **Zero-trust input validation**: All user inputs are sanitized.
- **Prompt Injection Defense**: Filters out malicious instructions.
- **MIME & Magic Byte Validation**: Ensures only real PDF files are processed.

## 📄 License
MIT
