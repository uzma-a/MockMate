# MockMate 🎙️🤖
### AI-powered Mock Interview Platform — practice like it's the real thing.



> Most candidates don't fail interviews because they lack knowledge —
> they fail because they've never practiced saying it out loud.

The nervousness before an interview. Not knowing what the interviewer will ask.
Blanking on answers you actually know. MockMate fixes that.

### MockMate simulates a real AI interviewer that asks you real technical questions,
### listens to your spoken answers, gives instant feedback, and scores your performance —
so by the time the real interview comes, you've already been there.

---

## The Problem

- 😰 You don't know what questions to expect
- 🤐 You know the answer in your head but can't articulate it under pressure
- 🔁 You have no way to practice speaking your answers out loud
- 📭 You get no feedback until it's too late

## The Solution

MockMate puts you in a real interview environment — before the real one.
Practice as many times as you want, on any topic, at any time.

MockMate simulates a real-time AI interviewer that asks technical questions, listens to your spoken answers, gives instant feedback, and scores your overall performance.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 Voice Input & Output | Speech-to-text via Whisper, text-to-speech via Pyttsx3 |
| 🤖 AI Interviewer | Dynamic questions & feedback powered by Gemini API |
| 📊 Scoring System | Detailed performance results at the end of each session |
| 📝 Answer Review | Replay and reflect on your answers after the interview |
| 🌐 Full-Stack Architecture | React frontend + Django REST API backend |
| 🎨 Modern UI | Glassmorphism design with smooth animations |

---

## 🛠️ Tech Stack

**Frontend**
- React, Bootstrap

**Backend**
- Django, Django REST Framework

**AI & Libraries**
- OpenAI Whisper (STT)
- Pyttsx3 (TTS)
- Google Gemini API
- google-generativeai

**Languages**
- Python, JavaScript

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- ffmpeg (required by Whisper)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mockmate.git
cd mockmate
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_django_secret_key
DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🖥️ Usage

1. Open the site and click **Get Started**
2. Choose an interview topic (e.g. Python, JavaScript, Django)
3. The AI interviewer will ask you a technical question
4. Record your answer using the microphone button
5. Receive instant AI feedback after each answer
6. Click **End Interview** to get your final score and review

---

## 📁 Project Structure

```
mockmate/
├── backend/
│   ├── api/              # Django app (views, models, urls)
│   ├── mockmate/         # Django project settings
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── Components/   # Shared UI components
│   │   └── Pages/        # Interview, History, About, etc.
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🌍 Deployment

| Service | Purpose |
|---|---|
| [Railway](https://railway.app) | Django backend hosting |
| [Vercel](https://vercel.com) | React frontend hosting |

**Backend env vars for Railway:**
```
GEMINI_API_KEY, SECRET_KEY, DEBUG=False,
VERCEL_FRONTEND_URL, CORS_ALLOWED_ORIGINS
```

**Frontend env var for Vercel:**
```
VITE_API_URL=https://your-railway-backend-url/api
```

---

## ⚠️ Known Limitations

- Whisper transcription may be slow on CPU — GPU recommended for production
- `google-generativeai` package is deprecated; migration to `google-genai` recommended
- Audio recording requires microphone permission in the browser

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ to help you ace your interviews.</p>