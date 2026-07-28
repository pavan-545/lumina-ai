# Lumina AI – Universal Intelligent Study Platform & Agent

> Learn Smarter. Revise Faster. Master Anything.

Lumina AI is a production-grade, premium multi-subject educational workspace designed to transform raw study notes, lecture transcripts, or textbook outline materials into structured, personalized study vaults.

Coordinated by a central **AI Orchestrator**, the system automatically detects notes subjects, designs customized step-by-step study plans, and populates interactive modules (Flashcards, Adaptive Quizzes, Conceptual Graphs, AI Mentoring, and Career roadmaps) dynamically tailored to the student's active learning goals.

---

## 🛠️ Architecture & Services

Lumina AI acts as an integrated **AI learning agent** rather than a disconnected bundle of generators. All requests propagate through a client-side orchestrator that merges state and checks local cache repositories.

```
       [ Client-Side Application Layout ]
                       │
                       ▼
       [ Central AI Orchestrator Service ] ◄──► [ Local Storage Cache & Memory ]
                       │
                       ▼
             [ POST /api/generate ] (Router)
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
  [AnalysisService] [StudyService] [ChallengeService] ... [Mentor / Career Services]
         │             │             │
         └─────────────┼─────────────┘
                       ▼
               [ Gemini 1.5 API ]
```

### 1. Central AI Orchestrator (`src/services/aiOrchestrator.js`)
The orchestrator unifies all outgoing AI transactions:
- **Shared Context Provider**: Attaches user history, goal styles, active levels, and recent mistakes to every request.
- **Request Queue Manager**: Sequences outgoing fetches to prevent concurrent task overlapping and browser throttle.
- **Local Response Cache**: Hashes note contents with parameters and stores results in `localStorage`, eliminating redundant LLM queries.
- **Offline Resilience**: Automatically falls back to cached materials if the network fails.
- **Error Recovery Engine**: Invokes JSON text repair algorithms, conducts Zod checks, and triggers retries on format discrepancies.
- **Event System**: Dispatches event signals (`LEVEL_UP`, `CHALLENGE_COMPLETED`, etc.) to keep independent UI views decoupled.

### 2. Modular Backend Services (`api/services/`)
We have refactored the API routing to ensure single-responsibility files:
- **Analysis Service**: Subject-agnostic subject detection, prerequisites mapping, and step-by-step timeline strategy building.
- **Study Service**: Coordinates Summaries, Syllabus Checklists, Cheat Sheets, React Flow Graphs, and dynamic dynamic subject assets (e.g. debugging for programming, timeline chains for history).
- **Quiz Service**: Builds balanced, difficulty-tiered question arrays for adaptive quizzing.
- **Challenge Service**: Designs Level 1 to 5 interactive progression challenges (Beginner to Boss scenario).
- **Mentor Service**: Acts as a visual analogy and conceptual coach reviewing mistakes notebook stats.
- **Career Service**: Tracks skill coverage lists and outputs employment roadmaps.

---

## 🧠 Core Features Checklist

- [x] **Dynamic Subject Analysis**: Extracts prerequisites, topics, confidence ratings, and objectives from any subject text.
- [x] **Smart Goal Selection**: Tailors study length and difficulty based on user target (e.g., Quick Revision, Exam Prep, Interview Prep).
- [x] **Arena Progression (Levels 1–5)**: Locked levels that test practical open-ended scenario answers instead of simple multiple choices.
- [x] **Interactive AI Tutor (Mentor)**: Feeds mistakes history to the tutor for analogies, ELI5 simplified summaries, and diagnostic tests.
- [x] **Career Gap Analyzer**: Maps study notes to careers, highlighting skills covered vs. missing and next-step roadmaps.
- [x] **Chronological Learning Timeline**: Records a beautiful history feed of achievements, completions, and streak logs.
- [x] **Developer Debug Console**: Setting panel checkbox enabling real-time review of prompts, raw output text, and repair logs.
- [x] **Feature Flags**: Global toggling for modular page deployment (`src/config/features.js`).

---

## 📂 Folder Structure

```
├── api/
│   ├── generate.js                # Express API Route Handler (Router)
│   ├── services/                  # Modular Service Engines
│   │   ├── analysisService.js     # Subjects & strategy analysis
│   │   ├── careerService.js       # Career roadmapping
│   │   ├── challengeService.js    # Progression challenge generator
│   │   ├── flashcardService.js    # Flashcard compilations
│   │   ├── mentorService.js       # Tutoring & analogy builders
│   │   ├── quizService.js         # Adaptive study quizzes
│   │   ├── recommendationService.js # Optimal path calculator
│   │   └── studyService.js        # Dynamic resource worksheets
│   ├── prompts/                   # LLM Prompt Templates
│   └── utils/                     # Backend API Helpers (JSON repairs, Gemini client)
└── src/
    ├── config/
    │   └── features.js            # Global Feature Flags config
    ├── services/
    │   └── aiOrchestrator.js      # Central Client-Side AI Manager
    ├── schemas/
    │   └── index.js               # Zod Schema Validator Models
    ├── features/                  # Feature Modules
    │   ├── landing/               # Premium Intro Landing page
    │   ├── dashboard/             # Main Hub, Journey feed, streak, and daily challenges
    │   ├── challenge-arena/       # Level 1-5 progression gameplay
    │   ├── mentor/                # Tutoring chat analogies
    │   ├── career/                # Jobs readiness and skill gaps
    │   ├── subject-analysis/      # Subject profiling card
    │   └── study/                 # Guide worksheets
    └── App.jsx                    # Unified React Entrypoint & Event Broker
```

---

## 🚀 Installation & Local Execution

### 1. Environment Settings
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 2. Install Packages
```bash
npm install
```

### 3. Run Servers
Spin up the local Express backend proxy server (on port `3000` to route keys securely):
```bash
node server.js
```

In a separate terminal, launch the Vite React dev frontend server:
```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.
