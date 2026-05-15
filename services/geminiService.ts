
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Tạo nội dung cho một phần đơn lẻ của báo cáo với độ chi tiết cực cao
 */
export const generateSectionContent = async (sectionName: string, context: string) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Bạn là một chuyên gia giáo dục bậc cao tại Việt Nam, nổi tiếng với các bản Sáng kiến kinh nghiệm (SKKN) đạt giải đặc biệt.
    Hãy viết nội dung cho phần "${sectionName}" của đề tài: "${context}".
    
    MỤC TIÊU: Nội dung phải cực kỳ dài, chi tiết, mang tính học thuật cao nhưng vẫn thực tế. 
    Yêu cầu:
    1. Lập luận đa chiều: Phân tích từ góc độ tâm lý học đường, lý luận dạy học và thực tiễn giáo dục hiện đại.
    2. Chi tiết hóa: Nếu là giải pháp, phải có ít nhất 5-7 bước thực hiện, mỗi bước mô tả tỉ mỉ hành động của giáo viên và phản ứng của học sinh.
    3. Minh chứng: Đưa ra các ví dụ cụ thể, các tình huống giả định xảy ra trong lớp học và cách xử lý sáng tạo.
    4. Văn phong: Chuẩn mực, trang trọng, sử dụng thuật ngữ chuyên môn giáo dục.
    
    Hãy viết thật dài, đảm bảo nội dung sâu sắc và thuyết phục tuyệt đối.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Không thể tạo nội dung, vui lòng thử lại.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Lỗi kết nối AI. Vui lòng thử lại.";
  }
};

/**
 * Lập kế hoạch và soạn thảo toàn bộ báo cáo dung lượng lớn (mục tiêu 12 trang A4)
 */
export const generateFullReportAI = async (title: string) => {
  const model = 'gemini-3.1-pro-preview';
  
  const prompt = `Bạn là một tác giả SKKN chuyên nghiệp cấp Quốc gia. Hãy soạn thảo báo cáo chi tiết cho đề tài: "${title}".
  
  QUY ĐỊNH VỀ DUNG LƯỢNG: Bản báo cáo này cần đạt độ dài tương đương 12 trang A4 (khoảng 6000-8000 từ). 
  
  YÊU CẦU NỘI DUNG TỪNG PHẦN:
  1. PHẦN I (ĐẶT VẤN ĐỀ): Phân tích tầm quan trọng của giáo dục trong kỷ nguyên mới, sự cần thiết của đề tài đối với đổi mới phương pháp dạy học.
  2. PHẦN II (NỘI DUNG):
     - Thực trạng: Phân tích cực sâu tình hình thực tế, bảng số liệu khảo sát giả định (trước khi áp dụng), tâm lý học sinh, khó khăn về cơ sở vật chất và con người.
     - Biện pháp (Trọng tâm): Mô tả ít nhất 5 biện pháp chiến lược. Mỗi biện pháp phải có: Cơ sở lý luận, Mục đích, Cách thức tiến hành (chi tiết từng tuần/tháng), Ví dụ minh họa và Kết quả mong đợi.
  3. PHẦN III (ĐÁNH GIÁ - PHẢI PHÂN TÍCH KỸ):
     - Tính mới: Phải làm nổi bật sự khác biệt so với lối mòn cũ. Tại sao đây là bước đột phá?
     - Tính hiệu quả & Khả thi: Chứng minh bằng các con số giả định sau khi áp dụng, sự thay đổi về năng lực và phẩm chất học sinh.
     - Phạm vi áp dụng: Khả năng triển khai rộng rãi cho toàn huyện, tỉnh.
  4. PHẦN IV (KẾT LUẬN): Bài học kinh nghiệm xương máu và những đề xuất mang tầm vĩ mô.

  LƯU Ý: Hãy viết mỗi phần thật dài và đầy đủ nhất có thể để đảm bảo chất lượng chuyên môn xuất sắc.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            necessity: { type: Type.STRING, description: "Phần Đặt vấn đề cực kỳ sâu sắc và dài" },
            advantages: { type: Type.STRING, description: "Thuận lợi thực tế chi tiết" },
            disadvantages: { type: Type.STRING, description: "Khó khăn thách thức được phân tích kỹ" },
            causes: { type: Type.STRING, description: "Nguyên nhân cốt lõi của thực trạng" },
            solutions: { type: Type.STRING, description: "Hệ thống các biện pháp thực hiện đồ sộ và chi tiết" },
            novelty: { type: Type.STRING, description: "Phân tích tính mới đột phá" },
            efficiency: { type: Type.STRING, description: "Đánh giá chi tiết hiệu quả qua số liệu và biểu hiện" },
            scope: { type: Type.STRING, description: "Khả năng nhân rộng và ứng dụng" },
            conclusion: { type: Type.STRING, description: "Kết luận và kiến nghị tâm huyết" }
          },
          required: ["necessity", "advantages", "disadvantages", "causes", "solutions", "novelty", "efficiency", "scope", "conclusion"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Full AI Generation Error:", error);
    throw error;
  }
};
