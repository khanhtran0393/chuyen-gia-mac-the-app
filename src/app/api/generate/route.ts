import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { 
      config, requestType, selectedChapter, 
      outlineText, dan_y_tong_the, danh_sach_nhan_vat, 
      danh_muc_chuong, scratchpad, signatureProps, apiKey,
      lorebook_the_gioi, bo_nho_nhan_vat, tom_tat_cuon_chieu, chuong_gan_nhat,
      activeChapterIndex, activeChapterText
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
4. BẮT BUỘC IN KHỐI STATE_JSON Ở CUỐI RESPONSE: Dòng cuối cùng phải là một khối JSON \`\`\`STATE_JSON và \`\`\` để cập nhật danh sách nhân vật.

Định dạng khối STATE_JSON bắt buộc ở cuối response:
\`\`\`STATE_JSON
{
  "danh_sach_nhan_vat": [
    {
      "ten": "Tiêu Hàn",
      "dac_diem": "Mô tả khuyết tật cơ thể và ngoại hình...",
      "muc_tieu": "Mục tiêu sống còn...",
      "noi_so": "Nỗi sợ lớn nhất...",
      "vat_dung_ky_nhan": "Vật dụng đặc trưng..."
    }
  ]
}
\`\`\`
`;

      userPrompt = `Hãy đọc Dàn ý cốt truyện 3 hồi và trích xuất/thiết kế hồ sơ chi tiết cho các nhân vật cốt lõi tham gia vào kịch bản:
- Dàn ý đã lập: Mở đầu: ${dan_y_tong_the?.mo_dau || "Chưa rõ"}. Cao trào: ${dan_y_tong_the?.cao_trao || "Chưa rõ"}. Kết thúc: ${dan_y_tong_the?.ket_thuc || "Chưa rõ"}.
- Số chương: ${danh_muc_chuong?.length || 10}.

Hãy miêu tả chi tiết từng nhân vật thô sơ dưới góc nhìn phân tích sinh tồn logic cứng. Sau cùng, in ra khối STATE_JSON chứa danh sách "danh_sach_nhan_vat" với đầy đủ 5 trường như yêu cầu.`;

    } else if (requestType === "WRITE_SCRIPT") {
      // 3. API KỊCH BẢN: Tập trung toàn lực vào viết văn kịch bản chi tiết dựa trên bối cảnh tĩnh (Context) khóa cứng kết hợp RAG cuốn chiếu
      temperature = 0.45;
      const minWords = config?.minWordCount || 3910;
      const maxWords = config?.maxWordCount || 4590;

      // Nạp danh sách nhân vật chi tiết vào hệ thống
      const characterContext = Array.isArray(danh_sach_nhan_vat) 
        ? danh_sach_nhan_vat.map(nv => `- **${nv.ten}**: Đặc điểm/Giới hạn thể chất: ${nv.dac_diem}. Vật dụng đặc trưng: ${nv.vat_dung_ky_nhan}. Mục tiêu: ${nv.muc_tieu}. Nỗi sợ: ${nv.noi_so}`).join("\n")
        : "Chưa thiết lập hồ sơ nhân vật tĩnh.";

      // Bơm ngữ cảnh động từ 3 tầng bộ nhớ để AI viết không bị ảo giác vết thương hay vật dụng
      const lorebookContext = lorebook_the_gioi 
        ? `- Quy tắc sinh tồn thép: ${JSON.stringify(lorebook_the_gioi.quy_tac_sinh_ton || [])}\n- Địa điểm đã mở khóa: ${JSON.stringify(lorebook_the_gioi.dia_diem_da_mo_khoa || [])}`
        : "Chưa thiết lập Lorebook thế giới.";

      const characterMemoryContext = Array.isArray(bo_nho_nhan_vat)
        ? bo_nho_nhan_vat.map(nv => `- **${nv.ten}**: Tình trạng thể chất/vết thương hiện tại: ${nv.tinh_trang_hien_tai}. Vật dụng đang mang theo người: ${JSON.stringify(nv.vat_dung_dang_mang || [])}`).join("\n")
        : "Chưa có bộ nhớ động nhân vật.";

      const rollingSummaryContext = tom_tat_cuon_chieu || "Không có tóm tắt cuốn chiếu ròng rọc trước đó.";

      const shortTermContext = Array.isArray(chuong_gan_nhat) && chuong_gan_nhat.length > 0
        ? chuong_gan_nhat.map(ch => `- Chương ${ch.chuong}: Tóm tắt diễn biến: ${ch.noi_dung_tom_luoc}`).join("\n")
        : "Không có trí nhớ ngắn hạn chương trước.";

      systemPrompt = `Bạn là Đại Văn Hào Mạt Thế, bậc thầy biên kịch truyện sinh tồn logic cứng.
Nhiệm vụ của bạn là viết kịch bản chi tiết cho chương được chỉ định, sử dụng hoàn hảo các bối cảnh tĩnh (Static Context) và bộ nhớ 3 tầng cuốn chiếu được cung cấp bên dưới làm ranh giới khóa cứng.

=== 5 RÀNG BUỘC BIÊN KỊCH TỐI CAO (CRITICAL WRITING LAWS) ===
1. KHÓA CỨNG HỒ SƠ NHÂN VẬT & BỘ NHỚ ĐỘNG: Tuyệt đối không tự tiện thêm nhân vật mới ngoài danh sách đã duyệt. Không sửa đổi hay làm biến dạng tính cách, khuyết tật thể chất, hay vật dụng đang mang của họ được cung cấp trong [BỘ NHỚ NHÂN VẬT ĐỘNG]. Nhân vật chính bắt buộc phải giải quyết các khó khăn bằng trí tuệ chiến thuật (Tactical IQ), phản ứng vật lý cơ học, đặt bẫy, lừa gạt quái vật dựa trên đúng hiện trạng cơ thể khuyết tật của mình, chứ không được buff may mắn vô lý.
2. DỆT ẤN KÝ VẬT DỤNG (STAMP-WEAVING): Bắt buộc lồng ghép chân thực và tinh tế sự xuất hiện cùng công năng thực tế của các vật dụng đang mang theo người của nhân vật hoặc vật dụng chữ ký: "${signatureProps || "bình nước sắt, bật lửa đồng, dây cáp nhựa"}" vào các hành động sinh tồn của nhân vật.
3. VĂN PHONG GAI GÓC ĐA GIÁ CƠ QUAN: Hành văn gai góc, ngột ngạt, bụi bặm. Miêu tả thế giới chi tiết qua nhiều giác quan (mùi ozone rỉ sét, sương phóng xạ buốt giá xộc vào phế quản, tia laser đỏ của drone rà qua vách đá rêu xanh, tiếng gầm rung chấn lồng ngực).
4. CỔNG TỪ KHẮT KHE (WORD-GATE): Viết cực kỳ chi tiết, kịch tính từng khung cảnh nhỏ. Bắt buộc bài viết chương này phải đạt độ dài từ ${minWords.toLocaleString('vi-VN')} đến ${maxWords.toLocaleString('vi-VN')} từ tiếng Việt để đảm bảo nội dung cực kỳ sâu và trọn vẹn. Hãy đấm chữ thật kiên cường, miêu tả từng bước di chuyển vật lý của nhân vật.
5. TUYỆT ĐỐI KHÔNG DÙNG TÊN BỊ CẤM: Cấm sử dụng các từ: "Lâm Khuyết", "Quảng Nam", "Đinh Hương".

=== 🧠 BỘ NHỚ 3 CẤP ĐỘ (3-TIER MEMORY RAG) ===
[TẦNG 1: LÕI BẤT BIẾN - LOREBOOK THẾ GIỚI]
${lorebookContext}

[TẦNG 2: TÓM TẮT CUỐN CHIẾU & BỘ NHỚ NHÂN VẬT ĐỘNG]
- Tóm tắt cuốn chiếu ròng rọc trước đó:
${rollingSummaryContext}

- Bộ nhớ nhân vật động (Thuộc tính vật lý, vết thương, vật phẩm thực tế hiện tại):
${characterMemoryContext}

[TẦNG 3: TRÍ NHỚ NGẮN HẠN (3 CHƯƠNG GẦN NHẤT)]
${shortTermContext}

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
Lưu ý: Mảng "danh_muc_chuong" trong khối JSON này chỉ cần trả về tối thiểu phần tử của chương hiện tại đang viết (frontend sẽ tự động gán văn bản kịch bản vào).`;

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

Hãy viết chương này thật dài, tỉ mỉ từng hành động vật lý của nhân vật chính phàm nhân, tôn trọng tuyệt đối tình trạng sức khỏe/vết thương hiện tại của nhân vật từ Bộ nhớ động, áp dụng toàn bộ các chỉ dẫn Static Context và Stamp-Weaving props. Đảm bảo số từ đạt tối thiểu ${minWords} từ!`;

    } else if (requestType === "COMMIT_MEMORY") {
      // 4. API GHI SỔ & NÉN KÝ ỨC (MEMORY COMMIT / ROLLING COMPRESSION)
      temperature = 0.3;
      systemPrompt = `Bạn là Trợ lý AI nén ký ức và cập nhật trạng thái nhân vật của tác phẩm biên kịch mạt thế sinh tồn.
Nhiệm vụ của bạn là đọc kịch bản chi tiết của chương vừa viết, sau đó phân tích các biến cố, hành động sinh tồn, vết thương mới, vật phẩm nhặt được/tiêu hao, và địa điểm mới mở khóa. Cuối cùng, cập nhật và nén chúng vào Bộ Nhớ 3 Cấp Độ mới nhất.

=== QUY TẮC PHÂN TÍCH & NÉN KÝ ỨC ===
1. TẦNG 1: LÕI BẤT BIẾN (LOREBOOK):
   - Đọc kỹ kịch bản chương và kiểm tra xem có quy luật sinh tồn mới nào được khám phá hoặc bất kỳ địa điểm hoang phế mới nào được mở khóa/nhắc tới hay không. Thêm chúng vào "dia_diem_da_mo_khoa" trong "lorebook_the_gioi". Giữ nguyên các quy tắc sinh tồn lõi cũ.
2. TẦNG 2: TÓM TẮT CUỐN CHIẾU & BỘ NHỚ NHÂN VẬT ĐỘNG:
   - Dựa trên diễn biến kịch bản chương vừa viết, hãy phân tích xem nhân vật nào bị thương ở bộ phận nào, bị hoại tử, mất ngón tay, hoặc tình trạng suy kiệt mệt mỏi thay đổi thế nào. Cập nhật trường "tinh_trang_hien_tai" của nhân vật.
   - Thống kê lại các vật dụng đang mang theo người của mỗi nhân vật (nhặt thêm dây rút, tiêu hao đạn dược, mất bật lửa, v.v.). Cập nhật trường "vat_dung_dang_mang".
   - Cập nhật và nén lại đoạn "tom_tat_cuon_chieu" (Văn bản tóm tắt tích lũy toàn bộ sự kiện từ chương 1 đến chương hiện tại thật ngắn gọn, súc tích trong vòng 500 từ).
3. TẦNG 3: TRÍ NHỚ NGẮN HẠN (SHORT-TERM CONTEXT):
   - Thêm tóm tắt siêu ngắn (1-2 câu) của chương hiện tại vừa viết vào danh sách "chuong_gan_nhat". Mảng này lưu tối đa 3 chương gần nhất (Chương N-2, N-1, N). Nếu vượt quá 3 chương, hãy tự động loại bỏ chương cũ nhất (FIFO).

=== BẮT BUỘC IN KHỐI STATE_JSON Ở CUỐI RESPONSE ===
Bạn bắt buộc phải in ra chính xác khối JSON cập nhật bộ nhớ bao quanh bởi thẻ \`\`\`STATE_JSON và \`\`\` ở dòng cuối cùng của câu trả lời.

Định dạng khối STATE_JSON bắt buộc ở cuối response:
\`\`\`STATE_JSON
{
  "lorebook_the_gioi": {
    "quy_tac_sinh_ton": [...mảng các quy tắc],
    "dia_diem_da_mo_khoa": [...mảng các địa điểm đã mở khóa mới nhất]
  },
  "bo_nho_nhan_vat": [
    {
      "ten": "Tên nhân vật",
      "tinh_trang_hien_tai": "Cập nhật tình trạng thể chất động, vết thương, khuyết tật mới phát sinh hoặc thuyên giảm...",
      "vat_dung_dang_mang": [...danh sách vật phẩm cập nhật]
    }
  ],
  "tom_tat_cuon_chieu": "Đoạn văn bản tóm tắt cuốn chiếu ròng rọc tích lũy từ đầu truyện đến chương vừa viết (khoảng 300-500 từ)...",
  "chuong_gan_nhat": [
    ... (mảng tối đa 3 chương gần nhất, định dạng: {"chuong": số_chương, "noi_dung_tom_luoc": "tóm tắt cực ngắn"})
  ]
}
\`\`\`
Lưu ý: Bạn chỉ được thay đổi dữ liệu bên trong khối JSON, giữ nguyên cấu trúc tên khóa bằng tiếng Việt đúng như yêu cầu.`;

      userPrompt = `Hãy đọc kịch bản chi tiết chương vừa viết dưới đây và cập nhật lại Bộ Nhớ 3 Cấp Độ cho toàn hệ thống:

--- KỊCH BẢN CHƯƠNG VỪA VIẾT (TẬP CHƯƠNG CHỐT) ---
${activeChapterText || "Không có kịch bản chương để phân tích."}
--------------------------------

--- BỘ NHỚ CŨ TRƯỚC ĐÓ ---
- Lorebook Thế Giới: ${JSON.stringify(lorebook_the_gioi || {})}
- Bộ Nhớ Nhân Vật Động: ${JSON.stringify(bo_nho_nhan_vat || [])}
- Tóm Tắt Cuốn Chiếu: "${tom_tat_cuon_chieu || ""}"
- Trí Nhớ Ngắn Hạn 3 Chương Trước: ${JSON.stringify(chuong_gan_nhat || [])}
--------------------------

Hãy tiến hành suy nghĩ phân tích một cách thông thái, sau đó in ra khối STATE_JSON cập nhật 3 tầng bộ nhớ chính xác ở dòng cuối cùng!`;
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
