import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatbotRouter from "./routes/chatbotroutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Load chatbot routes under /api
app.use("/api", chatbotRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
