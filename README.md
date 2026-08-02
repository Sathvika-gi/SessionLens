# SessionLens 👁️

SessionLens is an AI-powered browser activity memory system that organizes raw, fragmented browsing events into structured, meaningful sessions. It replaces traditional analytics dashboards and productivity trackers with a readable "digital journal" of your online journey.

---

## 🚀 Key Features

* **Chrome Extension**: Light-weight extension that tracks active tabs and URL updates in real-time, streaming logs to the backend.
* **Express Backend**: Hosts the REST API endpoints and stores raw browser events in MongoDB.
* **Gemini AI Service**: Connects to the Google Gemini API (`gemini-3.5-flash`) to dynamically group raw events into cohesive sessions, generating:
  - Human-friendly session titles.
  - Bullet-point summaries of activities.
  - Multi-tag classifications.
  - Core category groupings (e.g. Coding, Learning, Research, Design).
* **Next.js Dashboard**: A premium, modern dark-themed interface inspired by Linear and Arc Browser:
  - **Session Lens**: An interactive, animated SVG donut visualization of today's browsing journey.
  - **Journal Feed**: Expanding cards displaying chronological sessions with step-by-step navigation timelines.
  - **Memory Search**: Full-text filters to search through titles, summaries, tags, domains, and dates.
* **Swagger API UI**: Self-documenting endpoints accessible via a Swagger UI portal.
* **Diagnostics Health Check**: Real-time server, database connectivity, and Gemini key availability checks.

---

## 📂 Project Structure

```text
SessionLens/
 ├── extension/     # Chrome Extension (manifest.json, background.js listeners)
 ├── backend/       # Express.js REST API (Mongoose schemas, Gemini service, Swagger docs)
 └── dashboard/     # Next.js 16 (React, Tailwind CSS, Framer Motion UI)
```

---

## 🛠️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas Cluster)
* [Google AI Studio Gemini API Key](https://aistudio.google.com/)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run the development server (runs with nodemon):
   ```bash
   npm run dev
   ```

* **Health Check**: Visit `http://localhost:5000/health` to confirm database and Gemini connections are healthy.
* **API Documentation**: Open `http://localhost:5000/api-docs` to view the interactive Swagger documentation.

---

### 2. Next.js Dashboard Setup

1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

### 3. Chrome Extension Installation

1. Open your Chrome browser and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** in the top-left corner.
4. Select the `extension/` folder in your SessionLens project path.
5. Pin the extension. Keep the Express backend running, browse websites, and watch the events populate your dashboard!

---

## 🔌 API Endpoints Summary

All routes are fully documented at `http://localhost:5000/api-docs`.

### Browser Events
* `POST /api/events` - Log a new browser activity event.
* `GET /api/events` - Retrieve chronological raw activity logs.

### Sessions
* `GET /api/sessions` - Retrieve list of AI-grouped browser sessions.
* `GET /api/sessions/:id` - Fetch details for a specific session.

### AI Engine
* `POST /api/ai/analyze-session` - Perform Gemini clustering analysis on raw logs and store the resulting session.

### Health
* `GET /health` - Diagnostic connection checks.
