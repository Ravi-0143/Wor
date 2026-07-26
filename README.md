# 🌌 Antigravity English Lexicon

> An immersive, AI-powered vocabulary mastery platform and cognitive learning suite built with React 19, TypeScript, Vite, Tailwind CSS, and Google Gemini AI.

---

## 🚀 Overview

**Antigravity English Lexicon** is a modern, modular vocabulary acquisition and deep-learning web application designed for high-efficiency language mastery. It combines cognitive science principles, interactive relationship graphs, spaced repetition flashcards, reverse-concept searches, and real-time AI-powered quiz engines to deliver a distraction-free learning experience.

📖 **Primary Study Material**: The main vocabulary source dataset is preserved in **[`REVISION_GUIDE.md`](REVISION_GUIDE.md)** (also served dynamically by the webapp at `public/revision_guide.md`).

---

## ✨ Key Features & Learning Modules

- **01. Lexicon Main Stage** (`src/modules/01_LexiconMainStage`)  
  Unified vocabulary dashboard with search, filtering, level indicators, phonetic breakdowns, and quick-inspect word cards.

- **02. Markdown Parser Service** (`src/modules/02_MarkdownParserService`)  
  Intelligent parser capable of importing custom markdown study notes, structured lexicon lists, and the primary [`REVISION_GUIDE.md`](REVISION_GUIDE.md).

- **04. Flashcard Mastery Engine** (`src/modules/04_FlashcardMasteryEngine`)  
  Interactive active-recall system with spaced repetition mechanics, self-assessment scoring, and progress tracking.

- **05. Synonym Mesh Graph** (`src/modules/05_SynonymMeshGraph`)  
  Visual semantic network mapping words, synonyms, antonyms, and related concepts in an interactive graph layout.

- **06. Exam & Quiz Engine** (`src/modules/06_ExamQuizEngine`)  
  AI-generated quizzes powered by Google Gemini AI providing targeted practice questions, usage scenarios, and instant feedback.

- **07. Reverse Concept Engine** (`src/modules/07_ReverseConceptEngine`)  
  Enter descriptive thoughts or complex definitions to discover matching precision vocabulary terms.

- **08. Word Detail Inspector** (`src/modules/08_WordDetailInspector`)  
  Focused immersion view breaking down word etymology, root origins, prefixes, usage nuances, collocations, and memory hooks.

---

## 📁 Repository Structure

```
antigravity-english-lexicon/
├── REVISION_GUIDE.md                 # 📖 Primary Vocabulary Dataset (Root Link)
├── docs/                             # Platform Specifications & Governance
│   ├── README.md                     # Documentation suite index
│   ├── 01_constitution/              # Governance & supreme rules
│   ├── 02_vision_and_architecture/   # System vision & experience contracts
│   ├── 03_design_system/             # Visual identity, motion & UI guidelines
│   ├── 04_learning_philosophy/       # Cognitive resonance & pedagogy
│   ├── 05_quality_and_standards/     # QA checklists & anti-patterns
│   └── 06_reference_guides/          # Terminology glossary & reading order
├── public/
│   └── revision_guide.md             # Served dynamically to webapp frontend
├── src/
│   ├── components/                   # Shared UI components & modal dialogs
│   ├── modules/                      # Standalone core learning modules (01 - 08)
│   ├── services/                     # Gemini AI API & study guide parser services
│   ├── App.tsx                       # Main application shell & module router
│   ├── main.tsx                      # React root rendering entrypoint
│   ├── types.ts                      # Core TypeScript interfaces & data models
│   └── index.css                     # Global design tokens & styling
├── server.ts                         # Express backend proxy for Gemini AI API
├── vite.config.ts                    # Vite build configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Project dependencies & npm scripts
├── .env.example                      # Environment variables template
└── README.md                         # Project documentation
```

---

## 📚 Architectural Governance & Specifications

All design principles, module contracts, UI/UX standards, and cognitive learning mechanics follow the **Atlas Lexicon Specifications** preserved in the [`docs/`](docs/) directory:

- ⚖️ **[Platform Constitution](docs/01_constitution/00_CONSTITUTION.md)** — Supreme rules governing design and code.
- 🎨 **[Design Language](docs/03_design_system/03_DESIGN_LANGUAGE.md)** — Visual identity and craft standards.
- ⚡ **[Experience Contract](docs/02_vision_and_architecture/05_EXPERIENCE_CONTRACT.md)** — Module state and lifecycle contracts.
- 🏆 **[Quality Bar](docs/05_quality_and_standards/06_QUALITY_BAR.md)** — Code health and performance criteria.

Explore the complete specification suite in the **[Docs Directory](docs/README.md)**.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion)
- **AI Integration**: Google Gemini AI API (`@google/genai`)
- **Backend / Dev Server**: Node.js, Express, `tsx` server runner
- **Icons & FX**: Lucide React, Canvas Confetti

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/antigravity-english-lexicon.git
   cd antigravity-english-lexicon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Google Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or the port specified in terminal).

---

## 🧪 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express server and Vite development environment |
| `npm run build` | Builds the frontend dist bundle & bundles `server.ts` into `dist/server.cjs` |
| `npm run start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run preview` | Previews the production build locally via Vite |
| `npm run lint` | Performs TypeScript typechecking (`tsc --noEmit`) |

---

## 🤝 Contributing

Contributions are welcome! Please ensure all code changes align with our **[Constitution](docs/01_constitution/00_CONSTITUTION.md)** and pass typechecks (`npm run lint`) prior to submitting a pull request.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
