import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Chuong {
  so_chuong: number;
  tieu_de: string;
  dan_y: string;
  noi_dung: string;
  trang_thai: 'empty' | 'writing' | 'ready';
}

export interface SetupData {
  chu_de: string;
  phong_cach: string;
  mo_ta: string;
  so_chuong: number;
}

export interface NovelState {
  giai_doan: 1 | 2; // 1: Setup, 2: Workspace
  setup: SetupData;
  ten_tac_pham: string;
  dan_y_tong_the: string;
  nhan_vat: string[];
  danh_sach_chuong: Chuong[];
  chuong_dang_chon: number; // 1-indexed
  tab_hien_tai: 'dan_y' | 'noi_dung';
  dang_tai: boolean;
  useMock: boolean;
  apiKey: string;
  isHydrated: boolean;
}

export interface NovelActions {
  setSetup: (data: Partial<SetupData>) => void;
  setGiaiDoan: (giai_doan: 1 | 2) => void;
  updateTenTacPham: (name: string) => void;
  updateDanYTongThe: (outline: string) => void;
  updateNhanVat: (chars: string[]) => void;
  setDanhSachChuong: (chapters: Chuong[]) => void;
  updateChuong: (so_chuong: number, update: Partial<Chuong>) => void;
  selectChuong: (so_chuong: number) => void;
  setTabHienTai: (tab: 'dan_y' | 'noi_dung') => void;
  setDangTai: (loading: boolean) => void;
  setUseMock: (mock: boolean) => void;
  setApiKey: (key: string) => void;
  setHydrated: (hydrated: boolean) => void;
  resetStore: () => void;
}

export type NovelStore = NovelState & NovelActions;

const INITIAL_SETUP: SetupData = {
  chu_de: 'Sinh Tồn',
  phong_cach: 'Mạt Thế',
  mo_ta: '',
  so_chuong: 10,
};

const INITIAL_STATE: NovelState = {
  giai_doan: 1,
  setup: INITIAL_SETUP,
  ten_tac_pham: '',
  dan_y_tong_the: '',
  nhan_vat: [],
  danh_sach_chuong: [],
  chuong_dang_chon: 1,
  tab_hien_tai: 'dan_y',
  dang_tai: false,
  useMock: true, // Mặc định bật Mock Mode để dễ dàng kiểm thử offline
  apiKey: '',
  isHydrated: false,
};

export const useNovelStore = create<NovelStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setSetup: (data) =>
        set((state) => {
          const newSetup = { ...state.setup, ...data };
          // Tự động cập nhật tên kịch bản gợi ý dựa trên Chủ đề & Phong cách nếu ở Giai đoạn 1 và chưa tự sửa tên
          const generatedName = `${newSetup.chu_de} - ${newSetup.phong_cach}`;
          return {
            setup: newSetup,
            ten_tac_pham: state.giai_doan === 1 ? generatedName : state.ten_tac_pham,
          };
        }),

      setGiaiDoan: (giai_doan) => set({ giai_doan }),

      updateTenTacPham: (ten_tac_pham) => set({ ten_tac_pham }),

      updateDanYTongThe: (dan_y_tong_the) => set({ dan_y_tong_the }),

      updateNhanVat: (nhan_vat) => set({ nhan_vat }),

      setDanhSachChuong: (danh_sach_chuong) => set({ danh_sach_chuong }),

      updateChuong: (so_chuong, update) =>
        set((state) => ({
          danh_sach_chuong: state.danh_sach_chuong.map((c) =>
            c.so_chuong === so_chuong ? { ...c, ...update } : c
          ),
        })),

      selectChuong: (chuong_dang_chon) => set({ chuong_dang_chon }),

      setTabHienTai: (tab_hien_tai) => set({ tab_hien_tai }),

      setDangTai: (dang_tai) => set({ dang_tai }),

      setUseMock: (useMock) => set({ useMock }),

      setApiKey: (apiKey) => set({ apiKey }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      resetStore: () => {
        set({ ...INITIAL_STATE, isHydrated: true });
        // Xóa hoàn toàn khỏi localStorage
        localStorage.removeItem('novel_generator_v2_store');
      },
    }),
    {
      name: 'novel_generator_v2_store',
      skipHydration: true, // Tránh lỗi SSR Next.js hydration mismatch
      partialize: (state) => ({
        // Chỉ lưu giữ các trạng thái cần thiết
        giai_doan: state.giai_doan,
        setup: state.setup,
        ten_tac_pham: state.ten_tac_pham,
        dan_y_tong_the: state.dan_y_tong_the,
        nhan_vat: state.nhan_vat,
        danh_sach_chuong: state.danh_sach_chuong,
        chuong_dang_chon: state.chuong_dang_chon,
        tab_hien_tai: state.tab_hien_tai,
        useMock: state.useMock,
        apiKey: state.apiKey,
      }),
    }
  )
);
