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

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "tngtech/deepseek-r1t2-chimera:free", // change model if needed
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("OpenRouter error:", err?.response?.data || err);
    res.status(500).json({ error: "OpenRouter request failed" });
  }
});

export default router;
