# IELTS Learning Platform — Implementation Plan

> **Project:** IELTS Prep Website with AI-powered Writing & Speaking grader  
> **AI Backend:** Groq API (Llama 3 70B)  
> **Stack:** React + Tailwind CSS + Web Speech API + MediaRecorder API  

---

## Project Structure

```
ielts-app/
├── public/
│   └── audio/                    # Sample listening tracks
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── shared/
│   │   │   ├── Timer.jsx         # Countdown timer for timed sections
│   │   │   ├── BandScore.jsx     # Visual band score display (0–9)
│   │   │   ├── ProgressBar.jsx
│   │   │   └── AudioPlayer.jsx
│   │   ├── listening/
│   │   │   ├── ListeningPlayer.jsx
│   │   │   └── ListeningQuestion.jsx
│   │   ├── reading/
│   │   │   ├── ReadingPassage.jsx
│   │   │   └── ReadingQuestion.jsx
│   │   ├── writing/
│   │   │   ├── WritingPrompt.jsx
│   │   │   ├── WritingEditor.jsx
│   │   │   └── WritingFeedback.jsx
│   │   └── speaking/
│   │       ├── SpeakingPrompt.jsx
│   │       ├── AudioRecorder.jsx
│   │       └── SpeakingFeedback.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Listening.jsx
│   │   ├── Reading.jsx
│   │   ├── Writing.jsx
│   │   ├── Speaking.jsx
│   │   └── MockTest.jsx
│   ├── services/
│   │   ├── groqApi.js            # All Groq API calls
│   │   ├── speechToText.js       # Web Speech API wrapper
│   │   └── storage.js            # localStorage helpers
│   ├── data/
│   │   ├── listeningTests.js     # Sample listening tests
│   │   ├── readingPassages.js    # Sample reading passages
│   │   ├── writingPrompts.js     # Task 1 & Task 2 prompts
│   │   └── speakingPrompts.js    # Part 1, 2, 3 prompts
│   ├── hooks/
│   │   ├── useTimer.js
│   │   ├── useAudioRecorder.js
│   │   └── useProgress.js
│   ├── App.jsx
│   └── main.jsx
├── .env                          # GROQ_API_KEY
└── package.json
```

---

## Phase 1 — Project Setup

**Goal:** Get a working app shell running.

- [ ] `npm create vite@latest ielts-app -- --template react`
- [ ] Install dependencies: `npm install react-router-dom tailwindcss`
- [ ] Set up Tailwind CSS config
- [ ] Create `App.jsx` with React Router routes for all 6 pages
- [ ] Build `Navbar.jsx` and `Layout.jsx` wrapper
- [ ] Add `.env` file with `VITE_GROQ_API_KEY=your_key_here`
- [ ] Create placeholder pages for: Home, Dashboard, Listening, Reading, Writing, Speaking

**Deliverable:** App runs with navigable empty pages.

---

## Phase 2 — Writing Section + AI Grader

**Goal:** Users can write an essay and receive an AI band score with feedback.

### 2.1 — Writing UI
- [ ] `WritingPrompt.jsx` — displays Task 1 (graph/chart description) or Task 2 (essay) prompt
- [ ] `WritingEditor.jsx` — textarea with live word counter (Task 1: min 150 words, Task 2: min 250 words)
- [ ] Word count warning when below minimum
- [ ] Submit button (disabled until minimum word count met)
- [ ] Loading state while AI grades

### 2.2 — Groq API Grading (`groqApi.js`)

```js
// src/services/groqApi.js

export async function gradeWriting(taskType, prompt, essay) {
  const systemPrompt = `You are an expert IELTS examiner. Grade the following ${taskType} response strictly according to official IELTS band descriptors. Return ONLY a JSON object with this exact shape:
{
  "overallBand": 7.0,
  "criteria": {
    "taskAchievement": { "band": 7.0, "feedback": "..." },
    "coherenceCohesion": { "band": 6.5, "feedback": "..." },
    "lexicalResource": { "band": 7.0, "feedback": "..." },
    "grammaticalRange": { "band": 7.5, "feedback": "..." }
  },
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "correctedSentence": "Provide one example corrected sentence from the essay."
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `IELTS Prompt: ${prompt}\n\nStudent Essay:\n${essay}` }
      ]
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

### 2.3 — Writing Feedback UI
- [ ] `WritingFeedback.jsx` — display overall band score as a large visual number
- [ ] Show 4 criteria scores as individual band cards
- [ ] Strengths list (green)
- [ ] Areas to improve list (amber)
- [ ] "Try again" button to reset

**Deliverable:** Full writing grader working end-to-end.

---

## Phase 3 — Speaking Section + AI Grader

**Goal:** Users record their spoken answers and receive AI band scores.

### 3.1 — Audio Recording (`useAudioRecorder.js`)

```js
// src/hooks/useAudioRecorder.js

import { useState, useRef } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const result = Array.from(event.results)
        .map(r => r[0].transcript).join(" ");
      setTranscript(result);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return { isRecording, transcript, startRecording, stopRecording };
}
```

### 3.2 — Groq API Speaking Grader

```js
export async function gradeSpeaking(part, prompt, transcript) {
  const systemPrompt = `You are an expert IELTS speaking examiner. Grade the transcript below for Speaking ${part}. Return ONLY a JSON object:
{
  "overallBand": 6.5,
  "criteria": {
    "fluencyCoherence": { "band": 6.5, "feedback": "..." },
    "lexicalResource": { "band": 6.0, "feedback": "..." },
    "grammaticalRange": { "band": 7.0, "feedback": "..." },
    "pronunciation": { "band": 6.5, "feedback": "..." }
  },
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "betterPhrase": "Suggest one improved phrase from the transcript."
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Speaking Prompt (${part}): ${prompt}\n\nTranscript:\n${transcript}` }
      ]
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

### 3.3 — Speaking UI
- [ ] `SpeakingPrompt.jsx` — show Part 1 / 2 / 3 prompt with part description
- [ ] Part 2: show 1-minute prep timer before recording
- [ ] `AudioRecorder.jsx` — large mic button (red when recording), live transcript display
- [ ] Submit transcript for grading
- [ ] `SpeakingFeedback.jsx` — same layout as writing feedback

**Deliverable:** Full speaking recorder + grader working end-to-end.

---

## Phase 4 — Reading Section

**Goal:** Users read a passage and answer IELTS-style questions with auto-scoring.

### 4.1 — Question Types to Support
- [ ] Multiple Choice (A/B/C/D)
- [ ] True / False / Not Given
- [ ] Yes / No / Not Given
- [ ] Matching Headings
- [ ] Fill in the Blank (short answer)
- [ ] Sentence Completion

### 4.2 — Data Structure (`readingPassages.js`)

```js
export const passages = [
  {
    id: "passage-1",
    title: "The History of the Internet",
    text: "...",  // full passage text
    questions: [
      {
        id: "q1",
        type: "true-false-ng",
        question: "The internet was invented in the 1960s.",
        answer: "TRUE"
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "What was ARPANET primarily used for?",
        options: ["A. Commerce", "B. Military communication", "C. Entertainment", "D. Education"],
        answer: "B"
      }
    ]
  }
];
```

### 4.3 — Reading UI
- [ ] Split-screen: passage on left, questions on right (scrollable independently)
- [ ] Progress indicator (e.g., "Question 5 of 13")
- [ ] Auto-score on submit: show correct/incorrect per question
- [ ] Overall band score estimate based on raw score

**Deliverable:** At least 2 full reading passages with mixed question types.

---

## Phase 5 — Listening Section

**Goal:** Users listen to audio and answer questions.

### 5.1 — Audio Sources
- Use royalty-free IELTS-style recordings, or generate with TTS (e.g., browser `speechSynthesis`)
- Sections: conversation, monologue, academic discussion, academic lecture

### 5.2 — UI Flow
- [ ] `ListeningPlayer.jsx` — HTML5 `<audio>` player, play-once mode (no rewind, to simulate exam)
- [ ] Questions revealed after audio plays (or alongside, configurable)
- [ ] Same question types as Reading
- [ ] Auto-score on submit

---

## Phase 6 — Dashboard & Progress Tracking

**Goal:** Show the user's history and improvement over time.

### 6.1 — Storage (`storage.js`)

```js
// Save a result
export function saveResult(section, data) {
  const key = `ielts_${section}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ ...data, date: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing));
}

// Get results for a section
export function getResults(section) {
  return JSON.parse(localStorage.getItem(`ielts_${section}`) || "[]");
}
```

### 6.2 — Dashboard UI
- [ ] Overall band score average (Writing + Speaking + Reading + Listening)
- [ ] Per-section score history as a line chart (use `recharts`)
- [ ] Weak areas highlighted (lowest-scoring criteria)
- [ ] Study streak counter
- [ ] Recent activity feed (last 5 attempts)

---

## Phase 7 — Mock Test Mode

**Goal:** Simulate a full IELTS exam under timed conditions.

- [ ] `useTimer.js` hook — countdown timer with auto-submit on expiry
- [ ] Listening: 30 min
- [ ] Reading: 60 min
- [ ] Writing: 60 min (Task 1: 20 min, Task 2: 40 min)
- [ ] Speaking: 11–14 min (simulated with 3 parts)
- [ ] Final summary page with all 4 band scores and estimated overall band

---

## Phase 8 — Polish & UX

- [ ] Mobile responsive layout
- [ ] Dark mode toggle
- [ ] Onboarding screen (target band score input, test date countdown)
- [ ] Tips modal for each section ("IELTS Writing Tips", etc.)
- [ ] Loading skeletons while AI grades
- [ ] Error handling if API fails (retry button)

---

## Environment Variables

```env
# .env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ For production, proxy API calls through a backend (Node/Express) to keep the key secret.

---

## Recommended Build Order

```
Phase 1 (Setup) → Phase 2 (Writing) → Phase 3 (Speaking)
→ Phase 4 (Reading) → Phase 5 (Listening)
→ Phase 6 (Dashboard) → Phase 7 (Mock Test) → Phase 8 (Polish)
```

Start with **Writing** first — it's the highest-value feature (AI grading) and has no external dependencies.

---

## Notes

- In standalone dev, use `.env` to store your Groq API key. Make sure not to commit it to GitHub.
- Web Speech API works in Chrome and Edge; Firefox requires a fallback
- For a real product, store results in a database (Firebase / Supabase) instead of localStorage
- Consider adding a "vocabulary builder" section later (save unknown words, flashcard review)
