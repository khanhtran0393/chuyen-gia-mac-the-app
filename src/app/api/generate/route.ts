import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { requestType, config, macroState, currentData, apiKey } = await req.json();
    
    let systemPrompt = "Bạn là Trợ lý Biên kịch Mạt thế Phàm nhân chuyên nghiệp.";
    let userPrompt = "";

    // NODE 1: LÊN DÀN Ý
    if (requestType === "GENERATE_OUTLINE") {
      systemPrompt += "\nNhiệm vụ: Viết dàn ý chi tiết cấu trúc 3 hồi cho chương tiếp theo. Tập trung vào sự kiện, nút thắt.";
      userPrompt = `Bối cảnh gốc: ${config.y_tuong_goc}\nChương hiện tại: ${macroState.con_tro.chuong_hien_tai}
      Tóm tắt các sự kiện trước (Lorebook): ${macroState.tom_tat_cuon_chieu}
      Hãy lập dàn ý chương mới bám sát mạch truyện này.`;
    } 
    
    // NODE 2: TRÍCH XUẤT NHÂN VẬT (Chạy ngay sau Dàn ý)
    else if (requestType === "EXTRACT_CHARACTERS") {
      systemPrompt += `\nNhiệm vụ: Phân tích Dàn ý và cập nhật Bộ nhớ Nhân vật. 
      Trả về DUY NHẤT một mảng JSON tiếng Việt hợp lệ với cấu trúc:
      [{"ten": "...", "tinh_trang_hien_tai": "...", "vat_dung_dang_mang": ["..."], "moi_quan_he": {"Ten": "Quan he"}}]`;
      userPrompt = `Dàn ý hiện tại: ${currentData.dan_y_chot}\nTrích xuất và cập nhật trạng thái nhân vật ngay lập tức.`;
    } 
    
    // NODE 3: VIẾT KỊCH BẢN (Nạp Context khổng lồ làm bối cảnh tĩnh)
    else if (requestType === "WRITE_SCRIPT") {
      systemPrompt += `\nNhiệm vụ: Viết kịch bản chi tiết dựa trên Dàn ý và Bộ nhớ Nhân vật.
      RÀNG BUỘC: 
      1. Kịch bản thuần text, tả sâu đa giác quan.
      2. Phải tuân thủ tuyệt đối Tình trạng & Vật dụng của nhân vật trong Bộ nhớ, tuyệt đối không bịa thêm đồ vật nhân vật không có.
      3. Bám sát luật lệ thế giới trong Lorebook.`;
      
      userPrompt = `Viết Kịch bản Chương ${macroState.con_tro.chuong_hien_tai}.
      [LOREBOOK THẾ GIỚI]: ${JSON.stringify(macroState.lorebook_the_gioi)}
      [TÓM TẮT TRƯỚC ĐÂY]: ${macroState.tom_tat_cuon_chieu}
      [BỘ NHỚ NHÂN VẬT]: ${JSON.stringify(macroState.bo_nho_nhan_vat)}
      
      DÀN Ý CẦN VIẾT: ${currentData.dan_y_chot}`;
    }
    
    // NODE 4: GHI SỔ NỢ (MEMORY COMMIT - Chống quên 1000 chương)
    else if (requestType === "COMMIT_MEMORY") {
      systemPrompt += `\nNhiệm vụ: Đọc kịch bản vừa viết và NÉN KÝ ỨC.
      Trả về DUY NHẤT một khối JSON chứa 3 field sau:
      1. "tom_tat_cuon_chieu": Viết thêm sự kiện chính vừa xảy ra vào chuỗi tóm tắt cũ.
      2. "bo_nho_nhan_vat": Cập nhật lại vết thương, đồ vật bị mất/nhặt được của các nhân vật.
      3. "lorebook_the_gioi": Thêm địa điểm hoặc luật lệ mới nếu có xuất hiện trong chương.`;
      
      userPrompt = `Tóm tắt cũ: ${macroState.tom_tat_cuon_chieu}
      Kịch bản vừa viết xong ở Chương ${macroState.con_tro.chuong_hien_tai}: ${currentData.script_text}
      Hãy Nén ký ức và trả về JSON cập nhật.`;
    }

    // GỌI API GEMINI
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: requestType === "EXTRACT_CHARACTERS" || requestType === "COMMIT_MEMORY" ? 0.1 : 0.6 }
      })
    });

    const data = await response.json();
    return NextResponse.json({ result: data.candidates[0].content.parts[0].text });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
