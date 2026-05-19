'use client';

import { useWorkspaceStore } from '../../store/state-json';

export default function WorkspacePage() {
  const {
    config, updateConfig,
    stateJSON, setStateJSON,
    currentOutput, setCurrentOutput,
    isStreaming, setIsStreaming,
    activeTab, setActiveTab,
    selectedChapter, setSelectedChapter,
    resetWorkspace
  } = useWorkspaceStore();

  // Kiểm tra xem kịch bản đã được khởi tạo hay chưa để đổi Phase Layout
  const isInitialized = stateJSON.con_tro.pha !== "KHOI_TAO";

  const handleStartGeneration = async () => {
    if (!config.chủ_đề || !config.phong_cách) {
      alert("Vui lòng chọn đầy đủ Chủ đề và Phong cách!");
      return;
    }
    setIsStreaming(true);
    setCurrentOutput("");
    setStateJSON({ con_tro: { ...stateJSON.con_tro, pha: "DANG_XU_LY" } });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, stateJSON, requestType: "INITIAL_PACKAGE" })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setCurrentOutput(accumulatedText);
      }

      // Logic bóc tách STATE_JSON từ AI trả về để cập nhật ứng dụng
      const jsonRegex = /```STATE_JSON([\s\S]*?)```/;
      const match = accumulatedText.match(jsonRegex);
      if (match && match[1]) {
        try {
          const parsedJSON = JSON.parse(match[1].trim());
          setStateJSON(parsedJSON);
        } catch (e) {
          console.error("Lỗi parse STATE_JSON ẩn từ AI:", e);
        }
      }
      
      setStateJSON({ con_tro: { chuong: 1, tap_tiep_theo: 1, pha: "HIEN_THI" } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNextEpisode = async () => {
    if (!selectedChapter) {
      alert("Hãy chọn một chương cụ thể trong danh mục trước khi ra lệnh viết tiếp!");
      return;
    }
    setIsStreaming(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, stateJSON, requestType: "NEXT_EPISODE", selectedChapter })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = currentOutput + "\n\n=== PHẦN TIẾP THEO ===\n\n";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setCurrentOutput(accumulatedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  // --- PHASE 1: LAYOUT THIẾT LẬP BAN ĐẦU ---
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-[#111] border border-[#222] rounded-xl p-8 shadow-2xl animate-fade-in">
          <h2 className="text-xl font-bold text-center mb-8 uppercase tracking-wider text-orange-500 font-heading">
            Cấu hình kịch bản mạt thế
          </h2>
          
          {/* Khối Chủ Đề */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-400">1. CHỦ ĐỀ SỐNG CÒN (Chọn 1)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'Xuyên Không', desc: 'Vượt qua không gian & thời gian' },
                { id: 'Trùng Sinh', desc: 'Bắt đầu lại cuộc đời, báo thù' },
                { id: 'Hệ Thống', desc: 'Giao diện nhiệm vụ & thăng cấp' },
                { id: 'Sinh Tồn', desc: 'Vật lộn sống sót khắc nghiệt' },
                { id: 'Võ Hiệp', desc: 'Ân oán giang hồ mạt thế' },
                { id: 'Trinh Thám', desc: 'Phá án, ẩn số ly kỳ bí ẩn' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateConfig({ chủ_đề: item.id })}
                  className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                    config.chủ_đề === item.id 
                      ? 'border-orange-500 bg-orange-950/20 text-white shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                      : 'border-[#222] bg-[#161616] hover:border-[#333] text-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{item.id}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Khối Phong Cách */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-400">2. PHONG CÁCH BỐI CẢNH (Chọn 1)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Tu Tiên / Tiên Hiệp', 'Huyền Huyễn', 'Đô Thị', 'Viễn Tưởng', 'Mạt Thế', 'Cổ Đại'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateConfig({ phong_cách: style })}
                  className={`p-3 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                    config.phong_cách === style 
                      ? 'border-orange-500 bg-orange-950/20 text-white shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                      : 'border-[#222] bg-[#161616] hover:border-[#333] text-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Khối Mô Tả Cốt Truyện */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-400">3. MÔ TẢ CỐT TRUYỆN CHI TIẾT (Tùy chọn prompt)</label>
            <textarea
              value={config.mô_tả}
              onChange={(e) => updateConfig({ mô_tả: e.target.value })}
              placeholder="Ví dụ: Nhân vật chính Vương Bảo là một phàm nhân bị thảm nhầy ăn mòn cơ chân, trốn chạy trong hạ tầng đường ngầm Quảng Nam cũ..."
              className="w-full h-28 bg-[#161616] border border-[#222] rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder-gray-600 text-white"
            />
          </div>

          {/* Khối Quy Mô */}
          <div className="mb-8 flex items-center justify-between bg-[#161616] p-4 rounded-lg border border-[#222]">
            <div>
              <div className="text-sm font-semibold">4. QUY MÔ TÁC PHẨM</div>
              <div className="text-xs text-gray-500">Tổng số lượng chương kịch bản cần AI thiết lập quy trình</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => updateConfig({ số_chương: Math.max(1, config.số_chương - 1) })} 
                className="w-8 h-8 rounded bg-[#222] hover:bg-[#333] flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                -
              </button>
              <div className="text-lg font-bold min-w-[40px] text-center">
                {config.số_chương} 
                <span className="text-xs text-gray-500 block">CHƯƠNG</span>
              </div>
              <button 
                type="button"
                onClick={() => updateConfig({ số_chương: config.số_chương + 1 })} 
                className="w-8 h-8 rounded bg-[#222] hover:bg-[#333] flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút Kích Hoạt */}
          <button
            onClick={handleStartGeneration}
            disabled={isStreaming}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold tracking-wider text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isStreaming ? "ĐANG TÍNH TOÁN VÀ XÂY DỰNG HỆ SINH THÁI..." : "🚀 TIẾN HÀNH SINH KỊCH BẢN AI"}
          </button>
        </div>
      </div>
    );
  }

  // --- PHASE 2: WORKSPACE CHÍNH (LAYOUT CHIA 2 CỘT TỶ LỆ 3:7) ---
  return (
    <div className="min-h-screen bg-[#060606] text-gray-300 flex flex-col lg:flex-row border-t border-[#1a1a1a] animate-fade-in lg:h-screen overflow-hidden">
      
      {/* CỘT TRÁI: PANEL ĐIỀU KHIỂN & STATE LOGIC (30% WIDTH) */}
      <aside className="lg:w-[30%] border-r border-[#161616] bg-[#0c0c0c] p-5 flex flex-col justify-between overflow-y-auto select-none shrink-0">
        <div className="space-y-6">
          
          {/* Thẻ hiển thị Tên Tác Phẩm */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Tên tác phẩm</label>
            <input
              type="text"
              defaultValue={`${config.chủ_đề} - ${config.phong_cách}`}
              className="w-full bg-[#141414] border border-[#222] rounded px-3 py-2 text-sm font-semibold text-white focus:outline-none"
            />
          </div>

          {/* Mục Lục Bộ Chương Trình */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Danh sách chương kịch bản</label>
              <span className="text-xs px-2 py-0.5 rounded bg-orange-950/50 text-orange-400 font-mono border border-orange-900/30">
                {config.số_chương} Chương
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: config.số_chương }).map((_, i) => {
                const num = i + 1;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedChapter(num)}
                    className={`h-10 rounded text-sm font-mono font-bold transition-all border cursor-pointer ${
                      selectedChapter === num 
                        ? 'bg-orange-600 border-orange-500 text-white shadow-md' 
                        : 'bg-[#141414] border-[#222] hover:border-[#333] text-gray-400'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sổ Nợ Cơ Thể & Tài Nguyên Thực Tế */}
          <div className="bg-[#121212] border border-[#1c1c1c] rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase border-b border-[#222] pb-1.5 flex justify-between">
              <span>Chỉ số Cơ Thể & Hậu Cần</span>
              <span className="text-orange-500 font-mono text-[11px]">STATE_JSON</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#161616] p-2 rounded border border-[#222]">
                <div className="text-gray-500 text-[10px]">💧 NƯỚC SẠCH</div>
                <div className="font-bold text-white mt-0.5">{stateJSON.tai_nguyen.nhom_main.nuoc_lit} Lít</div>
              </div>
              <div className="bg-[#161616] p-2 rounded border border-[#222]">
                <div className="text-gray-500 text-[10px]">🥩 LƯƠNG THỰC</div>
                <div className="font-bold text-white mt-0.5">{stateJSON.tai_nguyen.nhom_main.thuc_an_kcal} Kcal</div>
              </div>
              <div className="bg-[#161616] p-2 rounded border border-[#222]">
                <div className="text-gray-500 text-[10px]">🚨 METER LEO THANG</div>
                <div className="font-bold text-red-400 mt-0.5">{stateJSON.dong_ho_leo_thang.escalation_meter}/100</div>
              </div>
              <div className="bg-[#161616] p-2 rounded border border-[#222]">
                <div className="text-gray-500 text-[10px]">🎭 CẤP HỆ SINH THÁI</div>
                <div className="font-bold text-yellow-500 mt-0.5">{stateJSON.dong_ho_leo_thang.cap_hien_tai}</div>
              </div>
            </div>

            {stateJSON.vet_thuong.danh_sach.length > 0 && (
              <div className="text-xs bg-red-950/20 border border-red-900/30 p-2 rounded text-red-400 animate-pulse">
                ⚠️ Vết thương sâu: {stateJSON.vet_thuong.danh_sach.join(', ')}
              </div>
            )}
          </div>

          {/* Cấu Hình Read-Only để Nhắc Nhở Context */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Thẻ cấu hình gốc</label>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded bg-[#161616] border border-[#222] font-semibold text-gray-300">{config.chủ_đề}</span>
              <span className="text-xs px-2.5 py-1 rounded bg-[#161616] border border-[#222] font-semibold text-gray-300">{config.phong_cách}</span>
            </div>
          </div>
        </div>

        {/* Nút Hành Động Phía Dưới Sidebar */}
        <div className="pt-4 border-t border-[#161616] flex gap-3 mt-6">
          <button
            onClick={resetWorkspace}
            className="px-4 py-2.5 text-xs font-bold rounded bg-[#1c1c1c] hover:bg-[#262626] border border-[#2c2c2c] transition-colors cursor-pointer"
          >
            LÀM MỚI
          </button>
          <button
            onClick={handleNextEpisode}
            disabled={isStreaming || !selectedChapter}
            className="flex-1 py-2.5 text-xs font-bold rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 tracking-wider cursor-pointer text-center"
          >
            {isStreaming ? "AI ĐANG GHI SỔ NỢ..." : "SINH PHẦN TIẾP THEO"}
          </button>
        </div>
      </aside>

      {/* CỘT PHẢI: KHÔNG GIAN HIỂN THỊ TEXT NỘI DUNG TỪ AI (70% WIDTH) */}
      <main className="flex-1 flex flex-col bg-[#080808] lg:h-full lg:overflow-hidden">
        
        {/* Header Content Điều Hướng Tab nội bộ */}
        <div className="h-14 border-b border-[#161616] px-6 flex items-center justify-between select-none shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('dan_y')}
              className={`text-sm font-bold pb-4 pt-4 border-b-2 transition-all cursor-pointer ${
                activeTab === 'dan_y' ? 'border-orange-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Dàn ý kịch bản chính
            </button>
            <button
              onClick={() => setActiveTab('chi_tiet')}
              className={`text-sm font-bold pb-4 pt-4 border-b-2 transition-all cursor-pointer ${
                activeTab === 'chi_tiet' ? 'border-orange-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Chi tiết tác phẩm (TXT)
            </button>
          </div>
          
          <button
            onClick={() => {
              const element = document.createElement("a");
              const file = new Blob([currentOutput], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = `kich-ban-mat-the-chuong-${selectedChapter || 1}.txt`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="text-xs px-3 py-1.5 rounded bg-[#161616] border border-[#222] hover:bg-[#222] font-semibold transition-colors cursor-pointer text-accent-orange"
          >
            Tải toàn bộ (.txt)
          </button>
        </div>

        {/* Khu vực Đọc/Xem văn bản xuất ra từ AI */}
        <div className="flex-1 p-8 overflow-y-auto font-sans leading-relaxed text-gray-300 selection:bg-orange-500/20 whitespace-pre-wrap">
          {currentOutput ? (
            <div className={`max-w-3xl mx-auto space-y-4 markdown-body ${isStreaming ? 'typing-cursor' : ''}`}>
              {currentOutput}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 select-none space-y-2">
              <svg className="w-12 h-12 stroke-current opacity-30" viewBox="0 0 24 24" fill="none">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm">Nội dung kịch bản văn bản từ AI sẽ xuất hiện chạy luồng tại đây.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
