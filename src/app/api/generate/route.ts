import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Hàm gọi API Gemini 1.5 Flash
async function callGemini(prompt: string, apiKey: string, responseJson = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        ...(responseJson ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Lỗi không xác định từ Gemini API');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('AI không trả về kết quả hợp lệ.');
  }

  return text;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestType, apiKey: clientApiKey, payload } = body;

    // Lấy API Key từ client hoặc từ biến môi trường của server
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Thiếu API Key. Vui lòng nhập API Key ở góc trên bên phải hoặc cấu hình biến môi trường server.' },
        { status: 400 }
      );
    }

    if (requestType === 'GENERATE_OUTLINE') {
      const { chu_de, phong_cach, mo_ta, so_chuong } = payload;

      const prompt = `Bạn là một Trợ lý Biên kịch Sản xuất tiểu thuyết mạt thế, sinh tồn, huyền huyễn xuất sắc bậc nhất.
Dựa trên các tham số cấu hình sau:
- Chủ đề: ${chu_de}
- Phong cách: ${phong_cach}
- Ý tưởng cốt truyện gốc: ${mo_ta || 'Ngẫu nhiên bối cảnh hoang phế độc đáo'}
- Số lượng chương cần phân bổ: ${so_chuong} chương

Nhiệm vụ của bạn là:
1. Đề xuất một tên tác phẩm tiếng Việt kịch tính, đậm chất mạt thế, sinh tồn.
2. Thiết lập Dàn ý Tổng thể (World-building & Plot Outline) thật chi tiết dưới dạng Markdown.
3. Bóc tách ra khoảng 2-4 tên nhân vật chính yếu (bắt buộc phải là tên Hán Việt độc đáo mới mẻ, ví dụ: Tiêu Hàn, Thạch Dã, Diệp Dao... tuyệt đối không sử dụng Lâm Khuyết hay các tên quá phổ biến).
4. Phác thảo dàn ý chi tiết cho từng chương (từ Chương 1 đến Chương ${so_chuong}) để người dùng chốt chặn trước khi viết.

Hạn chế/Yêu cầu:
- Trả về định dạng JSON duy nhất và TUYỆT ĐỐI không bao bọc bởi tag markdown \`\`\`json hay text thừa. Khối JSON phải khớp chính xác cấu trúc sau:
{
  "tieu_de": "Tên truyện đề xuất",
  "dan_y_tong_the": "# DÀN Ý TỔNG THỂ\\n\\n## 1. Bối cảnh thế giới...\\n\\n## 2. Diễn biến cốt truyện chính...",
  "nhan_vat": ["Nhân vật chính 1", "Nhân vật chính 2"],
  "danh_sach_chuong": [
    {
      "so_chuong": 1,
      "tieu_de": "Tiêu đề Chương 1",
      "dan_y": "Tóm tắt sự kiện, bối cảnh xảy ra trong Chương 1..."
    },
    ...
  ]
}

Hãy viết cực kỳ hấp dẫn, logic, áp đặt các quy luật sinh tồn khắc nghiệt. Trả về đúng cấu trúc JSON nêu trên.`;

      const aiResponse = await callGemini(prompt, apiKey, true);
      
      // Parsed JSON
      let result;
      try {
        result = JSON.parse(aiResponse);
      } catch {
        // Dọn dẹp nếu AI bao bọc bởi ```json
        const cleaned = aiResponse.replace(/```json|```/g, '').trim();
        result = JSON.parse(cleaned);
      }

      return NextResponse.json(result);
    } 
    
    if (requestType === 'WRITE_CHAPTER') {
      const { ten_tac_pham, dan_y_tong_the, nhan_vat, chuong_hien_tai, so_chuong } = payload;

      const prompt = `Bạn là Trợ lý Biên kịch Sản xuất tiểu thuyết mạt thế.
Hãy viết nội dung kịch bản văn học chi tiết đa giác quan cho Chương ${chuong_hien_tai.so_chuong} trong tác phẩm "${ten_tac_pham}".

Thông tin vĩ mô cốt truyện:
- Dàn ý tổng thể:
${dan_y_tong_the}
- Các nhân vật chủ chốt: ${nhan_vat.join(', ')}

Thông tin chương đang viết:
- Tên chương: ${chuong_hien_tai.tieu_de}
- Dàn ý sự kiện chương: ${chuong_hien_tai.dan_y}

Yêu cầu kỹ thuật khi viết:
1. Viết chi tiết văn học, tả sâu cảm xúc, âm thanh, mùi vị, hành động kịch tính, nhịp điệu sinh tồn mạt thế dồn dập.
2. Triển khai đầy đủ, logic, liên kết chặt chẽ với dàn ý tổng thể.
3. Không viết tóm tắt hay kết luận thừa thãi ở cuối chương.
4. Độ dài kịch bản lý tưởng là khoảng 1000 - 1500 từ.
5. Định dạng văn bản trả về bằng Markdown sạch đẹp với tiêu đề chương (H3) và phân chia các đoạn hội thoại, mô tả hành động rõ ràng.

Hãy bắt đầu viết trực tiếp nội dung chương truyện.`;

      const aiResponse = await callGemini(prompt, apiKey, false);
      return NextResponse.json({ noi_dung: aiResponse });
    }

    return NextResponse.json({ error: 'Loại yêu cầu không hợp lệ.' }, { status: 400 });
  } catch (err: any) {
    console.error('Lỗi API Generate:', err);
    return NextResponse.json(
      { error: err.message || 'Có lỗi xảy ra trong quá trình sinh dữ liệu từ AI.' },
      { status: 500 }
    );
  }
}
