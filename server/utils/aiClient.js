const OpenAI = require("openai");

function getClient(key) {
  let baseURL = "https://generativelanguage.googleapis.com/v1beta/openai";
  
  if (key && key.startsWith("gsk_")) {
    baseURL = "https://api.groq.com/openai/v1";
  } else if (key && key.startsWith("grok-")) {
    baseURL = "https://api.x.ai/v1";
  }

  return new OpenAI({
    apiKey: key,
    baseURL: baseURL,
  });
}

function getModel() {
  const key = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  if (key && key.startsWith("gsk_")) return "llama-3.3-70b-versatile";
  if (key && key.startsWith("grok-")) return "grok-beta";
  return "gemini-1.5-flash";
}

function checkApiKey(key) {
  if (!key || key.includes("your_gemini_api_key") || key.includes("your_groq_api_key")) {
    throw new Error("Missing API Key in .env file. Please add GEMINI_API_KEY or GROQ_API_KEY.");
  }
}

async function generateQuestion(resumeText, role, previousQA, questionNumber, totalQuestions) {
  try {
    const key = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    checkApiKey(key);

    const client = getClient(key);
    const model = getModel();

    const qaHistory = previousQA
      .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
      .join("\n\n");

    const prompt = `You are a professional interviewer conducting a mock interview for the role of "${role}".

Here is the candidate's resume:
---
${resumeText}
---

${qaHistory ? `Previous questions and answers:\n${qaHistory}\n\n` : ""}

Generate question ${questionNumber} of ${totalQuestions} for this interview. The questions should:
- Be relevant to the job role and the candidate's resume
- Progress from general to specific/technical
- Cover different aspects (experience, skills, scenarios, problem-solving)
- Be professional and concise

Respond with ONLY the interview question, nothing else.`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("LLM API Error (Generate Question):", error.name, error.message);
    if (error.response) {
      console.error("Status:", error.response.status, "Data:", JSON.stringify(error.response.data));
    }
    throw error;
  }
}

async function evaluateInterview(resumeText, role, allQA) {
  try {
    const key = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    checkApiKey(key);

    const client = getClient(key);
    const model = getModel();

    const qaFormatted = allQA
      .map((qa, i) => `Question ${i + 1}: ${qa.question}\nAnswer ${i + 1}: ${qa.answer}`)
      .join("\n\n");

    const prompt = `You are an expert interview evaluator. Analyze this mock interview for the role of "${role}".

Candidate's Resume:
---
${resumeText}
---

Interview Q&A:
---
${qaFormatted}
---

Evaluate the candidate and respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <number 1-10>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "perQuestion": [
    {
      "question": "<the question>",
      "answer": "<the candidate's answer>",
      "score": <number 1-10>,
      "feedback": "<specific feedback for this answer>",
      "marksLostReason": "<why marks were lost, be specific>"
    }
  ],
  "overallFeedback": "<2-3 sentence overall assessment>",
  "roleInsights": "<specific insights about what this role demands and how the candidate can improve>"
}

Ensure the output is valid JSON. Do not include any text before or after the JSON.`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content.trim();

    try {
      // Direct parse
      return JSON.parse(content);
    } catch (parseError) {
      console.warn("JSON direct parse failed, trying regex extraction...");
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         try {
            return JSON.parse(jsonMatch[0].replace(/,\s*([\]\}])/g, '$1')); // Basic trailing comma fix
         } catch (regexParseError) {
            console.error("Regex JSON extraction failed:", regexParseError.message);
            throw new Error("Failed to parse evaluation results from AI. The response was not in a valid JSON format.");
         }
      }
      throw new Error("AI response did not contain a valid JSON object.");
    }
  } catch (error) {
    console.error("LLM API Error (Evaluate):", error.name, error.message);
    if (error.response) {
      console.error("Status:", error.response.status, "Data:", JSON.stringify(error.response.data));
    }
    throw error;
  }
}

module.exports = { generateQuestion, evaluateInterview };
