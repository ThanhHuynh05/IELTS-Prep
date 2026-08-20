# 🛠️ IELTS Prep — Full Fix Prompt

> Copy everything inside the code block below and paste it into a new chat.

---

```
You are an expert full-stack developer and UX designer specializing in edtech applications.

## Project Context
I have an IELTS preparation web app with the following structure:
- **Frontend:** React + Vite + TailwindCSS v4, located in `/frontend/src/`
- **Backend:** Node.js + Express + MongoDB (Mongoose), located in `/backend/`
- **Auth:** JWT-less, uses localStorage to store a plain user object (`ielts_user`)
- **AI Grading:** Groq API (`VITE_GROQ_API_KEY`) used in `frontend/src/services/groqApi.js` for Writing and Speaking
- **Storage utility:** `frontend/src/utils/storage.js` — all API calls must go through this file
- **Dark mode:** `.dark` class on `<html>`, uses `dark:` Tailwind variants
- **Key pages:** Dashboard, Reading, Listening, Writing, Speaking, MockTest, Landing, Login, Register, Onboarding, AdminPanel

## Hard Constraints
- Do NOT introduce TypeScript
- Do NOT refactor the auth system or storage.js pattern
- Do NOT touch the Listening audio system (will be replaced separately with real audio files later)
- Maintain TailwindCSS v4 syntax (`@import "tailwindcss"`, not v3 `@tailwind` directives)
- Keep all API calls going through `storage.js`
- Do not add any new npm packages unless explicitly requested below

---

## PHASE 1 — Critical Bug Fixes

### Fix 1 — App.jsx: Broken Onboarding Check
**File:** `frontend/src/App.jsx`
**Problem:** `getSettings()` is an `async` function but is called synchronously in `AppContent`. The check `if (!getSettings())` always receives a `Promise` object (truthy), so the Onboarding screen never appears for brand new users.
**Fix:** Add an `isLoadingSettings` state. In a `useEffect`, `await getSettings()` and only set `hasSettings` to false if the result has no `targetBand` property. Show a blank loading screen while checking.

### Fix 2 — Dashboard: No Loading State
**File:** `frontend/src/pages/Dashboard.jsx`
**Problem:** The Dashboard fetches all data asynchronously but renders immediately with empty dashes (`-`) in the score cards while waiting for the API response.
**Fix:** Add an `isLoading` boolean state. Set it to `true` before the `Promise.all` fetch and `false` after. While `isLoading` is true, render the existing `LoadingSkeleton` component (from `../components/common/LoadingSkeleton`) in place of the score cards and chart. Also add an empty state: when loading is done but all four section arrays are empty, replace the score cards with a friendly message: "No practice sessions yet!" with 4 CTA buttons using `<Link>` to `/reading`, `/listening`, `/writing`, and `/speaking`.

### Fix 3 — Dashboard: Target Band Editor Not Keyboard Accessible
**File:** `frontend/src/pages/Dashboard.jsx`
**Problem:** The editable Target Band value uses a `<div onClick={...}>` which is invisible to keyboard navigation (Tab key skips it).
**Fix:** Replace the `<div onClick>` with a `<button>` element. Add `aria-label="Edit target band score"`. The button should render the current band value and visually show it is editable (pencil icon from lucide-react on hover, cursor-pointer).

### Fix 4 — MockTest: Timer Expiry Assigns Band 0 to AI-graded Sections
**File:** `frontend/src/pages/MockTest.jsx`
**Problem:** `handleExpire` calls `handleSectionSubmit({ estimatedBand: 0, rawScore: 0, maxScore: 40 })` for ALL sections. Writing and Speaking use AI grading and should attempt to grade any text/speech that was submitted. Currently they silently receive Band 0.
**Fix:** In `MockTest.jsx`, track the user's current essay/transcript via a shared ref or state that the child Writing/Speaking component updates via a callback prop (`onContentChange`). When the timer expires for Writing or Speaking, if there is content, attempt to grade it (call the same `handleSubmit` flow in the child). If there is no content at all, only then assign Band 0. Display a non-blocking "Time's up! Submitting your work..." banner while grading.

---

## PHASE 2 — Missing Features

### Feature 1 — Writing Editor: Real-time Word Count
**File:** `frontend/src/components/writing/WritingEditor.jsx`
**Problem:** The writing textarea has no word count. IELTS requires minimum 150 words (Task 1) and 250 words (Task 2). Students are flying blind.
**Fix:** Below the textarea, add a word count display that updates on every `onChange` event. Format: `"Words: X"`. Color logic:
- Task 1: green if ≥150, orange if 100–149, red if <100
- Task 2: green if ≥250, orange if 200–249, red if <200
Also add a minimum word notice: "Minimum X words required for this task" as a static subtext.

### Feature 2 — Writing Task 1: Display the Chart/Graph
**File:** `frontend/src/components/writing/WritingQuestion.jsx` and `frontend/src/pages/Writing.jsx`
**Problem:** Task 1 prompts say "The graph below shows…" but no image or chart is shown. Task 1 is currently unusable.
**Fix:** 
- In the `STANDARD_TEST` object in `Writing.jsx`, add a `task1Image` field with a URL to a placeholder chart image (use a relevant public URL, e.g., a line chart image from Wikipedia Commons or similar).
- Pass `task1Image` to `WritingQuestion`. In `WritingQuestion.jsx`, when `taskType === 'task1'` and an image URL exists, render it above the prompt text using an `<img>` tag with `alt="IELTS Task 1 chart"` and `className="w-full rounded-lg border mb-4"`.
- In the Admin Panel writing form, add a "Task 1 Image URL" text input field and save it as part of the content document.

### Feature 3 — Speaking: Part 2 Preparation Timer
**File:** `frontend/src/pages/Speaking.jsx`
**Problem:** Real IELTS Part 2 gives candidates 60 seconds of silent preparation time before speaking. This is completely absent.
**Fix:** When `taskPart === 'part2'` and the user is in practice mode (not `feedback` view), add a preparation phase before `AudioRecorder` appears:
1. Show a circular SVG countdown timer (60 seconds), a "Preparation Time" heading, and a "Skip Prep Time →" button.
2. Use a `useEffect` + `setInterval` to count down. When it hits 0, automatically transition to the recording phase.
3. Only render `<AudioRecorder>` after preparation is complete (or skipped).
Add a `prepPhase` state: `'prep' | 'recording'`. Start in `'prep'` when `taskPart` becomes `'part2'`. Reset to `'prep'` when the question changes.

### Feature 4 — History / Results Page
**Files (new):** `frontend/src/pages/History.jsx`
**Files (modified):** `frontend/src/App.jsx`, `frontend/src/components/layout/Navbar.jsx`, `frontend/src/utils/storage.js`
**Fix:**
1. Create a new `/history` route in `App.jsx` (inside the `ProtectedRoute` layout).
2. Add a "History" link in `Navbar.jsx` between "Speaking" and "Admin Panel".
3. In `History.jsx`, call `getResults('reading')`, `getResults('listening')`, `getResults('writing')`, `getResults('speaking')` and display them in 4 tabs. Each tab shows a reverse-chronological list of attempts with: date, estimated band score (styled as a coloured badge), and section-specific details (e.g., raw score for Reading/Listening, criteria bands for Writing/Speaking in a collapsible `<details>` element).
4. If a section has no results, show an empty state: "No [Section] attempts yet. Start practicing →" linking to that section.

### Feature 5 — Settings Page
**Files (new):** `frontend/src/pages/Settings.jsx`
**Files (modified):** `frontend/src/App.jsx`, `frontend/src/components/layout/Navbar.jsx`
**Fix:**
1. Create a `/settings` route in `App.jsx` (inside `ProtectedRoute`).
2. Make the **username display** in `Navbar.jsx` a clickable `<Link to="/settings">` instead of plain text.
3. In `Settings.jsx`, show a form with:
   - Target Band Score (dropdown, 5.0–9.0 in 0.5 steps)
   - Official Test Date (date input)
   - A "Save Settings" button that calls `saveSettings()` and shows an inline success message "✓ Settings saved" for 2 seconds.
4. Pre-populate the form by calling `await getSettings()` in a `useEffect`.

### Feature 6 — Mobile Navigation (Hamburger Menu)
**File:** `frontend/src/components/layout/Navbar.jsx`
**Problem:** All nav links use `hidden sm:flex` — on mobile there is no navigation at all. The app is completely unusable on phones.
**Fix:**
1. Add a `menuOpen` boolean state.
2. Add a hamburger button (`Menu` icon from lucide-react) visible only on `sm:hidden` screens, in the right side of the navbar.
3. When `menuOpen` is true, render a full-width dropdown panel directly below the navbar (using `absolute` positioning) with all the same nav links as the desktop version, stacked vertically with generous padding.
4. Close the menu when any link is clicked (use `onClick={() => setMenuOpen(false)}` on each link).
5. Also add a close button (`X` icon) inside the mobile menu.

### Feature 7 — Admin Panel: Edit and Delete Content
**File:** `frontend/src/pages/AdminPanel.jsx`
**Backend files:** `backend/routes/content.js`
**Problem:** Admins can only create content. There is no way to edit a typo or remove outdated passages.
**Fix:**
1. Add a new "Manage Content" tab to the Admin Panel alongside the existing creation tabs.
2. In this tab, fetch and list all existing content items per type (Reading, Listening, Writing, Speaking) from the API.
3. Add a **Delete** button next to each item that calls `DELETE /api/content/:type/:id` and refreshes the list.
4. Add a backend route `DELETE /api/content/:type/:id` in `content.js` that removes the document by ID.
(Edit functionality is out of scope for now — delete is the priority.)

---

## PHASE 3 — Accessibility

### A1 — Add aria-label to All Icon-Only Buttons
**Files:** `frontend/src/components/layout/Navbar.jsx`, `frontend/src/pages/Speaking.jsx`, `frontend/src/pages/Dashboard.jsx`
- Navbar LogOut button: add `aria-label="Log out"`
- Speaking Previous button: add `aria-label="Previous question"`
- Speaking Next button: add `aria-label="Next question"`
- Dashboard Target Band edit button (after Fix 3): add `aria-label="Edit target band score"`

### A2 — Active Navigation Link Highlight
**File:** `frontend/src/components/layout/Navbar.jsx`
**Problem:** No visual or semantic indication of the current page in the navbar.
**Fix:** Import `useLocation` from `react-router-dom`. For each `<Link>`, compare its `to` path with `location.pathname`. If it matches, apply `border-b-2 border-blue-600 text-blue-600 dark:text-blue-400` classes AND add `aria-current="page"`. Otherwise apply the existing default style.

### A3 — Fix Onboarding Form Labels
**File:** `frontend/src/pages/Onboarding.jsx`
**Problem:** The `<label>` for the date input contains an icon but has no `htmlFor` attribute, so it is not programmatically linked to the `<input>`.
**Fix:** Add `htmlFor="testDate"` to the label and `id="testDate"` to the date `<input>`. Similarly add `htmlFor="targetBand"` and `id="targetBand"` to the band select.

### A4 — Tips Modal Accessibility
**File:** `frontend/src/components/common/TipsModal.jsx`
**Fix:** Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="tips-modal-title"` to the modal container. Add `id="tips-modal-title"` to the modal's `<h2>` title. Add an `useEffect` that focuses the modal's close button when it opens. Add `onKeyDown` on the modal overlay to close on `Escape` key.

---

## PHASE 4 — Design & UX Polish

### D1 — Fix Dark Mode in Reading and Listening
**Files:** `frontend/src/pages/Reading.jsx`, `frontend/src/pages/Listening.jsx`, and their child components in `frontend/src/components/reading/` and `frontend/src/components/listening/`
**Problem:** Split-screen containers and inner panels are hardcoded `bg-white` and look broken in dark mode.
**Fix:** Go through every `bg-white` in these files and their direct child components (ReadingPassage, ReadingQuestions, ReadingFeedback, ListeningPlayer, ListeningQuestions, ListeningFeedback). Add the dark mode equivalent: `dark:bg-gray-900`, and for borders: `dark:border-gray-700`. For text: `dark:text-gray-100` where needed.

### D2 — Active Nav Link Highlight (visual)
Already covered in A2 above.

### D3 — Dashboard Empty State (visual)
Already covered in Fix 2 above.

### D4 — Add Google Font (Inter)
**File:** `frontend/index.html`
**Fix:** Add the following inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```
Then in `frontend/src/index.css`, add `font-family: 'Inter', sans-serif;` to the `body` selector.

### D5 — Landing Page: Add App Screenshot Section
**File:** `frontend/src/pages/Landing.jsx`
**Fix:** Between the hero section and the features section, add a "See it in action" section with a screenshot mockup. Use a `<div>` styled as a browser frame (dark top bar with 3 coloured circles, white/gray body) and inside it display a visual representation of the Dashboard UI (can be a styled div with the same card layout as Dashboard, not a real screenshot). This gives the landing page a premium "product showcase" feel.

Also add a 4th feature card to the features grid: **"Full Mock Exam"** with a `Clock` icon, explaining the timed mock test feature.

---

## PHASE 5 — Security Hardening

### S1 — Proxy Groq API Key Through Backend
**Problem:** `VITE_GROQ_API_KEY` is bundled into the frontend JavaScript and visible to anyone in DevTools.
**Fix:**
1. Remove `VITE_GROQ_API_KEY` from the frontend `.env`.
2. Move the key to the **backend** `.env` as `GROQ_API_KEY`.
3. Create a new backend route: `POST /api/grade/writing` and `POST /api/grade/speaking` in a new file `backend/routes/grade.js`. These routes receive the task type, question, and essay/transcript, call the Groq API server-side using `node-fetch` or the built-in `fetch` (Node 18+), and return the grading result.
4. Update `frontend/src/services/groqApi.js` to call `http://localhost:5000/api/grade/writing` and `http://localhost:5000/api/grade/speaking` instead of calling Groq directly. Remove the `Authorization` header from the frontend entirely.
5. Register the new routes in `backend/server.js`: `import gradeRoutes from './routes/grade.js'` and `app.use('/api/grade', gradeRoutes)`.

### S2 — Add Rate Limiting to Auth Routes
**File:** `backend/server.js`, `backend/routes/auth.js`
**Package to add:** `express-rate-limit` (run `npm install express-rate-limit` in `/backend`)
**Fix:** In `auth.js`, import `rateLimit` from `express-rate-limit`. Create a limiter:
```js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' }
});
```
Apply it to the login and register routes: `router.post('/login', authLimiter, ...)` and `router.post('/register', authLimiter, ...)`.

### S3 — Restrict CORS to Frontend Origin
**File:** `backend/server.js`
**Fix:** Replace `app.use(cors())` with:
```js
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```
Add `CLIENT_URL=http://localhost:5173` to the backend `.env`.

---

## Final Notes
- After all changes, verify `npm start` from the root runs both frontend and backend without errors.
- Test the dark mode toggle on all pages after D1 fixes.
- Test the mobile hamburger menu at 375px viewport width.
- The Listening audio system will be replaced separately — do not modify `ListeningPlayer.jsx` or the `listeningTests.js` data file.
```
