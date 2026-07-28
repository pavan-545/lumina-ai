# Lumina AI – Study Assistant

Lumina AI is an AI-powered study assistant built with **React**, **Node.js**, and the **Google Gemini API**. It transforms free-form study notes or topics into structured learning materials such as flashcards and quizzes, providing an interactive learning experience instead of a traditional chatbot.

This project was developed as part of a Frontend Internship Assignment with a focus on converting AI-generated structured data into reliable, interactive UI components while gracefully handling AI failures.

---

# Features

* Generate AI-powered flashcards from any study topic or notes
* Interactive flashcards with flip animations
* AI-generated quizzes
* Retry incorrectly answered questions
* Loading, error, and empty states
* Responsive design for desktop and mobile
* Backend API to securely communicate with Gemini
* JSON parsing and validation for AI responses
* Protection against malformed or incomplete AI output

---

# Tech Stack

## Frontend

* React
* Vite
* React Hooks
* Tailwind CSS

## Backend

* Node.js
* Express.js

## AI

* Google Gemini API

---

# Project Structure

```text
lumina-ai/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

# Setup

## Clone the repository

```bash
git clone https://github.com/pavan-545/lumina-ai.git
cd lumina-ai
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=5000
```

Start the backend:

```bash
npm run dev
```

---

## Frontend Setup

Open another terminal.

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

# Usage

1. Start both the backend and frontend servers.
2. Open the application in your browser.
3. Enter study notes or a topic into the input field.
4. Click **Generate**.
5. Review the generated flashcards or quiz.
6. Flip flashcards to reveal answers.
7. Complete the quiz and retry incorrectly answered questions.

---

# AI Integration

The frontend sends the user's prompt to the backend.

The backend securely calls the Google Gemini API.

Gemini returns structured JSON, which is validated before being sent back to the frontend.

The frontend parses the structured response and renders interactive UI components instead of displaying raw AI text.

---

# Handling AI Failures

The application is designed to handle unreliable AI responses gracefully.

It includes:

* Loading indicators while waiting for responses
* Error messages when requests fail
* Retry functionality
* Validation of AI-generated JSON
* Handling of malformed or incomplete responses
* Empty-state UI when no data is returned
* Prevention of stale responses from replacing newer requests

---

# Responsive Design

The application is optimized for:

* Desktop
* Tablet
* Mobile devices

---

# AI Usage Note

AI tools were used to assist with brainstorming, debugging, UI improvements, and code suggestions during development.

All application architecture, implementation decisions, debugging, testing, and integration were reviewed and completed manually to ensure full understanding of the codebase.

---

# Known Limitations

* Very large prompts may increase response time.
* AI-generated content depends on the Gemini model and may occasionally require regeneration.
* Internet connectivity is required for AI generation.
* User sessions are not permanently stored.

---

# Time Spent

Approximately **8 hours**, including planning, development, testing, debugging, and documentation.

---

# Demo

Screen Recording:

> *(Add your Google Drive or YouTube (Unlisted) link here before submission.)*

---

# Future Improvements

* Save and reload study sessions
* Streaming AI responses
* Dark mode improvements
* Keyboard navigation
* Additional study formats such as summaries and mind maps

---

# Submission Checklist

* ✅ React frontend using functional components and hooks
* ✅ Free-form text input
* ✅ Google Gemini API integration
* ✅ Structured JSON parsing
* ✅ Interactive UI (not a chatbot)
* ✅ Loading, error, and empty states
* ✅ Robust handling of malformed AI output
* ✅ Mobile responsive
* ✅ Backend-secured API key
* ✅ README with setup, usage, AI usage note, known limitations, and time spent

---

## Author

**Pavan Chandaka**

GitHub: https://github.com/pavan-545
