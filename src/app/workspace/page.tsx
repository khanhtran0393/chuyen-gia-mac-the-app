'use client';

import React, { useEffect, useState } from 'react';
import { useNovelStore, Chuong } from '@/store/useNovelStore';
import {
  Sparkles,
  BookOpen,
  Settings,
  Plus,
  Minus,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Info,
  CheckCircle,
  Key,
  Wifi,
  WifiOff,
  FileText,
  AlertCircle
} from 'lucide-react';

// Mảng ngẫu nhiên cho Zero-Legacy Template Engine
const CO_THE_KHUYET_TAT = [
  'rách gân tay trái khiến kiếm chiêu bị lệch 1 phân',
  'mù mắt phải do vết cào của dị chủng cấp cao',
  'liệt chân trái phải bước đi tập tễnh cùng nạng sắt',
  'mất khứu giác do hít phải bụi phóng xạ mạt thế',
  'phổi bị tổn thương nặng chỉ có thể nín thở tối đa 15 giây',
  'cụt 2 ngón tay phải khiến việc nạp đạn súng bị chậm 2 giây'
];

const KHONG_GIAN_HOANG_PHE = [
  'trạm xăng bỏ hoang ngập trong sương độc axit',
  'tầng hầm trung tâm thương mại bị rêu đỏ ăn mòn',
  'nhà kho đông lạnh cũ chứa đầy kén trứng của biến dị thể',
  'nhà thờ đổ nát có bức tượng đổ sập chặn lối thoát',
  'toa tàu điện ngầm mắc kẹt giữa đường hầm ngập nước',
  'phòng thí nghiệm sinh học đổ nát đầy bình chứa rò rỉ'
];

const TEN_HAN_VIET_MOI = [
  'Tiêu Hàn', 'Thạch Dã', 'Diệp Dao', 'Tô Dạ', 'Khương Phàm', 'Bạch Vũ', 
  'Lục Phong', 'Sở Doanh', 'Thần Phong', 'Nhạc Vân', 'Mộ Dung Trần'
];

const VAT_PHAM_MAC_DINH = [
  'Con dao găm rỉ sét cán gỗ',
  'Bình lọc nước cầm tay còn 1 lần lọc',
  'Bản đồ khu tị nạn rách góc',
  'Hộp quẹt đá hết gas nhưng còn tia lửa',
  'Sợi dây xích sắt dài 2 mét'
];

export default function Workspace() {
  const store = useNovelStore();
  const [promptError, setPromptError] = useState('');
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Rehydrate store để đồng bộ localStorage trên client an toàn cho Next.js SSR
  useEffect(() => {
    const hydrate = async () => {
      await useNovelStore.persist.rehydrate();
      store.setHydrated(true);
    };
    hydrate();
  }, []);

  // Zero-Legacy Template Engine: Sinh ý tưởng bối cảnh ngẫu nhiên chất lượng cao
  const handleRandomTemplate = () => {
    const tenMain = TEN_HAN_VIET_MOI[Math.floor(Math.random() * TEN_HAN_VIET_MOI.length)];
    const khuyetTat = CO_THE_KHUYET_TAT[Math.floor(Math.random() * CO_THE_KHUYET_TAT.length)];
    const khongGian = KHONG_GIAN_HOANG_PHE[Math.floor(Math.random() * KHONG_GIAN_HOANG_PHE.length)];
    const vatPham = VAT_PHAM_MAC_DINH[Math.floor(Math.random() * VAT_PHAM_MAC_DINH.length)];

    const template = `Thế giới rơi vào kỷ băng hà mạt thế rực đỏ. Nhân vật chính ${tenMain} gánh chịu khuyết tật nặng nề: ${khuyetTat}. Câu chuyện bắt đầu khi ${tenMain} đang bị bao vây tại một ${khongGian}, trong tay chỉ còn lại một ${vatPham}. Phải vật lộn sinh tồn tìm cách thoát thân trước khi nhiệt độ giảm xuống âm 50 độ C vào ban đêm.`;
    
    store.setSetup({ mo_ta: template });
    setPromptError('');
  };

  // Nút cộng trừ chương
  const handleAdjustChapters = (amount: number) => {
    const nextVal = Math.max(1, Math.min(100, store.setup.so_chuong + amount));
    store.setSetup({ so_chuong: nextVal });
  };

  // Nút khởi tạo kịch bản AI (Phase 1 -> Phase 2)
  const handleGenerateOutline = async () => {
    if (!store.setup.mo_ta.trim()) {
      setPromptError('⚠️ Vui lòng nhập mô tả cốt truyện hoặc bấm nút "AI Tự Tạo Ý Tưởng"!');
      return;
    }

    setPromptError('');
    store.setDangTai(true);

    if (store.useMock) {
      // Giả lập Mock Mode offline trong 2 giây
      setTimeout(() => {
        const dummyChapters: Chuong[] = Array.from({ length: store.setup.so_chuong }).map((_, i) => ({
          so_chuong: i + 1,
          tieu_de: `Chương ${i + 1}: Quyết Định Sinh Tử`,
          dan_y: `Diễn biến tóm tắt của Chương ${i + 1} tại khu hoang dã. Nhân vật chính phải vật lộn vượt qua cạm bẫy để mở khóa khu vực an toàn kế tiếp.`,
          noi_dung: '',
          trang_thai: 'empty'
        }));

        const mockOutline = `# DÀN Ý TỔNG THỂ TÁC PHẨM\n\n## 1. Khái Quát Bối Cảnh\nThế giới mạt thế suy tàn, nhiệt độ tụt dốc thê thảm. Luật lệ phàm nhân sụp đổ, chỉ có kẻ có ý chí thép và óc phán đoán mới sống sót.\n\n## 2. Tuyến Nhân Vật\nCác nhân vật trung tâm phải đối mặt với thử thách cơ thể khắc nghiệt.\n\n## 3. Lịch Trình Phát Triển Cốt Truyện\nTừ sinh tồn cô độc đến thành lập liên minh kháng cự dị chủng.`;

        // Bóc tách tên nhân vật từ mô tả hoặc lấy ngẫu nhiên
        const extractedCharacters = ['Tiêu Hàn', 'Thạch Dã', 'Dao Dao'];

        store.updateTenTacPham(`${store.setup.chu_de} Chi Lộ - ${store.setup.phong_cach} Mạt Thế`);
        store.updateDanYTongThe(mockOutline);
        store.updateNhanVat(extractedCharacters);
        store.setDanhSachChuong(dummyChapters);
        store.selectChuong(1);
        store.setGiaiDoan(2);
        store.setDangTai(false);
      }, 1800);
    } else {
      // Gọi API thực tế
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'GENERATE_OUTLINE',
            apiKey: store.apiKey,
            payload: store.setup
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Có lỗi xảy ra khi gọi API');
        }

        const data = await res.json();
        
        store.updateTenTacPham(data.tieu_de || `${store.setup.chu_de} - ${store.setup.phong_cach}`);
        store.updateDanYTongThe(data.dan_y_tong_the || 'Dàn ý tổng thể.');
        store.updateNhanVat(data.nhan_vat || []);
        
        // Convert to Chuong format
        const convertedChapters: Chuong[] = (data.danh_sach_chuong || []).map((ch: any) => ({
          so_chuong: ch.so_chuong,
          tieu_de: ch.tieu_de || `Chương ${ch.so_chuong}`,
          dan_y: ch.dan_y || 'Dàn ý chi tiết chưa có.',
          noi_dung: '',
          trang_thai: 'empty'
        }));

        store.setDanhSachChuong(convertedChapters);
        store.selectChuong(1);
        store.setGiaiDoan(2);
      } catch (err: any) {
        setPromptError(`❌ Lỗi API: ${err.message}`);
      } finally {
        store.setDangTai(false);
      }
    }
  };

  // Nút viết nội dung chi tiết chương truyện
  const handleWriteChapter = async () => {
    const currentChapter = store.danh_sach_chuong.find(c => c.so_chuong === store.chuong_dang_chon);
    if (!currentChapter) return;

    store.setDangTai(true);
    setIsStreaming(true);
    setStreamText('');

    if (store.useMock) {
      // Giả lập Typing Effect cực kỳ mượt mà
      const fullText = `### ${currentChapter.tieu_de}\n\nGió bấc gào rú qua khe cửa hở của toa tàu điện ngầm bỏ hoang. Tiêu Hàn khẽ ho một tiếng, lồng ngực đau nhói như kim châm. Vết thương cũ ở gân tay trái lại bắt đầu lên cơn đau buốt do nhiệt độ tụt sâu. \n\n"Bác lạnh không?" Tiêu Hàn xoay đầu, nhìn Thạch Dã đang co ro bên cạnh đống lửa sắp tàn. \n\nThạch Dã chỉ lắc đầu, bàn tay thô ráp ôm chặt lấy thanh sắt nhọn tự chế. Cả hai đều hiểu, củi khô chỉ còn đủ duy trì thêm nửa giờ nữa. Nếu ngọn lửa này tắt trước khi sương độc ngoài kia loãng bớt, cái lạnh âm 40 độ C sẽ đông cứng máu của họ ngay lập tức.\n\nTiêu Hàn mở bình lọc nước cầm tay, nước bên trong đã đóng thành một lớp băng mỏng. Cậu dùng chuôi dao găm gõ nhẹ, cẩn thận uống ngụm nước lạnh buốt cuối cùng. Đây là ngụm nước cứu mạng cuối cùng của họ. Mạt thế không có chỗ cho kẻ yếu đuối, cậu siết chặt chuôi dao rỉ sét cán gỗ, đôi mắt lạnh lùng nhìn về phía lối vào đường hầm tối om đầy rẫy hiểm họa...\n\n---\n*Kịch bản hoàn thành xuất sắc! Đầy đủ yếu tố đa giác quan và somatics của nhân vật chính.*`;
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          setStreamText(prev => prev + fullText.charAt(index));
          index += 5; // Tăng tốc độ hiển thị giả lập
        } else {
          clearInterval(interval);
          store.updateChuong(store.chuong_dang_chon, {
            noi_dung: fullText,
            trang_thai: 'ready'
          });
          setIsStreaming(false);
          store.setDangTai(false);
          store.setTabHienTai('noi_dung');
        }
      }, 30);
    } else {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'WRITE_CHAPTER',
            apiKey: store.apiKey,
            payload: {
              ten_tac_pham: store.ten_tac_pham,
              dan_y_tong_the: store.dan_y_tong_the,
              nhan_vat: store.nhan_vat,
              chuong_hien_tai: currentChapter,
              so_chuong: store.setup.so_chuong
            }
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Lỗi khi kết nối với AI.');
        }

        const data = await res.json();
        const content = data.noi_dung || 'Không có nội dung trả về.';
        
        // Giả lập stream trên frontend cho mượt
        let index = 0;
        const interval = setInterval(() => {
          if (index < content.length) {
            setStreamText(prev => prev + content.charAt(index));
            index += 10;
          } else {
            clearInterval(interval);
            store.updateChuong(store.chuong_dang_chon, {
              noi_dung: content,
              trang_thai: 'ready'
            });
            setIsStreaming(false);
            store.setDangTai(false);
            store.setTabHienTai('noi_dung');
          }
        }, 20);

      } catch (err: any) {
        alert(err.message);
        store.setDangTai(false);
        setIsStreaming(false);
      }
    }
  };

  // Tải file .txt
  const handleExportTxt = () => {
    const currentChapter = store.danh_sach_chuong.find(c => c.so_chuong === store.chuong_dang_chon);
    let text = '';
    
    if (store.tab_hien_tai === 'dan_y') {
      text = `TÁC PHẨM: ${store.ten_tac_pham}\n\n${store.dan_y_tong_the}\n\n======================\nCHI TIẾT CHƯƠNG ${store.chuong_dang_chon}:\n${currentChapter?.dan_y || ''}`;
    } else {
      text = currentChapter?.noi_dung || 'Chưa có nội dung.';
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.ten_tac_pham}_Chuong_${store.chuong_dang_chon}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Điều hướng Pagination
  const handlePrevChapter = () => {
    if (store.chuong_dang_chon > 1) {
      store.selectChuong(store.chuong_dang_chon - 1);
      setStreamText('');
    }
  };

  const handleNextChapter = () => {
    if (store.chuong_dang_chon < store.danh_sach_chuong.length) {
      store.selectChuong(store.chuong_dang_chon + 1);
      setStreamText('');
    }
  };

  // Lấy nội dung hiển thị trong panel phải
  const currentChapter = store.danh_sach_chuong.find(c => c.so_chuong === store.chuong_dang_chon);

  if (!store.isHydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black font-sans text-amber-500">
        <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-amber-950 border-t-amber-500"></div>
        <p className="mt-4 text-sm tracking-widest text-zinc-400 uppercase">Đang nạp trạng thái bộ nhớ...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* HEADER HỆ THỐNG CAO CẤP */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-black shadow-lg shadow-amber-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wider text-zinc-100 uppercase">
              AI Novel & Script Generator
            </h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">
              Trợ Lý Biên Kịch Mạt Thế v2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Huy hiệu Mock Mode / Online Mode */}
          <button
            onClick={() => store.setUseMock(!store.useMock)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              store.useMock
                ? 'bg-amber-950/40 text-amber-400 border border-amber-800'
                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800'
            }`}
          >
            {store.useMock ? (
              <>
                <WifiOff className="h-3 w-3" />
                📶 MOCK MODE ACTIVE
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3" />
                🌐 ONLINE MODE API
              </>
            )}
          </button>

          {/* Nhập API Key */}
          {!store.useMock && (
            <div className="relative flex items-center">
              <Key className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="password"
                placeholder="Nhập Gemini API Key..."
                value={store.apiKey}
                onChange={(e) => store.setApiKey(e.target.value)}
                className="h-8 w-48 rounded-md border border-zinc-800 bg-zinc-900 pl-8 pr-3 text-xs text-zinc-300 outline-none transition-colors focus:border-amber-500 focus:bg-zinc-950"
              />
            </div>
          )}
        </div>
      </header>

      {/* GIAI ĐOẠN 1: MÀN HÌNH SETUP BAN ĐẦU */}
      {store.giai_doan === 1 && (
        <main className="flex flex-1 items-center justify-center px-4 py-12 bg-black">
          <div className="w-full max-w-3xl rounded-xl border border-zinc-900 bg-zinc-950/50 p-8 shadow-2xl shadow-amber-500/5 glow-amber-sm">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-wide text-zinc-100">
                THIẾT LẬP THAM SỐ AI NOVEL
              </h2>
              <p className="mt-2 text-xs text-zinc-400 uppercase tracking-widest">
                Định hình kịch bản sinh tồn mạt thế của bạn
              </p>
            </div>

            <div className="space-y-6">
              {/* Khối CHỦ ĐỀ */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-amber-500">
                  1. Khối Chủ Đề (Theme)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { name: 'Xuyên Không', desc: 'Vượt qua không gian & thời gian' },
                    { name: 'Trùng Sinh', desc: 'Bắt đầu lại cuộc đời, báo thù...' },
                    { name: 'Hệ Thống', desc: 'Giao diện nhiệm vụ & thăng cấp' },
                    { name: 'Sinh Tồn', desc: 'Vật lộn sống sót khắc nghiệt' },
                    { name: 'Võ Hiệp', desc: 'Ân oán giang hồ, kiếm hiệp' },
                    { name: 'Trinh Thám', desc: 'Phá án & ly kỳ bí ẩn' }
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => store.setSetup({ chu_de: theme.name })}
                      className={`flex flex-col items-start rounded-lg border p-3.5 text-left transition-all duration-300 ${
                        store.setup.chu_de === theme.name
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-sm font-semibold text-zinc-100">{theme.name}</span>
                      <span className="mt-1 text-[10px] text-zinc-400 leading-normal">{theme.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Khối PHONG CÁCH */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-sky-400">
                  2. Khối Phong Cách (Style)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { name: 'Tu Tiên / Tiên Hiệp', desc: 'Trường sinh đạo quả, tiên môn' },
                    { name: 'Huyền Huyễn', desc: 'Thần thú, huyết mạch bí ẩn' },
                    { name: 'Đô Thị', desc: 'Cuộc chiến ngầm phố thị' },
                    { name: 'Viễn Tưởng', desc: 'Khoa học viễn tưởng siêu tưởng' },
                    { name: 'Mạt Thế', desc: 'Ngày tàn nhân loại, dị chủng' },
                    { name: 'Cổ Đại', desc: 'Cung đấu, lịch sử quân sự cổ kính' }
                  ].map((style) => (
                    <button
                      key={style.name}
                      onClick={() => store.setSetup({ phong_cach: style.name })}
                      className={`flex flex-col items-start rounded-lg border p-3.5 text-left transition-all duration-300 ${
                        store.setup.phong_cach === style.name
                          ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-sm font-semibold text-zinc-100">{style.name}</span>
                      <span className="mt-1 text-[10px] text-zinc-400 leading-normal">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Khối MÔ TẢ CỐT TRUYỆN */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    3. Mô Tả Cốt Truyện (Tùy Chọn)
                  </label>
                  <button
                    onClick={handleRandomTemplate}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 transition-colors hover:text-amber-400"
                  >
                    <Sparkles className="h-3 w-3" />
                    ✨ AI Tự Tạo Ý Tưởng
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Nhập bối cảnh cốt truyện của riêng bạn... Hoặc click nút 'AI Tự Tạo Ý Tưởng' ở trên để AI tạo ngẫu nhiên một bối cảnh mạt thế kịch tính."
                  value={store.setup.mo_ta}
                  onChange={(e) => {
                    store.setSetup({ mo_ta: e.target.value });
                    setPromptError('');
                  }}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-amber-500 focus:bg-zinc-950"
                />
                {promptError && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {promptError}
                  </p>
                )}
              </div>

              {/* Khối QUY MÔ TÁC PHẨM */}
              <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/20 py-5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  4. Quy Mô Tác Phẩm
                </label>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleAdjustChapters(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold tracking-wider text-zinc-100">
                      {store.setup.so_chuong}
                    </span>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                      CHƯƠNG
                    </span>
                  </div>
                  <button
                    onClick={() => handleAdjustChapters(1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Nút CTA khởi tạo */}
              <button
                disabled={store.dang_tai}
                onClick={handleGenerateOutline}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-4 text-sm font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-500/10 transition-all duration-300 hover:bg-amber-400 hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {store.dang_tai ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang thiết lập dàn ý kịch bản...
                  </>
                ) : (
                  <>
                    🚀 TIẾN HÀNH SINH KỊCH BẢN AI
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* GIAI ĐOẠN 2: WORKSPACE CHÍNH (Layout 2 cột) */}
      {store.giai_doan === 2 && (
        <main className="flex flex-1 overflow-hidden">
          {/* CỘT TRÁI: SIDEBAR (30%) */}
          <aside className="w-80 flex flex-col border-r border-zinc-900 bg-zinc-950 p-5 shrink-0 overflow-y-auto">
            
            {/* Khối Cấu Hình tag (Read-only) */}
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-800/40">
                {store.setup.chu_de}
              </span>
              <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400 border border-sky-800/40">
                {store.setup.phong_cach}
              </span>
              <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-800">
                {store.setup.so_chuong} Chương
              </span>
            </div>

            {/* Tên Tác Phẩm */}
            <div className="mb-5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                TÊN TÁC PHẨM
              </label>
              <input
                type="text"
                value={store.ten_tac_pham}
                onChange={(e) => store.updateTenTacPham(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-200 outline-none focus:border-amber-500 focus:bg-zinc-950"
              />
            </div>

            {/* Danh Sách Chương */}
            <div className="mb-5 flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                DANH SÁCH CHƯƠNG
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {store.danh_sach_chuong.map((ch) => {
                  const isActive = ch.so_chuong === store.chuong_dang_chon;
                  const hasContent = ch.trang_thai === 'ready';
                  return (
                    <button
                      key={ch.so_chuong}
                      onClick={() => {
                        store.selectChuong(ch.so_chuong);
                        setStreamText('');
                      }}
                      className={`flex h-9 items-center justify-center rounded border text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500 glow-amber-sm'
                          : hasContent
                          ? 'border-emerald-800 bg-emerald-950/20 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {ch.so_chuong}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hồ Sơ Nhân Vật */}
            {store.nhan_vat.length > 0 && (
              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5">
                  HỒ SƠ NHÂN VẬT ĐÃ PHÁT HIỆN
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {store.nhan_vat.map((char, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-xs text-zinc-300"
                    >
                      <User className="h-3 w-3 text-amber-500" />
                      <span>{char}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cụm Nút Hành Động Ở Dưới Cùng */}
            <div className="mt-auto space-y-3 pt-4 border-t border-zinc-900">
              <button
                disabled={store.dang_tai}
                onClick={handleWriteChapter}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-emerald-500/5 transition-all duration-300 hover:bg-emerald-400 hover:shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {store.dang_tai && isStreaming ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ĐANG VIẾT...
                  </>
                ) : (
                  <>
                    Sinh phần tiếp theo
                  </>
                )}
              </button>

              <button
                disabled={store.dang_tai}
                onClick={() => {
                  if (confirm('⚠️ Bạn có chắc chắn muốn làm mới dự án? Toàn bộ thiết lập và kịch bản đã sinh sẽ bị XÓA SẠCH!')) {
                    store.resetStore();
                  }
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
              >
                <RefreshCw className="h-3 w-3" />
                Làm Mới Dự Án
              </button>
            </div>
          </aside>

          {/* CỘT PHẢI: KHÔNG GIAN HIỂN THỊ NỘI DUNG (70%) */}
          <section className="flex flex-1 flex-col bg-black">
            
            {/* Header Content Panel */}
            <div className="flex h-12 w-full items-center justify-between border-b border-zinc-900 bg-zinc-950 px-6 shrink-0">
              {/* Tab Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={() => store.setTabHienTai('dan_y')}
                  className={`relative h-12 text-xs font-bold uppercase tracking-wider transition-colors ${
                    store.tab_hien_tai === 'dan_y'
                      ? 'text-amber-500 border-b-2 border-amber-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  DÀN Ý KỊCH BẢN
                </button>
                <button
                  onClick={() => store.setTabHienTai('noi_dung')}
                  className={`relative h-12 text-xs font-bold uppercase tracking-wider transition-colors ${
                    store.tab_hien_tai === 'noi_dung'
                      ? 'text-amber-500 border-b-2 border-amber-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  CHI TIẾT TÁC PHẨM
                </button>
              </div>

              {/* Nút export */}
              <button
                onClick={handleExportTxt}
                className="flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Tải Toàn Bộ (.txt)
              </button>
            </div>

            {/* Box Nội Dung Lớn */}
            <div className="relative flex-1 p-8 overflow-y-auto bg-black flex flex-col">
              
              {/* Cụm Pagination góc trên bên phải của box nội dung */}
              <div className="absolute top-6 right-8 flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded px-2 py-1 text-xs">
                <button
                  disabled={store.chuong_dang_chon <= 1}
                  onClick={handlePrevChapter}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-zinc-400 select-none">
                  Chương {store.chuong_dang_chon}/{store.danh_sach_chuong.length}
                </span>
                <button
                  disabled={store.chuong_dang_chon >= store.danh_sach_chuong.length}
                  onClick={handleNextChapter}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Khu Vực Hiển Thị Văn Bản */}
              <div className="prose prose-invert max-w-4xl text-zinc-300 leading-relaxed font-sans text-sm mt-6">
                
                {/* 1. HIỂN THỊ DÀN Ý */}
                {store.tab_hien_tai === 'dan_y' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-zinc-100 tracking-wide border-b border-zinc-900 pb-3 uppercase">
                      📋 Dàn Ý Tổng Quan Truyện: {store.ten_tac_pham}
                    </h2>
                    
                    <div className="whitespace-pre-line bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 font-mono text-zinc-400 text-xs leading-normal">
                      {store.dan_y_tong_the}
                    </div>

                    {currentChapter && (
                      <div className="mt-8 border-t border-zinc-900 pt-6">
                        <h3 className="text-md font-bold text-amber-500 mb-2 uppercase">
                          📍 Tóm Tắt {currentChapter.tieu_de}:
                        </h3>
                        <p className="bg-zinc-950/60 border border-zinc-900/60 rounded p-4 text-xs leading-relaxed text-zinc-300 italic">
                          {currentChapter.dan_y}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. HIỂN THỊ NỘI DUNG VĂN BẢN */}
                {store.tab_hien_tai === 'noi_dung' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100 tracking-wide border-b border-zinc-900 pb-3">
                      ✍️ {store.ten_tac_pham}
                    </h2>

                    {isStreaming ? (
                      <div className="whitespace-pre-line bg-zinc-950/30 border border-zinc-900/50 rounded-lg p-6 font-serif text-md leading-loose">
                        {streamText}
                        <span className="inline-block h-4 w-2 bg-amber-500 animate-blink ml-1">▋</span>
                      </div>
                    ) : currentChapter?.noi_dung ? (
                      <div className="whitespace-pre-line bg-zinc-950/20 border border-zinc-900/30 rounded-lg p-6 font-serif text-md leading-loose">
                        {currentChapter.noi_dung}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
                        <FileText className="h-12 w-12 text-zinc-700 mb-4" />
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                          Chương này chưa có nội dung văn học
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 mb-5 max-w-xs">
                          Bấm vào nút "Sinh phần tiếp theo" ở cột điều khiển bên trái để kích hoạt AI viết kịch bản.
                        </p>
                        <button
                          disabled={store.dang_tai}
                          onClick={handleWriteChapter}
                          className="flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-xs font-bold text-black shadow hover:bg-amber-400 transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Sinh Chi Tiết Chương {store.chuong_dang_chon}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
