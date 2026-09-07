# IELTS Prep

**Live Deployment:** [https://ielts-prep-pi-ten.vercel.app/](https://ielts-prep-pi-ten.vercel.app/)

IELTS Prep is a comprehensive web application designed to help students prepare for the IELTS exam. It provides practice modules and AI-powered feedback to help users improve their skills under simulated test conditions.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **AI Integration:** Groq API for automated grading and feedback

## Pages & Features

- **Landing / Home:** The welcoming entry point introducing the platform.
- **Authentication (Login / Register / Forgot Password):** Secure user access and account creation.
- **Onboarding:** Initial setup for new students to get started.
- **Dashboard:** The central hub for students to view their progress and access modules.
- **Reading & Listening:** Practice tests for comprehensive reading and listening skills.
- **Writing:** Practice for Task 1 and Task 2 essays with automated AI grading and feedback.
- **Speaking:** A simulated Speaking test environment with timed preparation and AI-assisted evaluation.
- **Mock Test:** A full-length, simulated IELTS test experience.
- **History:** A record of past test submissions and feedback.
- **Settings:** User preferences and account management.
- **Admin Panel:** A comprehensive dashboard for teachers/administrators to manage curriculum content and test questions.

## Folder Structure

```text
TNhungIelts/
├── backend/                  # Node.js & Express server
│   ├── models/               # Database schemas/models
│   ├── routes/               # API endpoints
│   ├── uploads/              # Directory for user-uploaded files
│   └── server.js             # Main backend application entry point
├── frontend/                 # React & Vite application
│   ├── public/               # Static assets (favicons, SVGs)
│   ├── src/
│   │   ├── assets/           # Internal images/assets
│   │   ├── components/       # Reusable React UI components
│   │   ├── context/          # React Context (e.g., authentication state)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Top-level page components (Writing, AdminPanel, etc.)
│   │   ├── services/         # API integration logic (Groq API, backend calls)
│   │   └── utils/            # Helper functions
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── vite.config.js        # Vite build configuration
├── package.json              # Root project dependencies and scripts
└── vercel.json               # Vercel deployment configuration
```
