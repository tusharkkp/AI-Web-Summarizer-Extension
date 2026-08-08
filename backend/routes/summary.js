import express from "express";

import { summarize } from "../services/gemini.js";

const router = express.Router();
const MAX_TEXT_LENGTH = 40000;

router.post("/summarize", async (req, res) => {
  try {
    const rawText = req.body?.text;

    if (typeof rawText !== "string" || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required to generate a summary.",
      });
    }

    const text = rawText.trim();

    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(413).json({
        success: false,
        message: `Text must be ${MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`,
      });
    }

    console.log("Received summarize request");
    console.log("Text length:", text.length);

    const options = req.body?.options && typeof req.body.options === "object" ? req.body.options : {};
    const result = await summarize(text, options);

    res.json({ success: true, result });
  } catch (error) {
    const status = error.statusCode || 500;
    console.error("Summary request failed:", error.message);
    res.status(status).json({
      success: false,
      message: error.message || "Unable to generate a summary.",
    });
  }
});

export default router;
