const express = require('express');
const multer = require('multer');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { generateQuestion, evaluateInterview } = require('../utils/aiClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// In-memory session store
const sessions = new Map();

const TOTAL_QUESTIONS = 5;

// Upload resume and create session
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const { role, resumeText } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Job role is required' });
    }

    let parsedResume = '';

    if (req.file) {
      parsedResume = await extractTextFromPDF(req.file.buffer);
    } else if (resumeText) {
      parsedResume = resumeText.trim();
    } else {
      return res.status(400).json({ error: 'Resume (PDF or text) is required' });
    }

    if (!parsedResume) {
      return res.status(400).json({ error: 'Could not extract text from resume' });
    }

    const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    sessions.set(sessionId, {
      resumeText: parsedResume,
      role,
      qa: [],
      currentQuestion: null,
      completed: false,
      createdAt: Date.now(),
    });

    // Generate first question
    const firstQuestion = await generateQuestion(parsedResume, role, [], 1, TOTAL_QUESTIONS);

    sessions.get(sessionId).currentQuestion = firstQuestion;

    res.json({
      sessionId,
      question: firstQuestion,
      questionNumber: 1,
      totalQuestions: TOTAL_QUESTIONS,
    });
  } catch (error) {
    console.error('Upload/Process Resume Error:', error.name, error.message);
    const status = error.message.includes('Missing API Key') ? 401 : 500;
    res.status(status).json({ error: error.message || 'Failed to process resume' });
  }
});

// Submit answer and get next question
router.post('/interview', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ error: 'Session ID and answer are required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.completed) {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    // Store the Q&A
    session.qa.push({
      question: session.currentQuestion,
      answer: answer.trim(),
    });

    const questionNumber = session.qa.length + 1;

    // Check if interview is complete
    if (session.qa.length >= TOTAL_QUESTIONS) {
      session.completed = true;
      return res.json({
        completed: true,
        message: 'Interview completed! Generating results...',
      });
    }

    // Generate next question
    const nextQuestion = await generateQuestion(
      session.resumeText,
      session.role,
      session.qa,
      questionNumber,
      TOTAL_QUESTIONS
    );

    session.currentQuestion = nextQuestion;

    res.json({
      completed: false,
      question: nextQuestion,
      questionNumber,
      totalQuestions: TOTAL_QUESTIONS,
    });
  } catch (error) {
    console.error('Interview Process Answer Error:', error.name, error.message);
    res.status(500).json({ error: error.message || 'Failed to process answer' });
  }
});

// Get results
router.post('/results', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.completed) {
      return res.status(400).json({ error: 'Interview not yet completed' });
    }

    const results = await evaluateInterview(session.resumeText, session.role, session.qa);

    res.json({ results });
  } catch (error) {
    console.error('Results Generation Error:', error.name, error.message);
    res.status(500).json({ error: error.message || 'Failed to generate results' });
  }
});

module.exports = router;
