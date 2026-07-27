import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Local revision guide fallback endpoint
  app.get("/api/revision-guide", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), "public", "revision_guide.md");
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        res.type("text/plain").send(content);
      } else {
        res.status(404).send("Revision guide file not found");
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API 2: Dynamic GitHub raw fetch proxy to allow fetching revision guides directly from GitHub
  app.get("/api/fetch-github-guide", async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    try {
      let targetUrl = rawUrl;
      if (targetUrl.includes("github.com") && !targetUrl.includes("raw.githubusercontent.com")) {
        targetUrl = targetUrl
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/");
      }

      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch from GitHub: ${response.statusText}` });
      }

      const text = await response.text();
      res.type("text/plain").send(text);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch remote markdown" });
    }
  });

  // API 3: AI Exam Quiz Question Generator using Gemini API
  app.post("/api/ai/quiz-generate", async (req, res) => {
    const { word, meaning, category, optionsPool } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Word parameter is required" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an SSC CGL / Competitive Exam Vocabulary Quiz Master.
Generate a high-yield multiple-choice quiz question for the vocabulary word "${word}" (Meaning: "${meaning || ''}", Category: "${category || 'General'}").

Return ONLY valid JSON matching this exact structure:
{
  "question": "Clear exam-style question stem asking for synonym, antonym, or correct usage of ${word}",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string from options that is correct",
  "explanation": "Brief 2-sentence explanation of why the correct answer is right and why distractors are wrong",
  "hint": "Useful clue highlighting subtle context or word root"
}

Make sure 1 option is clearly correct and 3 are plausible distractors. Respond ONLY with raw JSON, no markdown formatting or backticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Quiz API error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI Quiz question" });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Atlas Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Atlas server:", err);
});
