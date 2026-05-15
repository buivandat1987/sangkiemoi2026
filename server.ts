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
app.post("/api/ai/generate-initiative", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `
Bạn là một trợ lý chuyên gia viết Sáng kiến kinh nghiệm trong giáo dục tại Việt Nam. 
Nhiệm vụ của bạn là viết một bài báo cáo sáng kiến kinh nghiệm chi tiết dựa trên chủ đề hoặc yêu cầu của người dùng.
Bài báo cáo PHẢI tuân thủ chính xác cấu trúc sau:

I. ĐẶT VẤN ĐỀ
1. Tên sáng kiến hoặc giải pháp: [Tên sáng kiến]
2. Sự cần thiết, mục đích của việc thực hiện sáng kiến: [Tại sao cần sáng kiến này? Mục đích đạt được là gì?]

II. NỘI DUNG SÁNG KIẾN HOẶC GIẢI PHÁP
1. Thực trạng tại đơn vị:
a. Thuận lợi: [Nêu ít nhất 3 điểm thuận lợi]
b. Khó khăn: [Nêu ít nhất 3 điểm khó khăn]
2. Nguyên nhân và hạn chế: [Tại sao lại có những khó khăn trên?]
3. Các biện pháp thực hiện: [Trình bày chi tiết các bước, các phương pháp đã triển khai. Đây là phần quan trọng nhất, hãy viết cụ thể và có tính ứng dụng cao.]

III. ĐÁNH GIÁ VỀ TÍNH MỚI, TÍNH HIỆU QUẢ VÀ KHẢ THI, PHẠM VI ÁP DỤNG
1. Tính mới: [Sáng kiến này có gì khác biệt so với cách làm cũ?]
2. Tính hiệu quả và khả thi: [Kết quả đạt được thực tế như thế nào? Có dễ dàng áp dụng không?]
3. Phạm vi áp dụng: [Có thể áp dụng ở quy mô nào? Tổ, trường, hay liên trường?]

IV. KẾT LUẬN
[Tóm tắt lại giá trị của sáng kiến và bài học kinh nghiệm.]

Yêu cầu:
- Ngôn ngữ: Tiếng Việt, trang trọng, chuyên nghiệp trong lĩnh vực giáo dục.
- Nội dung: Khoa học, cụ thể, dễ hiểu.
- Không sử dụng các ký tự Markdown đặc biệt như ** hay #. Hãy trình bày theo kiểu văn bản báo cáo truyền thống.
`,
    });

    const result = await model.generateContent(`Chủ đề sáng kiến: ${topic}\n\nHãy viết báo cáo sáng kiến kinh nghiệm theo mẫu đã quy định.`);
    const text = result.response.text();
    
    res.json({ text });
  } catch (error: any) {
    console.error("Error generating initiative:", error);
    res.status(500).json({ error: error.message || "Failed to generate initiative" });
  }
});

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
