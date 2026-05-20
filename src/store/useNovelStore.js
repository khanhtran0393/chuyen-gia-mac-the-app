import { create } from 'zustand';

export const TROPHIC_WEB = {
  1: {
    name: "Tầng 1: Thực vật biến dị (Producer)",
    monsters: [
      { name: "Nhựa Độc Đinh Hương", cues: "Mùi mật ngọt lợ ngào ngạt, không khí lạnh buốt bất chợt, thân cây có dịch đen chảy" },
      { name: "Nấm Bào Tử Phát Quang", cues: "Bụi phấn màu lam lơ lửng, âm thanh tí tách nhỏ, mùi nấm mốc ẩm rữa" }
    ]
  },
  2: {
    name: "Tầng 2: Động vật ăn cỏ biến dị (Primary Consumer)",
    monsters: [
      { name: "Thỏ Tai Gai", cues: "Tiếng sột soạt cực nhanh trong cỏ bụi, mùi hôi hám của lông ướt, mặt đất rung nhẹ" },
      { name: "Lợn Rừng Bọc Thép", cues: "Tiếng thở hồng hộc nặng nề, tiếng ủi đất ầm ầm, mùi bùn tanh nồng" }
    ]
  },
  3: {
    name: "Tầng 3: Động vật ăn thịt biến dị (Secondary Consumer)",
    monsters: [
      { name: "Sói Xương Xám", cues: "Tiếng tru khàn khàn xa xăm, bóng xám di chuyển chập chờn, mùi máu tanh thoang thoảng" },
      { name: "Báo Bóng Tối", cues: "Không khí ngưng đọng tĩnh lặng, hai đốm sáng lục lập lòe, gió thổi lạnh sau gáy" }
    ]
  },
  4: {
    name: "Tầng 4: Kẻ săn mồi đỉnh cao (Apex Predator)",
    monsters: [
      { name: "Hổ Răng Kiếm Kim Loại", cues: "Tiếng gầm rung chuyển lồng ngực, mùi ozone khét lẹt, mặt đất chấn động nhịp nhàng" },
      { name: "Rồng Biển Axit", cues: "Tiếng xè xè ăn mòn đá, sương mù vàng nhạt bao phủ, mùi chua loét xộc vào mũi" }
    ]
  },
  5: {
    name: "Tầng 5: Ký sinh & Nấm rữa (Decomposer/Parasite)",
    monsters: [
      { name: "Ký Sinh Sợi Chỉ", cues: "Tiếng vo ve tần số cực thấp nhức tai, tơ trắng mảnh bay lơ lửng, ngứa ngáy da thịt" },
      { name: "Nấm Da Thối Rữa", cues: "Mùi xác thối rữa nồng nặc, bào tử màu xám nhạt bám đầy vách đá, độ ẩm tăng cao" }
    ]
  },
  6: {
    name: "Tầng 6: Thảm họa cơ khí (Cybernetic Aberration)",
    monsters: [
      { name: "Người Máy Rỉ Sét", cues: "Tiếng kim loại ma sát kèn kẹt, tia lửa điện xẹt nhẹ, mùi dầu máy khét lẹt" },
      { name: "Drone Săn Mồi Độc Lập", cues: "Tiếng rít gió tần số cao, ánh laser đỏ quét qua, tiếng động cơ servo rè rè" }
    ]
  },
  7: {
    name: "Tầng 7: Thực thể tâm linh (Psionic/Abyssal Entity)",
    monsters: [
      { name: "Bóng Ma Ký Ức", cues: "Tiếng thì thầm gọi tên mình, tầm nhìn bị nhòe và ảo ảnh mờ ảo, nhức đầu buốt nhói" },
      { name: "Thực Thể Sương Mù", cues: "Sương mù đen đặc hấp thụ ánh sáng, nhiệt độ giảm sâu âm độ, cảm giác bị dòm ngó" }
    ]
  },
  8: {
    name: "Tầng 8: Cổ thần ngoại tinh tú (Alien Deity/Ancient God)",
    monsters: [
      { name: "Cổ Thần Tinh Tú", cues: "Nhịp tim đập nặng nề từ hư không, trọng lực thay đổi đảo lộn, bầu trời biến dạng quang học" },
      { name: "Ý Chí Vực Thẳm", cues: "Âm thanh thủy tinh vỡ hàng loạt, ký ức bị đảo lộn liên tục, cảm giác rơi tự do" }
    ]
  }
};

export const FORBIDDEN_MOVES = [
  { minFatigue: 60, move: "Không thể nín thở bắn chính xác (tay run rẩy dữ dội)" },
  { minFatigue: 60, move: "Không thể bế/vác đồng đội chạy liên tục quá 50m" },
  { minFatigue: 80, move: "Không thể chạy bứt tốc nước rút quá 30m" },
  { minToxin: 60, move: "Không thể vận dụng tư duy phức tạp để giải mã cơ cấu, trận đồ" },
  { minToxin: 60, move: "Không thể tập trung linh lực bộc phát chiêu thức mà không ói máu" },
  { minToxin: 80, move: "Ngất lịm tạm thời nếu vận động quá mạnh trong 5 phút" }
];

export const useNovelStore = create((set, get) => {
  // Tránh lỗi SSR khi đọc localStorage
  const getStoredApiKeys = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('chuyen_gia_api_keys');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const getStoredProps = () => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('chuyen_gia_props') || "Bật lửa đồng, Bình nước vỏ sắt, Kính một tròng nứt";
      } catch (e) {
        return "Bật lửa đồng, Bình nước vỏ sắt, Kính một tròng nứt";
      }
    }
    return "Bật lửa đồng, Bình nước vỏ sắt, Kính một tròng nứt";
  };

  return {
    // Phase 1 Setup Config
    theme: "Sinh Tồn",
    style: "Mạt Thế",
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

    // ─── CÁC CẢI TIẾN TĂNG CƯỜNG TÍNH LOGIC CỨNG ───
    apiKeys: getStoredApiKeys(),
    activeApiKeyIndex: 0,
    rotationMessage: "",

    // 1. Somatic Feedback Loop
    fatigue: 20, // 0 - 100
    toxin: 10, // 0 - 100

    // 2. Genius Beat Structure
    geniusGoal: "",
    geniusConstraints: "",
    geniusPrep: "",
    geniusOps: "",
    geniusParadox: "",
    geniusCost: "",

    // 3. Radar Trophic Web 8 tầng động
    trophicLevel: 1,
    selectedMonster: "Nhựa Độc Đinh Hương",
    monsterCues: "Mùi mật ngọt lợ ngào ngạt, không khí lạnh buốt bất chợt, thân cây có dịch đen chảy",

    // 4. Word-Gate & Stamp-Weaving
    signatureProps: getStoredProps(),
    detectedProps: [], // Mảng các props tìm thấy
    wordCount: 0,
    wordGatePassed: false,
    stampWeavingPassed: false,
    minWordCount: 3910,
    maxWordCount: 4590,

    // 5. Survival Resources & Injury Tracker
    water: 100,
    food: 100,
    ammo: 6,
    cableTies: 10,
    injuries: [],

    // Actions
    setTheme: (theme) => set({ theme }),
    setStyle: (style) => set({ style }),
    setPrompt: (prompt) => set({ prompt }),
    setNovelTitle: (novelTitle) => set({ novelTitle }),
    
    setWater: (water) => set({ water }),
    setFood: (food) => set({ food }),
    setAmmo: (ammo) => set({ ammo }),
    setCableTies: (cableTies) => set({ cableTies }),
    
    addInjury: (injury) => set((state) => ({ 
      injuries: [...state.injuries, { id: Date.now(), ...injury }] 
    })),
    removeInjury: (id) => set((state) => ({ 
      injuries: state.injuries.filter(inj => inj.id !== id) 
    })),
    setInjuries: (injuries) => set({ injuries }),
    
    generateAIPrompt: () => {
      const names = ["Tiêu Hàn", "Thạch Dã", "Dạ Vô Cực", "Lục Phong", "Tề Lăng", "Mộ Dung Triệt", "Uất Trì Hoằng", "Khương Dịch", "Tần Mộ", "Lôi Chiến"];
      const defects = [
        "bị rách gân gót chân phải",
        "mù mắt trái do bụi phóng xạ",
        "liệt cánh tay trái sau một cuộc phục kích",
        "nứt 3 xương sườn số 4, 5, 6",
        "cụt ngón áp út trên tay bắn súng",
        "hỏng phế nang phổi phải gây hít thở khò khè",
        "tổn thương tủy sống khiến chân đi khập khiễng",
        "mất hoàn toàn thính giác bên tai phải"
      ];
      const locations = [
        "phế tích lò phản ứng hạt nhân Ninh Thuận cũ chứa sương vàng độc hại",
        "tàn tích ga tàu điện cũ dưới lòng đất ngập ngụa nước đen và nấm rữa",
        "hầm trú ẩn quân sự số 99 đổ sập nằm sâu dưới lòng cát sa mạc",
        "nhà máy hóa chất sinh học hoang phế có sương mù xanh lam bao phủ",
        "trạm rada quân sự bỏ hoang trên đỉnh Ba Vì gầm rú",
        "tàn tích viện nghiên cứu đột biến gen hoang tàn bị dây leo biến dị phủ kín",
        "bãi nghĩa địa xe bọc thép rỉ sét ở sa mạc muối trắng Ninh Hòa"
      ];
      const items = [
        "chiếc bật lửa đồng rỉ sét chứa ít xăng cặn",
        "bình nước vỏ sắt cũ kỹ móp méo",
        "chiếc kính một tròng nứt dọc che mắt mù",
        "la bàn cơ khí cổ lỗ có kim chỉ loạn xạ",
        "mặt nạ phòng độc rách một góc màng lọc",
        "bộ dây siết cáp nhựa tự chế dài 2 mét"
      ];
      const threats = [
        "sự lùng sục gắt gao của Drone Săn Mồi Độc Lập phát tia laser đỏ quét qua vách đá",
        "những xúc tu gai nhọn đầy chất dịch độc của Nhựa Độc Đinh Hương rủ xuống trần",
        "sự bám đuổi đói khát chập chờn của đàn Sói Xương Xám đột biến",
        "tiếng hồng hộc săn mồi đầy hung bạo của Lợn Rừng Bọc Thép ngoài cửa hầm",
        "tiếng vo ve tần số cực thấp nhức óc của bầy Ký Sinh Sợi Chỉ đang lơ lửng trong không khí"
      ];

      const name = names[Math.floor(Math.random() * names.length)];
      const defect = defects[Math.floor(Math.random() * defects.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const item = items[Math.floor(Math.random() * items.length)];
      const threat = threats[Math.floor(Math.random() * threats.length)];

      const generated = `${name} là một phàm nhân sinh tồn kiên cường nhưng ${defect}, hiện đang ẩn nấp đơn độc trong ${location}. Anh sở hữu ${item} và phải tìm mọi cách vượt qua ${threat} để thu thập tài nguyên nước sạch duy trì mạng sống.`;
      
      set({ prompt: generated });
    },

    syncStateJson: (text) => {
      if (!text) return text;
      
      const stateJsonMatch = text.match(/```(?:STATE_JSON|json)?\s*({\s*"fatigue"[\s\S]*?})\s*```/i) 
                          || text.match(/```STATE_JSON\s*([\s\S]*?)\s*```/i);
                          
      if (stateJsonMatch && stateJsonMatch[1]) {
        try {
          const data = JSON.parse(stateJsonMatch[1].trim());
          const updates = {};
          
          if (typeof data.fatigue === 'number') updates.fatigue = data.fatigue;
          if (typeof data.toxin === 'number') updates.toxin = data.toxin;
          if (typeof data.water === 'number') updates.water = data.water;
          if (typeof data.food === 'number') updates.food = data.food;
          if (typeof data.ammo === 'number') updates.ammo = data.ammo;
          if (typeof data.cableTies === 'number') updates.cableTies = data.cableTies;
          
          if (Array.isArray(data.injuries)) {
            updates.injuries = data.injuries.map((inj, idx) => ({ 
              id: Date.now() + idx, 
              part: inj.part || "Chưa rõ bộ phận", 
              pain: typeof inj.pain === 'number' ? inj.pain : 5, 
              consequence: inj.consequence || "Không rõ hậu quả" 
            }));
          }
          
          set(updates);
          return text.replace(stateJsonMatch[0], "").trim();
        } catch (e) {
          console.error("Lỗi giải mã STATE_JSON từ AI: ", e);
        }
      }
      return text;
    },
    
    // Setters cho các cải tiến mới
    setApiKeys: (keys) => {
      set({ apiKeys: keys, activeApiKeyIndex: 0 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('chuyen_gia_api_keys', JSON.stringify(keys));
      }
    },
    setFatigue: (fatigue) => set({ fatigue }),
    setToxin: (toxin) => set({ toxin }),
    
    setGeniusGoal: (geniusGoal) => set({ geniusGoal }),
    setGeniusConstraints: (geniusConstraints) => set({ geniusConstraints }),
    setGeniusPrep: (geniusPrep) => set({ geniusPrep }),
    setGeniusOps: (geniusOps) => set({ geniusOps }),
    setGeniusParadox: (geniusParadox) => set({ geniusParadox }),
    setGeniusCost: (geniusCost) => set({ geniusCost }),

    setMinWordCount: (minWordCount) => {
      set({ minWordCount });
      get().calculateWordCount(get().displayedText);
    },
    setMaxWordCount: (maxWordCount) => {
      set({ maxWordCount });
      get().calculateWordCount(get().displayedText);
    },

    setTrophicLevel: (level) => {
      const levelData = TROPHIC_WEB[level];
      if (levelData && levelData.monsters.length > 0) {
        const firstMonster = levelData.monsters[0];
        set({ 
          trophicLevel: level, 
          selectedMonster: firstMonster.name, 
          monsterCues: firstMonster.cues 
        });
      } else {
        set({ trophicLevel: level });
      }
    },

    setSelectedMonster: (monsterName) => {
      const level = get().trophicLevel;
      const monster = TROPHIC_WEB[level]?.monsters.find(m => m.name === monsterName);
      if (monster) {
        set({ selectedMonster: monsterName, monsterCues: monster.cues });
      } else {
        set({ selectedMonster: monsterName });
      }
    },

    setSignatureProps: (propsStr) => {
      set({ signatureProps: propsStr });
      if (typeof window !== 'undefined') {
        localStorage.setItem('chuyen_gia_props', propsStr);
      }
      // Re-scan current content immediately if it exists
      get().scanSignatureProps(get().displayedText);
    },

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
      rotationMessage: "",
      fatigue: 20,
      toxin: 10,
      geniusGoal: "",
      geniusConstraints: "",
      geniusPrep: "",
      geniusOps: "",
      geniusParadox: "",
      geniusCost: "",
      trophicLevel: 1,
      selectedMonster: "Nhựa Độc Đinh Hương",
      monsterCues: "Mùi mật ngọt lợ ngào ngạt, không khí lạnh buốt bất chợt, thân cây có dịch đen chảy",
      detectedProps: [],
      wordCount: 0,
      wordGatePassed: false,
      stampWeavingPassed: false,
      minWordCount: 3910,
      maxWordCount: 4590,
      water: 100,
      food: 100,
      ammo: 6,
      cableTies: 10,
      injuries: [],
    }),

    // Quét tìm vật dụng chữ ký trong văn bản sinh ra
    scanSignatureProps: (text) => {
      if (!text) {
        set({ detectedProps: [], stampWeavingPassed: false });
        return;
      }
      const propsStr = get().signatureProps;
      if (!propsStr.trim()) {
        set({ detectedProps: [], stampWeavingPassed: true });
        return;
      }

      const props = propsStr.split(',').map(p => p.trim()).filter(Boolean);
      const detected = [];
      
      props.forEach(p => {
        // Tạo regex không phân biệt hoa thường để tìm prop
        const escaped = p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        if (regex.test(text)) {
          detected.push(p);
        }
      });

      set({
        detectedProps: detected,
        stampWeavingPassed: props.length > 0 && detected.length === props.length
      });
    },

    // Tính toán số từ tiếng Việt
    calculateWordCount: (text) => {
      if (!text) {
        set({ wordCount: 0, wordGatePassed: false });
        return 0;
      }
      // Đếm số khoảng trắng để ước lượng từ tiếng Việt
      const cleanText = text.trim().replace(/\s+/g, ' ');
      const words = cleanText ? cleanText.split(' ') : [];
      const count = words.length;

      // Cổng từ cứng: 3910 - 4590 từ
      // Để trải nghiệm người dùng thực tế không phải chờ quá lâu cho 4000 từ thật (mất 5 phút streaming),
      // chúng ta sẽ đếm thực tế nhưng hiển thị hệ số tỷ lệ đếm từ kịch bản hoặc cho phép đạt chuẩn
      // dựa trên điều kiện của Prompt. Trong code này, ta sẽ kiểm tra xem số từ thực tế có nằm trong
      // khoảng 3910 - 4590 từ hay không, hoặc nếu người dùng muốn mô phỏng kịch bản chuẩn, chúng ta
      // nhân hệ số hiển thị hoặc tính số từ thực tế. Hãy đếm từ thực tế và kiểm tra!
      const passed = count >= get().minWordCount && count <= get().maxWordCount;

      set({
        wordCount: count,
        wordGatePassed: passed
      });
      return count;
    },

    // Gọi API Generate sử dụng cơ chế xoay vòng chìa khóa API
    callGenerateAPI: async (requestBody, onChunk, onError) => {
      const keys = get().apiKeys || [];
      let startIndex = get().activeApiKeyIndex;
      let attempts = 0;
      const totalKeys = keys.length;

      // Số lượt thử tối đa: bằng số lượng keys hoặc 1 nếu không có keys (sử dụng server key mặc định)
      const maxAttempts = totalKeys > 0 ? totalKeys : 1;

      while (attempts < maxAttempts) {
        const currentIdx = (startIndex + attempts) % (totalKeys || 1);
        const apiKey = totalKeys > 0 ? keys[currentIdx] : "";

        if (totalKeys > 0) {
          set({ 
            activeApiKeyIndex: currentIdx, 
            rotationMessage: `Sử dụng API Key dự phòng #${currentIdx + 1}...` 
          });
        } else {
          set({ rotationMessage: "Sử dụng API Key máy chủ mặc định..." });
        }

        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...requestBody,
              apiKey: apiKey
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error || `HTTP error ${res.status}`;
            
            // Nếu lỗi quota (429) hoặc lỗi xác thực và chúng ta còn key dự phòng, hãy xoay key!
            if ((res.status === 429 || res.status === 400 || res.status === 500) && totalKeys > 1 && attempts < totalKeys - 1) {
              console.warn(`API Key #${currentIdx + 1} lỗi: ${errMsg}. Đang xoay sang key kế tiếp...`);
              attempts++;
              continue;
            }
            throw new Error(errMsg);
          }

          // Fetch thành công, xử lý stream trả về
          set({ rotationMessage: "" });
          return res; // Trả về response để đọc stream

        } catch (error) {
          if (totalKeys > 1 && attempts < totalKeys - 1) {
            console.warn(`Thử thất bại với API Key #${currentIdx + 1}. Lỗi: ${error.message}. Đang xoay key...`);
            attempts++;
            continue;
          }
          // Hết key dự phòng hoặc lỗi không thể tự xoay
          set({ rotationMessage: "" });
          onError(error);
          return null;
        }
      }

      set({ rotationMessage: "" });
      onError(new Error("Tất cả các API Keys trong danh sách xoay vòng đều bị từ chối hoặc hết quota."));
      return null;
    },

    // Khởi tạo kịch bản / Sinh dàn ý chính thức qua AI
    startOutlineGeneration: async () => {
      const { theme, style, prompt, chaptersCount, callGenerateAPI, scanSignatureProps, calculateWordCount } = get();
      
      set({
        phase: 2,
        isGeneratingOutline: true,
        outlineGenerated: false,
        activeTab: "outline",
        displayedText: "Đang phân tích hệ sinh thái và khởi tạo dàn ý kịch bản mạt thế...",
        isStreaming: true,
      });

      const requestBody = {
        requestType: "INITIAL_PACKAGE",
        config: {
          chủ_đề: theme,
          phong_cách: style,
          mô_tả: prompt,
          số_chương: chaptersCount
        }
      };

      const res = await callGenerateAPI(
        requestBody,
        null,
        (err) => {
          alert(`Lỗi sinh dàn ý kịch bản: ${err.message}`);
          set({
            isGeneratingOutline: false,
            isStreaming: false,
            phase: 1
          });
        }
      );

      if (!res) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      
      try {
        set({ displayedText: "" });
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          accumulatedText += chunk;
          set({ displayedText: accumulatedText });
        }

        // Đồng bộ và bóc tách khối STATE_JSON nếu có
        const cleanedText = get().syncStateJson(accumulatedText);

        // Tự động phân tích các thông số từ Dàn Ý được sinh ra để cập nhật Title và nhân vật
        let novelName = "NGHỊCH LÝ VONG XUYÊN";
        const titleMatch = cleanedText.match(/(?:TÊN TRUYỆN|TÊN KỊCH BẢN|Tên tác phẩm):\s*\*\*?([^\*\n]+)\*\*?/i);
        if (titleMatch && titleMatch[1]) {
          novelName = titleMatch[1].trim();
        }

        // Tạo sẵn các chương trống dựa trên chaptersCount để viết chi tiết
        const chapters = [];
        for (let i = 1; i <= chaptersCount; i++) {
          chapters.push({
            number: i,
            title: `Chương ${i}: Kịch Bản Phân Phối Chi Tiết #${i}`,
            content: "",
            written: false
          });
        }

        set({
          novelTitle: novelName,
          worldBackground: `Hệ sinh thái bối cảnh mạt thế ${theme} kết hợp phong cách ${style}.`,
          characters: [
            { name: "Phàm Nhân (Main)", desc: "Nhân vật chính sinh tồn bằng logic sắt đá, thể chất suy kiệt." },
            { name: "Đồng Hành Chí Cốt", desc: "Hỗ trợ tác chiến vật lý và cung cấp vật tư hậu cần." },
            { name: "Thực Thể Săn Mồi", desc: "Quái vật thuộc tầng sinh thái đang ẩn nấp trong khu vực." }
          ],
          outlineText: cleanedText,
          displayedText: cleanedText,
          chapters,
          isGeneratingOutline: false,
          outlineGenerated: true,
          isStreaming: false
        });

      } catch (err) {
        console.error("Lỗi đọc stream dàn ý: ", err);
        set({
          isGeneratingOutline: false,
          isStreaming: false
        });
      }
    },

    // Viết chi tiết chương truyện bám sát Hard Logic Filter
    writeActiveChapter: async () => {
      const { 
        activeChapterIndex, chapters, theme, style,
        fatigue, toxin, water, food, ammo, cableTies, injuries,
        geniusGoal, geniusConstraints, geniusPrep, geniusOps, geniusParadox, geniusCost,
        trophicLevel, selectedMonster, monsterCues,
        signatureProps,
        callGenerateAPI,
        scanSignatureProps,
        calculateWordCount
      } = get();

      const ch = chapters[activeChapterIndex];
      if (!ch) return;

      set({
        isWritingChapter: true,
        activeTab: "chapters",
        displayedText: `Đang lập chỉ mục logic... Thiết lập bộ lọc somatic (${fatigue}% fatigue, ${toxin}% toxin)... Đang nhắm mục tiêu quái vật tầng ${trophicLevel}...`,
        isStreaming: true,
      });

      // Lọc danh sách hành vi bị cấm dựa trên chỉ số hiện tại (>60%)
      const forbidden = FORBIDDEN_MOVES.filter(m => {
        if (m.minFatigue && fatigue >= m.minFatigue) return true;
        if (m.minToxin && toxin >= m.minToxin) return true;
        return false;
      }).map(m => m.move);

      // Thêm chấn thương vật lý từ Injury Tracker vào Forbidden Moves
      injuries.forEach(inj => {
        forbidden.push(`Bị thương ở ${inj.part} (Độ đau ${inj.pain}/10): ${inj.consequence}`);
      });

      const requestBody = {
        requestType: "WRITE_CHAPTER",
        selectedChapter: ch.number,
        config: {
          chủ_đề: theme,
          phong_cách: style,
          số_chương: chapters.length,
          minWordCount: get().minWordCount || 3910,
          maxWordCount: get().maxWordCount || 4590
        },
        stateJSON: {
          fatigue,
          toxin,
          forbiddenMoves: forbidden,
          trophicLevel,
          selectedMonster,
          monsterCues,
          water,
          food,
          ammo,
          cableTies,
          injuries: injuries.map(inj => ({ part: inj.part, pain: inj.pain, consequence: inj.consequence }))
        },
        geniusBeat: {
          goal: geniusGoal,
          constraints: geniusConstraints,
          prep: geniusPrep,
          ops: geniusOps,
          paradox: geniusParadox,
          cost: geniusCost
        },
        signatureProps: signatureProps
      };

      const res = await callGenerateAPI(
        requestBody,
        null,
        (err) => {
          alert(`Lỗi sinh nội dung chương: ${err.message}`);
          set({
            isWritingChapter: false,
            isStreaming: false
          });
        }
      );

      if (!res) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      try {
        set({ displayedText: "" });
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          accumulatedText += chunk;
          
          set({ displayedText: accumulatedText });
          
          // Quét và cập nhật số từ/props thời gian thực khi đang stream
          scanSignatureProps(accumulatedText);
          calculateWordCount(accumulatedText);
        }

        // Cập nhật trạng thái chương đã viết xong sau khi bóc tách STATE_JSON
        const cleanedText = get().syncStateJson(accumulatedText);

        const updatedChapters = [...chapters];
        updatedChapters[activeChapterIndex] = {
          ...ch,
          content: cleanedText,
          written: true
        };

        set({
          displayedText: cleanedText,
          chapters: updatedChapters,
          isWritingChapter: false,
          isStreaming: false
        });

        // Cập nhật số lượng từ và props dựa trên văn bản đã làm sạch
        scanSignatureProps(cleanedText);
        calculateWordCount(cleanedText);

      } catch (err) {
        console.error("Lỗi đọc stream chương truyện: ", err);
        set({
          isWritingChapter: false,
          isStreaming: false
        });
      }
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
      const content = ch && ch.written ? ch.content : "";
      set({
        activeChapterIndex: index,
        activeTab: "chapters",
        displayedText: content
      });
      // Quét ngay props và số từ của chương được chọn
      get().scanSignatureProps(content);
      get().calculateWordCount(content);
    },

    navigateChapter: (direction) => {
      const { activeChapterIndex, chapters, selectChapter } = get();
      const nextIdx = activeChapterIndex + direction;
      if (nextIdx >= 0 && nextIdx < chapters.length) {
        selectChapter(nextIdx);
      }
    }
  };
});
