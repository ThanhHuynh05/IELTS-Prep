# IELTS Master

IELTS Master is a full-stack application designed to help students prepare for the IELTS exam. It provides comprehensive practice and AI-powered feedback for various IELTS skills, including Writing and Speaking.

## Features

- **Writing Practice:** Practice Task 1 and Task 2 essays with integrated questions.
- **Speaking Practice:** Simulate Speaking test conditions with timed prep and AI feedback.
- **Admin Panel:** A comprehensive dashboard for teachers/administrators to manage tests, questions, and curriculum content.
- **AI Feedback Integration:** Leverages AI (via Groq API) to provide automated grading and constructive feedback based on official IELTS band descriptors.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js (Express/custom backend)
- **AI Integration:** Groq API

## Getting Started

### Prerequisites

- Node.js installed on your machine
- npm (Node Package Manager)

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd TNhungIelts
   ```

2. Install dependencies for the root, frontend, and backend simultaneously:
   ```bash
   npm run install-all
   ```

### Running the Application (Development)

To start both the frontend and backend servers concurrently, run:

```bash
npm start
```

This will run:
- The backend server on its designated port.
- The frontend Vite development server.

### Available Scripts

In the project directory, you can run:

- `npm run install-all`: Installs dependencies for the root folder, backend, and frontend.
- `npm start`: Runs both backend and frontend in development mode concurrently.
- `npm run server`: Starts only the backend server.
- `npm run client`: Starts only the frontend development server.
- `npm run build`: Builds the frontend application for production.
- `npm run vercel-build`: Script used for Vercel deployment to install and build all necessary packages.

## Deployment

This project is configured for easy deployment on platforms like Vercel (see `vercel.json` and the `vercel-build` script).

