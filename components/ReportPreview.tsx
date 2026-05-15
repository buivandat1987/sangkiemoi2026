
import React from 'react';
import { ReportData } from '../types';

interface ReportPreviewProps {
  data: ReportData;
}

const Page: React.FC<{ children: React.ReactNode; pageNumber?: number }> = ({ children, pageNumber }) => (
  <div className="relative bg-white shadow-2xl mb-12 mx-auto print:shadow-none print:mb-0 border border-slate-300 print:border-none" 
       style={{ width: '210mm', minHeight: '297mm', padding: '20mm 15mm 20mm 30mm', boxSizing: 'border-box' }}>
    <div className="report-font text-[14pt] leading-[1.5] text-black h-full">
      {children}
    </div>
    {pageNumber && (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12pt] text-slate-500 no-print">
        {pageNumber}
      </div>
    )}
  </div>
);

export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  return (
    <div className="bg-slate-300 p-12 flex flex-col items-center overflow-y-auto h-full custom-scrollbar print:p-0 print:bg-white">
      {/* TRANG 1: THÔNG TIN ĐỊNH DANH VÀ BẮT ĐẦU NỘI DUNG */}
      <Page pageNumber={1}>
        <div className="flex justify-between mb-10">
          <div className="w-[45%] text-center">
            <h4 className="font-bold text-[13pt] uppercase mb-1">{data.unit || "TÊN ĐƠN VỊ"}</h4>
            <div className="w-24 h-[0.5pt] bg-black mx-auto"></div>
          </div>
          <div className="w-[55%] text-center">
            <h4 className="font-bold text-[13pt] uppercase leading-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
            <h5 className="font-bold text-[14pt]">Độc lập - Tự do - Hạnh phúc</h5>
            <div className="w-32 h-[0.5pt] bg-black mx-auto mt-1"></div>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex">
            <span className="font-bold whitespace-nowrap">Tên sáng kiến:</span>
            <span className="ml-2 uppercase font-bold">{data.title || "................................................"}</span>
          </div>
          <div className="flex">
            <span className="font-bold whitespace-nowrap">Họ và tên người thực hiện:</span>
            <span className="ml-2">{data.author || "................................................"}</span>
          </div>
          <div className="flex">
            <span className="font-bold whitespace-nowrap">Đơn vị công tác:</span>
            <span className="ml-2">{data.unit || "................................................"}</span>
          </div>
          <div className="flex">
            <span className="font-bold whitespace-nowrap">Cá nhân tổ chức phối hợp:</span>
            <span className="ml-2">{data.collaborators || "Không"}</span>
          </div>
          <div className="flex">
            <span className="font-bold whitespace-nowrap">Thời gian đã được triển khai thực hiện:</span>
            <span className="ml-2">Từ ngày {data.startDate || "..."} đến ngày {data.endDate || "..."}</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="font-bold uppercase text-[16pt]">BÁO CÁO SÁNG KIẾN</h3>
        </div>

        <div className="space-y-6 text-justify">
          <div>
            <h3 className="font-bold uppercase mb-2">I. ĐẶT VẤN ĐỀ</h3>
            <p className="mb-2"><span className="font-bold">1. Tên sáng kiến hoặc giải pháp:</span> {data.problemStatement.initiativeName || data.title}</p>
            <p className="font-bold">2. Sự cần thiết, mục đích của việc thực hiện sáng kiến:</p>
            <div className="whitespace-pre-wrap mt-2 indent-8 text-justify">{data.problemStatement.necessity}</div>
          </div>
        </div>
      </Page>

      {/* TRANG 2: NỘI DUNG TIẾP THEO */}
      <Page pageNumber={2}>
        <div className="space-y-6 text-justify">
          <h3 className="font-bold uppercase mb-2">II. NỘI DUNG SÁNG KIẾN HOẶC GIẢI PHÁP</h3>
          <div>
            <p className="font-bold">1. Thực trạng tại đơn vị:</p>
            <div className="pl-4">
              <p className="italic font-bold">a. Thuận lợi:</p>
              <div className="whitespace-pre-wrap mb-4 indent-8">{data.content.status.advantages}</div>
              <p className="italic font-bold">b. Khó khăn:</p>
              <div className="whitespace-pre-wrap indent-8">{data.content.status.disadvantages}</div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="font-bold">2. Nguyên nhân và hạn chế:</p>
            <div className="whitespace-pre-wrap indent-8">{data.content.causes}</div>
          </div>
        </div>
      </Page>

      {/* TRANG TIẾP THEO (DÀI HƠN) */}
      <Page pageNumber={3}>
        <div className="space-y-6 text-justify">
          <div className="mt-4">
            <p className="font-bold">3. Các biện pháp thực hiện:</p>
            <div className="whitespace-pre-wrap indent-8">{data.content.solutions}</div>
          </div>
        </div>
      </Page>

      {/* TRANG KẾT THÚC */}
      <Page pageNumber={4}>
        <div className="space-y-6 text-justify">
          <h3 className="font-bold uppercase mb-2">III. ĐÁNH GIÁ VỀ TÍNH MỚI, TÍNH HIỆU QUẢ VÀ KHẢ THI</h3>
          <div className="space-y-4">
            <p><span className="font-bold">1. Tính mới:</span> {data.evaluation.novelty}</p>
            <p><span className="font-bold">2. Tính hiệu quả và khả thi:</span> {data.evaluation.efficiency}</p>
            <p><span className="font-bold">3. Phạm vi áp dụng:</span> {data.evaluation.scope}</p>
          </div>

          <div className="mt-8">
            <h3 className="font-bold uppercase mb-2">IV. KẾT LUẬN</h3>
            <div className="whitespace-pre-wrap indent-8">{data.conclusion}</div>
          </div>

          <div className="flex justify-between text-center mt-20 pt-10">
            <div className="w-1/2">
              <p className="font-bold uppercase">XÁC NHẬN CỦA ĐƠN VỊ</p>
              <p className="font-bold uppercase">TRỰC TIẾP</p>
            </div>
            <div className="w-1/2">
              <p className="font-bold uppercase">NGƯỜI BÁO CÁO</p>
              <div className="h-24"></div>
              <p className="font-bold uppercase underline">{data.author}</p>
            </div>
          </div>
        </div>
      </Page>
      
      <div className="no-print text-slate-600 text-sm mt-8 italic pb-20">
        * Bản xem trước đang hiển thị 4 trang mẫu. Xuất file Word để nhận đủ 12 trang nội dung chi tiết.
      </div>
    </div>
  );
};
