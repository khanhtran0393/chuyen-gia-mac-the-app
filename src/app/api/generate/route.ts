import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { 
      config, requestType, selectedChapter, 
      outlineText, dan_y_tong_the, danh_sach_nhan_vat, 
      danh_muc_chuong, scratchpad, signatureProps, apiKey 
    } = await req.json();

    // Sử dụng API Key tùy biến do client gửi lên hoặc fallback về biến môi trường máy chủ
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "Không tìm thấy API Key. Vui lòng nhập API Key của bạn trong phần Cài đặt (⚙️) ở góc trên bên phải màn hình!" 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Khởi tạo thực thể Google Generative AI với khóa tương ứng
    const googleProvider = createGoogleGenerativeAI({
      apiKey: finalApiKey
    });

    let systemPrompt = "";
    let userPrompt = "";
    let temperature = 0.5;

    // BỘ PHÂN LOẠI PROMPT CHAINING THEO REQUEST TYPE
    if (requestType === "GENERATE_OUTLINE") {
      // 1. API DÀN Ý: Chỉ tập trung vào cấu trúc 3 hồi, phân bổ chương, pacing và plot hooks. Không viết rườm rà.
      temperature = 0.5;
      systemPrompt = `Bạn là Trợ lý Biên kịch Mạt Thế tối cao chuyên gia cấu trúc cốt truyện.
Nhiệm vụ của bạn là lập dàn ý chi tiết (Outline) chia làm 3 hồi rõ ràng và thiết lập các chương cho bộ truyện mạt thế sinh tồn.

=== QUY TẮC PHẠT LỖI & RÀNG BUỘC CỨNG (CRITICAL GUARDRAILS) ===
1. TUYỆT ĐỐI CẤM LẶP LẠI TÊN CŨ: Nghiêm cấm sử dụng các danh từ riêng, tên nhân vật hoặc địa danh cũ như: "Lâm Khuyết", "Quảng Nam", "Đinh Hương". Hãy sáng tạo ra những tên Hán Việt hoàn toàn mới (ví dụ: Tiêu Hàn, Thạch Dã, Dạ Vô Cực, Lục Phong...) và địa điểm đổ nát mới.
2. KHÔNG HOA MỸ RƯỜM RÀ: Tập trung xây dựng nhịp độ (pacing), nút thắt kịch bản, và cấu trúc logic vững chắc.
3. BẮT BUỘC IN KHỐI STATE_JSON Ở CUỐI RESPONSE: Bạn bắt buộc phải in ra chính xác một khối JSON cập nhật cấu trúc dàn ý bao quanh bởi thẻ \`\`\`STATE_JSON và \`\`\` ở dòng cuối cùng của câu trả lời.

Định dạng khối STATE_JSON bắt buộc ở dòng cuối cùng:
\`\`\`STATE_JSON
{
  "dan_y_tong_the": {
    "mo_dau": "Mô tả cụ thể hồi 1: Sự khởi đầu, thế giới hoang phế, hoàn cảnh giới hạn thể chất của main và mục tiêu ban đầu",
    "cao_trao": "Mô tả cụ thể hồi 2: Các biến cố leo thang, chạm trán các tầng quái vật cao hơn, mâu thuẫn sinh tồn cân não",
    "ket_thuc": "Mô tả hồi 3: Điểm nút thắt cuối cùng, cuộc chiến giải quyết mâu thuẫn chính hoặc lối thoát sinh tử"
  },
  "danh_muc_chuong": [
    {
      "so_chuong": 1,
      "tieu_de": "Chương 1: [Tên chương tiếng Việt hấp dẫn]",
      "tom_tat_su_kien": "Tóm tắt sự kiện chính của chương này (khoảng 2-3 câu). Main phải đối mặt với khó khăn gì, dùng chiến thuật vật lý/cơ học nào?",
      "noi_dung_kich_ban": "",
      "da_viet": false
    },
    ... (tiếp tục cho đủ số chương)
  ]
}
\`\`\`
`;

      userPrompt = `Hãy lập dàn ý kịch bản 3 hồi và danh mục chương chi tiết cho tác phẩm mạt thế mới:
- Chủ đề chính: ${config?.chủ_đề || "Sinh Tồn"}
- Phong cách viết: ${config?.phong_cách || "Mạt Thế"}
- Ý tưởng/bối cảnh sơ khởi: ${config?.mô_tả || "Không có ý tưởng đặc biệt"}
- Quy mô kịch bản: ${config?.số_chương || 10} chương.

Hãy trình bày chi tiết Tên tác phẩm, Bối cảnh thế giới và dàn ý 3 hồi rõ ràng. Sau cùng, in ra khối STATE_JSON có chứa "dan_y_tong_the" và mảng "danh_muc_chuong" phân bổ chính xác đúng ${config?.số_chương || 10} chương.`;

    } else if (requestType === "EXTRACT_CHARACTERS") {
      // 2. API TRÍCH XUẤT NHÂN VẬT: Đọc dàn ý và trích xuất hồ sơ nhân vật tĩnh
      temperature = 0.3;
      systemPrompt = `Bạn là Trợ lý Biên kịch Mạt Thế có đầu óc phân tích nhân vật sắc bén.
Nhiệm vụ của bạn là đọc Dàn ý cốt truyện và trích xuất ra một danh sách các nhân vật cốt lõi với thông tin sinh tồn tĩnh cực kỳ nhất quán.

=== QUY TẮC PHÁC HỌA NHÂN VẬT (CHARACTER DESIGN GUARDRAILS) ===
1. MAIN LÀ PHÀM NHÂN CÓ GIỚI HẠN THỂ CHẤT: Nhân vật chính tuyệt đối không có phép thuật hay siêu năng lực. Bắt buộc phải có một khuyết tật cơ thể rõ rệt (ví dụ: mù một mắt, liệt một tay, rách gân gót chân khập khiễng, tổn thương phổi phải hít thở khò khè...) để định hình các hành vi bị giới hạn.
2. VẬT DỤNG KÝ NHÂN ĐẶC TRƯNG: Mỗi nhân vật cốt lõi phải mang theo 1-2 vật dụng đặc trưng, thô sơ nhưng hữu dụng (bật lửa cũ, bình nước sắt móp, dây siết cáp nhựa...).
3. TUYỆT ĐỐI CẤM TÊN CŨ: Cấm sử dụng các tên 'Lâm Khuyết', 'Quảng Nam', 'Đinh Hương'. Tạo tên Hán Việt hoàn toàn mới (Tiêu Hàn, Thạch Dã, Dạ Vô Cực...).
4. BẮT BUỘC IN KHỐI STATE_JSON Ở CUỐI RESPONSE: Dòng cuối cùng phải là một khối JSON \`\`\`STATE_JSON ... \`\`\` chứa danh sách nhân vật chốt.

Định dạng khối STATE_JSON bắt buộc ở cuối response:
\`\`\`STATE_JSON
{
  "danh_sach_nhan_vat": [
    {
      "ten": "Tên nhân vật Hán Việt mới",
      "dac_diem": "Mô tả chi tiết ngoại hình, tính cách, và bắt buộc nêu rõ giới hạn thể chất/khuyết tật cơ thể",
      "vat_dung_ky_nhan": "Vật dụng đặc trưng mang theo người để sinh tồn",
      "muc_tieu": "Mục tiêu sinh tồn hoặc động cơ hành động chính trong truyện",
      "noi_so": "Nỗi sợ lớn nhất của nhân vật này trong thế giới mạt thế (ví dụ: Drone cơ khí, sương vàng phóng xạ...)"
    }
  ]
}
\`\`\`
`;

      userPrompt = `Hãy đọc Dàn ý kịch bản đã chốt dưới đây, trích xuất tất cả các nhân vật xuất hiện hoặc phác họa ra dàn nhân vật chính phụ hoàn hảo dựa trên dàn ý này:

--- DÀN Ý ĐÃ CHỐT ---
${outlineText}
---------------------

Hãy trình bày hồ sơ từng nhân vật thật sinh động, sau cùng in ra khối STATE_JSON có mảng "danh_sach_nhan_vat" với đầy đủ 5 trường thuộc tính đã định nghĩa.`;

    } else if (requestType === "WRITE_SCRIPT") {
      // 3. API KỊCH BẢN: Tập trung toàn lực vào viết văn kịch bản chi tiết dựa trên bối cảnh tĩnh (Context) khóa cứng
      temperature = 0.45;
      const minWords = config?.minWordCount || 3910;
      const maxWords = config?.maxWordCount || 4590;

      // Nạp danh sách nhân vật chi tiết vào hệ thống
      const characterContext = Array.isArray(danh_sach_nhan_vat) 
        ? danh_sach_nhan_vat.map(nv => `- **${nv.ten}**: Đặc điểm/Giới hạn thể chất: ${nv.dac_diem}. Vật dụng đặc trưng: ${nv.vat_dung_ky_nhan}. Mục tiêu: ${nv.muc_tieu}. Nỗi sợ: ${nv.noi_so}`).join("\n")
        : "Chưa thiết lập hồ sơ nhân vật tĩnh.";

      systemPrompt = `Bạn là Đại Văn Hào Mạt Thế, bậc thầy biên kịch truyện sinh tồn logic cứng.
Nhiệm vụ của bạn là viết kịch bản chi tiết cho chương được chỉ định, sử dụng hoàn hảo các bối cảnh tĩnh (Static Context) được cung cấp bên dưới làm ranh giới khóa cứng.

=== 5 RÀNG BUỘC BIÊN KỊCH TỐI CAO (CRITICAL WRITING LAWS) ===
1. KHÓA CỨNG HỒ SƠ NHÂN VẬT TĨNH: Tuyệt đối không tự tiện thêm nhân vật mới ngoài danh sách đã duyệt. Không sửa đổi hay làm biến dạng tính cách, khuyết tật thể chất, hay vật dụng đặc trưng của họ. Nhân vật chính bắt buộc phải giải quyết các khó khăn bằng trí tuệ chiến thuật (Tactical IQ), phản ứng vật lý cơ học, đặt bẫy, lừa gạt quái vật chứ không được buff may mắn vô lý.
2. DỆT ẤN KÝ VẬT DỤNG (STAMP-WEAVING): Bắt buộc lồng ghép chân thực và tinh tế sự xuất hiện cùng công năng thực tế của các vật dụng chữ ký: "${signatureProps || "bình nước sắt, bật lửa đồng, dây cáp nhựa"}" vào các hành động sinh tồn của nhân vật.
3. VĂN PHONG GAI GÓC ĐA GIÁ CƠ QUAN: Hành văn gai góc, ngột ngạt, bụi bặm. Miêu tả thế giới chi tiết qua nhiều giác quan (mùi ozone rỉ sét, sương phóng xạ buốt giá xộc vào phế quản, tia laser đỏ của drone rà qua vách đá rêu xanh, tiếng gầm rung chấn lồng ngực).
4. CỔNG TỪ KHẮT KHE (WORD-GATE): Viết cực kỳ chi tiết, kịch tính từng khung cảnh nhỏ. Bắt buộc bài viết chương này phải đạt độ dài từ ${minWords.toLocaleString('vi-VN')} đến ${maxWords.toLocaleString('vi-VN')} từ tiếng Việt để đảm bảo nội dung cực kỳ sâu và trọn vẹn. Hãy đấm chữ thật kiên cường, miêu tả từng bước di chuyển vật lý của nhân vật.
5. TUYỆT ĐỐI KHÔNG DÙNG TÊN BỊ CẤM: Cấm sử dụng các từ: "Lâm Khuyết", "Quảng Nam", "Đinh Hương".

=== THÔNG TIN BỐI CẢNH TĨNH (STATIC CONTEXT) ===
* DÀN Ý TỔNG THỂ TÁC PHẨM:
- Mở đầu: ${dan_y_tong_the?.mo_dau || "Chưa rõ"}
- Cao trào: ${dan_y_tong_the?.cao_trao || "Chưa rõ"}
- Kết thúc: ${dan_y_tong_the?.ket_thuc || "Chưa rõ"}

* HỒ SƠ NHÂN VẬT ĐÃ DUYỆT:
${characterContext}

* GHI CHÚ VIẾT TAY (SCRATCHPAD) DÀNH CHO CHƯƠNG NÀY:
${scratchpad || "Không có ghi chú đặc biệt từ biên kịch."}

=== BẮT BUỘC IN KHỐI STATE_JSON Ở CUỐI RESPONSE ===
Sau khi đã viết xong toàn bộ nội dung kịch bản văn học của chương, ở dòng cuối cùng, bạn bắt buộc phải in ra khối JSON \`\`\`STATE_JSON và \`\`\` để cập nhật trạng thái câu chuyện. 

Định dạng khối STATE_JSON bắt buộc ở cuối response:
\`\`\`STATE_JSON
{
  "con_tro": {
    "chuong_hien_tai": ${selectedChapter},
    "trang_thai_pipeline": "VIET_KICH_BAN"
  },
  "dan_y_tong_the": ${JSON.stringify(dan_y_tong_the || {})},
  "danh_sach_nhan_vat": ${JSON.stringify(danh_sach_nhan_vat || [])},
  "danh_muc_chuong": [
    {
      "so_chuong": ${selectedChapter},
      "tieu_de": "Chương ${selectedChapter}",
      "tom_tat_su_kien": "Tóm tắt sự kiện chương này đã xảy ra",
      "noi_dung_kich_ban": "",
      "da_viet": true
    }
  ]
}
\`\`\`
Lưu ý: Mảng "danh_muc_chuong" trong khối JSON này chỉ cần trả về tối thiểu phần tử của chương hiện tại đang viết (đã đặt "da_viet": true và "noi_dung_kich_ban" có thể để chuỗi trống vì frontend sẽ tự động gán văn bản chương đã sinh vào).`;

      // Tìm thông tin chương hiện tại
      const currentChapterData = Array.isArray(danh_muc_chuong) 
        ? danh_muc_chuong.find(c => c.so_chuong === selectedChapter)
        : null;
      const chapterTitle = currentChapterData?.tieu_de || `Chương ${selectedChapter}`;
      const chapterEvent = currentChapterData?.tom_tat_su_kien || "Sự kiện sinh tồn căng thẳng.";

      userPrompt = `Hãy viết chi tiết chương kịch bản: ${chapterTitle.toUpperCase()} - SỰ KIỆN TẤN CÔNG/THOÁT HIỂM.

Chi tiết sự kiện cần viết:
- Tóm tắt diễn biến: ${chapterEvent}
- Ghi chú định hướng (Scratchpad): ${scratchpad || "Không có"}

Hãy viết chương này thật dài, tỉ mỉ từng hành động vật lý của nhân vật chính phàm nhân, áp dụng toàn bộ các chỉ dẫn Static Context và Stamp-Weaving props. Đảm bảo số từ đạt tối thiểu ${minWords} từ!`;
    }

    const result = await streamText({
      model: googleProvider('gemini-1.5-flash'), // Stream mượt mà bằng Gemini 1.5 Flash
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: temperature, // Tối ưu hóa cho từng giai đoạn
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Lỗi API generate: ", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
