import { create } from 'zustand';

export const useNovelStore = create((set, get) => ({
  // Phase 1 Setup Config
  theme: "Xuyên Không",
  style: "Tu Tiên / Tiên Hiệp",
  prompt: "",
  chaptersCount: 10,

  // Phase 2 Workspace Content State
  phase: 1, // 1 or 2
  novelTitle: "",
  isGeneratingOutline: false,
  outlineGenerated: false,
  activeTab: "outline", // 'outline' | 'chapters'

  // Core Data
  worldBackground: "",
  characters: [],
  outlineText: "",
  chapters: [], // Array of { number: 1, title: "", content: "", written: false }

  // Active chapter controls
  activeChapterIndex: 0,
  isWritingChapter: false,
  displayedText: "", // Text currently streamed to the screen
  isStreaming: false,

  // Actions
  setTheme: (theme) => set({ theme }),
  setStyle: (style) => set({ style }),
  setPrompt: (prompt) => set({ prompt }),
  setNovelTitle: (novelTitle) => set({ novelTitle }),

  stepChapters: (amount) => set((state) => {
    const min = 1;
    const max = 50;
    let next = state.chaptersCount + amount;
    if (next < min) next = min;
    if (next > max) next = max;
    return { chaptersCount: next };
  }),

  reset: () => set({
    phase: 1,
    novelTitle: "",
    isGeneratingOutline: false,
    outlineGenerated: false,
    activeTab: "outline",
    worldBackground: "",
    characters: [],
    outlineText: "",
    chapters: [],
    activeChapterIndex: 0,
    isWritingChapter: false,
    displayedText: "",
    isStreaming: false,
  }),

  // State Generator Engine (Procedural Vietnamese Novel Builder)
  generateNovelConfigDetails: () => {
    const { theme, style, prompt, chaptersCount } = get();
    const t = theme;
    const s = style;
    const p = prompt ? prompt.trim() : "";

    let novelName = "";
    let mainCharacter = "";
    let mcDescription = "";
    let sideCharacter1 = "";
    let sc1Description = "";
    let sideCharacter2 = "";
    let sc2Description = "";
    let worldName = "";
    let worldDesc = "";
    let chapterTitles = [];

    if (t === "Xuyên Không" && s.includes("Tu Tiên")) {
      novelName = "NGHỊCH LÝ VONG XUYÊN (THE OBLIVION PARADOX)";
      mainCharacter = "Lâm Khuyết";
      mcDescription = "Vốn là một chuyên gia giám định cổ vật và tâm lý học tội phạm ở hiện đại, bị xuyên không sau khi chạm vào bình cổ. Sử dụng tư duy logic cực cao, điềm tĩnh lạnh lùng để thăng cấp nghịch thiên cải mệnh.";
      sideCharacter1 = "Vân Nguyệt";
      sc1Description = "Truyền nhân duy nhất của Linh Ảnh Tông bị suy tàn, mang trọng trách phục hưng tông môn, tính cách quật cường.";
      sideCharacter2 = "Thánh Sư Vô Niệm";
      sc2Description = "Một tàn hồn ngủ say trong cổ vật, dẫn dắt Lâm Khuyết đi vào con đường tu đạo.";
      worldName = "VỰC THẲM TỊCH DIỆT (TIÊN GIỚI SUY TÀN)";
      worldDesc = "Một giới vực Tiên Hiệp cổ kính nhưng đầy ngột ngạt. Tại đây, linh khí không tự nhiên sinh ra mà phải được chiết xuất từ ký ức của tu sĩ thông qua Vong Xuyên tế thần. Kẻ bị cướp đoạt hết ký ức sẽ tan biến thành Xóa Sổ nhân vật, tạo nên ngân hàng linh khí ngầm.";

      chapterTitles = [
        "Bản Án Tử Hình Của Sự Quên Lãng",
        "Mượn Hồn Khởi Tử - Linh Ảnh Cổ Tông",
        "Tư Duy Giám Định: Phá Giải Trận Khởi Nguyên",
        "Tế Đàn Vong Xuyên Và Kẻ Thu Gom Ký Ức",
        "Lâm Khuyết Gặp Vân Nguyệt: Ước Hẹn Bên Bờ Tịch Diệt",
        "Nhất Bộ Đăng Tiên: Sự Trỗi Dậy Của Phế Hồn",
        "Hội Nghị Cửu Tông: Vạch Trần Kẻ Giấu Mặt",
        "Cấm Địa Ký Ức: Vượt Trội Hơn Thần Thông",
        "Trận Chiến Bảo Vệ Linh Ảnh Tông",
        "Khởi Đầu Một Nghịch Lý: Nghịch Thiên Cải Mệnh"
      ];
    } else if (t === "Trùng Sinh" && s.includes("Huyền Huyễn")) {
      novelName = "MA THẦN TRỞ LẠI: VƯƠNG TỌA HUYỀN BĂNG";
      mainCharacter = "Diệp Vô Cực";
      mcDescription = "Trọng sinh 500 năm trước khi tông môn bị diệt. Mang theo toàn bộ ký ức của Ma Đế Chí Tôn, quyết tâm trả thù và bảo vệ những người yêu thương.";
      sideCharacter1 = "Hạ Khuynh Thành";
      sc1Description = "Nữ đế tương lai của Tuyết Quốc, lạnh lùng như băng nhưng dành trọn tình cảm cho Diệp Vô Cực.";
      sideCharacter2 = "Tiêu Vân";
      sc2Description = "Hảo huynh đệ chí cốt, một luyện khí sư thiên tài tính tình sảng khoái.";
      worldName = "BĂNG THIÊN VỰC MẪU (THẦN GIỚI HOANG DÃ)";
      worldDesc = "Dị giới ma pháp huyền ảo quanh năm bao phủ bởi bão tuyết và ma pháp cổ xưa. Trọng tâm cốt truyện xoay quanh việc thắp sáng Băng Ấn Thiên Trụ để ngăn chặn Quỷ Vực tràn ngập.";

      chapterTitles = [
        "Hồn Về Năm Trăm Năm Trước - Khởi Đầu Trả Thù",
        "Huyết Mạch Thức Tỉnh: Chí Tôn Cực Hạn Băng",
        "Hạ Khuynh Thành - Gặp Gỡ Bên Suối Hàn Băng",
        "Phá Nát Âm Mưu: Vả Mặt Lục Trưởng Lão",
        "Tuyệt Thế Đan Dược: Luyện Khí Sư Tiêu Vân Gia Nhập",
        "Thức Tỉnh Băng Tinh Ma Binh",
        "Đại Chiến Phá Băng Sảnh",
        "Sứ Giả Quỷ Vực: Cuộc Gặp Trực Diện",
        "Thu Phục Cổ Long Băng Tộc",
        "Vương Tọa Trở Lại - Tuyết Quốc Xưng Thần"
      ];
    } else if (t === "Hệ Thống" && s.includes("Đô Thị")) {
      novelName = "SIÊU CẤP ĐẦU TƯ: HÀO MÔN THẦN HÀO KHAI CỤC";
      mainCharacter = "Trần Phong";
      mcDescription = "Sinh viên nghèo bất ngờ thức tỉnh Hệ thống Đầu tư Tối cao, nhìn thấy trước tỷ lệ sinh lời của mọi dự án trên thế giới.";
      sideCharacter1 = "Lâm Nhược Vy";
      sc1Description = "Tổng tài xinh đẹp lạnh lùng của tập đoàn Lâm Thị, đối tác kinh doanh thân thiết đầu tiên.";
      sideCharacter2 = "Đường Minh";
      sc2Description = "Vệ sĩ trung thành kiêm cựu đặc công tinh nhuệ, hỗ trợ các mặt đen tối của thương trường.";
      worldName = "ĐÔ THỊ HOA LỆ (SÓNG GIÓ THƯƠNG TRƯỜNG)";
      worldDesc = "Thế giới hiện đại phồn hoa đô thị nhưng ẩn chứa vô vàn cuộc đấu trí ngầm giữa các gia tộc tài phiệt. Tiền bạc, địa vị và công nghệ là vũ khí tối cao.";

      chapterTitles = [
        "Hệ Thống Thức Tỉnh: Thần Hào Khai Cục!",
        "Khoản Đầu Tư Đầu Tiên - Nhìn Thấy Tương Lai",
        "Gặp Gỡ Mỹ Nữ Tổng Tài Lâm Nhược Vy",
        "Vả Mặt Phú Nhị Đại Trực Diện",
        "Tập Đoàn Mới Thành Lập - Thu Phục Đường Minh",
        "Khủng Hoảng Tài Chính Lâm Thị: Trần Phong Ra Tay",
        "Lật Kèo Ngoạn Mục: Kiếm 10 Tỷ Đô Sau Một Đêm",
        "Hội Nghị Thương Nhân Đỉnh Cao Đô Thị",
        "Chiến Dịch Thâu Tóm Tập Đoàn Đối Thủ",
        "Vương Giả Thương Trường Đô Thị"
      ];
    } else {
      novelName = `ĐẾ VƯƠNG VÔ CỰC: BẢN HÙNG CA ${t.toUpperCase()} - ${s.toUpperCase()}`;
      mainCharacter = "Lục Vô Song";
      mcDescription = "Một chiến binh quả cảm mang ý chí sắc đá, dùng kiếm và trí tuệ phá giải mọi rào cản để đạt đỉnh phong thế giới.";
      sideCharacter1 = "Tuyết Kỳ";
      sc1Description = "Nữ kiếm khách bí ẩn mang mặt nạ bạc, hành tung xuất quỷ nhập thần.";
      sideCharacter2 = "Mộc Y Y";
      sc2Description = "Dược sư chữa trị hiền lành, sở hữu tri thức sâu rộng về độc dược cổ xưa.";
      worldName = `GIỚI VỰC ${t.toUpperCase()} - CỐT CÁCH ${s.toUpperCase()}`;
      worldDesc = `Một không gian giao thoa đặc trưng giữa các yếu tố sinh tồn hoang dã và thần thông viễn tưởng nguy nga. ${p ? "Context bổ sung: " + p : "Mọi quy tắc cũ bị đạp đổ, nhường chỗ cho trật tự sinh tồn khốc liệt."}`;

      chapterTitles = [
        "Điểm Khởi Đầu Khốc Liệt",
        "Gặp Gỡ Đồng Hành Bí Ẩn",
        "Thức Tỉnh Sức Mạnh Thượng Cổ",
        "Cạm Bẫy Trong Đêm Tối",
        "Khám Phá Di Tích Cấm Kỵ",
        "Chạm Trán Kẻ Săn Mồi Đỉnh Cao",
        "Phá Giải Phong Ấn Cổ Đại",
        "Đồng Minh Trở Mặt",
        "Quyết Chiến Trên Đỉnh Vạn Trượng",
        "Bình Minh Mới Của Không Gian Tác Phẩm"
      ];
    }

    let outlines = `📖 DÀN Ý KỊCH BẢN\n=======================\n\n`;
    outlines += `Chủ đề: **${t}**\n`;
    outlines += `Phong cách: **${s}**\n`;
    outlines += `Quy mô: **${chaptersCount} chương**\n`;
    if (p) outlines += `Ý tưởng đặc biệt: *"${p}"*\n`;
    outlines += `\n-----------------------\n\n`;
    outlines += `Chào bạn, với tư cách là Biên kịch chính AI, tôi đã tiếp nhận các chỉ thị của bạn. Để tạo ra một tác phẩm **${t} - ${s}** hoàn toàn mới lạ, đột phá và mang tính thị trường cực cao, tôi xin đề xuất concept kịch bản chi tiết dưới đây:\n\n`;
    outlines += `TÊN TRUYỆN: **${novelName}**\n\n`;
    outlines += `I. BỐI CẢNH THẾ GIỚI: **${worldName}**\n`;
    outlines += `> ${worldDesc}\n\n`;
    outlines += `II. DANH SÁCH NHÂN VẬT CHÍNH:\n`;
    outlines += `*   **${mainCharacter} (Main)**: ${mcDescription}\n`;
    outlines += `*   **${sideCharacter1}**: ${sc1Description}\n`;
    outlines += `*   **${sideCharacter2}**: ${sc2Description}\n\n`;
    outlines += `III. DANH SÁCH CHƯƠNG CHI TIẾT:\n`;

    const chapters = [];
    for (let i = 1; i <= chaptersCount; i++) {
      let chTitle = chapterTitles[(i - 1) % chapterTitles.length];
      if (i > chapterTitles.length) {
        chTitle = `Bí Mật Đằng Sau Kỷ Nguyên Số ${i}: Phá Giải Phong Ấn`;
      }

      outlines += `*   **Chương ${i}: ${chTitle}**\n`;
      outlines += `    *Ý chính:* Nhân vật chính đối mặt với thử thách giai đoạn ${i}, phối hợp cùng các đồng hành để thu thập linh lực và giải mã cốt truyện.\n`;

      chapters.push({
        number: i,
        title: `Số ${i}: ${chTitle}`,
        content: "",
        written: false
      });
    }

    set({
      novelTitle: novelName,
      worldBackground: worldDesc,
      characters: [
        { name: mainCharacter + " (Main)", desc: mcDescription },
        { name: sideCharacter1 + " (Đồng Hành)", desc: sc1Description },
        { name: sideCharacter2 + " (Hỗ Trợ)", desc: sc2Description }
      ],
      outlineText: outlines,
      chapters,
    });
  },

  // Streaming outline
  startOutlineGeneration: (onComplete) => {
    get().generateNovelConfigDetails();

    set({
      phase: 2,
      isGeneratingOutline: true,
      outlineGenerated: false,
      activeTab: "outline",
      displayedText: "",
      isStreaming: true,
    });

    const fullText = get().outlineText;
    const words = fullText.split(" ");
    let currentWordIndex = 0;

    const timer = setInterval(() => {
      if (currentWordIndex >= words.length) {
        clearInterval(timer);
        set({
          isGeneratingOutline: false,
          outlineGenerated: true,
          isStreaming: false,
        });
        if (onComplete) onComplete();
        return;
      }

      const partial = words.slice(0, currentWordIndex + 1).join(" ");
      set({ displayedText: partial });
      currentWordIndex += 2; // Stream 2 words at a time for snappiness
    }, 15);
  },

  // Write chapter content with streaming effect
  writeActiveChapter: (onComplete) => {
    const index = get().activeChapterIndex;
    const ch = get().chapters[index];
    if (!ch) return;

    set({
      isWritingChapter: true,
      activeTab: "chapters",
      displayedText: "",
      isStreaming: true,
    });

    const t = get().theme;
    const s = get().style;
    let content = "";

    if (t === "Xuyên Không" && s.includes("Tu Tiên")) {
      if (ch.number === 1) {
        content = `*Bóng tối không đặc quánh, nó lỏng và lạnh lẽo như nước đã tràn vào phổi.*

Lâm Khuyết mở mắt. Tầm nhìn của anh bị ngăn cách bởi một lớp tinh thể mờ đục. Anh không thể cử động, toàn thân cứng đờ như một khối thạch cao lâu ngày. Tai anh lùng bùng những tiếng tụng niệm trầm đục, nhịp nhàng nhưng mang theo một áp lực vô hình khiến lồng ngực muốn nổ tung.

*Đây không phải hiện trường vụ án. Đây cũng không phải phòng giám định.*

Lâm Khuyết cố gắng kích hoạt tư duy logic của một chuyên gia giám định cổ vật và tâm lý học tội phạm. Ký ức cuối cùng của anh là bình gốm cổ thời Thương vừa chạm vào tay tại viện bảo tàng, một luồng điện cực mạnh xẹt qua, và rồi... thế giới sụp đổ vào bóng tối.

“Giờ lành đã đến.” Một giọng nói khản đặc như tiếng hai thanh củi khô cọ vào nhau vang lên từ phía trên đỉnh đầu. “Tế phẩm đã sẵn sàng. Khai mở Vong Xuyên cấm thuật, hiến tế toàn bộ ký ức để giữ cho nguyên hồn Linh Ảnh Tông không bị thế giới xóa sổ!”

“Cái gì cơ?” Lâm Khuyết thầm nhủ, nhíu mày dữ dội.

Lớp pha lê trong suốt phía trên anh chậm rãi trượt ra phát ra tiếng rít rùng rợn. Không khí lạnh buốt tràn vào, mang theo mùi trầm hương nồng nặc đến nghẹt thở xen lẫn vị rát sét của máu tươi. Lâm Khuyết khó nhọc hé mắt nhìn. Đập vào mắt anh là một mái vòm đá cao vút, đầy rẫy những vết nứt sâu hoắm và những bức phù điêu cổ bị bào mòn bởi năm tháng đến mức không còn nhận dạng.

Hàng trăm người đang quỳ rạp bên dưới tế đàn đá khổng lồ. Họ mặc những bộ đạo bào rách nát mang biểu tượng Linh Ảnh Tông, gương mặt ai nấy đều trống rỗng, u sầu như những chiếc xác không hồn. Họ đang cầu nguyện một điều kỳ bí.

Lúc này, một vị đạo sĩ già với gương mặt nhăn nheo tựa vỏ cây, tay cầm một viên tinh thạch phát ra luồng sáng màu lam tiến lại gần Lâm Khuyết. Ông ta chính là Đại trưởng lão tông môn.

Lâm Khuyết biết mình phải hành động lập tức nếu không muốn bị biến thành kẻ ngốc không ký ức. Anh thầm ra lệnh kích hoạt tư duy giám định cổ vật sâu thẳm trong tiềm thức. Đột nhiên, viên tinh thạch màu lam trong tay lão đạo sĩ lập tức hiện lên một dòng chữ vàng óng giữa không trung mà chỉ anh thấy được:

*[VẬT THỂ: MÃ HỒN TINH CHẤT - HẠNG: HẠ PHẨM]*
*[TRẠNG THÁI: RẠN NỨT 45%, ĐANG TIÊU HAO CHƯA HOÀN THIỆN]*
*[ĐIỂM YẾU: TÂM KHỞI NGUYÊN GÓC 30 ĐỘ PHÍA DƯỚI]*

Khóe miệng Lâm Khuyết nhếch lên một nụ cười lạnh lùng. Nghịch lý bắt đầu từ đây!`;
      } else if (ch.number === 2) {
        content = `*Sự sống bắt nguồn từ cái chết, và sức mạnh được rèn giũa từ nỗi đau tuyệt vọng.*

Sau màn thoát hiểm ngoạn mục tại tế đàn Vong Xuyên bằng cách chỉ ra vết nứt chí mạng của Mã Hồn Tinh Chất, Lâm Khuyết chính thức giành được quyền sống sót. Tuy nhiên, anh phát hiện ra cơ thể mà mình đang chiếm hữu là một phế vật kinh mạch bế tắc hoàn toàn.

Vân Nguyệt, thiếu nữ kiên cường với thanh kiếm gãy đeo sau lưng, dẫn Lâm Khuyết đi vào sâu trong tàn tích Linh Ảnh Cổ Tông. Những bức tường đổ nát phủ đầy dây leo phát ra thứ ánh sáng lân tinh ma quái.

“Ngươi thực sự không nhớ gì sao?” Vân Nguyệt quay đầu lại, đôi mắt to tròn chứa đựng sự cảnh giác lẫn hy vọng dò xét anh. “Linh Ảnh Tông đã không còn tài nguyên. Nếu tháng sau Cửu Tông Đại Hội diễn ra mà chúng ta không cống nạp đủ Linh Thạch Ký Ức, tông môn sẽ bị các thế lực lớn nuốt chửng.”

Lâm Khuyết điềm tĩnh trả lời: “Ta không nhớ quá khứ, nhưng ta biết cách giúp cô tái cấu trúc lại Linh Trận cấm thuật này.”

Vừa nói, anh vừa chạm tay vào cột đá hộ tông bị nứt nẻ. Trong đầu anh, một giao diện số liệu phân tích rực sáng lập tức hiện ra. Cổ vật thời Thương vốn dĩ là chìa khóa khởi động cổ tự trận đồ này.

“Nào, hãy để ta chỉ cho cô thấy thế nào là tư duy giám định thực thụ.” Lâm Khuyết lạnh nhạt cười.`;
      } else {
        content = `*Cuộc chơi càng lớn, cái giá phải trả càng đắt đỏ. Nhưng đối với Lâm Khuyết, mọi rủi ro đều đã được tính toán.*

Tại chương này, Lâm Khuyết bắt đầu bộc lộ toàn bộ năng lực bá đạo của mình. Bằng việc giải mã cổ vật cấp Thượng Phẩm mà anh vô tình đào được tại khu vực cấm giới Vực Thẳm Tịch Diệt, toàn bộ giới tu sĩ chấn động.

Cốt truyện diễn tiến nhanh chóng khi các thế lực Cửu Tông phái người đến áp sát nhằm cướp đoạt bí mật của Linh Ảnh Tông. Nhưng họ không ngờ rằng, Lâm Khuyết đã biến toàn bộ khu vực cấm địa thành một mê cung trận đồ khổng lồ dựa trên nguyên lý cơ học hiện đại kết hợp ma pháp phù trận cổ xưa.

“Các ngươi muốn lấy cổ vật?” Lâm Khuyết đứng trên đỉnh điện thờ gió lốc thổi lồng lộng, vạt áo tung bay. “Được thôi, bước vào tế đàn và cược bằng toàn bộ tu vi của các ngươi!”

Sự hỗ trợ từ Vân Nguyệt cùng sức mạnh ẩn giấu của Thánh Sư Vô Niệm bắt đầu phát huy tối đa tác dụng, đẩy chương truyện lên cao trào đỉnh điểm.`;
      }
    } else if (t === "Trùng Sinh" && s.includes("Huyền Huyễn")) {
      content = `*Tiếng sấm vang rền chia đôi bầu trời lạnh buốt, Diệp Vô Cực đứng bật dậy giữa gian phòng gỗ giản dị của năm trăm năm trước.*

Ký ức về cuộc hủy diệt khốc liệt của Ma Đế vương triều vẫn hiển hiện chân thực như mới xảy ra ngày hôm qua. Vết sẹo linh hồn do Cửu Thiên Huyền Lôi đánh sâu vào nguyên thần vẫn nhức nhối. Nhưng nhìn lại đôi bàn tay thon gọn, kinh mạch tràn đầy sức sống tuổi trẻ, anh bật cười điên cuồng.

“Tông môn của ta... Hạ Khuynh Thành... Ta đã trở lại!”

Chương 1 mở đầu bằng cuộc chạm trán gay gắt ngay tại nội điện Tuyết Quốc giữa Diệp Vô Cực và kẻ thù truyền kiếp Lục Trưởng Lão - kẻ sau này sẽ bán đứng tông môn cho Quỷ Vực.

Bằng việc vận dụng vượt trội kinh nghiệm chiến đấu của một Ma Đế Chí Tôn, Diệp Vô Cực dễ dàng bẻ gãy mọi chiêu thức công kích của đối phương, giành lấy ngọn Băng Tinh Ma Kiếm đầu tiên, mở ra con đường bá chủ tuyệt đối.`;
    } else {
      content = `*Khi quy luật của thế giới cũ sụp đổ, kẻ mạnh nhất không phải là kẻ có nắm đấm to nhất, mà là kẻ thích nghi nhanh nhất.*

Lục Vô Song siết chặt thanh trọng kiếm trong tay. Bão tuyết vẫn gầm rú xung quanh, che khuất tầm nhìn nhưng không thể ngăn được linh giác bén nhạy của anh cảm nhận luồng sát khí cuồn cuộn đang áp sát từ phía sau rừng thông hoang dã.

“Y Y, lùi lại!” Anh hét lớn.

Mộc Y Y vội vã thối lui gật đầu, tay nâng hộp bảo dược phát ra hương thơm dịu nhẹ xoa dịu đi luồng áp lực đè nặng. Thanh kiếm của Tuyết Kỳ cũng lập tức tuốt vỏ ra kêu vang coong coong giòn giã.

Trận chiến tại chương này diễn ra vô cùng khốc liệt, mở màn cho chuỗi chiến thắng áp đảo của tổ đội Lục Vô Song chống lại các thế lực thù địch hung hãn đang cố bóp nghẹt họ giữa hoang dã mênh mông.`;
    }

    const words = content.split(" ");
    let currentWordIndex = 0;

    const timer = setInterval(() => {
      if (currentWordIndex >= words.length) {
        clearInterval(timer);

        // Save chapter state
        const updatedChapters = [...get().chapters];
        updatedChapters[index] = {
          ...ch,
          content,
          written: true
        };

        set({
          chapters: updatedChapters,
          isWritingChapter: false,
          isStreaming: false,
          displayedText: content
        });

        if (onComplete) onComplete();
        return;
      }

      const partial = words.slice(0, currentWordIndex + 1).join(" ");
      set({ displayedText: partial });
      currentWordIndex += 2;
    }, 15);
  },

  setActiveChapterIndex: (index) => set({ activeChapterIndex: index }),
  switchTab: (activeTab) => {
    const { isGeneratingOutline, isWritingChapter } = get();
    if (isGeneratingOutline || isWritingChapter) return;
    set({ activeTab });
  },

  selectChapter: (index) => {
    const { isGeneratingOutline, isWritingChapter, chapters } = get();
    if (isGeneratingOutline || isWritingChapter) return;

    const ch = chapters[index];
    set({
      activeChapterIndex: index,
      activeTab: "chapters",
      displayedText: ch && ch.written ? ch.content : ""
    });
  },

  navigateChapter: (direction) => {
    const { activeChapterIndex, chaptersCount, selectChapter } = get();
    const nextIdx = activeChapterIndex + direction;
    if (nextIdx >= 0 && nextIdx < chaptersCount) {
      selectChapter(nextIdx);
    }
  }
}));
