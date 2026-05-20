import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { 
      config, stateJSON, requestType, selectedChapter, 
      geniusBeat, signatureProps, apiKey 
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

    let systemPrompt = `Bạn là Trợ lý Biên kịch Mạt Thế tối cao, được trang bị "BỘ LỌC LOGIC CỨNG" (Hard Logic Filter).
Nhiệm vụ của bạn là viết kịch bản/chương tiểu thuyết mạt thế siêu dài, cực kỳ khắt khe về mặt vật lý, sinh học và quy luật sinh tồn.

=== 4 RÀNG BUỘC PHẢM NHÂN KHÓA CỨNG (CRITICAL GUARDRAILS) ===
1. MAIN LÀ PHÀM NHÂN, THẮNG BẰNG TACTICAL IQ: Nhân vật chính tuyệt đối không có siêu năng lực, phép thuật hay tu tiên buff bẩn. Main là người thường có giới hạn thể chất rõ rệt, phải chiến đấu hoặc thoát hiểm bằng trí tuệ chiến thuật đỉnh cao (Tactical IQ), lập kế hoạch chi tiết, phối hợp dụng cụ thô sơ, bẫy cơ học và lợi dụng địa hình vật lý (lấy dữ liệu từ bảng Genius Beat đã cung cấp làm trọng tâm).
2. TẤN CÔNG LÀ PHẢI TRẢ GIÁ BẰNG TÀI NGUYÊN: Mọi hành động chiến đấu, trốn chạy dữ dội hay vận động thể xác cật lực bắt buộc phải tiêu hao tài nguyên sinh tồn thực tế (nước, lương thực, đạn dược nếu bắn súng, dây rút nếu trói/bẫy). AI phải mô tả sự suy hao tài nguyên này trong nội dung câu chuyện và trừ trực tiếp trong khối STATE_JSON trả về.
3. TUYỆT ĐỐI CẤM LẶP LẠI MOTIF/TÊN CŨ: Nghiêm cấm sử dụng các danh từ riêng, tên nhân vật hoặc địa danh cũ như: "Lâm Khuyết", "Quảng Nam", "Đinh Hương". Hãy sáng tạo ra những tên Hán Việt hoàn toàn mới (ví dụ: Tiêu Hàn, Thạch Dã, Dạ Vô Cực...), vết thương thể chất ngẫu nhiên, không gian hoang phế ngẫu nhiên.
4. BẮT BUỘC IN KHỐI STATE_JSON Ở CUỐI RESPONSE: Ở dòng cuối cùng của mỗi câu trả lời (sau khi đã viết xong toàn bộ nội dung văn bản truyện), bạn bắt buộc phải in ra chính xác một khối json cập nhật trạng thái mới của nhân vật bao quanh bởi thẻ \`\`\`STATE_JSON và \`\`\`.

Định dạng khối STATE_JSON bắt buộc ở cuối response (Hãy tính toán hao hụt tài nguyên sinh tồn hợp lý từ giá trị cũ do Client gửi sang dựa theo tình tiết chương):
\`\`\`STATE_JSON
{
  "fatigue": <số nguyên từ 0 đến 100, kiệt sức tăng hoặc giảm dựa trên vận động>,
  "toxin": <số nguyên từ 0 đến 100, nhiễm độc tăng hoặc giảm dựa trên môi trường quái vật>,
  "water": <số nguyên từ 0 đến 100, nước giảm tương ứng nếu dùng nước sạch sinh tồn>,
  "food": <số nguyên từ 0 đến 100, lương thực giảm tương ứng nếu dùng thức ăn>,
  "ammo": <số nguyên thể hiện số lượng đạn dược còn lại sau khi dùng súng>,
  "cableTies": <số nguyên thể hiện số lượng dây rút còn lại sau khi dùng bẫy/dây>,
  "injuries": [
    { "part": "bộ phận cơ thể bị chấn thương", "pain": <độ đau từ 1 đến 10>, "consequence": "hậu quả vật lý thực tế" }
  ]
}
\`\`\`
`;

    let userPrompt = "";

    if (requestType === "INITIAL_PACKAGE") {
      systemPrompt += `\n\n=== QUY TẮC BẮT BUỘC ===
1. Hãy phân tích đủ hệ sinh thái lưới thức ăn (8 tầng dinh dưỡng).
2. Xây dựng dàn ý chi tiết từng chương (chương 1 tới chương ${config.số_chương}) rõ ràng.
3. Xuất kịch bản mở màn EPS_HOOK dài khoảng 350 từ mang đậm mùi vị bụi bặm, chết chóc và ngột ngạt của mạt thế.
4. Cuối response này, vẫn in kèm một khối STATE_JSON mẫu khởi tạo tài nguyên ban đầu (Fatigue=20, Toxin=10, Water=100, Food=100, Ammo=6, CableTies=10, Injuries=[]).`;

      userPrompt = `Khởi tạo Gói Kịch Bản Mạt Thế mới với cấu hình sau:
- Chủ đề chính: ${config.chủ_đề}
- Phong cách: ${config.phong_cách}
- Ý tưởng cốt lõi bổ sung: ${config.mô_tả || "Không có"}
- Quy mô kịch bản: ${config.số_chương} chương.

Hãy trình bày chi tiết Tên tác phẩm, Bối cảnh thế giới, Hồ sơ nhân vật phàm nhân, danh sách mục lục và tập mở đầu EPS_HOOK. Cuối cùng, in ra khối STATE_JSON khởi tạo.`;

    } else {
      // Dành cho việc sinh viết chi tiết chương
      const fatigue = stateJSON?.fatigue || 20;
      const toxin = stateJSON?.toxin || 10;
      const water = stateJSON?.water || 100;
      const food = stateJSON?.food || 100;
      const ammo = stateJSON?.ammo || 6;
      const cableTies = stateJSON?.cableTies || 10;
      const injuries = stateJSON?.injuries || [];

      const injuriesText = injuries.length > 0
        ? injuries.map((inj: any) => `- Bị thương ở ${inj.part} (Độ đau: ${inj.pain}/10): ${inj.consequence}`).join("\n")
        : "Không có chấn thương vật lý nào.";

      const forbiddenMoves = stateJSON?.forbiddenMoves || [];
      const forbiddenText = forbiddenMoves.length > 0 
        ? forbiddenMoves.map((m: string) => `- BỊ CẤM THỰC HIỆN: ${m}`).join("\n")
        : "Không có hành vi nào bị cấm ở mức này. Cơ thể phàm nhân vẫn vận động tương đối ổn định.";

      const minWordCount = config?.minWordCount || 3910;
      const maxWordCount = config?.maxWordCount || 4590;

      systemPrompt += `\n\n=== VÒNG LẶP PHẢN HỒI CƠ THỂ (SOMATIC FEEDBACK) ===
Chỉ số cơ thể nhân vật chính hiện tại: Fatigue (Kiệt sức) = ${fatigue}%, Toxin (Nhiễm độc) = ${toxin}%.
Tài nguyên sinh tồn hiện tại: Nước = ${water}%, Lương thực = ${food}%, Đạn dược = ${ammo} viên, Dây rút = ${cableTies} sợi.
Danh sách chấn thương hiện tại:
${injuriesText}

Quy tắc somatic nghiêm ngặt về các giới hạn thể chất phàm nhân (bao gồm chấn thương vật lý):
${forbiddenText}
Lưu ý: Nếu nhân vật cố gắng thực hiện hành vi bị cấm ở trên, họ sẽ phải trả giá cực kỳ đắt (ví dụ: ngất xỉu, ói máu, trượt tay bóp cò bắn lệch mục tiêu hoàn toàn). Bạn PHẢI viết rõ sự hao mòn thể chất và hao tốn tài nguyên này trong văn bản.

=== BỘ KIẾN TRÚC CHIẾN THUẬT "GENIUS BEAT" ===
Mọi hành động giải quyết mâu thuẫn hay chiến đấu của Main bắt buộc phải bám sát 6 trường chiến thuật sau:
- 🎯 MỤC TIÊU: ${geniusBeat?.goal || "Trốn chạy an toàn hoặc thu thập tài nguyên."}
- 🧱 RÀNG BUỘC VẬT LÝ: ${geniusBeat?.constraints || "Độ cao nguy hiểm, góc khuất tầm nhìn, địa hình trơn trượt."}
- 🎒 CHUẨN BỊ TRƯỚC: ${geniusBeat?.prep || "Đã kiểm tra kỹ lượng đạn dược, rải cát giảm tiếng bước chân."}
- ⚙️ THAO TÁC VẬT LÝ: ${geniusBeat?.ops || "Di chuyển sát mép tường, kích nổ bẫy tự chế, nén hơi thở."}
- 🌀 NGHỊCH LÝ BẪY (TRAP PARADOX): ${geniusBeat?.paradox || "Dụ đối thủ tập trung vào điểm giả, tấn công từ điểm mù cơ học."}
- ⚖️ CÁI GIÁ PHẢI TRẢ: ${geniusBeat?.cost || "Tổn hao sinh lực, hao phí đạn dược, tăng mệt mỏi."}

Bạn PHẢI miêu tả sinh động từng thao tác cơ học thực tế, loại bỏ hoàn toàn may mắn vô lý hoặc buff bẩn từ không trung!

=== RADAR TROPHIC WEB 8 TẦNG ===
Thực thể quái vật đang lẩn trốn tại bối cảnh: ${stateJSON?.selectedMonster || "Thực thể biến dị tự do"} (Tầng sinh thái: Tầng ${stateJSON?.trophicLevel || 1})
Các tín hiệu sensory nhạy bén truyền lại: ${stateJSON?.monsterCues || "Mùi không khí khô hốc"}
BẮT BUỘC: Bạn phải tả chi tiết các tín hiệu sensory (mùi, nhiệt độ lạnh buốt, độ rung sắt rỉ, tiếng động tần số cao...) này xuất hiện trong môi trường TRƯỚC KHI nhân vật chạm mặt hay mô tả sự đe dọa của quái vật!

=== DỆT ẤN KÝ VẬT DỤNG (STAMP-WEAVING PROPS) ===
Bạn phải khéo léo dệt (lồng ghép tự nhiên) sự xuất hiện và công năng thực tế của các vật dụng chữ ký sau của nhân vật vào mạch truyện của chương này:
👉 Vật dụng chữ ký: "${signatureProps || "Bật lửa đồng, Bình nước vỏ sắt"}"

=== CỔNG TỪ ĐẤM CHỮ (WORD-GATE COVENANT) ===
Hãy viết một chương cực kỳ dài, miêu tả sâu sắc các diễn biến nội tâm, hành động cơ học, bối cảnh ngột ngạt và sự tính toán cân não. Mục tiêu lý tưởng là dài từ ${minWordCount.toLocaleString('vi-VN')} - ${maxWordCount.toLocaleString('vi-VN')} từ. Hãy hành văn thật tỉ mỉ từng chi tiết, làm nổi bật phong cách sinh tồn mạt thế thực tế.

Nhắc lại: Ở dòng cuối cùng của response, bạn bắt buộc phải in ra khối STATE_JSON cập nhật lượng tài nguyên còn lại, fatigue, toxin và chấn thương của nhân vật sau các biến cố của chương này!`;

      userPrompt = `Hãy viết chi tiết chương kịch bản: CHƯƠNG ${selectedChapter} - PHÂN CẢNH TIẾP THEO.
Bám sát toàn bộ các chỉ số Somatic, Cues hệ sinh thái của thực thể lân cận, dệt các Props chữ ký và diễn giải chính xác nước đi thiên tài Genius Beat đã định sẵn! Sau khi viết xong chương, in khối STATE_JSON phản ánh sự suy giảm tài nguyên và biến đổi trạng thái ở cuối cùng.`;
    }

    const result = await streamText({
      model: googleProvider('gemini-1.5-flash'), // Stream mượt mà bằng Gemini 1.5 Flash
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.45, // Tối ưu hóa tính nhất quán logic cao, chống bay bổng ngẫu nhiên
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
