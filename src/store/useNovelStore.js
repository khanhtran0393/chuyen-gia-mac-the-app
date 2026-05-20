import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useNovelStore = create(
  persist(
    (set, get) => {
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

  const getStoredMockMode = () => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('chuyen_gia_use_mock') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  return {
    // Phase 1 Setup Config
    theme: "Sinh Tồn",
    style: "Mạt Thế",
    prompt: "",
    chaptersCount: 10,

    // Pipeline State
    pipelineStep: 1, // 1: Ý Tưởng, 2: Dàn Ý, 3: Nhân Vật, 4: Kịch Bản
    outlineBranches: ["", "", ""],
    activeOutlineBranch: 0,
    selectedBranchGenerated: [false, false, false],
    isExtractingCharacters: false,
    charactersExtracted: false,
    useMock: getStoredMockMode(),
    scratchpad: "",

    // Phase 2 Workspace Content State
    phase: 1, // 1 or 2
    novelTitle: "",
    isGeneratingOutline: false,
    outlineGenerated: false,
    activeTab: "outline", // 'outline' | 'chapters'

    // Core Data
    worldBackground: "",
    characters: [], // Old compatibility array
    outlineText: "", // Old compatibility text
    chapters: [], // Old compatibility array

    // Structured Data (Tiếng Việt)
    dan_y_tong_the: { mo_dau: "", cao_trao: "", ket_thuc: "" },
    danh_sach_nhan_vat: [],
    danh_muc_chuong: [],

    // 3 Tiers of Memory
    lorebook_the_gioi: {
      quy_tac_sinh_ton: [
        "Không được nín thở quá 20s",
        "Quái T4 phản ứng với kim loại",
        "Không ăn nấm bào tử lam khi chưa sấy khô",
        "Drone săn mồi đổi nhịp quét laser mỗi 5 giây"
      ],
      dia_diem_da_mo_khoa: [
        "Trạm phát sóng hỏng",
        "Rãnh xả kiềm",
        "Ga tàu điện cũ dưới lòng đất"
      ]
    },
    bo_nho_nhan_vat: [
      {
        ten: "Tiêu Hàn",
        tinh_trang_hien_tai: "Liệt hoàn toàn cánh tay trái do sương vàng ăn mòn",
        vat_dung_dang_mang: ["Bật lửa đồng", "Bình nước vỏ sắt móp méo", "Kính một tròng nứt"]
      },
      {
        ten: "Thạch Dã",
        tinh_trang_hien_tai: "Bị rách gân gót chân phải đi khập khiễng",
        vat_dung_dang_mang: ["La bàn cơ khí", "Bộ dây siết cáp nhựa 2 mét"]
      }
    ],
    tom_tat_cuon_chieu: "Khởi đầu cuộc hành trình sinh tồn mạt thế khốc liệt.",
    chuong_gan_nhat: [],
    isCommittingMemory: false,

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
      
      const stateJsonMatch = text.match(/```(?:STATE_JSON|json)?\s*({\s*"(?:fatigue|con_tro|dan_y_tong_the|danh_sach_nhan_vat|danh_muc_chuong|lorebook_the_gioi|bo_nho_nhan_vat|tom_tat_cuon_chieu|chuong_gan_nhat)"[\s\S]*?})\s*```/i) 
                          || text.match(/```STATE_JSON\s*([\s\S]*?)\s*```/i);
                          
      if (stateJsonMatch && stateJsonMatch[1]) {
        try {
          const data = JSON.parse(stateJsonMatch[1].trim());
          const updates = {};
          
          // --- HỖ TRỢ ĐỊNH DẠNG TIẾNG VIỆT MỚI (STORY MEMORY & RAG) ---
          if (data.lorebook_the_gioi) {
            updates.lorebook_the_gioi = data.lorebook_the_gioi;
          }
          if (data.bo_nho_nhan_vat) {
            updates.bo_nho_nhan_vat = data.bo_nho_nhan_vat;
          }
          if (typeof data.tom_tat_cuon_chieu === 'string') {
            updates.tom_tat_cuon_chieu = data.tom_tat_cuon_chieu;
          }
          if (Array.isArray(data.chuong_gan_nhat)) {
            updates.chuong_gan_nhat = data.chuong_gan_nhat;
          }

          if (data.con_tro) {
            if (typeof data.con_tro.chuong_hien_tai === 'number') {
              updates.activeChapterIndex = data.con_tro.chuong_hien_tai - 1;
            }
          }
          if (data.dan_y_tong_the) {
            updates.dan_y_tong_the = data.dan_y_tong_the;
          }
          if (Array.isArray(data.danh_sach_nhan_vat)) {
            updates.danh_sach_nhan_vat = data.danh_sach_nhan_vat;
          }
          if (Array.isArray(data.danh_muc_chuong)) {
            const currentList = get().danh_muc_chuong || [];
            updates.danh_muc_chuong = data.danh_muc_chuong.map((ch, idx) => {
              const existing = currentList.find(c => c.so_chuong === ch.so_chuong) || currentList[idx] || {};
              return {
                ...existing,
                ...ch,
                noi_dung_kich_ban: ch.noi_dung_kich_ban || existing.noi_dung_kich_ban || "",
                da_viet: ch.da_viet !== undefined ? ch.da_viet : (existing.da_viet || false)
              };
            });
            // Đồng bộ ngược sang chapters compatibility array
            updates.chapters = updates.danh_muc_chuong.map(ch => ({
              number: ch.so_chuong,
              title: ch.tieu_de,
              content: ch.noi_dung_kich_ban || "",
              written: ch.da_viet || false
            }));
          }

          // --- HỖ TRỢ ĐỊNH DẠNG TIẾNG ANH CŨ (SOMATIC COMPATIBILITY) ---
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

    // Pipeline Navigation Actions
    setPipelineStep: (step) => set({ pipelineStep: step }),
    setActiveOutlineBranch: (idx) => set({ activeOutlineBranch: idx }),
    setScratchpad: (scratchpad) => set({ scratchpad }),
    setUseMock: (useMock) => {
      set({ useMock });
      if (typeof window !== 'undefined') {
        localStorage.setItem('chuyen_gia_use_mock', useMock ? 'true' : 'false');
      }
    },

    simulateMockOutlineStream: async (branchIndex) => {
      const mockOutlines = [
        // Nhánh 1
`# DÀN Ý CHI TIẾT - NHÁNH 1: ĐƯỜNG NGẦM PHÓNG XẠ (GIẢ LẬP)

## 1. Bối cảnh Thế giới
Thế giới hoang tàn sau thảm họa hạt nhân. Sương phóng xạ vàng bao phủ mặt đất, biến các sinh vật thành thực thể dị biến.

## 2. Cấu trúc 3 hồi
* **Mở đầu**: Tiêu Hàn, một phàm nhân bị liệt tay trái, đang nấp trong ga tàu điện ngầm bỏ hoang để tránh sương độc và tìm nguồn nước sạch sinh tồn.
* **Cao trào**: Anh chạm trán với Nhựa Độc Đinh Hương đang rủ xuống từ trần ga tàu. Thể chất suy kiệt và sương độc tràn vào ép anh phải đưa ra các quyết định chiến thuật vật lý bằng tay phải duy nhất.
* **Kết thúc**: Tiêu Hàn thành công dùng bộ dây siết cáp nhựa và bật lửa đồng rỉ sét kích nổ một turbine máy phát điện cũ, đánh lạc hướng drone săn mồi và chạy thoát ra ngoài.

\`\`\`STATE_JSON
{
  "dan_y_tong_the": {
    "mo_dau": "Tiêu Hàn, phàm nhân liệt tay trái, nấp trong ga tàu điện ngầm hoang phế tránh sương độc và tìm nước.",
    "cao_trao": "Chạm trán Nhựa Độc Đinh Hương rủ từ trần hầm, dùng bẫy cơ học để lừa gạt quái vật.",
    "ket_thuc": "Kích nổ turbine cũ bằng bật lửa đồng rỉ sét để tiêu diệt drone săn mồi và thoát ra ngoài."
  },
  "danh_muc_chuong": [
    {
      "so_chuong": 1,
      "tieu_de": "Chương 1: Sương Vàng Rỉ Sét",
      "tom_tat_su_kien": "Tiêu Hàn vượt qua tầm quét của Drone săn mồi để tìm kiếm bình nước sạch trong ga tàu hoang phế.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    },
    {
      "so_chuong": 2,
      "tieu_de": "Chương 2: Nhựa Độc Đinh Hương",
      "tom_tat_su_kien": "Main đụng độ quái vật rủ xuống từ trần ga tàu và buộc phải di chuyển khập khiễng để đặt bẫy lửa.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    },
    {
      "so_chuong": 3,
      "tieu_de": "Chương 3: Cáp Nhựa Và Lửa Đồng",
      "tom_tat_su_kien": "Sử dụng dây siết cáp nhựa bẫy chân quái vật và dùng bật lửa đồng rỉ sét để phóng hỏa thiêu rụi xúc tu.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    }
  ]
}
\`\`\``,
        // Nhánh 2
`# DÀN Ý CHI TIẾT - NHÁNH 2: NHÀ MÁY BỎ HOANG (GIẢ LẬP)

## 1. Bối cảnh Thế giới
Nhà máy hóa chất sinh học hoang phế bị dây leo biến dị bao phủ kín kẽ. Sương mù xanh lam độc hại bao trùm các lò phản ứng cũ.

## 2. Cấu Trúc 3 Hồi
* **Mở đầu**: Tiêu Hàn phát hiện ra một trạm tiếp tế lương thực tự động vẫn còn hoạt động bên trong khu lọc dầu của nhà máy hóa chất bỏ hoang.
* **Cao trào**: Đàn Sói Xương Xám đột biến bao vây bên ngoài các cửa thoát khí. Anh phải thiết kế một bẫy trọng lực cơ học bằng cách treo các thùng phuy rỉ sét chứa axit.
* **Kết thúc**: Dùng bật lửa đồng kích hỏa dây dẫn, làm đổ sập thùng phuy axit thiêu cháy đàn sói và thoát ra phế tích rada.

\`\`\`STATE_JSON
{
  "dan_y_tong_the": {
    "mo_dau": "Tiêu Hàn phát hiện trạm tiếp tế tự động hoạt động bên trong khu lọc dầu nhà máy hóa chất bỏ hoang.",
    "cao_trao": "Đàn Sói Xương Xám bao vây cửa thoát khí, đặt bẫy trọng lực cơ học bằng thùng phuy axit.",
    "ket_thuc": "Dùng bật lửa đồng kích hỏa đốt dây, sập thùng axit tiêu diệt sói biến dị và rút lui."
  },
  "danh_muc_chuong": [
    {
      "so_chuong": 1,
      "tieu_de": "Chương 1: Khu Lọc Dầu Chết Chóc",
      "tom_tat_su_kien": "Tiêu Hàn lẻn vào trạm tiếp tế và phải ẩn nấp sau các turbine rỉ sét để tránh sói xương xám.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    },
    {
      "so_chuong": 2,
      "tieu_de": "Chương 2: Bẫy Trọng Lực Thùng Axit",
      "tom_tat_su_kien": "Tiêu Hàn thiết kế hệ thống bẫy ròng rọc cơ học treo thùng phuy axit rách bằng tay phải cực kỳ vất vả.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    },
    {
      "so_chuong": 3,
      "tieu_de": "Chương 3: Tiếng Lửa Trên Dây Dẫn",
      "tom_tat_su_kien": "Main bật lửa đồng rỉ sét đốt đứt dây treo bẫy axit, dội thẳng vào đàn sói đang vồ đến cửa thoát khí.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    }
  ]
}
\`\`\``,
        // Nhánh 3
`# DÀN Ý CHI TIẾT - NHÁNH 3: TRẠM RADA BA VÌ (GIẢ LẬP)

## 1. Bối cảnh Thế giới
Trạm rada quân sự bỏ hoang trên đỉnh Ba Vì đầy gió rít buốt giá. Drone săn mồi cơ khí độc lập liên tục tuần tiễu xung quanh vách đá.

## 2. Cấu Trúc 3 Hồi
* **Mở đầu**: Tiêu Hàn bò lên đỉnh vách đá trạm rada để tìm kiếm pin sạc cho bộ đàm khẩn cấp của mình.
* **Cao trào**: Bão cát phóng xạ ập đến, che khuất tầm nhìn nhưng lại làm tăng độ nhạy quét laser của Drone săn mồi. Anh phải vận dụng Tactical IQ để tính toán nhịp gió lừa drone.
* **Kết thúc**: Sử dụng bình nước sắt ném đập vào cột ăng-ten sắt rỉ tạo tiếng vang phản xạ, dụ drone lao đầu vào cánh quạt gió bị chém đứt làm đôi.

\`\`\`STATE_JSON
{
  "dan_y_tong_the": {
    "mo_dau": "Tiêu Hàn bò lên trạm rada đỉnh Ba Vì tìm pin sạc bộ đàm trong thời tiết gió rít phóng xạ buốt giá.",
    "cao_trao": "Bão cát ập đến, drone săn mồi tăng quét laser đỏ, main vận dụng Tactical IQ để tính toán ẩn nấp.",
    "ket_thuc": "Ném bình nước sắt vào ăng-ten tạo âm vang phản xạ dụ drone va đứt vào tuabin quạt gió."
  },
  "danh_muc_chuong": [
    {
      "so_chuong": 1,
      "tieu_de": "Chương 1: Đỉnh Đá Gió Rít",
      "tom_tat_su_kien": "Tiêu Hàn vượt qua dốc đá trơn trượt bằng một tay bám đá, tay kia giữ chặt bình nước sắt sinh tồn.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    },
    {
      "so_chuong": 2,
      "tieu_de": "Chương 2: Nhịp Quét Tia Laser Đỏ",
      "tom_tat_su_kien": "Bão cát ập tới, tia laser đỏ của drone săn mồi rà quét sát vạt áo khoác mủn nát của main.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    },
    {
      "so_chuong": 3,
      "tieu_de": "Chương 3: Tiếng Vang Sắt Rỉ",
      "tom_tat_su_kien": "Búng mạnh bình nước sắt vỏ móp đập vào cột thu lôi tạo tiếng chuông vang dội, bẫy drone tự sát cơ học.",
      "noi_dung_kich_ban": "",
      "da_viet": false
    }
  ]
}
\`\`\``
      ];

      const fullText = mockOutlines[branchIndex] || mockOutlines[0];
      const chunks = [];
      for (let i = 0; i < fullText.length; i += 40) {
        chunks.push(fullText.substring(i, i + 40));
      }

      let idx = 0;
      set({ displayedText: "" });

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (idx < chunks.length) {
            const nextChunk = chunks[idx];
            const currentText = get().displayedText + nextChunk;
            set({ displayedText: currentText });
            
            const branches = [...get().outlineBranches];
            branches[branchIndex] = currentText;
            set({ outlineBranches: branches });
            
            idx++;
          } else {
            clearInterval(interval);
            
            const finalFullText = get().displayedText;
            const cleanedText = get().syncStateJson(finalFullText);
            
            const branches = [...get().outlineBranches];
            branches[branchIndex] = cleanedText;
            
            const branchGen = [...get().selectedBranchGenerated];
            branchGen[branchIndex] = true;
            
            set({
              novelTitle: "NGHỊCH LÝ VONG XUYÊN (GIẢ LẬP)",
              outlineBranches: branches,
              selectedBranchGenerated: branchGen,
              displayedText: cleanedText,
              isGeneratingOutline: false,
              isStreaming: false,
            });
            resolve(true);
          }
        }, 15);
      });
    },

    simulateMockCharactersStream: async () => {
      const fullText = `# HỒ SƠ NHÂN VẬT TRÍCH XUẤT TỪ DÀN Ý (GIẢ LẬP)

Dưới đây là hồ sơ nhân vật tĩnh đã được bóc tách tự động từ Dàn ý chi tiết để khóa cứng tính liên tục cốt truyện:

1. **Tiêu Hàn (Main)**: Phàm nhân sinh tồn kiên cường, bị liệt tay trái, tư duy Tactical IQ cực cao.
2. **Thạch Dã**: Đồng đội trầm tính, bị chấn thương rách gân gót chân đi khập khiễng, mang theo bộ cáp nhựa sinh tồn.

\`\`\`STATE_JSON
{
  "danh_sach_nhan_vat": [
    {
      "ten": "Tiêu Hàn",
      "dac_diem": "Phàm nhân sinh tồn kiên cường, liệt hoàn toàn tay trái do sương vàng ăn mòn, tư duy Tactical IQ cực cao.",
      "vat_dung_ky_nhan": "Bật lửa đồng rỉ sét, Bình nước vỏ sắt móp méo",
      "muc_tieu": "Tìm kiếm nước sạch và cứu thoát đồng đội khỏi phế tích ga tàu.",
      "noi_so": "Drone săn mồi cơ khí quét laser đỏ"
    },
    {
      "ten": "Thạch Dã",
      "dac_diem": "Đồng hành trầm tính, bị rách gân gót chân phải đi khập khiễng, chịu đau cực giỏi.",
      "vat_dung_ky_nhan": "La bàn cơ khí cổ, Bộ dây siết cáp nhựa 2 mét",
      "muc_tieu": "Hỗ trợ Tiêu Hàn sửa chữa turbine phát điện.",
      "noi_so": "Bào tử Nhựa Độc Đinh Hương ăn mòn da thịt"
    }
  ]
}
\`\`\``;

      const chunks = [];
      for (let i = 0; i < fullText.length; i += 40) {
        chunks.push(fullText.substring(i, i + 40));
      }

      let idx = 0;
      set({ displayedText: "" });

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (idx < chunks.length) {
            const nextChunk = chunks[idx];
            const currentText = get().displayedText + nextChunk;
            set({ displayedText: currentText });
            idx++;
          } else {
            clearInterval(interval);
            
            const finalFullText = get().displayedText;
            const cleanedText = get().syncStateJson(finalFullText);
            
            set({
              isExtractingCharacters: false,
              charactersExtracted: true,
              isStreaming: false,
              displayedText: cleanedText
            });
            resolve(true);
          }
        }, 15);
      });
    },

    simulateMockChapterScriptStream: async () => {
      const { activeChapterIndex, danh_muc_chuong, scanSignatureProps, calculateWordCount } = get();
      const ch = danh_muc_chuong[activeChapterIndex];
      const title = ch?.tieu_de || `Chương ${activeChapterIndex + 1}`;

      const p1 = `Không khí bên trong ga tàu điện ngầm ngập ngụa mùi rỉ sét tanh nồng xen lẫn sương phóng xạ vàng nhạt. Tiêu Hàn ngồi thụp dưới gầm bệ turbine, cánh tay trái liệt hoàn toàn rủ xuống vô lực như một khúc gỗ mục. Anh thở từng hơi nặng nhọc, lồng ngực thắt lại trước sự ăn mòn của không khí độc hại. Trên trần ga, những xúc tu của Nhựa Độc Đinh Hương lay động chập chữa, tiết ra chất dịch nhầy phát ra ánh sáng lam lợ kỳ quái.`;
      const p2 = `Bên ngoài cửa hầm, tiếng gió rít rú vang lên kèn kẹt. Một tia laser đỏ rực từ mắt cảm biến của Drone Săn Mồi Độc Lập quét ngang qua khe đá rạn nứt, chiếu thẳng vào góc áo khoác mủn nát của Tiêu Hàn. Đầu óc anh vận hành hết công suất. Với Tactical IQ vượt trội, anh nhanh chóng nắm bắt quy luật rà quét năm giây một nhịp của cỗ máy giết người cơ khí kia. Anh không được phép hoảng sợ. Sự may mắn không tồn tại ở thế giới chết chóc này, chỉ có tính toán cơ học lạnh lùng mới giúp phàm nhân sống sót.`;
      const p3 = `Tiêu Hàn thọc tay phải duy nhất vào túi áo, ngón tay anh chạm vào bề mặt kim loại sần sùi quen thuộc của chiếc bật lửa đồng rỉ sét. Kế bên nó là bình nước vỏ sắt cũ móp méo chứa vài ngụm nước cặn cuối cùng. Anh lấy bình nước ra, khẽ nhấp một ngụm nhỏ để làm dịu đi cái buồng phổi đang rát buốt như bị thiêu đốt. Đồng đội Thạch Dã của anh đang nấp cách đó hai mươi mét, gót chân bị rách gân rướm máu đỏ thẫm khiến anh ta không thể di chuyển bứt tốc quá ba mét mà không ngã quỵ.`;
      const p4 = `Thạch Dã khẽ giơ bộ dây siết cáp nhựa dài hai mét ra hiệu. Tiêu Hàn gật đầu ra hiệu im lặng. Anh bắt đầu lê tấm thân mỏi mệt bò rạp dưới đất, dùng tay phải kéo lê cơ thể khập khiễng của mình tiến về phía chân bệ đỡ xích cột thu lôi cũ. Nhịp quét laser của drone lại bắt đầu. Ba, hai, một. Ánh sáng đỏ vừa trượt qua, Tiêu Hàn búng mạnh bình nước vỏ sắt móp méo đập vào vỏ thép của cột thu lôi. KENG! Âm vang kim loại đập nhau dội vang dữ dội trong lòng đường ngầm phế tích. Cỗ drone cơ khí lập tức đổi hướng đầu servo, lao vút vào bên trong vách hang đá nơi tiếng động phát ra, đâm thẳng vào tuabin gió đang quay tít kèn kẹt và bị chém đứt vụn sắt vụn văng tung tóe.`;
      
      let scriptContent = `## ${title.toUpperCase()} (GIẢ LẬP)\n\n`;
      scriptContent += `### Diễn biến chi tiết kịch bản văn học:\n\n`;
      
      for (let i = 0; i < 8; i++) {
        scriptContent += `${p1}\n\n${p2}\n\n${p3}\n\n${p4}\n\n`;
      }

      const fullText = `${scriptContent}

\`\`\`STATE_JSON
{
  "con_tro": {
    "chuong_hien_tai": ${ch.so_chuong},
    "trang_thai_pipeline": "VIET_KICH_BAN"
  },
  "dan_y_tong_the": ${JSON.stringify(get().dan_y_tong_the)},
  "danh_sach_nhan_vat": ${JSON.stringify(get().danh_sach_nhan_vat)},
  "danh_muc_chuong": [
    {
      "so_chuong": ${ch.so_chuong},
      "tieu_de": "${ch.tieu_de}",
      "tom_tat_su_kien": "${ch.tom_tat_su_kien}",
      "noi_dung_kich_ban": "",
      "da_viet": true
    }
  ]
}
\`\`\``;

      const chunks = [];
      for (let i = 0; i < fullText.length; i += 120) {
        chunks.push(fullText.substring(i, i + 120));
      }

      let idx = 0;
      set({ displayedText: "" });

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (idx < chunks.length) {
            const nextChunk = chunks[idx];
            const currentText = get().displayedText + nextChunk;
            set({ displayedText: currentText });
            
            scanSignatureProps(currentText);
            calculateWordCount(currentText);
            idx++;
          } else {
            clearInterval(interval);
            
            const finalFullText = get().displayedText;
            const cleanedText = get().syncStateJson(finalFullText);
            
            const updatedChapters = [...danh_muc_chuong];
            updatedChapters[activeChapterIndex] = {
              ...ch,
              noi_dung_kich_ban: cleanedText,
              da_viet: true
            };
            
            set({
              displayedText: cleanedText,
              danh_muc_chuong: updatedChapters,
              chapters: updatedChapters.map(c => ({
                number: c.so_chuong,
                title: c.tieu_de,
                content: c.noi_dung_kich_ban,
                written: c.da_viet
              })),
              isWritingChapter: false,
              isStreaming: false
            });
            
            scanSignatureProps(cleanedText);
            calculateWordCount(cleanedText);
            resolve(true);
          }
        }, 10);
      });
    },
    
    updateOutlineBranchText: (text) => set((state) => {
      const branches = [...state.outlineBranches];
      branches[state.activeOutlineBranch] = text;
      return { outlineBranches: branches };
    }),

    setDanhSachNhanVat: (danh_sach_nhan_vat) => set({ danh_sach_nhan_vat }),
    
    addNhanVat: (nv) => set((state) => ({
      danh_sach_nhan_vat: [...state.danh_sach_nhan_vat, nv]
    })),
    
    updateNhanVat: (idx, updatedNv) => set((state) => {
      const list = [...state.danh_sach_nhan_vat];
      if (list[idx]) {
        list[idx] = { ...list[idx], ...updatedNv };
      }
      return { danh_sach_nhan_vat: list };
    }),

    removeNhanVat: (ten) => set((state) => ({
      danh_sach_nhan_vat: state.danh_sach_nhan_vat.filter(nv => nv.ten !== ten)
    })),

    reset: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('chuyen_gia_mac_the_store');
        } catch (e) {
          console.error("Lỗi xóa localStorage:", e);
        }
      }
      set({
        pipelineStep: 1,
        outlineBranches: ["", "", ""],
        activeOutlineBranch: 0,
        selectedBranchGenerated: [false, false, false],
        isExtractingCharacters: false,
        charactersExtracted: false,
        scratchpad: "",
        
        dan_y_tong_the: { mo_dau: "", cao_trao: "", ket_thuc: "" },
        danh_sach_nhan_vat: [],
        danh_muc_chuong: [],

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

        // Reset 3 Tiers of Memory
        lorebook_the_gioi: {
          quy_tac_sinh_ton: [
            "Không được nín thở quá 20s",
            "Quái T4 phản ứng với kim loại",
            "Không ăn nấm bào tử lam khi chưa sấy khô",
            "Drone săn mồi đổi nhịp quét laser mỗi 5 giây"
          ],
          dia_diem_da_mo_khoa: [
            "Trạm phát sóng hỏng",
            "Rãnh xả kiềm",
            "Ga tàu điện cũ dưới lòng đất"
          ]
        },
        bo_nho_nhan_vat: [
          {
            ten: "Tiêu Hàn",
            tinh_trang_hien_tai: "Liệt hoàn toàn cánh tay trái do sương vàng ăn mòn",
            vat_dung_dang_mang: ["Bật lửa đồng", "Bình nước vỏ sắt móp méo", "Kính một tròng nứt"]
          },
          {
            ten: "Thạch Dã",
            tinh_trang_hien_tai: "Bị rách gân gót chân phải đi khập khiễng",
            vat_dung_dang_mang: ["La bàn cơ khí", "Bộ dây siết cáp nhựa 2 mét"]
          }
        ],
        tom_tat_cuon_chieu: "Khởi đầu cuộc hành trình sinh tồn mạt thế khốc liệt.",
        chuong_gan_nhat: [],
        isCommittingMemory: false,
      });
    },

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
      const cleanText = text.trim().replace(/\s+/g, ' ');
      const words = cleanText ? cleanText.split(' ') : [];
      const count = words.length;
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
            
            if ((res.status === 429 || res.status === 400 || res.status === 500) && totalKeys > 1 && attempts < totalKeys - 1) {
              console.warn(`API Key #${currentIdx + 1} lỗi: ${errMsg}. Đang xoay sang key kế tiếp...`);
              attempts++;
              continue;
            }
            throw new Error(errMsg);
          }

          set({ rotationMessage: "" });
          return res;

        } catch (error) {
          if (totalKeys > 1 && attempts < totalKeys - 1) {
            console.warn(`Thử thất bại với API Key #${currentIdx + 1}. Lỗi: ${error.message}. Đang xoay key...`);
            attempts++;
            continue;
          }
          set({ rotationMessage: "" });
          onError(error);
          return null;
        }
      }

      set({ rotationMessage: "" });
      onError(new Error("Tất cả các API Keys trong danh sách xoay vòng đều bị từ chối hoặc hết quota."));
      return null;
    },

    // GIAI ĐOẠN 1: SINH DÀN Ý CHO NHÁNH ĐƯỢC CHỌN
    generateOutlineBranch: async (branchIndex) => {
      const { theme, style, prompt, chaptersCount, callGenerateAPI, useMock } = get();
      
      set({
        isGeneratingOutline: true,
        phase: 2,
        pipelineStep: 2,
        activeOutlineBranch: branchIndex,
        displayedText: `Đang lập cấu trúc 3 hồi và lên dàn ý độc lập cho Nhánh ${branchIndex + 1}...`,
        isStreaming: true,
      });

      if (useMock) {
        await get().simulateMockOutlineStream(branchIndex);
        return;
      }

      const requestBody = {
        requestType: "GENERATE_OUTLINE",
        branchIndex: branchIndex,
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
          alert(`Lỗi sinh dàn ý Nhánh ${branchIndex + 1}: ${err.message}`);
          set({
            isGeneratingOutline: false,
            isStreaming: false,
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
          
          // Cập nhật tạm thời cho nhánh này
          const branches = [...get().outlineBranches];
          branches[branchIndex] = accumulatedText;
          set({ outlineBranches: branches });
        }

        // Parse STATE_JSON ở cuối stream
        const cleanedText = get().syncStateJson(accumulatedText);
        
        const branches = [...get().outlineBranches];
        branches[branchIndex] = cleanedText;
        
        const branchGen = [...get().selectedBranchGenerated];
        branchGen[branchIndex] = true;

        // Trích xuất Tên truyện
        let novelName = get().novelTitle || "NGHỊCH LÝ VONG XUYÊN";
        const titleMatch = cleanedText.match(/(?:TÊN TRUYỆN|TÊN KỊCH BẢN|Tên tác phẩm):\s*\*\*?([^\*\n]+)\*\*?/i);
        if (titleMatch && titleMatch[1]) {
          novelName = titleMatch[1].trim();
        }

        set({
          novelTitle: novelName,
          outlineBranches: branches,
          selectedBranchGenerated: branchGen,
          displayedText: cleanedText,
          isGeneratingOutline: false,
          isStreaming: false,
        });

      } catch (err) {
        console.error("Lỗi đọc stream dàn ý: ", err);
        set({
          isGeneratingOutline: false,
          isStreaming: false
        });
      }
    },

    // XÁC NHẬN CHỐT DÀN Ý & SANG BƯỚC 3
    confirmOutline: async () => {
      const { outlineBranches, activeOutlineBranch, syncStateJson, extractCharacters } = get();
      const approvedText = outlineBranches[activeOutlineBranch];
      
      if (!approvedText || !approvedText.trim()) {
        alert("Dàn ý nhánh này chưa được tạo hoặc trống rỗng!");
        return;
      }

      // Sync lại JSON để đảm bảo cấu trúc lưu trong store
      syncStateJson(approvedText);

      set({
        pipelineStep: 3,
        outlineGenerated: true,
        outlineText: approvedText // Old compatibility
      });

      // Tự động gọi trích xuất nhân vật
      await extractCharacters();
    },

    // GIAI ĐOẠN 2: TRÍCH XUẤT NHÂN VẬT TỰ ĐỘNG TỪ DÀN Ý ĐÃ CHỐT
    extractCharacters: async () => {
      const { outlineBranches, activeOutlineBranch, callGenerateAPI, syncStateJson, useMock } = get();
      const approvedOutline = outlineBranches[activeOutlineBranch];

      set({
        isExtractingCharacters: true,
        displayedText: "Đang tiến hành trích xuất danh sách nhân vật chi tiết từ Dàn ý đã chốt bằng AI...",
        isStreaming: true,
      });

      if (useMock) {
        await get().simulateMockCharactersStream();
        return;
      }

      const requestBody = {
        requestType: "EXTRACT_CHARACTERS",
        outlineText: approvedOutline
      };

      const res = await callGenerateAPI(
        requestBody,
        null,
        (err) => {
          alert(`Lỗi trích xuất hồ sơ nhân vật: ${err.message}`);
          set({
            isExtractingCharacters: false,
            isStreaming: false,
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

        // Bóc tách JSON danh sách nhân vật và đồng bộ
        const cleanedText = syncStateJson(accumulatedText);

        set({
          isExtractingCharacters: false,
          charactersExtracted: true,
          isStreaming: false,
          displayedText: cleanedText
        });

      } catch (err) {
        console.error("Lỗi đọc stream trích xuất nhân vật: ", err);
        set({
          isExtractingCharacters: false,
          isStreaming: false
        });
      }
    },

    // XÁC NHẬN CHỐT NHÂN VẬT & SANG BƯỚC 4
    confirmCharacters: () => {
      const { danh_muc_chuong } = get();
      if (!danh_muc_chuong || danh_muc_chuong.length === 0) {
        // Dự phòng tạo chương nếu không được AI khởi tạo thành công
        const size = get().chaptersCount || 10;
        const fallbackChapters = [];
        for (let i = 1; i <= size; i++) {
          fallbackChapters.push({
            so_chuong: i,
            tieu_de: `Chương ${i}: Kịch Bản Phân Phối Chi Tiết #${i}`,
            tom_tat_su_kien: "Chưa rõ chi tiết sự kiện.",
            noi_dung_kich_ban: "",
            da_viet: false
          });
        }
        set({ 
          danh_muc_chuong: fallbackChapters,
          chapters: fallbackChapters.map(ch => ({
            number: ch.so_chuong,
            title: ch.tieu_de,
            content: "",
            written: false
          }))
        });
      }
      
      set({
        pipelineStep: 4,
        activeTab: "chapters",
        displayedText: ""
      });
      
      // Select chương đầu tiên để hiển thị
      get().selectChapter(0);
    },

    // GIAI ĐOẠN 3: VIẾT KỊCH BẢN TẬP TRUNG (STATIC REFERENCE CONTEXT)
    writeActiveChapter: async () => {
      const { 
        activeChapterIndex, danh_muc_chuong, theme, style,
        dan_y_tong_the, danh_sach_nhan_vat, scratchpad,
        signatureProps, callGenerateAPI, scanSignatureProps, calculateWordCount, useMock
      } = get();

      const ch = danh_muc_chuong[activeChapterIndex];
      if (!ch) return;

      set({
        isWritingChapter: true,
        activeTab: "chapters",
        displayedText: `Đang lập chỉ mục Static Context... Phân tích cấu trúc 3 hồi... Nạp hồ sơ nhân vật tĩnh của ${danh_sach_nhan_vat.length} nhân vật...`,
        isStreaming: true,
      });

      if (useMock) {
        await get().simulateMockChapterScriptStream();
        return;
      }

      const requestBody = {
        requestType: "WRITE_SCRIPT",
        selectedChapter: ch.so_chuong,
        config: {
          chủ_đề: theme,
          phong_cách: style,
          số_chương: danh_muc_chuong.length,
          minWordCount: get().minWordCount || 3910,
          maxWordCount: get().maxWordCount || 4590
        },
        dan_y_tong_the: dan_y_tong_the,
        danh_sach_nhan_vat: danh_sach_nhan_vat,
        danh_muc_chuong: danh_muc_chuong,
        scratchpad: scratchpad,
        signatureProps: signatureProps
      };

      const res = await callGenerateAPI(
        requestBody,
        null,
        (err) => {
          alert(`Lỗi sinh kịch bản chi tiết chương: ${err.message}`);
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
          
          scanSignatureProps(accumulatedText);
          calculateWordCount(accumulatedText);
        }

        // Bóc tách STATE_JSON và đồng bộ
        const cleanedText = get().syncStateJson(accumulatedText);

        const updatedChapters = [...danh_muc_chuong];
        updatedChapters[activeChapterIndex] = {
          ...ch,
          noi_dung_kich_ban: cleanedText,
          da_viet: true
        };

        set({
          displayedText: cleanedText,
          danh_muc_chuong: updatedChapters,
          // Đồng bộ với old compatibility array chapters
          chapters: updatedChapters.map(c => ({
            number: c.so_chuong,
            title: c.tieu_de,
            content: c.noi_dung_kich_ban,
            written: c.da_viet
          })),
          isWritingChapter: false,
          isStreaming: false
        });

        scanSignatureProps(cleanedText);
        calculateWordCount(cleanedText);

      } catch (err) {
        console.error("Lỗi đọc stream viết chương kịch bản: ", err);
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
      const { isGeneratingOutline, isWritingChapter, danh_muc_chuong } = get();
      if (isGeneratingOutline || isWritingChapter) return;

      const ch = danh_muc_chuong[index];
      const content = ch && ch.da_viet ? ch.noi_dung_kich_ban : "";
      set({
        activeChapterIndex: index,
        activeTab: "chapters",
        displayedText: content
      });
      get().scanSignatureProps(content);
      get().calculateWordCount(content);
    },

    navigateChapter: (direction) => {
      const { activeChapterIndex, danh_muc_chuong, selectChapter } = get();
      const nextIdx = activeChapterIndex + direction;
      if (nextIdx >= 0 && nextIdx < danh_muc_chuong.length) {
        selectChapter(nextIdx);
      }
    },

    commitMemory: async () => {
      const { 
        activeChapterIndex, danh_muc_chuong, callGenerateAPI, syncStateJson, useMock,
        lorebook_the_gioi, bo_nho_nhan_vat, tom_tat_cuon_chieu, chuong_gan_nhat
      } = get();
      
      const ch = danh_muc_chuong[activeChapterIndex];
      if (!ch || !ch.noi_dung_kich_ban) return;

      set({
        isCommittingMemory: true,
        pipelineStep: 5,
        displayedText: "Đang tiến hành phân tích kịch bản chương vừa viết... Đang nạp RAG bộ nhớ cuốn chiếu... Cập nhật Lorebook & Sổ rách...",
        isStreaming: true
      });

      if (useMock) {
        await get().simulateMockMemoryCommitStream();
        return;
      }

      const requestBody = {
        requestType: "COMMIT_MEMORY",
        activeChapterIndex: activeChapterIndex,
        activeChapterText: ch.noi_dung_kich_ban,
        lorebook_the_gioi,
        bo_nho_nhan_vat,
        tom_tat_cuon_chieu,
        chuong_gan_nhat
      };

      const res = await callGenerateAPI(
        requestBody,
        null,
        (err) => {
          alert(`Lỗi ghi sổ & nén ký ức: ${err.message}`);
          set({
            isCommittingMemory: false,
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
        }

        const cleanedText = get().syncStateJson(accumulatedText);

        set({
          displayedText: cleanedText,
          isCommittingMemory: false,
          isStreaming: false
        });

      } catch (err) {
        console.error("Lỗi đọc stream nén ký ức: ", err);
        set({
          isCommittingMemory: false,
          isStreaming: false
        });
      }
    },

    simulateMockMemoryCommitStream: async () => {
      const { activeChapterIndex, danh_muc_chuong, lorebook_the_gioi, bo_nho_nhan_vat, tom_tat_cuon_chieu, chuong_gan_nhat } = get();
      const ch = danh_muc_chuong[activeChapterIndex];
      const chNum = ch?.so_chuong || (activeChapterIndex + 1);

      const updatedLorebook = {
        quy_tac_sinh_ton: [...(lorebook_the_gioi?.quy_tac_sinh_ton || [])],
        dia_diem_da_mo_khoa: Array.from(new Set([...(lorebook_the_gioi?.dia_diem_da_mo_khoa || []), `Phế tích Tầng ${Math.min(chNum, 8)}: Vùng hoang dã mới mở khóa ở Chương ${chNum}`]))
      };

      const updatedNhanVat = (bo_nho_nhan_vat || []).map(nv => {
        if (nv.ten === "Tiêu Hàn") {
          return {
            ...nv,
            tinh_trang_hien_tai: `Bị trầy xước đùi nhẹ, kiệt sức nhẹ sau khi dùng tay phải bẫy drone ở Chương ${chNum}.`,
            vat_dung_dang_mang: ["Bật lửa đồng", "Bình nước vỏ sắt móp méo (hết nước)", "Kính một tròng nứt"]
          };
        }
        if (nv.ten === "Thạch Dã") {
          return {
            ...nv,
            tinh_trang_hien_tai: "Chấn thương rách gân gót chân phải rỉ máu nhẹ, được cố định bằng cáp nhựa.",
            vat_dung_dang_mang: ["La bàn cơ khí", "Bộ dây siết cáp nhựa 2 mét (còn 1.5 mét)"]
          };
        }
        return nv;
      });

      const nextSummary = `${tom_tat_cuon_chieu || ""} Ở Chương ${chNum}, Tiêu Hàn đã kiên cường sử dụng tay phải phối hợp chiếc bật lửa đồng rỉ sét cùng bình nước sắt móp bẫy Drone cơ khí rà quét tia laser đỏ tự sát va đập tuabin gió, tạm thời giải nguy cho bản thân và đồng đội Thạch Dã bị rách gân gót chân tại ga tàu bỏ hoang.`;

      const newShortTerm = [
        ...chuong_gan_nhat.filter(c => c.chuong !== chNum),
        {
          chuong: chNum,
          noi_dung_tom_luoc: `Tiêu Hàn bẫy thành công Drone săn mồi cơ khí quét laser đỏ bằng cách ném bình nước sắt tạo tiếng động phản xạ.`
        }
      ].slice(-3);

      const mockCommitResponse = `# NHẬT KÝ GHI SỔ & NÉN KÝ ỨC (MOCK MODE ACTIVE)
- Đang tiến hành phân tích kịch bản Chương ${chNum}... Phát hiện các thực thể sinh tồn: Tiêu Hàn, Thạch Dã.
- Phát hiện sử dụng vật phẩm chữ ký: Bật lửa đồng rỉ sét, bình nước vỏ sắt móp méo, dây siết cáp nhựa.
- Phát hiện môi trường: Ga tàu điện bỏ hoang dưới lòng đất, Drone săn mồi quét tia laser đỏ.
- Tiến hành cập nhật Sổ Rách Cơ Thể: Tiêu Hàn bị kiệt sức nhẹ; Thạch Dã rỉ máu chân.
- Tiến hành cập nhật Lorebook: Mở khóa vùng hoang dã mới.
- Tiến hành Rolling Summary: Tóm tắt nén cuốn chiếu toàn bộ ${chNum} chương trước đó.

\`\`\`STATE_JSON
{
  "lorebook_the_gioi": ${JSON.stringify(updatedLorebook)},
  "bo_nho_nhan_vat": ${JSON.stringify(updatedNhanVat)},
  "tom_tat_cuon_chieu": ${JSON.stringify(nextSummary)},
  "chuong_gan_nhat": ${JSON.stringify(newShortTerm)}
}
\`\`\``;

      const chunks = [];
      for (let i = 0; i < mockCommitResponse.length; i += 40) {
        chunks.push(mockCommitResponse.substring(i, i + 40));
      }

      let idx = 0;
      set({ displayedText: "" });

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (idx < chunks.length) {
            const nextChunk = chunks[idx];
            const currentText = get().displayedText + nextChunk;
            set({ displayedText: currentText });
            idx++;
          } else {
            clearInterval(interval);
            
            const finalFullText = get().displayedText;
            const cleanedText = get().syncStateJson(finalFullText);
            
            set({
              displayedText: cleanedText,
              isCommittingMemory: false,
              isStreaming: false
            });
            resolve(true);
          }
        }, 15);
      });
    }
  };
},
{
  name: 'chuyen_gia_mac_the_store',
  skipHydration: true
}
)
);
