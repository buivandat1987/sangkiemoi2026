
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType
} from "docx";
import FileSaver from "file-saver";
import { ReportData } from "../types";

const TIMES_NEW_ROMAN = "Times New Roman";
const FONT_SIZE_NORMAL = 28; // 14pt
const FONT_SIZE_SMALL = 26;  // 13pt
const LINE_SPACING = 360;    // 1.5 lines

const MARGIN_TOP = 1134;    // 20mm
const MARGIN_BOTTOM = 1134; // 20mm
const MARGIN_LEFT = 1701;   // 30mm
const MARGIN_RIGHT = 850;   // 15mm

export const exportToWord = async (data: ReportData) => {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: TIMES_NEW_ROMAN, size: FONT_SIZE_NORMAL },
          paragraph: {
            spacing: { line: LINE_SPACING, lineRule: "auto" as any, before: 120, after: 120 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT },
          },
        },
        children: [
          // HEADER TABLE (Agency and National Motto)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.unit || "TÊN ĐƠN VỊ", bold: true, size: FONT_SIZE_SMALL })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "⎯⎯⎯⎯⎯⎯⎯⎯⎯", size: FONT_SIZE_SMALL })] }),
                    ]
                  }),
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: FONT_SIZE_SMALL })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: FONT_SIZE_NORMAL })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", size: FONT_SIZE_NORMAL })] }),
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 400 } }),

          // IDENTIFYING INFO
          new Paragraph({
            children: [
              new TextRun({ text: "Tên sáng kiến: ", bold: true }),
              new TextRun({ text: data.title.toUpperCase(), bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Họ và tên người thực hiện: ", bold: true }),
              new TextRun({ text: data.author }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Đơn vị công tác: ", bold: true }),
              new TextRun({ text: data.unit }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Cá nhân tổ chức phối hợp: ", bold: true }),
              new TextRun({ text: data.collaborators || "Không" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Thời gian triển khai thực hiện: ", bold: true }),
              new TextRun({ text: `Từ ngày ${data.startDate || "..."} đến ngày ${data.endDate || "..."}` }),
            ],
          }),

          new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BÁO CÁO SÁNG KIẾN", bold: true, size: 36 })] }),

          // SECTION I: ĐẶT VẤN ĐỀ
          new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: "I. ĐẶT VẤN ĐỀ", bold: true })] }),
          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "1. Tên sáng kiến hoặc giải pháp: ", bold: true }), new TextRun({ text: data.problemStatement.initiativeName || data.title })] }),
          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "2. Sự cần thiết, mục đích của việc thực hiện sáng kiến:", bold: true })] }),
          ...data.problemStatement.necessity.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 720, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          // SECTION II: NỘI DUNG SÁNG KIẾN
          new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "II. NỘI DUNG SÁNG KIẾN HOẶC GIẢI PHÁP", bold: true })] }),
          
          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "1. Thực trạng tại đơn vị:", bold: true })] }),
          new Paragraph({ indent: { left: 1080 }, children: [new TextRun({ text: "a. Thuận lợi:", italics: true, bold: true })] }),
          ...data.content.status.advantages.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 1080, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),
          new Paragraph({ indent: { left: 1080 }, children: [new TextRun({ text: "b. Khó khăn:", italics: true, bold: true })] }),
          ...data.content.status.disadvantages.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 1080, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "2. Nguyên nhân và hạn chế:", bold: true })] }),
          ...data.content.causes.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 720, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "3. Các biện pháp thực hiện:", bold: true })] }),
          ...data.content.solutions.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 720, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          // SECTION III: ĐÁNH GIÁ
          new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "III. ĐÁNH GIÁ VỀ TÍNH MỚI, TÍNH HIỆU QUẢ VÀ KHẢ THI, PHẠM VI ÁP DỤNG", bold: true })] }),
          
          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "1. Tính mới:", bold: true })] }),
          ...data.evaluation.novelty.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 720, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "2. Tính hiệu quả và khả thi:", bold: true })] }),
          ...data.evaluation.efficiency.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 720, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: "3. Phạm vi áp dụng:", bold: true })] }),
          ...data.evaluation.scope.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 720, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          // SECTION IV: KẾT LUẬN
          new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "IV. KẾT LUẬN", bold: true })] }),
          ...data.conclusion.split('\n').filter(l => l.trim()).map(line => new Paragraph({ 
            indent: { left: 720, firstLine: 432 }, 
            alignment: AlignmentType.JUSTIFIED, 
            children: [new TextRun({ text: line })] 
          })),

          // SIGNATURE SECTION
          new Paragraph({ spacing: { before: 1000 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "XÁC NHẬN CỦA ĐƠN VỊ", bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TRỰC TIẾP", bold: true })] }),
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NGƯỜI BÁO CÁO", bold: true })] }),
                      new Paragraph({ spacing: { before: 1200 } }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.author, bold: true })] }),
                    ]
                  })
                ]
              })
            ]
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `SKKN_${data.author.replace(/\s/g, '_') || 'Bao_Cao'}.docx`;
  
  try {
    if (FileSaver && typeof FileSaver.saveAs === 'function') {
      FileSaver.saveAs(blob, fileName);
    } else {
      throw new Error("FileSaver is not available");
    }
  } catch (error) {
    console.warn("Falling back to standard download link...");
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};
