import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MacroStateJSON {
  con_tro: { chuong_hien_tai: number; trang_thai: string };
  lorebook_the_gioi: {
    quy_tac_sinh_ton: string[];
    dia_diem_da_mo_khoa: string[];
  };
  bo_nho_nhan_vat: Array<{
    ten: string;
    tinh_trang_hien_tai: string;
    vat_dung_dang_mang: string[];
    moi_quan_he: Record<string, string>;
  }>;
  tom_tat_cuon_chieu: string;
  chuong_gan_nhat: Array<{ chuong: number; noi_dung_tom_luoc: string }>;
}

const INITIAL_MACRO_STATE: MacroStateJSON = {
  con_tro: { chuong_hien_tai: 1, trang_thai: "KHOI_TAO" },
  lorebook_the_gioi: { quy_tac_sinh_ton: [], dia_diem_da_mo_khoa: [] },
  bo_nho_nhan_vat: [],
  tom_tat_cuon_chieu: "Chưa có sự kiện nào diễn ra. Bắt đầu chương 1.",
  chuong_gan_nhat: []
};

interface NovelStore {
  apiKey: string;
  useMock: boolean;
  pipelineStep: 1 | 2 | 3 | 4; // 1: Dàn ý -> 2: Trích xuất NV -> 3: Kịch bản -> 4: Ghi sổ (Commit)
  config: { chu_de: string; phong_cach: string; y_tuong_goc: string };
  macroState: MacroStateJSON;
  currentChapterData: {
    dan_y_nhanh: string;
    dan_y_chot: string;
    script_text: string;
  };
  
  setApiKey: (key: string) => void;
  setUseMock: (mock: boolean) => void;
  setConfig: (config: any) => void;
  setPipelineStep: (step: 1 | 2 | 3 | 4) => void;
  setMacroState: (state: Partial<MacroStateJSON>) => void;
  setCurrentChapterData: (data: Partial<NovelStore['currentChapterData']>) => void;
  nextChapter: () => void;
  reset: () => void;
}

export const useNovelStore = create<NovelStore>()(
  persist(
    (set, get) => ({
      apiKey: "",
      useMock: true,
      pipelineStep: 1,
      config: { chu_de: "Sinh Tồn", phong_cach: "Mạt Thế", y_tuong_goc: "" },
      macroState: INITIAL_MACRO_STATE,
      currentChapterData: { dan_y_nhanh: "", dan_y_chot: "", script_text: "" },

      setApiKey: (key) => set({ apiKey: key }),
      setUseMock: (mock) => set({ useMock: mock }),
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      setPipelineStep: (step) => set({ pipelineStep: step }),
      setMacroState: (newState) => set((state) => ({ macroState: { ...state.macroState, ...newState } })),
      setCurrentChapterData: (data) => set((state) => ({ currentChapterData: { ...state.currentChapterData, ...data } })),
      
      nextChapter: () => set((state) => ({
        pipelineStep: 1,
        currentChapterData: { dan_y_nhanh: "", dan_y_chot: "", script_text: "" },
        macroState: {
          ...state.macroState,
          con_tro: { ...state.macroState.con_tro, chuong_hien_tai: state.macroState.con_tro.chuong_hien_tai + 1 }
        }
      })),

      reset: () => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('chuyen_gia_mac_the_store_new');
          } catch (e) {
            console.error("Lỗi xóa localStorage:", e);
          }
        }
        set({
          pipelineStep: 1,
          config: { chu_de: "Sinh Tồn", phong_cach: "Mạt Thế", y_tuong_goc: "" },
          macroState: INITIAL_MACRO_STATE,
          currentChapterData: { dan_y_nhanh: "", dan_y_chot: "", script_text: "" }
        });
      }
    }),
    {
      name: 'chuyen_gia_mac_the_store_new',
      skipHydration: true
    }
  )
);
