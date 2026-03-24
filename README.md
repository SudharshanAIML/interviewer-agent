# Interviewer Agent (Beginner Friendly Setup)

This app runs a mock interview based on your resume and gives feedback at the end.

- **Frontend:** React + Vite (in `client/`)
- **Backend:** Node.js + Express (in `server/`)
- **AI Provider:** Groq API key (required)

---

## 1) What you need before starting

Install these first:

1. **Git**
2. **Node.js (LTS)** from https://nodejs.org

After installation, open Terminal and check:

```bash
git --version
node --version
npm --version
```

---PI

## 2) Clone the project

```bash
git clone <your-repo-url>
cd interviewer-agent
```

> Replace `<your-repo-url>` with your actual GitHub repo URL.

---

## 3) Get your Groq API key

1. Go to https://console.groq.com
2. Sign in / create account
3. Open **API Keys** page
4. Click **Create API Key**
5. Copy the key (it starts with `gsk_...`)

Keep this key private. Do not share it publicly.

---

## 4) Add your API key to backend env file

Open `server/.env` and make sure it looks like this:

```env
GROQ_API_KEY=your_gsk_key_here
PORT=5000
```

Important:
- If `GEMINI_API_KEY` exists in `server/.env`, remove it or leave it empty if you want to use Groq only.
- Never commit real API keys to GitHub.

---

## 4.1) Configure frontend API URL (for separate deployment)

Create `client/.env` for local development:

```env
VITE_DEV_API_PROXY_TARGET=http://localhost:5000
```

Optional: if your frontend and backend are deployed on different domains, set this in your frontend environment:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Behavior:
- If `VITE_API_BASE_URL` is set, frontend requests go directly to that backend URL.
- If `VITE_API_BASE_URL` is not set, frontend uses relative `/api/...` calls (works with Vite proxy in local dev).

---

## 5) Install dependencies

Run these commands from project root:

```bash
cd server
npm install
cd ../client
npm install
```

---

## 6) Run the app locally

You need **2 terminals** open.

### Terminal A (backend)

```bash
cd interviewer-agent/server
npm start
```

You should see something like:

`Interviewer API running on http://localhost:5000`

### Terminal B (frontend)

```bash
cd interviewer-agent/client
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`).

---

## 7) How to use

1. Enter your target job role
2. Upload resume PDF (or paste resume text)
3. Answer interview questions
4. Submit all answers
5. View AI-generated interview feedback/results

---

## 8) Troubleshooting

### "Missing API Key" error
- Check `server/.env` exists
- Confirm `GROQ_API_KEY` is set and starts with `gsk_`
- Restart backend after editing `.env`

### Frontend opens but API fails
- Make sure backend is running on port `5000`
- Confirm frontend is running from `client/` with `npm run dev`
- If frontend/backend are on different domains, set `VITE_API_BASE_URL` in frontend env

### Port already in use
- Change `PORT` in `server/.env` (for example `PORT=5001`)
- If changed, set `VITE_DEV_API_PROXY_TARGET` in `client/.env` (for example `http://localhost:5001`)

---

## 9) Security note

If you accidentally exposed an API key anywhere, revoke it in Groq dashboard and create a new one immediately.
