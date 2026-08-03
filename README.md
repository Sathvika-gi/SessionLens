# 👁️ SessionLens

**SessionLens** is an AI-powered Visual Browser Activity Intelligence platform that transforms fragmented browser events into meaningful, human-readable browsing sessions. Instead of displaying raw browser history, SessionLens uses Google's Gemini AI to understand browsing behavior, generate contextual summaries, and organize activities into an interactive digital journal.

---

## ✨ Features

### 🌐 Chrome Extension
- Monitors browser activity in real time.
- Tracks active tabs, URL changes, and browsing events.
- Captures visual context through screenshots to improve AI understanding.
- Simple Tracking ON/OFF control for complete user control.

### 🤖 AI-Powered Session Analysis
- Uses **Google Gemini** for multimodal (text + image) analysis.
- Converts raw browser events into meaningful browsing sessions.
- Generates:
  - Intelligent session titles
  - Context-aware summaries
  - Relevant tags
  - Activity categories
- Uses screenshots as additional context to improve the accuracy of generated insights.

### 📊 Interactive Dashboard
Built with **Next.js**, **Tailwind CSS**, and **Framer Motion**.

Features include:
- AI-generated session timeline
- Interactive digital journal
- Search across sessions, domains, summaries, and tags
- Session expansion with chronological activity timeline
- AI-powered session reports
- Session and global report export

### ⚙️ Backend API
Built with **Express.js** and **MongoDB**.

Provides:
- Browser event logging
- AI session generation
- Session retrieval APIs
- Swagger documentation
- Health monitoring endpoints

---

# 🏗️ Architecture

```text
Chrome Extension
        │
        ▼
Browser Events + Screenshots
        │
        ▼
Express.js Backend
        │
        ▼
Gemini AI (Multimodal)
        │
        ▼
MongoDB
        │
        ▼
Next.js Dashboard
```

---

# 🛠️ Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Framer Motion

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### AI
- Google Gemini API (Multimodal)

### Browser Extension
- Chrome Extension (Manifest V3)

### Documentation
- Swagger UI

---

# 📁 Project Structure

```text
SessionLens
│
├── extension/     # Chrome Extension
├── backend/       # Express API + Gemini Integration + MongoDB
└── dashboard/     # Next.js Dashboard
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

---

## 1️⃣ Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
npx nodemon server.js
```

Available endpoints:

- Health Check → `http://localhost:5000/health`
- Swagger → `http://localhost:5000/api-docs`

---

## 2️⃣ Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 3️⃣ Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension` folder
5. Enable tracking and start browsing

Browser activity will automatically appear in the dashboard.

---

# 📡 API Overview

### Browser Events

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/events` | Log browser activity |
| GET | `/api/events` | Retrieve browser events |

### Sessions

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/sessions` | Retrieve AI-generated sessions |
| GET | `/api/sessions/:id` | Retrieve session details |

### AI

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/ai/analyze-session` | Generate AI session from browser events |

### Health

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Backend diagnostics |

---

# 📸 Screenshots

Add screenshots of:
- Dashboard
  <img width="1902" height="1031" alt="Screenshot 2026-08-03 210759" src="https://github.com/user-attachments/assets/d951865b-9718-4d40-8a1b-cf431f79c3f5" />

- Chrome Extension
  <img width="742" height="706" alt="Screenshot 2026-08-03 210837" src="https://github.com/user-attachments/assets/8c31dcc9-3a7e-49f5-9974-2cf5c31197aa" />

- Session Timeline
  <img width="1903" height="1037" alt="Screenshot 2026-08-03 210900" src="https://github.com/user-attachments/assets/7cb84445-0081-47c2-94d0-873a7b2bb150" />

- AI Report Export
  <img width="1903" height="1042" alt="image" src="https://github.com/user-attachments/assets/7cbdac61-419f-4bcc-b064-6b3d5042d175" />

- Swagger Documentation
  <img width="1901" height="1043" alt="Screenshot 2026-08-03 211107" src="https://github.com/user-attachments/assets/2ffe9bd4-688b-4b59-a579-be457ceaddbf" />


---

# 🔮 Future Enhancements

- Google Authentication
- Multi-device synchronization
- Chrome Web Store publishing
- Natural language search
- Weekly AI insights
- Cloud deployment
- Advanced Visual AI analytics

---

# 📄 License

This project is created for educational and portfolio purposes.
