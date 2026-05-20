'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNovelStore, TROPHIC_WEB, FORBIDDEN_MOVES } from '@/store/useNovelStore';
import MarkdownBody from '@/components/MarkdownBody';

export default function Home() {
  const store = useNovelStore();
  const renderedTextRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [keyInputText, setKeyInputText] = useState("");
  const [expandedSection, setExpandedSection] = useState("somatic"); // "somatic" | "genius" | "trophic" | "props"

  // Injury Tracker Form State
  const [newInjuryPart, setNewInjuryPart] = useState("");
  const [newInjuryPain, setNewInjuryPain] = useState(5);
  const [newInjuryConsequence, setNewInjuryConsequence] = useState("");

  const handleAddInjurySubmit = (e) => {
    e.preventDefault();
    if (!newInjuryPart.trim() || !newInjuryConsequence.trim()) return;
    store.addInjury({
      part: newInjuryPart.trim(),
      pain: newInjuryPain,
      consequence: newInjuryConsequence.trim()
    });
    setNewInjuryPart("");
    setNewInjuryPain(5);
    setNewInjuryConsequence("");
  };

  // Load API keys into local state when opening settings
  useEffect(() => {
    if (store.apiKeys && store.apiKeys.length > 0) {
      setKeyInputText(store.apiKeys.join("\n"));
    }
  }, [store.apiKeys]);

  // Auto-scroll when streaming text updates
  useEffect(() => {
    if (renderedTextRef.current) {
      renderedTextRef.current.scrollTop = renderedTextRef.current.scrollHeight;
    }
  }, [store.displayedText]);

  // Phase 1 -> Phase 2 Outline Streaming Trigger
  const handleStartOutline = (e) => {
    e.preventDefault();
    store.startOutlineGeneration();
  };

  // Chapter Writing Streaming Trigger
  const handleWriteChapter = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    store.writeActiveChapter();
  };

  // Switch Tab Handler
  const handleSwitchTab = (tab) => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    store.switchTab(tab);
  };

  // Select Chapter from Sidebar Grid
  const handleSelectChapter = (index) => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    store.selectChapter(index);
  };

  // Chapter pagination navigator
  const handleNavigateChapter = (direction) => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    store.navigateChapter(direction);
  };

  // Download raw text file helper
  const triggerDownload = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Full Novel Text file
  const handleExportFullNovel = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    
    const title = store.novelTitle || "AI-Kich-Ban-Tieu-Thuyet";
    
    let text = `==================================================\n`;
    text += `TÁC PHẨM SINH BỞI AI NOVEL GENERATOR - LOGIC CỨNG\n`;
    text += `TÊN TRUYỆN: ${title.toUpperCase()}\n`;
    text += `==================================================\n\n`;
    
    text += store.outlineText;
    text += `\n\n==================================================\n`;
    text += `CHI TIẾT CÁC CHƯƠNG\n`;
    text += `==================================================\n\n`;
    
    let writtenChaptersCount = 0;
    store.chapters.forEach(ch => {
      text += `--------------------------------------------------\n`;
      text += `Chương ${ch.number}: ${ch.title.split(": ")[1] || ch.title}\n`;
      text += `--------------------------------------------------\n\n`;
      if (ch.written) {
        text += ch.content;
        writtenChaptersCount++;
      } else {
        text += `[Chương này chưa được tiến hành viết nội dung chi tiết bằng AI]`;
      }
      text += `\n\n\n`;
    });
    
    text += `\n==================================================\n`;
    text += `Tổng số chương thiết lập: ${store.chapters.length}\n`;
    text += `Số chương đã viết thành công: ${writtenChaptersCount}\n`;
    text += `Ngày tạo kịch bản: ${new Date().toLocaleDateString("vi-VN")}\n`;
    text += `==================================================\n`;
    
    const safeFilename = title.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-full.txt";
    triggerDownload(safeFilename, text);
  };

  // Download active view (.txt)
  const handleDownloadActiveView = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    
    const title = store.novelTitle || "AI-Kich-Ban";
    const prefix = title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    
    if (store.activeTab === "outline") {
      triggerDownload(`${prefix}-dan-y.txt`, store.outlineText);
    } else {
      const ch = store.chapters[store.activeChapterIndex];
      if (!ch || !ch.written) {
        alert("Chương này chưa có nội dung để tải về!");
        return;
      }
      let txt = `Chương ${ch.number}: ${ch.title.split(": ")[1] || ch.title}\n\n${ch.content}`;
      triggerDownload(`${prefix}-chuong-${ch.number}.txt`, txt);
    }
  };

  // Copy active text to Clipboard
  const handleCopyToClipboard = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    
    let text = "";
    if (store.activeTab === "outline") {
      text = store.outlineText;
    } else {
      const ch = store.chapters[store.activeChapterIndex];
      if (!ch || !ch.written) {
        alert("Chương này chưa có nội dung để sao chép!");
        return;
      }
      text = `Chương ${ch.number}: ${ch.title.split(": ")[1] || ch.title}\n\n${ch.content}`;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Đã sao chép nội dung vào khay nhớ tạm!");
      })
      .catch(err => {
        console.error("Không thể sao chép: ", err);
      });
  };

  // Reset entire application back to Phase 1
  const handleConfirmReset = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    
    if (window.confirm("Bạn có chắc chắn muốn làm mới? Toàn bộ nội dung kịch bản hiện tại sẽ bị xóa sạch.")) {
      store.reset();
    }
  };

  const handleSaveApiKeys = () => {
    const keys = keyInputText
      .split("\n")
      .map(k => k.trim())
      .filter(k => k.length > 0);
    store.setApiKeys(keys);
    setIsSettingsOpen(false);
    alert(`Đã lưu ${keys.length} API Keys thành công!`);
  };

  const activeChapter = store.chapters[store.activeChapterIndex];
  
  // Lọc danh sách hành vi bị cấm hiện tại của somatic feedback + Chấn thương vật lý
  const currentForbidden = FORBIDDEN_MOVES.filter(m => {
    if (m.minFatigue && store.fatigue >= m.minFatigue) return true;
    if (m.minToxin && store.toxin >= m.minToxin) return true;
    return false;
  }).map(m => ({ move: m.move }));

  // Nạp chấn thương vật lý
  store.injuries.forEach(inj => {
    currentForbidden.push({
      move: `Bị thương ở ${inj.part} (Độ đau ${inj.pain}/10): ${inj.consequence}`
    });
  });

  const parsedProps = store.signatureProps
    .split(",")
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className="app-container bg-[#080808] text-zinc-300 min-h-screen font-sans antialiased relative">
      
      {/* HEADER TÁC PHẨM CẬP NHẬT GIAO DIỆN PREMIUM */}
      <header className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between shrink-0 bg-[#0d0d0d] sticky top-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-950/20">
            ☢️
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider font-heading">CHUYÊN GIA MẠT THẾ</h1>
            <p className="text-[10px] text-zinc-500 tracking-wide uppercase font-mono">Trợ lý kịch bản logic cứng v2.0</p>
          </div>
        </div>

        {/* NÚT CÀI ĐẶT RĂNG CƯA */}
        <div className="flex items-center gap-4">
          {store.rotationMessage && (
            <span className="text-[11px] font-mono text-amber-500 animate-pulse bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded">
              🔄 {store.rotationMessage}
            </span>
          )}
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shadow"
            title="Cấu hình API Keys"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ==================== GIAI ĐOẠN 1: MÀN HÌNH SETUP BAN ĐẦU ==================== */}
      <main id="phase-1" className={`phase ${store.phase === 1 ? 'active' : 'hidden'}`}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          <header className="setup-header text-center mb-10">
            <span className="inline-block text-xs px-3 py-1 rounded bg-orange-950/40 border border-orange-900/30 text-orange-500 font-bold uppercase tracking-widest mb-3">
              ☢️ Wasteland Somatic Engine
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase mb-3 font-heading">
              Biên kịch Mạt thế Logic Cứng
            </h1>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm">
              Bộ lọc logic ngăn chặn tuyệt đối trạng thái AI viết bừa, "buff bẩn". Kiểm soát nghiêm ngặt thể chất phàm nhân và quy luật hệ sinh thái 8 tầng.
            </p>
          </header>

          <form id="setup-form" onSubmit={handleStartOutline} className="space-y-8 bg-[#0d0d0d] border border-zinc-900 rounded-xl p-8 shadow-xl">
            
            {/* 1. KHỐI CHỦ ĐỀ (THEME) */}
            <div className="form-section">
              <div className="section-title-wrapper flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">1. CHỦ ĐỀ CHÍNH</h2>
                <span className="text-xs px-2.5 py-0.5 rounded bg-orange-950/50 text-orange-400 font-bold font-mono border border-orange-900/20">{store.theme}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'Sinh Tồn', desc: 'Vật lộn sống sót khốc liệt, khan hiếm.', icon: '🎒' },
                  { value: 'Trùng Sinh', desc: 'Trở lại quá khứ, báo thù dựa trên logic.', icon: '⏳' },
                  { value: 'Xuyên Không', desc: 'Sử dụng tri thức hiện đại đè bẹp cổ đại.', icon: '🌀' },
                  { value: 'Hệ Thống', desc: 'Giao diện tính toán cơ học phàm nhân.', icon: '🖥️' },
                  { value: 'Thám Hiểm', desc: 'Khai thác phế tích cổ đại đầy cạm bẫy.', icon: '🧭' },
                  { value: 'Tự Do', desc: 'Tùy chỉnh cốt truyện mạt thế phóng khoáng.', icon: '🎲' }
                ].map((t) => (
                  <div 
                    key={t.value} 
                    className={`border p-4 rounded-lg cursor-pointer transition-all ${store.theme === t.value ? 'bg-orange-950/15 border-orange-600 shadow-md shadow-orange-950/10' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'}`}
                    onClick={() => store.setTheme(t.value)}
                  >
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <div className="font-bold text-sm text-white">{t.value}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. KHỐI PHONG CÁCH (STYLE) */}
            <div className="form-section">
              <div className="section-title-wrapper flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">2. PHONG CÁCH CHẤP BÚT</h2>
                <span className="text-xs px-2.5 py-0.5 rounded bg-blue-950/50 text-blue-400 font-bold font-mono border border-blue-900/20">{store.style}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'Mạt Thế', desc: 'Thế giới sụp đổ, phóng xạ, tang thi.', icon: '☣️' },
                  { value: 'Huyền Huyễn', desc: 'Yếu tố ma pháp thần bí thô ráp cổ xưa.', icon: '🪐' },
                  { value: 'Tu Tiên', desc: 'Đạo pháp lạnh lùng, tài nguyên suy kiệt.', icon: '⚔️' },
                  { value: 'Đô Thị Mạt Thế', desc: 'Thương trường pha lẫn hoang tàn phế tích.', icon: '🏙️' },
                  { value: 'Viễn Tưởng', desc: 'Cyberpunk rỉ sét, AI biến dị nổi loạn.', icon: '🤖' },
                  { value: 'Khắc Nghiệt', desc: 'Tả thực gai góc, bạo lực sinh học trần trụi.', icon: '🔥' }
                ].map((s) => (
                  <div 
                    key={s.value} 
                    className={`border p-4 rounded-lg cursor-pointer transition-all ${store.style === s.value ? 'bg-blue-950/15 border-blue-600 shadow-md shadow-blue-950/10' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'}`}
                    onClick={() => store.setStyle(s.value)}
                  >
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="font-bold text-sm text-white">{s.value}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MÔ TẢ Ý TƯỞNG CỐT TRUYỆN */}
            <div className="form-section">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-white uppercase tracking-wider font-heading">3. Ý tưởng kịch bản gốc</label>
                <button
                  type="button"
                  onClick={() => store.generateAIPrompt()}
                  className="px-3 py-1 text-xs rounded-full bg-orange-950/45 hover:bg-orange-900/60 border border-orange-500/30 text-orange-400 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  ✨ AI Tự Tạo Ý Tưởng
                </button>
              </div>
              <textarea 
                className="w-full h-24 p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder-zinc-700" 
                value={store.prompt}
                onChange={(e) => store.setPrompt(e.target.value)}
                placeholder="Ví dụ: Tiêu Hàn là phàm nhân bị rách gân gót chân phải, ẩn nấp trong phế tích lò phản ứng hạt nhân Ninh Thuận cũ, sở hữu chiếc bật lửa đồng rỉ sét và phải tìm mọi cách vượt qua sự lùng sục gắt gao của Drone Săn Mồi Độc Lập..."
              />
            </div>

            {/* 4. QUY MÔ KỊCH BẢN */}
            <div className="form-section flex items-center justify-between bg-zinc-950 border border-zinc-900 p-4 rounded-lg">
              <div>
                <h3 className="font-bold text-sm text-white uppercase font-heading">4. Quy mô kịch bản</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Xác định tổng số chương cho kịch bản</p>
              </div>
              <div className="flex items-center gap-3 bg-[#0d0d0d] border border-zinc-800 rounded p-1.5">
                <button type="button" className="w-8 h-8 rounded hover:bg-zinc-900 text-lg font-bold" onClick={() => store.stepChapters(-1)}>-</button>
                <div className="text-center font-mono font-bold text-sm w-16">
                  {store.chaptersCount} <span className="text-[10px] text-zinc-500 font-normal">TẬP</span>
                </div>
                <button type="button" className="w-8 h-8 rounded hover:bg-zinc-900 text-lg font-bold" onClick={() => store.stepChapters(1)}>+</button>
              </div>
            </div>

            {/* TIẾN HÀNH SINH KỊCH BẢN AI */}
            <div className="pt-4 border-t border-zinc-900 text-center">
              <button 
                type="submit" 
                className="w-full py-3.5 rounded-lg bg-orange-600 hover:bg-orange-500 transition-colors font-bold text-sm text-white tracking-widest cursor-pointer shadow-lg shadow-orange-950/20 uppercase"
              >
                ✦ Khởi tạo Dàn ý kịch bản chính thức ✦
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* ==================== GIAI ĐOẠN 2: WORKSPACE CHÍNH ==================== */}
      <main id="phase-2" className={`phase ${store.phase === 2 ? 'block' : 'hidden'}`}>
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
          
          {/* CỘT TRÁI: SIDEBAR ĐIỀU KHIỂN & BỘ LỌC LOGIC CỨNG (30% WIDTH) */}
          <aside className="w-full lg:w-96 border-r border-zinc-900 bg-[#0c0c0c] p-6 overflow-y-auto shrink-0 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Tên tác phẩm */}
              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">TÊN TÁC PHẨM</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-950 border border-zinc-900 rounded p-2.5 text-sm font-bold text-white focus:outline-none focus:border-zinc-800" 
                  value={store.novelTitle}
                  disabled={store.isGeneratingOutline || store.isWritingChapter}
                  onChange={(e) => store.setNovelTitle(e.target.value)}
                />
              </div>

              {/* Lưới chọn chương */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">DANH SÁCH CHƯƠNG</label>
                  <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                    {store.chapters.length} Chương
                  </span>
                </div>
                
                <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {store.chapters.map((ch, i) => (
                    <button
                      key={ch.number}
                      onClick={() => handleSelectChapter(i)}
                      disabled={store.isGeneratingOutline || store.isWritingChapter}
                      className={`h-9 rounded text-xs font-mono font-bold transition-all border cursor-pointer ${
                        ch.written
                          ? i === store.activeChapterIndex
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow shadow-emerald-950/20'
                            : 'bg-emerald-950/25 border-emerald-900/30 text-emerald-400 hover:border-emerald-800'
                          : i === store.activeChapterIndex
                            ? 'bg-orange-600 border-orange-500 text-white shadow shadow-orange-950/20'
                            : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {ch.number}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHỈ SỐ SINH TỒN HUD */}
              <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-950/40 space-y-3">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">📊 TÀI NGUYÊN SINH TỒN</span>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Nước */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-blue-400">💧 NƯỚC</span>
                      <span className="font-bold text-zinc-300">{store.water}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${store.water}%` }}></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => store.setWater(Math.max(0, store.water - 10))}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        -10%
                      </button>
                      <button 
                        type="button" 
                        onClick={() => store.setWater(Math.min(100, store.water + 10))}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        +10%
                      </button>
                    </div>
                  </div>

                  {/* Lương thực */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-amber-500">🍞 LƯƠNG THỰC</span>
                      <span className="font-bold text-zinc-300">{store.food}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-1.5 overflow-hidden">
                      <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${store.food}%` }}></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => store.setFood(Math.max(0, store.food - 10))}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        -10%
                      </button>
                      <button 
                        type="button" 
                        onClick={() => store.setFood(Math.min(100, store.food + 10))}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        +10%
                      </button>
                    </div>
                  </div>

                  {/* Đạn dược */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-red-400">🔫 ĐẠN DƯỢC</span>
                      <span className="font-bold text-zinc-300">{store.ammo} viên</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <button 
                        type="button" 
                        onClick={() => store.setAmmo(Math.max(0, store.ammo - 1))}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        -1 viên
                      </button>
                      <button 
                        type="button" 
                        onClick={() => store.setAmmo(store.ammo + 1)}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        +1 viên
                      </button>
                    </div>
                  </div>

                  {/* Dây rút */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-emerald-400">⛓️ DÂY RÚT</span>
                      <span className="font-bold text-zinc-300">{store.cableTies} sợi</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <button 
                        type="button" 
                        onClick={() => store.setCableTies(Math.max(0, store.cableTies - 1))}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        -1 sợi
                      </button>
                      <button 
                        type="button" 
                        onClick={() => store.setCableTies(store.cableTies + 1)}
                        className="w-full py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        +1 sợi
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* BỘ LỌC CỨNG LOGIC & CHỈ SỐ (ACCORDION SECTIONS) */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden bg-[#080808]">
                
                {/* HEADERS SELECT TABS */}
                <div className="grid grid-cols-4 border-b border-zinc-900 bg-zinc-950 text-[10px] font-mono font-bold select-none text-center">
                  <button 
                    onClick={() => setExpandedSection("somatic")}
                    className={`py-2 border-r border-zinc-900 transition-colors ${expandedSection === "somatic" ? "bg-orange-950/20 text-orange-400" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    🩸 THÂN THỂ
                  </button>
                  <button 
                    onClick={() => setExpandedSection("genius")}
                    className={`py-2 border-r border-zinc-900 transition-colors ${expandedSection === "genius" ? "bg-blue-950/20 text-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    ⚙️ TÁC CHIẾN
                  </button>
                  <button 
                    onClick={() => setExpandedSection("trophic")}
                    className={`py-2 border-r border-zinc-900 transition-colors ${expandedSection === "trophic" ? "bg-yellow-950/20 text-yellow-400" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    ☢️ TROPHIC
                  </button>
                  <button 
                    onClick={() => setExpandedSection("props")}
                    className={`py-2 transition-colors ${expandedSection === "props" ? "bg-emerald-950/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    🎒 CỔNG TỪ
                  </button>
                </div>

                {/* CONTENT AREA FOR EACH FILTER TAB */}
                <div className="p-4 space-y-4">
                  
                  {/* TAB 1: VÒNG LẶP PHẢN HỒI CƠ THỂ */}
                  {expandedSection === "somatic" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-white mb-2 uppercase flex items-center justify-between font-heading">
                          <span>Chỉ số cơ thể phàm nhân</span>
                          {currentForbidden.length > 0 && (
                            <span className="text-[10px] bg-red-950 border border-red-900 px-1.5 py-0.5 rounded text-red-500 font-mono animate-pulse">
                              ⚠️ Vượt ngưỡng!
                            </span>
                          )}
                        </h4>
                        
                        <div className="space-y-3">
                          {/* Fatigue Slider */}
                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span className="text-zinc-500">Mức kiệt sức (Fatigue)</span>
                              <span className={`font-bold ${store.fatigue > 60 ? 'text-red-500' : 'text-zinc-300'}`}>{store.fatigue}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" max="100" 
                              value={store.fatigue}
                              onChange={(e) => store.setFatigue(parseInt(e.target.value))}
                              className="w-full accent-orange-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Toxin Slider */}
                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span className="text-zinc-500">Mức nhiễm độc (Toxin)</span>
                              <span className={`font-bold ${store.toxin > 60 ? 'text-red-500' : 'text-zinc-300'}`}>{store.toxin}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" max="100" 
                              value={store.toxin}
                              onChange={(e) => store.setToxin(parseInt(e.target.value))}
                              className="w-full accent-red-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Forbidden Moves Box */}
                      <div className="border border-zinc-900 rounded bg-zinc-950/50 p-3 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide block">HÀNH VI BỊ CẤM CỦA PHÀM NHÂN</span>
                        {currentForbidden.length === 0 ? (
                          <p className="text-xs text-zinc-600 italic">Chỉ số sinh học an toàn. Không có hành vi bị cấm.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {currentForbidden.map((m, idx) => (
                              <li key={idx} className="text-xs text-red-400/90 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-red-600 font-medium">
                                {m.move}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* INJURY TRACKER PANEL */}
                      <div className="border border-zinc-900 rounded bg-zinc-950/50 p-3 space-y-3">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide block">🩹 SỔ RÁCH CƠ THỂ (INJURY TRACKER)</span>
                        
                        {/* List of current injuries */}
                        {store.injuries.length === 0 ? (
                          <p className="text-xs text-zinc-600 italic">Chưa ghi nhận chấn thương vật lý nào.</p>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {store.injuries.map((inj) => (
                              <div key={inj.id} className="bg-[#0c0c0c] border border-zinc-900 rounded p-2 text-[11px] flex items-start justify-between gap-2 shadow-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-red-400">📍 {inj.part}</span>
                                    <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-mono font-bold ${
                                      inj.pain >= 8 ? 'bg-red-950/50 border border-red-900/40 text-red-500' :
                                      inj.pain >= 5 ? 'bg-amber-950/50 border border-amber-900/40 text-amber-500' :
                                      'bg-zinc-900 border border-zinc-800 text-zinc-400'
                                    }`}>
                                      Đau: {inj.pain}/10
                                    </span>
                                  </div>
                                  <p className="text-zinc-400"><span className="text-zinc-500 font-medium">Hậu quả:</span> {inj.consequence}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => store.removeInjury(inj.id)}
                                  className="text-zinc-600 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                  title="Xóa vết thương"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new injury form */}
                        <div className="border-t border-zinc-900 pt-2.5 mt-2 space-y-2">
                          <span className="text-[9.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Thêm chấn thương mới</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            <input 
                              type="text"
                              required
                              placeholder="Bộ phận"
                              className="col-span-2 bg-zinc-950 border border-zinc-900 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                              value={newInjuryPart}
                              onChange={(e) => setNewInjuryPart(e.target.value)}
                            />
                            <select
                              className="bg-zinc-950 border border-zinc-900 rounded p-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-800"
                              value={newInjuryPain}
                              onChange={(e) => setNewInjuryPain(parseInt(e.target.value))}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>Đau: {n}</option>
                              ))}
                            </select>
                          </div>
                          <input 
                            type="text"
                            required
                            placeholder="Ví dụ: Khập khiễng không thể chạy"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                            value={newInjuryConsequence}
                            onChange={(e) => setNewInjuryConsequence(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={(e) => handleAddInjurySubmit(e)}
                            className="w-full py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer text-center"
                          >
                            🩹 Thêm Chấn Thương
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: KIẾN TRÚC CHIẾN THUẬT "GENIUS BEAT" */}
                  {expandedSection === "genius" && (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      <h4 className="text-xs font-bold text-white uppercase font-heading mb-1.5 flex justify-between items-center">
                        <span>Nước đi thiên tài (Genius Beat)</span>
                        <span className="text-[9px] font-mono text-zinc-500">6 trường logic</span>
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">🎯 MỤC TIÊU (GOAL)</label>
                          <input 
                            type="text"
                            placeholder="Ví dụ: Đoạt lấy bình nước khoáng trên bàn"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-800"
                            value={store.geniusGoal}
                            onChange={(e) => store.setGeniusGoal(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">🧱 RÀNG BUỘC VẬT LÝ</label>
                          <input 
                            type="text"
                            placeholder="Ví dụ: Vai trái nứt xương, bão cát che khuất"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-800"
                            value={store.geniusConstraints}
                            onChange={(e) => store.setGeniusConstraints(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">🎒 CHUẨN BỊ TRƯỚC</label>
                          <input 
                            type="text"
                            placeholder="Ví dụ: Rải bột lưu huỳnh dẫn dụ kiến đỏ"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-800"
                            value={store.geniusPrep}
                            onChange={(e) => store.setGeniusPrep(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">⚙️ THAO TÁC VẬT LÝ</label>
                          <input 
                            type="text"
                            placeholder="Ví dụ: Di chuyển 3 bước, kéo chốt dây sắt"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-800"
                            value={store.geniusOps}
                            onChange={(e) => store.setGeniusOps(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">🌀 NGHỊCH LÝ BẪY (TRAP PARADOX)</label>
                          <input 
                            type="text"
                            placeholder="Ví dụ: Tạo tiếng động giả ở hốc đá trái"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-800"
                            value={store.geniusParadox}
                            onChange={(e) => store.setGeniusParadox(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">⚖️ CÁI GIÁ PHẢI TRẢ</label>
                          <input 
                            type="text"
                            placeholder="Ví dụ: 3 viên đạn, tăng 15% kiệt sức"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-800"
                            value={store.geniusCost}
                            onChange={(e) => store.setGeniusCost(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: RADAR TROPHIC WEB 8 TẦNG */}
                  {expandedSection === "trophic" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-heading mb-2">Radar Trophic Web 8 tầng</h4>
                        
                        <div className="space-y-3">
                          {/* Level Select Slider */}
                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span className="text-zinc-500">Tầng dinh dưỡng</span>
                              <span className="font-bold text-yellow-500">Tầng {store.trophicLevel}</span>
                            </div>
                            <input 
                              type="range" 
                              min="1" max="8" 
                              value={store.trophicLevel}
                              onChange={(e) => store.setTrophicLevel(parseInt(e.target.value))}
                              className="w-full accent-yellow-500 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                            />
                            <div className="text-[10px] font-mono text-zinc-500 mt-1 font-semibold">
                              {TROPHIC_WEB[store.trophicLevel]?.name}
                            </div>
                          </div>

                          {/* Monster Dropdown */}
                          <div>
                            <label className="text-[10px] text-zinc-500 font-mono block mb-1">CHỌN THỰC THỂ KHU VỰC</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-white focus:outline-none focus:border-zinc-800 cursor-pointer"
                              value={store.selectedMonster}
                              onChange={(e) => store.setSelectedMonster(e.target.value)}
                            >
                              {TROPHIC_WEB[store.trophicLevel]?.monsters.map(m => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Sensory Cues Box */}
                      <div className="border border-zinc-900 rounded bg-zinc-950/50 p-3">
                        <span className="text-[10px] font-mono font-bold text-yellow-500 uppercase tracking-wide block mb-1.5">📡 TÍN HIỆU CẢM QUAN (CUES)</span>
                        <p className="text-xs text-zinc-400 italic leading-relaxed">
                          "{store.monsterCues}"
                        </p>
                        <span className="text-[9px] font-mono text-zinc-600 block mt-2">
                          *Ép AI mô tả tín hiệu này trước khi quái vật xuất đầu lộ diện.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ĐỆT ẤN KÝ VẬT DỤNG (SIGNATURE PROPS) */}
                  {expandedSection === "props" && (
                    <div className="space-y-4">
                      {/* Cổng từ Word-Gate */}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-heading mb-2 flex justify-between items-center">
                          <span>Cổng Từ (Word-Gate)</span>
                          <button
                            type="button"
                            onClick={() => {
                              store.setMinWordCount(3910);
                              store.setMaxWordCount(4590);
                            }}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-mono uppercase transition-colors cursor-pointer"
                            title="Khôi phục chuẩn vàng mặc định 3.910 - 4.590 từ"
                          >
                            Mặc định
                          </button>
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-zinc-500 font-mono block mb-1">TỪ TỐI THIỂU (MIN)</label>
                            <input
                              type="number"
                              className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 font-mono"
                              value={store.minWordCount}
                              onChange={(e) => store.setMinWordCount(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-500 font-mono block mb-1">TỪ TỐI ĐA (MAX)</label>
                            <input
                              type="number"
                              className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 font-mono"
                              value={store.maxWordCount}
                              onChange={(e) => store.setMaxWordCount(parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-650 block mt-1.5">
                          * Chuẩn vàng mặc định: 3.910 - 4.590 từ.
                        </span>
                      </div>

                      <hr className="border-zinc-900/60" />

                      {/* Đột Phá Ấn Ký Chữ Ký */}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-heading mb-2">Đột Phá Ấn Ký Chữ Ký</h4>
                        
                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono block mb-1">VẬT DỤNG CHỮ KÝ (PHÂN TÁCH BẰNG DẤU PHẨY)</label>
                          <textarea
                            className="w-full h-16 p-2 bg-zinc-950 border border-zinc-900 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                            value={store.signatureProps}
                            onChange={(e) => store.setSignatureProps(e.target.value)}
                            placeholder="Ví dụ: Bật lửa đồng, Bình nước vỏ sắt, Kính một tròng nứt"
                          />
                        </div>
                      </div>

                      {/* Realtime Detection Badges */}
                      <div className="border border-zinc-900 rounded bg-zinc-950/50 p-3 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide block">TRẠNG THÁI QUÉT ẤN KÝ CHƯƠNG</span>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {parsedProps.length === 0 ? (
                            <span className="text-xs text-zinc-600 italic">Chưa khai báo vật dụng chữ ký.</span>
                          ) : (
                            parsedProps.map((p, idx) => {
                              const detected = store.detectedProps.includes(p);
                              return (
                                <span 
                                  key={idx} 
                                  className={`text-[10px] px-2 py-0.5 rounded font-medium border font-mono transition-all ${
                                    detected 
                                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                                      : 'bg-zinc-900/50 border-zinc-850 text-zinc-600'
                                  }`}
                                >
                                  {detected ? '✓' : '✗'} {p}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Tóm tắt Cấu hình Read-Only */}
              <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs font-mono space-y-1.5">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1 mb-1">Cấu hình nền</div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Chủ đề:</span>
                  <span className="text-white font-semibold">{store.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Phong cách:</span>
                  <span className="text-white font-semibold">{store.style}</span>
                </div>
              </div>

            </div>

            {/* Cụm nút hành động phía dưới Sidebar */}
            <div className="pt-4 border-t border-zinc-900 flex gap-3 mt-6">
              <button 
                onClick={handleConfirmReset}
                disabled={store.isGeneratingOutline || store.isWritingChapter}
                className="px-3.5 py-2.5 text-xs font-bold rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer text-zinc-400 hover:text-white"
              >
                LÀM MỚI
              </button>
              
              <button 
                onClick={handleWriteChapter}
                disabled={store.isGeneratingOutline || store.isWritingChapter || !store.outlineGenerated}
                className="flex-1 py-2.5 text-xs font-bold rounded bg-orange-600 hover:bg-orange-500 text-white transition-colors disabled:opacity-40 tracking-wider cursor-pointer text-center uppercase"
              >
                {store.isWritingChapter ? "Đang viết..." : "Sinh Phần Kế Tiếp"}
              </button>
            </div>

          </aside>

          {/* CỘT PHẢI: KHÔNG GIAN HIỂN THỊ NỘI DUNG VÀ METER CON DẤU STAMP (70% WIDTH) */}
          <section className="flex-1 flex flex-col bg-[#070707] lg:h-full lg:overflow-hidden relative">
            
            {/* Header Content Toolbar */}
            <div className="h-14 border-b border-zinc-900 px-6 flex items-center justify-between select-none shrink-0 bg-[#0a0a0a]">
              <div className="flex gap-4">
                <button
                  onClick={() => handleSwitchTab('outline')}
                  className={`text-xs font-bold pb-4 pt-4 border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
                    store.activeTab === 'outline' ? 'border-orange-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Dàn ý kịch bản
                </button>
                <button
                  onClick={() => handleSwitchTab('chapters')}
                  disabled={!store.outlineGenerated}
                  className={`text-xs font-bold pb-4 pt-4 border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
                    store.activeTab === 'chapters' ? 'border-orange-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  Chi tiết tác phẩm
                </button>
              </div>

              {/* MÉT CON DẤU WORD-GATE & STAMP-WEAVING */}
              <div className="hidden md:flex items-center gap-3.5">
                
                {/* Word counter progress */}
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Số từ:</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {store.wordCount.toLocaleString()} / <span className="text-[10px] text-zinc-500">{store.minWordCount.toLocaleString('vi-VN')}-{store.maxWordCount.toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                {/* Word Gate Stamp */}
                <span 
                  className={`text-[10px] px-2.5 py-1 rounded font-bold border transition-all font-mono tracking-wider ${
                    store.wordGatePassed 
                      ? 'bg-amber-950/20 border-amber-500 text-amber-500 shadow shadow-amber-950/10 scale-105' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-700'
                  }`}
                >
                  👑 WORD-GATE
                </span>

                {/* Stamp Weaving Stamp */}
                <span 
                  className={`text-[10px] px-2.5 py-1 rounded font-bold border transition-all font-mono tracking-wider ${
                    store.stampWeavingPassed 
                      ? 'bg-emerald-950/20 border-emerald-500 text-emerald-500 shadow shadow-emerald-950/10 scale-105' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-700'
                  }`}
                >
                  🛡️ STAMP-WEAVING
                </span>
              </div>
              
              <button 
                onClick={handleExportFullNovel}
                disabled={store.isGeneratingOutline || store.isWritingChapter || !store.outlineGenerated}
                className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-bold transition-all cursor-pointer text-zinc-400 hover:text-white"
              >
                Tải về (.txt)
              </button>
            </div>

            {/* Khung đếm từ thu nhỏ khi màn hình nhỏ */}
            <div className="md:hidden flex items-center justify-between px-6 py-2 border-b border-zinc-900 bg-zinc-950/30 text-xs font-mono">
              <span className="text-zinc-500">Đếm từ: <strong className="text-white">{store.wordCount}</strong></span>
              <div className="flex gap-2">
                <span className={`px-1.5 py-0.5 rounded font-bold ${store.wordGatePassed ? 'text-amber-500 bg-amber-950/10' : 'text-zinc-600'}`}>👑</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${store.stampWeavingPassed ? 'text-emerald-500 bg-emerald-950/10' : 'text-zinc-600'}`}>🛡️</span>
              </div>
            </div>

            {/* Inner Card / Editor Workspace */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto selection:bg-orange-500/20 relative" ref={renderedTextRef}>
              
              {/* Pagination bar for Chapter view */}
              {store.activeTab === 'chapters' && store.outlineGenerated && (
                <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between bg-zinc-950/80 border border-zinc-900 p-2 rounded-lg backdrop-blur shrink-0 select-none">
                  <button 
                    className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-xs font-bold disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-white"
                    disabled={store.activeChapterIndex === 0 || store.isWritingChapter}
                    onClick={() => handleNavigateChapter(-1)}
                  >
                    ◀ Tập Trước
                  </button>
                  <span className="text-xs font-mono font-bold text-white">
                    TẬP KỊCH BẢN: {store.activeChapterIndex + 1} / {store.chapters.length}
                  </span>
                  <button 
                    className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-xs font-bold disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-white"
                    disabled={store.activeChapterIndex === store.chapters.length - 1 || store.isWritingChapter}
                    onClick={() => handleNavigateChapter(1)}
                  >
                    Tập Tiếp ▶
                  </button>
                </div>
              )}

              {/* Render chính */}
              <div className="max-w-3xl mx-auto space-y-4">
                
                {/* 1. Màn hình chờ rỗng chưa có dàn ý */}
                {!store.outlineGenerated && !store.isGeneratingOutline && (
                  <div className="h-96 flex flex-col items-center justify-center text-zinc-600 select-none text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-3xl">
                      ☢️
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-400">Không gian biên kịch trống</p>
                      <p className="text-xs text-zinc-500 max-w-sm mt-1">Vui lòng quay lại màn hình Setup hoặc nhấn nút "Khởi tạo Dàn ý kịch bản chính thức" để bắt đầu viết truyện bằng trí tuệ nhân tạo.</p>
                    </div>
                  </div>
                )}

                {/* 2. Stream Dàn Ý */}
                {store.activeTab === 'outline' && (store.outlineGenerated || store.isGeneratingOutline) && (
                  <div className="markdown-block bg-[#090909]/40 border border-zinc-900/30 p-6 md:p-8 rounded-xl">
                    <MarkdownBody 
                      text={store.isGeneratingOutline ? store.displayedText : store.outlineText} 
                      isStreaming={store.isGeneratingOutline} 
                    />
                  </div>
                )}

                {/* 3. Stream Chương */}
                {store.activeTab === 'chapters' && store.outlineGenerated && (
                  <div className="markdown-block bg-[#090909]/40 border border-zinc-900/30 p-6 md:p-8 rounded-xl">
                    {store.isWritingChapter ? (
                      <MarkdownBody text={store.displayedText} isStreaming={true} />
                    ) : activeChapter?.written ? (
                      <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 uppercase border-b border-zinc-900 pb-3 font-heading">
                          Chương {activeChapter.number}: {activeChapter.title.split(': ')[1] || activeChapter.title}
                        </h2>
                        <MarkdownBody text={activeChapter.content} isStreaming={false} />
                      </div>
                    ) : (
                      <div className="text-center py-16 space-y-4">
                        <div className="text-4xl">✍️</div>
                        <h3 className="font-bold text-sm text-zinc-400">Chương này chưa có nội dung kịch bản</h3>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                          Vui lòng thiết lập chỉ số sinh lực, Trophic Web và kịch bản chiến thuật Genius Beat ở Sidebar trái, sau đó nhấn nút "Sinh Phần Kế Tiếp" để bắt đầu.
                        </p>
                        <button
                          onClick={handleWriteChapter}
                          className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded transition-colors shadow cursor-pointer uppercase"
                        >
                          🚀 Bắt đầu viết tập {activeChapter?.number}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </section>
        </div>
      </main>

      {/* ==================== SETTINGS MODAL (CẤU HÌNH API KEYS VÀ XOAY VÒNG) ==================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
          <div className="w-full max-w-md bg-[#0d0d0d] border border-zinc-900 rounded-xl p-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">⚙️ Cấu Hình API Keys Gemini</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm cursor-pointer"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-500 leading-relaxed text-[11px]">
                Bạn có thể nhập <strong>nhiều API Key Gemini</strong> (mỗi dòng một Key). Hệ thống sẽ tự động xoay vòng phím dự phòng khi phím chính đạt giới hạn số lượng yêu cầu (quota error 429).
              </p>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-400 block mb-1">DANH SÁCH API KEYS (MỖI DÒNG MỘT KEY)</label>
                <textarea
                  className="w-full h-32 p-2.5 bg-zinc-950 border border-zinc-900 rounded text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                  value={keyInputText}
                  onChange={(e) => setKeyInputText(e.target.value)}
                  placeholder="AIzaSy..."
                />
              </div>

              {/* Status information */}
              <div className="bg-zinc-950 border border-zinc-900 p-3 rounded space-y-1 font-mono text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Số lượng keys khả dụng:</span>
                  <span className="text-white font-bold">{store.apiKeys.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>API Key đang hoạt động:</span>
                  <span className="text-amber-500 font-bold">
                    {store.apiKeys.length > 0 
                      ? `Key #${store.activeApiKeyIndex + 1} (${store.apiKeys[store.activeApiKeyIndex].substring(0, 8)}...)`
                      : "Sử dụng key máy chủ mặc định"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded font-bold cursor-pointer"
                >
                  HỦY
                </button>
                <button
                  onClick={handleSaveApiKeys}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold cursor-pointer shadow"
                >
                  LƯU CẤU HÌNH
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
