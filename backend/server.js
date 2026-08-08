import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createRateLimiter } from "./middleware/rateLimit.js";
import summaryRouter from "./routes/summary.js";

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);

app.use(express.json({ limit: "200kb" }));
app.use("/api", createRateLimiter());
app.use("/api", summaryRouter);

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Request body must contain valid JSON.",
    });
  }

  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({
      success: false,
      message: "This origin is not allowed to use the API.",
    });
  }

  console.error("Unhandled server error:", error.message);
  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
