import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import summaryRouter from "./routes/summary.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", summaryRouter);

app.listen(3000, () => {
  console.log("Server running");
});
