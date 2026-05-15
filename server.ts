import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/math/generate", async (req, res) => {
  try {
    const { topic, difficulty, grade, count = 5 } = req.body;

    const prompt = `Bạn là một trợ lý giáo viên môn Toán. 
Hãy tạo ${count} câu hỏi trắc nghiệm Toán cho lớp ${grade}, chủ đề: ${topic}, độ khó: ${difficulty}.
Đối với mỗi câu hỏi, hãy cung cấp:
1. Nội dung câu hỏi.
2. 4 lựa chọn (A, B, C, D).
3. Đáp án chính xác.
4. Lời giải chi tiết (giải thích tại sao đáp án đó đúng).

Hãy trả về kết quả dưới định dạng JSON.`;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                },
                required: ["A", "B", "C", "D"],
              },
              correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
              explanation: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer", "explanation"],
          },
        },
      },
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error: any) {
    console.error("Error generating math questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
