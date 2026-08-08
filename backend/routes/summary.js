import express from "express";

import { summarize } from "../services/gemini.js";

const router = express.Router();

router.post("/summarize", async (req, res) => {
  try {
    const text = req.body?.text?.trim();

    console.log("Received summarize request");
    console.log("Text length:", text?.length ?? 0);

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required to generate a summary.",
      });
    }

    const result = await summarize(text);

    res.json({
      success: true,

      result,
    });
  } catch (error) {
    console.error("Summary request failed:", error.message);

    res.status(500).json({
      success: false,

      message: error.message || "Unable to generate a summary.",
    });
  }
});

export default router;
