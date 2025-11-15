import express from "express";
import axios from "axios";

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.json({ status: "Backend working!" });
});

// OpenRouter chat route
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const apiKey = process.env.OPENROUTER_API_KEY;
  const referer = process.env.APP_REFERER || "http://localhost:8080";
  const title = process.env.APP_TITLE || "Athena LMS Chatbot";
  const model = process.env.OPENROUTER_MODEL || "tngtech/deepseek-r1t2-chimera:free";

  if (!apiKey) {
    return res.json({
      choices: [
        { message: { role: "assistant", content: "Hello! How can I help you today?" } },
      ],
    });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": referer,
          "X-Title": title,
        },
        timeout: 20000,
      }
    );

    res.json(response.data);
  } catch (err) {
    const status = err?.response?.status || 500;
    if (status === 401) {
      return res.json({
        choices: [
          { message: { role: "assistant", content: "Hello! How can I help you today?" } },
        ],
      });
    }
    console.error("OpenRouter error:", err?.response?.data || err);
    res.status(500).json({ error: "OpenRouter request failed" });
  }
});

export default router;
