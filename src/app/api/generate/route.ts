import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Đọc nội dung file cấu hình trợ lý từ System Prompt kịch bản mạt thế
const SYSTEM_PROMPT = `
Bạn là Trợ lý biên kịch tạo series mạt thế siêu dài theo CHƯƠNG.
Main là PHÀM NHÂN, thắng bằng cơ trí, thể chất hao mòn. Quái là HỆ SINH THÁI 8 TẦNG.
Mọi hành động đều phải trả giá sinh học và tài nguyên thực tế.

QUY TẮC BẮT BUỘC TỐI CAO:
1. Luôn cập nhật, đọc và trả về khối cấu trúc \`\`\`STATE_JSON ở cuối bài viết.
2. Thân thể = Máy hao mòn: Trong kịch bản phải thể hiện đói, khát, run tay, kiệt sức khi vận động nặng quá 2 giờ.
3. Chống lặp: Cụm từ khóa cốt lõi không lặp quá 2 lần mỗi tập kịch bản.
4. Ép Cổng từ (Word Gate): Mỗi tập kịch bản giọng đọc của chương phải dài từ 3.910 - 4.590 từ. 
5. Cấm AI tự giải bài toán chiến thuật hoặc tự động one-shot quái vật lớn cho main.
`;

export async function POST(req: Request) {
  try {
    const { config, stateJSON, requestType, selectedChapter } = await req.json();

    let userPrompt = "";
    
    if (requestType === "INITIAL_PACKAGE") {
      userPrompt = `Khởi tạo Gói Series Mạt Thế mới với:
      - Chủ đề: ${config.chủ_đề}
      - Phong cách: ${config.phong_cách}
      - Mô tả bổ sung: ${config.mô_tả}
      - Quy mô: ${config.số_chương} chương.
      Hãy phân tích đủ 8 tầng mạng lưới dinh dưỡng hệ sinh thái, cấu trúc nhân vật và xuất kịch bản mở màn EPS_HOOK dài ~340 từ.`;
    } else {
      userPrompt = `Hãy viết tiếp CHƯƠNG ${selectedChapter} - EPISODE kế tiếp dựa trên trạng thái hiện tại.
      Dữ liệu trạng thái hệ thống đầu vào cần mô phỏng: ${JSON.stringify(stateJSON)}.
      Yêu cầu: Kiểm tra nợ cơ thể, trừ tài nguyên hợp lý, áp dụng luật tiếng động và bẫy tín hiệu của hệ sinh thái hiện tại.`;
    }

    const result = await streamText({
      model: google('gemini-1.5-flash'), // Đảm bảo đã thiết lập biến GEMINI_API_KEY
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4, // Giữ độ nhất quán logic cao, tránh random bay bổng
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
