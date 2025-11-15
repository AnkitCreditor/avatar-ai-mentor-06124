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
  // Allow a configurable system prompt to steer the assistant (recommended)
  const systemPrompt = process.env.SYSTEM_PROMPT ||
    "You are an educational assistant. Explain concepts concisely and clearly with an example when helpful.";

  // Local fallback when API key is missing: answer simple, common questions from a tiny knowledge base.
  if (!apiKey) {
    const q = (message || "").toLowerCase().trim();
    const localKb = new Map([
      ["what is a cell", "A cell is the basic structural and functional unit of all living organisms. Cells can perform life processes such as metabolism, growth, and reproduction. Examples include animal cells, plant cells (which have cell walls and chloroplasts), and single-celled organisms like bacteria."],
      ["define cell", "A cell is the smallest unit of life that can replicate independently. Cells are often called the building blocks of life."],
      ["hello", "Hello! How can I help you today?"],
    ]);

    for (const [k, v] of localKb.entries()) {
      if (q.includes(k)) return res.json({ assistant: v, raw: { source: "local-kb", matched: k } });
    }

    // If nothing matches, return a helpful hint instead of a generic prompt
    return res.json({ assistant: "I don't have access to the AI service in this environment. Set OPENROUTER_API_KEY to enable dynamic answers, or try a simple question like 'What is a cell?'", raw: { source: "no-api-key" } });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        // include a system prompt to steer the model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Some servers expect the standard 'Referer' header name
          Referer: referer,
          "X-Title": title,
        },
        timeout: 20000,
      }
    );

    // Debug: log provider response shape for troubleshooting (will show in server logs)
    console.debug("OpenRouter raw response:", response.data);

    // Normalize response into a simple assistant text when possible.
    const data = response.data;
    let assistantText = null;

    // Helpers: strip common default greetings that some providers include as an initial message
    const stripDefaultGreeting = (txt) => {
      if (!txt || typeof txt !== "string") return txt;
      const s = txt.trim();
      // common greetings that we want to remove if they are the only/first thing returned
      const greetings = [
        "hello",
        "hi",
        "hey",
        "hello! how can i help you today?",
        "hello! how can i help you?",
        "how can i help you today?",
        "how can i help you?",
        "how may i assist you?",
        "how may i assist you today?",
        "how can i assist you?",
      ];

      // remove greeting if text starts with one of these phrases (case-insensitive)
      for (const g of greetings) {
        const re = new RegExp("^" + g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:[\\.!?]|\\b)", "i");
        if (re.test(s)) {
          // strip the matched greeting from the start
          return s.replace(re, "").trim();
        }
      }
      return s;
    };

    // Common OpenAI-like shape: { choices: [{ message: { role, content } }] }
    if (data?.choices && Array.isArray(data.choices) && data.choices.length) {
      const c = data.choices[0];
      assistantText = c?.message?.content ?? c?.text ?? null;
    }

    // Some OpenRouter/model formats may return `output` arrays or `result.output`
    if (!assistantText && data?.output && Array.isArray(data.output) && data.output.length) {
      const out = data.output[0];
      if (typeof out === "string") assistantText = out;
      else if (out?.content) {
        if (Array.isArray(out.content)) {
          const piece = out.content.find((p) => typeof p?.text === "string") ?? out.content[0];
          assistantText = piece?.text ?? piece?.content ?? JSON.stringify(piece);
        } else if (typeof out.content === "string") assistantText = out.content;
        else assistantText = JSON.stringify(out.content);
      }
    }

    if (!assistantText && data?.result?.output && Array.isArray(data.result.output) && data.result.output.length) {
      const out = data.result.output[0];
      assistantText = out?.content ?? JSON.stringify(out);
    }

    if (!assistantText) assistantText = data?.text ?? data?.response ?? null;

    // Strip common default greetings so the frontend doesn't display a canned "How can I help you" message
    if (assistantText) {
      const cleaned = stripDefaultGreeting(assistantText);
      // If cleaning removed all meaningful content, return an empty assistant field but include raw provider data.
      if (!cleaned) return res.json({ assistant: "", raw: data });
      return res.json({ assistant: cleaned, raw: data });
    }

    // No assistant-like text found: return the raw provider object for inspection
    res.json({ assistant: "", raw: data });
  } catch (err) {
    const status = err?.response?.status || 500;
    if (status === 401) {
      console.error("OpenRouter unauthorized (401):", err?.response?.data || err);
      return res.status(401).json({ error: "OpenRouter unauthorized - check OPENROUTER_API_KEY", raw: err?.response?.data });
    }
    console.error("OpenRouter error:", err?.response?.data || err);
    res.status(500).json({ error: "OpenRouter request failed", raw: err?.response?.data });
  }
});

export default router;
