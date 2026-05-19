import { create } from 'zustand';

export interface StateJSON {
  con_tro: { chuong: number; tap_tiep_theo: number; pha: string };
  tien_do: { eps_hook_da_viet: boolean; chuong_hien_tai: number; dang_cho_xac_nhan: boolean };
  tai_nguyen: {
    nhom_main: { nuoc_lit: number; thuc_an_kcal: number; dan_duoc: number; thuoc: string[] };
  };
  vet_thuong: { danh_sach: string[]; anh_huong_van_dong: string };
  dau_vet: { heat: number; trace: number; debt: number; pattern_bi_hoc: string[] };
  nhiem_doc: { muc_do: number; trieu_chung: string[] };
  dong_ho_leo_thang: { escalation_meter: number; cap_hien_tai: 'Lv1' | 'Lv2' | 'Lv3' | 'Lv4' };
}

interface WorkspaceStore {
  config: { chủ_đề: string; phong_cách: string; mô_tả: string; số_chương: number };
  stateJSON: StateJSON;
  currentOutput: string;
  isStreaming: boolean;
  activeTab: 'dan_y' | 'chi_tiet';
  selectedChapter: number | null;
  updateConfig: (fields: Partial<WorkspaceStore['config']>) => void;
  setStateJSON: (newState: Partial<StateJSON>) => void;
  setCurrentOutput: (text: string) => void;
  setIsStreaming: (status: boolean) => void;
  setActiveTab: (tab: 'dan_y' | 'chi_tiet') => void;
  setSelectedChapter: (chapter: number | null) => void;
  resetWorkspace: () => void;
}

const initial_state: StateJSON = {
  con_tro: { chuong: 1, tap_tiep_theo: 1, pha: "KHOI_TAO" },
  tien_do: { eps_hook_da_viet: false, chuong_hien_tai: 1, dang_cho_xac_nhan: false },
  tai_nguyen: { nhom_main: { nuoc_lit: 2, thuc_an_kcal: 2000, dan_duoc: 3, thuoc: [] } },
  vet_thuong: { danh_sach: [], anh_huong_van_dong: "Bình thường" },
  dau_vet: { heat: 0, trace: 0, debt: 0, pattern_bi_hoc: [] },
  nhiem_doc: { muc_do: 0, trieu_chung: [] },
  dong_ho_leo_thang: { escalation_meter: 0, cap_hien_tai: "Lv1" }
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  config: { chủ_đề: '', phong_cách: '', mô_tả: '', số_chương: 10 },
  stateJSON: initial_state,
  currentOutput: '',
  isStreaming: false,
  activeTab: 'dan_y',
  selectedChapter: null,
  updateConfig: (fields) => set((state) => ({ config: { ...state.config, ...fields } })),
  setStateJSON: (newState) => set((state) => ({ stateJSON: { ...state.stateJSON, ...newState } })),
  setCurrentOutput: (text) => set({ currentOutput: text }),
  setIsStreaming: (status) => set({ isStreaming: status }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),
  resetWorkspace: () => set({ config: { chủ_đề: '', phong_cách: '', mô_tả: '', số_chương: 10 }, stateJSON: initial_state, currentOutput: '', isStreaming: false, selectedChapter: null, activeTab: 'dan_y' })
}));
