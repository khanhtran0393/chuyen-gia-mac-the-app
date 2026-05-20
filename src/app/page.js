'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNovelStore, TROPHIC_WEB } from '@/store/useNovelStore';
import MarkdownBody from '@/components/MarkdownBody';

export default function Home() {
  const store = useNovelStore();
  const renderedTextRef = useRef(null);
  
  // Settings & Navigation States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [keyInputText, setKeyInputText] = useState("");
  const [leftTab, setLeftTab] = useState("outline"); // "outline" | "characters" | "scratchpad"
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [scriptEditText, setScriptEditText] = useState("");

  // New character form state
  const [newCharName, setNewCharName] = useState("");
  const [newCharTraits, setNewCharTraits] = useState("");
  const [newCharItem, setNewCharItem] = useState("");
  const [newCharGoal, setNewCharGoal] = useState("");
  const [newCharFear, setNewCharFear] = useState("");

  // Setup Word Gate Default targets when component mounts
  useEffect(() => {
    if (store.minWordCount === 0 || store.maxWordCount === 0) {
      store.setMinWordCount(3910);
      store.setMaxWordCount(4590);
    }
  }, []);

  // Load API keys into settings field
  useEffect(() => {
    if (store.apiKeys && store.apiKeys.length > 0) {
      setKeyInputText(store.apiKeys.join("\n"));
    }
  }, [store.apiKeys]);

  // Scroll to bottom when streaming script content
  useEffect(() => {
    if (renderedTextRef.current && store.isStreaming) {
      renderedTextRef.current.scrollTop = renderedTextRef.current.scrollHeight;
    }
  }, [store.displayedText, store.isStreaming]);

  // Sync edit box when active chapter changes or written script updates
  const activeChapter = store.danh_muc_chuong[store.activeChapterIndex];
  useEffect(() => {
    if (activeChapter && activeChapter.da_viet) {
      setScriptEditText(activeChapter.noi_dung_kich_ban || "");
    } else {
      setScriptEditText("");
    }
    setIsEditingScript(false);
  }, [store.activeChapterIndex, activeChapter?.noi_dung_kich_ban, activeChapter?.da_viet]);

  // Setup Trigger (Step 1 -> Step 2)
  const handleStartOutline = (e) => {
    e.preventDefault();
    if (!store.prompt.trim()) {
      alert("Vui lòng điền ý tưởng kịch bản gốc hoặc bấm ✨ AI Tự Tạo Ý Tưởng!");
      return;
    }
    store.generateOutlineBranch(0);
  };

  // Chapter Generation Trigger
  const handleWriteChapter = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    store.writeActiveChapter();
  };

  // Export Entire Novel script as a text file
  const handleExportFullNovel = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    const title = store.novelTitle || "Trợ-Lý-Biên-Kịch-Sản-Xuất";
    
    let text = `==================================================\n`;
    text += `TÁC PHẨM TRỢ LÝ BIÊN KỊCH SẢN XUẤT - LOGIC CỨNG\n`;
    text += `TÊN KỊCH BẢN: ${title.toUpperCase()}\n`;
    text += `==================================================\n\n`;
    
    text += `=== DÀN Ý TỔNG THỂ TÁC PHẨM ===\n`;
    text += `Mở đầu: ${store.dan_y_tong_the.mo_dau || "Chưa rõ"}\n`;
    text += `Cao trào: ${store.dan_y_tong_the.cao_trao || "Chưa rõ"}\n`;
    text += `Kết thúc: ${store.dan_y_tong_the.ket_thuc || "Chưa rõ"}\n\n`;
    
    text += `=== HỒ SƠ NHÂN VẬT ĐÃ CHỐT ===\n`;
    store.danh_sach_nhan_vat.forEach((nv, idx) => {
      text += `${idx + 1}. ${nv.ten}\n`;
      text += `   - Đặc điểm & Khuyết tật: ${nv.dac_diem}\n`;
      text += `   - Vật dụng đặc trưng: ${nv.vat_dung_ky_nhan}\n`;
      text += `   - Mục tiêu: ${nv.muc_tieu}\n`;
      text += `   - Nỗi sợ: ${nv.noi_so}\n\n`;
    });
    
    text += `\n==================================================\n`;
    text += `CHI TIẾT CÁC TẬP KỊCH BẢN CHI TIẾT\n`;
    text += `==================================================\n\n`;
    
    let writtenCount = 0;
    store.danh_muc_chuong.forEach(ch => {
      text += `--------------------------------------------------\n`;
      text += `${ch.tieu_de.toUpperCase()}\n`;
      text += `Sự kiện: ${ch.tom_tat_su_kien}\n`;
      text += `--------------------------------------------------\n\n`;
      if (ch.da_viet) {
        text += ch.noi_dung_kich_ban;
        writtenCount++;
      } else {
        text += `[Chương này chưa được tiến hành viết nội dung chi tiết bằng AI]`;
      }
      text += `\n\n\n`;
    });
    
    text += `\n==================================================\n`;
    text += `Tổng số chương thiết lập: ${store.danh_muc_chuong.length}\n`;
    text += `Số chương đã hoàn thành: ${writtenCount}\n`;
    text += `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}\n`;
    text += `==================================================\n`;
    
    triggerDownload(`${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-kich-ban-full.txt`, text);
  };

  // Helper download trigger
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

  // Copy current content to clipboard
  const handleCopyToClipboard = () => {
    let text = "";
    if (store.pipelineStep === 2) {
      text = store.outlineBranches[store.activeOutlineBranch];
    } else if (store.pipelineStep === 4) {
      if (!activeChapter || !activeChapter.da_viet) {
        alert("Chương này chưa có nội dung kịch bản để sao chép!");
        return;
      }
      text = `${activeChapter.tieu_de}\n\n${activeChapter.noi_dung_kich_ban}`;
    } else {
      alert("Không có nội dung dạng văn bản thích hợp để sao chép ở bước này!");
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => alert("Đã sao chép nội dung vào khay nhớ tạm!"))
      .catch(err => console.error("Không thể sao chép: ", err));
  };

  // Full reset back to step 1
  const handleConfirmReset = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    if (window.confirm("Bạn có chắc chắn muốn làm mới toàn bộ quy trình? Mọi dữ liệu dàn ý, nhân vật và kịch bản đã viết sẽ bị xóa vĩnh viễn.")) {
      store.reset();
    }
  };

  // Save Settings API keys
  const handleSaveApiKeys = () => {
    const keys = keyInputText.split("\n").map(k => k.trim()).filter(Boolean);
    store.setApiKeys(keys);
    setIsSettingsOpen(false);
    alert(`Đã lưu thành công ${keys.length} API Keys Gemini!`);
  };

  // Add new character manually in Step 3
  const handleAddCharacter = (e) => {
    e.preventDefault();
    if (!newCharName.trim() || !newCharTraits.trim()) {
      alert("Vui lòng điền tối thiểu Tên và Đặc điểm/Giới hạn cơ thể!");
      return;
    }
    store.addNhanVat({
      ten: newCharName.trim(),
      dac_diem: newCharTraits.trim(),
      vat_dung_ky_nhan: newCharItem.trim() || "Bật lửa đồng, bình nước sắt",
      muc_tieu: newCharGoal.trim() || "Sống sót và tìm nước",
      noi_so: newCharFear.trim() || "Drone săn mồi cơ khí"
    });
    setNewCharName("");
    setNewCharTraits("");
    setNewCharItem("");
    setNewCharGoal("");
    setNewCharFear("");
  };

  // Save manually edited chapter script
  const handleSaveEditedScript = () => {
    if (!activeChapter) return;
    const updatedChapters = [...store.danh_muc_chuong];
    updatedChapters[store.activeChapterIndex] = {
      ...activeChapter,
      noi_dung_kich_ban: scriptEditText,
      da_viet: true
    };
    store.set({
      danh_muc_chuong: updatedChapters,
      chapters: updatedChapters.map(c => ({
        number: c.so_chuong,
        title: c.tieu_de,
        content: c.noi_dung_kich_ban,
        written: c.da_viet
      }))
    });
    setIsEditingScript(false);
    store.scanSignatureProps(scriptEditText);
    store.calculateWordCount(scriptEditText);
  };

  // Setup signatures detection
  const parsedProps = store.signatureProps.split(",").map(p => p.trim()).filter(Boolean);

  return (
    <div className="app-container bg-[#050505] text-zinc-300 min-h-screen font-sans antialiased flex flex-col relative select-none">
      
      {/* 1. PREMIUM HEADER */}
      <header className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between shrink-0 bg-[#0a0a0a] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-950/20 text-lg">
            ✍️
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-widest font-heading">PRODUCTION ASSISTANT</h1>
            <p className="text-[10px] text-orange-500 font-bold tracking-wider uppercase font-mono">Trợ lý Biên kịch Sản xuất kịch bản mạt thế</p>
          </div>
        </div>

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

      {/* 2. PIPELINE STEPPER HUD */}
      <div className="w-full bg-[#080808] border-b border-zinc-900 py-3.5 px-6 flex items-center justify-between shrink-0 font-mono text-xs select-none shadow-md">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-none w-full justify-center">
          {[
            { step: 1, label: "Ý TƯỞNG CORE" },
            { step: 2, label: "DÀN Ý TỔNG THỂ (GATE 1)" },
            { step: 3, label: "HỒ SƠ NHÂN VẬT (GATE 2)" },
            { step: 4, label: "KỊCH BẢN TẬP CHI TIẾT" }
          ].map((s) => (
            <React.Fragment key={s.step}>
              <button
                onClick={() => {
                  if (s.step < store.pipelineStep && !store.isGeneratingOutline && !store.isWritingChapter) {
                    store.setPipelineStep(s.step);
                  }
                }}
                disabled={s.step > store.pipelineStep || store.isGeneratingOutline || store.isWritingChapter}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all border ${
                  store.pipelineStep === s.step
                    ? "bg-orange-600/15 text-orange-400 font-extrabold border-orange-500/40 shadow-md shadow-orange-950/5 scale-105"
                    : s.step < store.pipelineStep
                    ? "text-emerald-500 hover:text-emerald-400 border-emerald-950/20 bg-emerald-950/5 cursor-pointer font-bold"
                    : "text-zinc-650 border-transparent cursor-not-allowed"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  store.pipelineStep === s.step
                    ? "bg-orange-600 text-white"
                    : s.step < store.pipelineStep
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 text-zinc-600"
                }`}>
                  {s.step < store.pipelineStep ? "✓" : s.step}
                </span>
                <span>{s.label}</span>
              </button>
              {s.step < 4 && <span className="text-zinc-800 font-bold hidden md:inline">➔</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. STEP CONTENT SWITCHER */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* ==================== BƯỚC 1: Ý TƯỞNG CORE ==================== */}
        {store.pipelineStep === 1 && (
          <div className="flex-1 overflow-y-auto px-6 py-10 max-w-4xl mx-auto w-full select-text">
            <header className="text-center mb-8">
              <span className="inline-block text-xs px-3 py-1 rounded bg-orange-950/40 border border-orange-900/30 text-orange-400 font-bold uppercase tracking-widest mb-3">
                Phase 1: Setup Foundation
              </span>
              <h2 className="text-3xl font-black text-white uppercase mb-2 font-heading tracking-tight">
                Thiết Thiết Ý Tưởng Cốt Truyện
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
                Thiết lập các tham số cốt lõi và số lượng từ. AI sẽ chia kịch bản thành cấu trúc 3 hồi chuẩn công nghiệp kịch bản trước khi phân rã.
              </p>
            </header>

            <form onSubmit={handleStartOutline} className="space-y-6 bg-[#0c0c0c] border border-zinc-900 rounded-xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chủ đề chính */}
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">1. CHỦ ĐỀ CHÍNH</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                    value={store.theme}
                    onChange={(e) => store.setTheme(e.target.value)}
                  >
                    <option value="Sinh Tồn">🎒 Mạt thế Sinh Tồn thô ráp</option>
                    <option value="Trùng Sinh">⏳ Trùng Sinh báo thù logic</option>
                    <option value="Xuyên Không">🌀 Xuyên Không khai phá phế tích</option>
                    <option value="Hệ Thống">🖥️ Hệ Thống đếm số cơ học</option>
                    <option value="Thám Hiểm">🧭 Thám Hiểm mộ hoang mạt thế</option>
                  </select>
                </div>

                {/* Phong cách chấp bút */}
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">2. PHONG CÁCH HÀNH VĂN</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                    value={store.style}
                    onChange={(e) => store.setStyle(e.target.value)}
                  >
                    <option value="Mạt Thế">☣️ Mạt Thế tang thi, phóng xạ</option>
                    <option value="Viễn Tưởng">🤖 Cyberpunk hoang tàn rỉ sét</option>
                    <option value="Huyền Huyễn">🪐 Thần bí tàn tích cổ xưa</option>
                    <option value="Tu Tiên">⚔️ Tu Tiên tài nguyên khô cạn</option>
                    <option value="Khắc Nghiệt">🔥 Gai góc, tả thực bạo lực sinh học</option>
                  </select>
                </div>

              </div>

              {/* Word count target gates */}
              <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-950/40">
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono">3. ĐỊNH HÌNH CỔNG TỪ (WORD-GATE TARGET)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block mb-1">ĐỘ DÀI TỐI THIỂU (TỪ)</label>
                    <input 
                      type="number" 
                      className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs font-mono font-bold focus:outline-none focus:border-zinc-800"
                      value={store.minWordCount}
                      onChange={(e) => store.setMinWordCount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block mb-1">ĐỘ DÀI TỐI ĐA (TỪ)</label>
                    <input 
                      type="number" 
                      className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs font-mono font-bold focus:outline-none focus:border-zinc-800"
                      value={store.maxWordCount}
                      onChange={(e) => store.setMaxWordCount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-mono">* Mặc định chuẩn vàng biên kịch: 3.910 - 4.590 từ tiếng Việt.</p>
              </div>

              {/* Ý tưởng cốt truyện */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">4. Ý TƯỞNG KỊCH BẢN GỐC</label>
                  <button
                    type="button"
                    onClick={() => store.generateAIPrompt()}
                    className="px-3 py-1 text-xs rounded-full bg-orange-950/50 hover:bg-orange-900/60 border border-orange-500/20 text-orange-400 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    ✨ AI Tự Tạo Ý Tưởng
                  </button>
                </div>
                <textarea 
                  className="w-full h-28 p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder-zinc-750 leading-relaxed font-sans" 
                  value={store.prompt}
                  onChange={(e) => store.setPrompt(e.target.value)}
                  placeholder="Ví dụ: Tiêu Hàn là phàm nhân bị liệt một tay trái, ẩn nấp trong phế tích ga tàu điện cũ ngập nước đen phóng xạ. Anh sở hữu bình nước vỏ sắt cũ móp méo và phải tìm cách thoát khỏi sương phóng xạ ăn mòn cùng bầy quái vật Tầng 2..."
                />
              </div>

              {/* Số chương */}
              <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-4 rounded-lg">
                <div>
                  <h3 className="font-bold text-xs text-white uppercase font-mono">5. Số chương thiết lập</h3>
                  <p className="text-[10px] text-zinc-550 mt-0.5 font-mono">Quy mô phân phối cốt truyện</p>
                </div>
                <div className="flex items-center gap-3 bg-[#0c0c0c] border border-zinc-800 rounded p-1.5 font-mono">
                  <button type="button" className="w-8 h-8 rounded hover:bg-zinc-900 text-lg font-bold text-zinc-400 hover:text-white" onClick={() => store.stepChapters(-1)}>-</button>
                  <div className="text-center font-bold text-sm w-16">
                    {store.chaptersCount} <span className="text-[10px] text-zinc-500 font-normal">TẬP</span>
                  </div>
                  <button type="button" className="w-8 h-8 rounded hover:bg-zinc-900 text-lg font-bold text-zinc-400 hover:text-white" onClick={() => store.stepChapters(1)}>+</button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full py-4 rounded-lg bg-orange-600 hover:bg-orange-500 transition-colors font-extrabold text-xs text-white tracking-widest cursor-pointer shadow-lg shadow-orange-950/20 uppercase"
                >
                  ✦ TIẾN HÀNH KHỞI TẠO DÀN Ý TỔNG THỂ ✦
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ==================== BƯỚC 2: DÀN Ý TỔNG THỂ (GATE 1) ==================== */}
        {store.pipelineStep === 2 && (
          <div className="flex-1 overflow-hidden flex flex-col select-text">
            {/* Top Sub-navigation for Branching Outline */}
            <div className="h-14 border-b border-zinc-900 bg-[#0a0a0a] px-6 flex items-center justify-between shrink-0 select-none">
              <div className="flex gap-2">
                {[0, 1, 2].map((idx) => {
                  const generated = store.selectedBranchGenerated[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => store.setActiveOutlineBranch(idx)}
                      disabled={store.isGeneratingOutline}
                      className={`text-xs font-bold px-4 py-2 rounded transition-all cursor-pointer ${
                        store.activeOutlineBranch === idx
                          ? "bg-orange-600 text-white font-extrabold shadow shadow-orange-950/30"
                          : "bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      Nhánh {idx + 1} {generated ? "✓" : ""}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                {/* Sinh mới nhánh hiện tại button */}
                <button
                  onClick={() => store.generateOutlineBranch(store.activeOutlineBranch)}
                  disabled={store.isGeneratingOutline}
                  className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ⚡ Sinh Mới Nhánh {store.activeOutlineBranch + 1}
                </button>

                {store.selectedBranchGenerated[store.activeOutlineBranch] && (
                  <>
                    <button
                      onClick={handleCopyToClipboard}
                      className="px-3 py-2 rounded bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      title="Copy to Clipboard"
                    >
                      📋 Copy
                    </button>
                    <button 
                      onClick={() => store.confirmOutline()}
                      className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white uppercase tracking-wider cursor-pointer shadow shadow-emerald-950/20"
                    >
                      🔒 CHỐT DÀN Ý & BƯỚC TIẾP THEO
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Main side-by-side Live Preview Editor */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* Left pane: Plaintext outline editor */}
              <div className="w-full md:w-1/2 border-r border-zinc-900 bg-[#070707] flex flex-col">
                <div className="h-10 px-4 border-b border-zinc-900 bg-zinc-950/40 flex items-center shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">📝 TRÌNH SOẠN THẢO DÀN Ý CHƯƠNG CHI TIẾT</span>
                </div>
                
                {store.selectedBranchGenerated[store.activeOutlineBranch] ? (
                  <textarea
                    className="flex-1 p-6 bg-zinc-950/20 text-zinc-300 text-xs font-mono leading-relaxed focus:outline-none resize-none overflow-y-auto placeholder-zinc-800"
                    value={store.outlineBranches[store.activeOutlineBranch]}
                    onChange={(e) => store.updateOutlineBranchText(e.target.value)}
                    placeholder="Viết hoặc hiệu chỉnh dàn ý tổng thể tại đây..."
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <span className="text-4xl text-zinc-700 animate-pulse">⚡</span>
                    <h3 className="text-sm font-bold text-zinc-500">Nhánh {store.activeOutlineBranch + 1} Chưa Khởi Tạo</h3>
                    <p className="text-xs text-zinc-600 max-w-xs mx-auto">AI sẽ tự động lập cấu trúc 3 hồi, phân bổ số tập và plot hooks dựa trên ý tưởng core.</p>
                    <button
                      onClick={() => store.generateOutlineBranch(store.activeOutlineBranch)}
                      className="px-5 py-2.5 rounded bg-orange-600 hover:bg-orange-500 font-extrabold text-xs text-white uppercase tracking-wider transition-all cursor-pointer shadow shadow-orange-950/20"
                    >
                      🚀 Khởi Tạo Dàn Ý Nhánh {store.activeOutlineBranch + 1}
                    </button>
                  </div>
                )}
              </div>

              {/* Right pane: Beautiful Markdown preview */}
              <div className="w-full md:w-1/2 bg-[#050505] flex flex-col overflow-hidden">
                <div className="h-10 px-4 border-b border-zinc-900 bg-zinc-950/40 flex items-center shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">👁️ BẢN PREVIEW ĐỊNH DẠNG HOÀN THIỆN</span>
                </div>
                
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                  {store.isGeneratingOutline && store.activeOutlineBranch === store.activeOutlineBranch ? (
                    <div className="space-y-4">
                      <MarkdownBody text={store.displayedText} isStreaming={true} />
                    </div>
                  ) : store.selectedBranchGenerated[store.activeOutlineBranch] ? (
                    <div className="markdown-block bg-[#080808]/20 border border-zinc-900/30 p-6 rounded-lg leading-relaxed select-text">
                      <MarkdownBody text={store.outlineBranches[store.activeOutlineBranch]} isStreaming={false} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-650 text-xs italic">
                      Đang đợi sinh kịch bản dàn ý...
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== BƯỚC 3: HỒ SƠ NHÂN VẬT (GATE 2) ==================== */}
        {store.pipelineStep === 3 && (
          <div className="flex-1 overflow-y-auto px-6 py-8 select-text">
            <div className="max-w-6xl mx-auto space-y-6">
              
              <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
                <div>
                  <span className="inline-block text-[10px] font-mono font-bold text-orange-500 bg-orange-950/30 border border-orange-900/30 px-2 py-0.5 rounded mb-2">
                    GATE 2: CHARACTER EXTRACTION
                  </span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight font-heading">
                    HỒ SƠ NHÂN VẬT TĨNH
                  </h2>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed max-w-2xl">
                    Đảm bảo tuyệt đối tính nhất quán trong cốt truyện. AI sẽ tự động phân tích dàn ý để bóc tách thông tin nhân vật chính phụ. Bạn có quyền hiệu chỉnh, xóa hoặc thêm mới.
                  </p>
                </div>
                
                <div>
                  {store.isExtractingCharacters ? (
                    <span className="text-xs text-amber-500 animate-pulse font-mono font-bold bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded inline-block">
                      ⚙️ AI đang quét trích xuất nhân vật...
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => store.extractCharacters()}
                        className="px-4 py-2 text-xs font-bold rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-450 hover:text-white transition-colors cursor-pointer"
                      >
                        🔄 Quét Lại Dàn Ý
                      </button>
                      <button
                        onClick={() => store.confirmCharacters()}
                        className="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white uppercase tracking-wider cursor-pointer shadow shadow-emerald-950/20"
                      >
                        🔒 CHỐT NHÂN VẬT & TIẾP TỤC
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Streaming progress if extracting */}
              {store.isExtractingCharacters && (
                <div className="bg-[#0b0b0b] border border-zinc-900 rounded-lg p-6 max-h-72 overflow-y-auto">
                  <MarkdownBody text={store.displayedText} isStreaming={true} />
                </div>
              )}

              {/* Character editable grid */}
              {!store.isExtractingCharacters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {store.danh_sach_nhan_vat.map((nv, idx) => (
                    <div key={idx} className="bg-[#0c0c0c] border border-zinc-900 rounded-xl p-5 relative group space-y-4 hover:border-zinc-800 transition-all shadow-md">
                      <button
                        onClick={() => store.removeNhanVat(nv.ten)}
                        className="absolute top-4 right-4 text-zinc-650 hover:text-red-500 transition-colors cursor-pointer"
                        title="Xóa nhân vật"
                      >
                        🗑️
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-650 flex items-center justify-center font-bold text-white text-xs font-mono">
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          className="bg-zinc-950 border border-zinc-900 rounded px-2.5 py-1 text-sm font-black text-white focus:outline-none focus:border-zinc-850"
                          value={nv.ten}
                          onChange={(e) => store.updateNhanVat(idx, { ten: e.target.value })}
                          placeholder="Tên nhân vật"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 text-xs">
                        <div>
                          <label className="text-[9px] text-zinc-550 font-mono block mb-0.5">ĐẶC ĐIỂM & GIỚI HẠN THỂ CHẤT / KHUYẾT TẬT</label>
                          <textarea
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-zinc-300 focus:outline-none focus:border-zinc-850 h-14 resize-none"
                            value={nv.dac_diem}
                            onChange={(e) => store.updateNhanVat(idx, { dac_diem: e.target.value })}
                            placeholder="Mô tả khuyết tật cơ thể và ngoại hình..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-zinc-550 font-mono block mb-0.5">MỤC TIÊU SỐNG CÒN</label>
                            <input
                              type="text"
                              className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-850"
                              value={nv.muc_tieu}
                              onChange={(e) => store.updateNhanVat(idx, { muc_tieu: e.target.value })}
                              placeholder="Mục tiêu..."
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-550 font-mono block mb-0.5">NỖI SỢ LỚN NHẤT</label>
                            <input
                              type="text"
                              className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-850"
                              value={nv.noi_so}
                              onChange={(e) => store.updateNhanVat(idx, { noi_so: e.target.value })}
                              placeholder="Nỗi sợ..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-550 font-mono block mb-0.5">VẬT DỤNG KÝ NHÂN ĐẶC TRƯNG</label>
                          <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-zinc-850"
                            value={nv.vat_dung_ky_nhan}
                            onChange={(e) => store.updateNhanVat(idx, { vat_dung_ky_nhan: e.target.value })}
                            placeholder="Chiếc bật lửa cũ, bình nước sắt..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add manual character form */}
                  <form onSubmit={handleAddCharacter} className="bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-750 transition-colors rounded-xl p-5 flex flex-col justify-between space-y-4">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">➕ Thêm nhân vật mới</span>
                    
                    <div className="space-y-2 text-xs flex-1">
                      <input
                        type="text"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-zinc-700"
                        value={newCharName}
                        onChange={(e) => setNewCharName(e.target.value)}
                        placeholder="Tên nhân vật Hán Việt mới (ví dụ: Thạch Dã)"
                      />
                      <textarea
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-zinc-700 h-14 resize-none"
                        value={newCharTraits}
                        onChange={(e) => setNewCharTraits(e.target.value)}
                        placeholder="Đặc điểm & khuyết tật vật lý (ví dụ: mù mắt trái)..."
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-300 focus:outline-none"
                          value={newCharGoal}
                          onChange={(e) => setNewCharGoal(e.target.value)}
                          placeholder="Mục tiêu sinh tồn..."
                        />
                        <input
                          type="text"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-300 focus:outline-none"
                          value={newCharFear}
                          onChange={(e) => setNewCharFear(e.target.value)}
                          placeholder="Nỗi sợ mạt thế..."
                        />
                      </div>
                      <input
                        type="text"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none"
                        value={newCharItem}
                        onChange={(e) => setNewCharItem(e.target.value)}
                        placeholder="Vật dụng ký nhân đặc trưng mang theo..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-white tracking-wider transition-colors cursor-pointer text-center uppercase"
                    >
                      Thêm Vào Danh Sách
                    </button>
                  </form>

                </div>
              )}

              {/* Warnings and continuity rules */}
              <div className="bg-[#0b0b0b] border border-zinc-900/60 p-4 rounded-lg space-y-1.5 text-[11px] text-zinc-550 leading-relaxed font-mono">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">⚠️ QUY TẮC BẢO TOÀN TÍNH LIÊN TỤC (CONTINUITY SYSTEM)</span>
                <p>1. Các nhân vật đã chốt ở bước này sẽ được nạp trực tiếp làm **Static Context** (Bối cảnh tĩnh) cho API Kịch bản.</p>
                <p>2. AI sẽ bị cấm tiệt việc tự sáng tác ra thêm nhân vật lạ hoặc thay đổi khuyết tật cơ thể của những nhân vật này trong suốt các chương sau.</p>
              </div>

            </div>
          </div>
        )}

        {/* ==================== BƯỚC 4: KỊCH BẢN PHÂN CẢNH (SPLIT-VIEW WORKSPACE) ==================== */}
        {store.pipelineStep === 4 && (
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row select-text">
            
            {/* LEFT COLUMN: STATIC REFERENCE PANEL (40% WIDTH) */}
            <aside className="w-full lg:w-[480px] border-r border-zinc-900 bg-[#0a0a0a] flex flex-col overflow-hidden shrink-0 select-none">
              
              {/* Reference Tabs Navigation */}
              <div className="h-12 border-b border-zinc-900 bg-zinc-950 flex items-center justify-around shrink-0 px-2">
                {[
                  { id: "outline", label: "🗺️ DÀN Ý TỔNG" },
                  { id: "characters", label: "👥 NHÂN VẬT CHỐT" },
                  { id: "scratchpad", label: "📝 GHI CHÚ VIẾT TAY" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setLeftTab(t.id)}
                    className={`text-[10px] font-bold py-3 px-3.5 border-b-2 transition-all cursor-pointer font-mono tracking-wider ${
                      leftTab === t.id ? "border-orange-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Reference Tab Content */}
              <div className="flex-1 p-5 overflow-y-auto select-text">

                {/* Tab Outline: Displays lock dan y and chapters structure */}
                {leftTab === "outline" && (
                  <div className="space-y-5">
                    <div className="border border-zinc-900 rounded bg-zinc-950/40 p-4 space-y-3">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-1">Cấu trúc 3 hồi tổng quát</span>
                      <div className="space-y-2 text-xs leading-relaxed text-zinc-400">
                        <div><strong className="text-zinc-300 font-semibold font-sans">1. Mở đầu:</strong> {store.dan_y_tong_the.mo_dau || "Chưa rõ"}</div>
                        <div><strong className="text-zinc-300 font-semibold font-sans">2. Cao trào:</strong> {store.dan_y_tong_the.cao_trao || "Chưa rõ"}</div>
                        <div><strong className="text-zinc-300 font-semibold font-sans">3. Kết thúc:</strong> {store.dan_y_tong_the.ket_thuc || "Chưa rõ"}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-1">Danh mục chương chi tiết</span>
                      
                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                        {store.danh_muc_chuong.map((ch, idx) => {
                          const isActive = store.activeChapterIndex === idx;
                          return (
                            <div 
                              key={ch.so_chuong}
                              onClick={() => !store.isWritingChapter && store.selectChapter(idx)}
                              className={`border p-3 rounded-lg transition-all cursor-pointer ${
                                isActive 
                                  ? "bg-orange-950/15 border-orange-600 shadow shadow-orange-950/15 scale-[1.01]" 
                                  : ch.da_viet
                                  ? "bg-emerald-950/5 border-emerald-900/30 hover:border-emerald-800 text-zinc-400"
                                  : "bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-500"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1 text-[11px] font-mono font-bold">
                                <span>Chương {ch.so_chuong}</span>
                                <span className={ch.da_viet ? "text-emerald-500" : "text-zinc-650"}>
                                  {ch.da_viet ? "ĐÃ HOÀN THÀNH" : "CHƯA VIẾT"}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-white mb-1.5">{ch.tieu_de}</h4>
                              <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans font-medium line-clamp-2">{ch.tom_tat_su_kien}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Characters: Read-only display of locked character DB */}
                {leftTab === "characters" && (
                  <div className="space-y-4">
                    {store.danh_sach_nhan_vat.map((nv, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-1.5 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-orange-600/10 border border-orange-500/25 flex items-center justify-center font-mono font-bold text-[10px] text-orange-400">
                            {idx + 1}
                          </span>
                          <h4 className="font-black text-white text-sm">{nv.ten}</h4>
                        </div>
                        <div className="space-y-1.5 leading-relaxed text-zinc-400 font-sans">
                          <p><strong className="text-zinc-550 font-mono text-[9px] block">ĐẶC ĐIỂM & GIỚI HẠN THỂ CHẤT</strong> {nv.dac_diem}</p>
                          <p><strong className="text-zinc-550 font-mono text-[9px] block">MỤC TIÊU SỐNG CÒN</strong> {nv.muc_tieu}</p>
                          <p><strong className="text-zinc-550 font-mono text-[9px] block">NỖI SỢ LỚN NHẤT</strong> {nv.noi_so}</p>
                          <p><strong className="text-zinc-550 font-mono text-[9px] block">VẬT DỤNG CHỮ KÝ</strong> {nv.vat_dung_ky_nhan}</p>
                        </div>
                      </div>
                    ))}

                    {store.danh_sach_nhan_vat.length === 0 && (
                      <p className="text-center text-zinc-650 text-xs italic py-8">Chưa ghi nhận danh sách nhân vật chốt nào.</p>
                    )}
                  </div>
                )}

                {/* Tab Scratchpad: Free writer notes */}
                {leftTab === "scratchpad" && (
                  <div className="space-y-3 flex flex-col h-full">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">💡 GHI CHÚ VIẾT TAY (SCRATCHPAD)</span>
                      <p className="text-zinc-550 text-[10px] leading-relaxed">
                        Nhập ghi chú định hướng, các chi tiết đắt giá hoặc plot points cụ thể cho chương hiện tại. AI sẽ nạp trực tiếp vào Prompt viết kịch bản chi tiết để triển khai chính xác ý đồ của bạn.
                      </p>
                    </div>
                    <textarea
                      className="flex-1 min-h-[300px] w-full p-4 bg-zinc-950 border border-zinc-900 focus:border-zinc-800 rounded-lg text-xs leading-relaxed text-zinc-300 font-mono placeholder-zinc-800 focus:outline-none resize-none"
                      value={store.scratchpad}
                      onChange={(e) => store.setScratchpad(e.target.value)}
                      placeholder="Nhập ghi chú viết tay cho tập này... (ví dụ: Tiêu Hàn dùng bình nước kim loại cũ gõ vào thành turbine tạo âm thanh vang nhại dụ drone bay lệch hướng, sau đó khập khiễng rách gân lê chân chạy sang hốc đá bên cạnh)..."
                    />
                  </div>
                )}

              </div>

              {/* Sidebar Footer reset and global action */}
              <div className="h-16 px-5 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between shrink-0 select-none">
                <button
                  onClick={handleConfirmReset}
                  className="px-3.5 py-2 text-xs font-bold rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-450 hover:text-white transition-colors cursor-pointer"
                >
                  RESET APP
                </button>

                <button
                  onClick={handleExportFullNovel}
                  disabled={store.isWritingChapter}
                  className="px-4 py-2 text-xs font-extrabold rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-40 cursor-pointer text-center uppercase"
                >
                  Xuất Kịch Bản
                </button>
              </div>

            </aside>

            {/* RIGHT COLUMN: CREATIVE SCRIPTWRITER PANE (60% WIDTH) */}
            <section className="flex-1 flex flex-col bg-[#050505] overflow-hidden relative select-text">
              
              {/* Header Content Toolbar */}
              <div className="h-14 border-b border-zinc-900 px-6 flex items-center justify-between shrink-0 bg-[#0a0a0a] select-none">
                {activeChapter ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-600/10 border border-orange-500/25 text-orange-400">
                      TẬP {activeChapter.so_chuong}
                    </span>
                    <h3 className="font-extrabold text-xs text-white line-clamp-1">{activeChapter.tieu_de}</h3>
                  </div>
                ) : (
                  <div></div>
                )}

                {/* WORD-GATE & STAMP-WEAVING REALTIME HUD */}
                <div className="hidden md:flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-zinc-550 font-mono block">ĐẾM TỪ</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {store.wordCount.toLocaleString()} / <span className="text-[10px] text-zinc-500">{store.minWordCount.toLocaleString()}-{store.maxWordCount.toLocaleString()}</span>
                    </span>
                  </div>

                  <span 
                    className={`text-[10px] px-2.5 py-1 rounded font-bold border transition-all font-mono tracking-wider ${
                      store.wordGatePassed 
                        ? 'bg-amber-950/20 border-amber-500 text-amber-500 shadow shadow-amber-950/10 scale-105' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-700'
                    }`}
                  >
                    👑 WORD-GATE
                  </span>

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
              </div>

              {/* Real-time word checks on mobile */}
              <div className="md:hidden flex items-center justify-between px-6 py-2 border-b border-zinc-900 bg-zinc-950/40 text-xs font-mono">
                <span className="text-zinc-500">Số từ: <strong className="text-white">{store.wordCount}</strong></span>
                <div className="flex gap-2">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${store.wordGatePassed ? 'text-amber-500 bg-amber-950/10' : 'text-zinc-700'}`}>👑 WORD</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${store.stampWeavingPassed ? 'text-emerald-500 bg-emerald-950/10' : 'text-zinc-700'}`}>🛡️ WEAVE</span>
                </div>
              </div>

              {/* Active Chapter Pagination & Control Bar */}
              <div className="h-12 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <button 
                    className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-white"
                    disabled={store.activeChapterIndex === 0 || store.isWritingChapter}
                    onClick={() => store.navigateChapter(-1)}
                  >
                    ◀ TRƯỚC
                  </button>
                  <button 
                    className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-white"
                    disabled={store.activeChapterIndex === store.danh_muc_chuong.length - 1 || store.isWritingChapter}
                    onClick={() => store.navigateChapter(1)}
                  >
                    TIẾP ▶
                  </button>
                </div>

                <div className="flex gap-2">
                  {activeChapter && activeChapter.da_viet && !store.isWritingChapter && (
                    <>
                      <button
                        onClick={handleCopyToClipboard}
                        className="px-3 py-1 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-[10.5px] font-bold text-zinc-450 hover:text-white cursor-pointer transition-colors"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => {
                          if (isEditingScript) {
                            handleSaveEditedScript();
                          } else {
                            setIsEditingScript(true);
                          }
                        }}
                        className={`px-3 py-1 rounded border text-[10.5px] font-bold cursor-pointer transition-all ${
                          isEditingScript 
                            ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold shadow' 
                            : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isEditingScript ? "✓ LƯU" : "✏️ SỬA"}
                      </button>
                      {isEditingScript && (
                        <button
                          onClick={() => setIsEditingScript(false)}
                          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-850 text-[10.5px] text-zinc-500 hover:text-white cursor-pointer"
                        >
                          HỦY
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleWriteChapter}
                    disabled={store.isWritingChapter || store.isGeneratingOutline}
                    className="px-4 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-[10.5px] uppercase tracking-wider disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow shadow-orange-950/20"
                  >
                    {store.isWritingChapter ? (
                      <>
                        <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ĐANG VIẾT...
                      </>
                    ) : activeChapter?.da_viet ? (
                      "⚡ VIẾT LẠI (REGENERATE)"
                    ) : (
                      "🚀 BẮT ĐẦU VIẾT BẰNG AI"
                    )}
                  </button>
                </div>
              </div>

              {/* Script Text Editor Workspace */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto selection:bg-orange-500/20 relative" ref={renderedTextRef}>
                
                {store.isWritingChapter ? (
                  // Active streaming view
                  <div className="max-w-3xl mx-auto markdown-block bg-[#090909]/40 border border-zinc-900/30 p-6 md:p-8 rounded-xl select-text leading-relaxed">
                    <MarkdownBody text={store.displayedText} isStreaming={true} />
                  </div>
                ) : isEditingScript ? (
                  // Manual Edit mode
                  <div className="max-w-3xl mx-auto h-full flex flex-col">
                    <textarea
                      className="flex-1 w-full min-h-[450px] p-6 bg-zinc-950 border border-zinc-900 focus:border-zinc-800 rounded-xl text-zinc-300 font-sans text-[13px] leading-relaxed focus:outline-none resize-none overflow-y-auto"
                      value={scriptEditText}
                      onChange={(e) => setScriptEditText(e.target.value)}
                      placeholder="Chỉnh sửa nội dung chi tiết kịch bản chương tại đây..."
                    />
                  </div>
                ) : activeChapter?.da_viet ? (
                  // Formatted preview view
                  <div className="max-w-3xl mx-auto markdown-block bg-[#090909]/20 border border-zinc-900/30 p-6 md:p-8 rounded-xl leading-relaxed select-text">
                    <h2 className="text-xl md:text-2xl font-black text-white mb-6 uppercase border-b border-zinc-900 pb-3 tracking-tight font-heading">
                      {activeChapter.tieu_de}
                    </h2>
                    <MarkdownBody text={activeChapter.noi_dung_kich_ban} isStreaming={false} />
                  </div>
                ) : (
                  // Fallback empty view with instructions
                  <div className="max-w-3xl mx-auto text-center py-20 space-y-5 select-none">
                    <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-3xl mx-auto shadow-md">
                      🎬
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-sm text-zinc-400 uppercase tracking-wider font-heading">TẬP KỊCH BẢN NÀY CHƯA ĐƯỢC THỰC THI</h3>
                      <p className="text-xs text-zinc-550 max-w-md mx-auto leading-relaxed">
                        Hệ thống đã nhận diện khóa dàn ý chi tiết và hồ sơ nhân vật. Vui lòng thiết lập ghi chú gợi ý tác chiến (Scratchpad) ở panel trái nếu muốn định hướng, sau đó nhấn nút "BẮT ĐẦU VIẾT BẰNG AI" để tiến hành viết.
                      </p>
                    </div>
                    <button
                      onClick={handleWriteChapter}
                      className="px-5 py-2.5 text-xs font-extrabold bg-orange-600 hover:bg-orange-500 border-none text-white rounded transition-colors shadow cursor-pointer uppercase tracking-wider"
                    >
                      🚀 BẮT ĐẦU VIẾT TẬP {activeChapter?.so_chuong}
                    </button>
                  </div>
                )}

              </div>

              {/* Script footer signatures details */}
              {activeChapter?.da_viet && !store.isWritingChapter && (
                <div className="h-10 px-6 border-t border-zinc-900 bg-zinc-950 flex items-center gap-2 select-none text-[10px] shrink-0 overflow-x-auto scrollbar-none">
                  <span className="text-zinc-550 font-mono uppercase tracking-wider shrink-0 font-bold">Vật dụng dệt thành công:</span>
                  <div className="flex gap-1.5 shrink-0">
                    {parsedProps.map((p, idx) => {
                      const detected = store.detectedProps.includes(p);
                      return (
                        <span 
                          key={idx} 
                          className={`px-2 py-0.5 rounded font-mono font-medium border ${
                            detected 
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                              : 'bg-zinc-900/40 border-zinc-850 text-zinc-600'
                          }`}
                        >
                          {detected ? '✓' : '✗'} {p}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

            </section>

          </div>
        )}

      </div>

      {/* ==================== SETTINGS KEY MODAL ==================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md bg-[#0d0d0d] border border-zinc-900 rounded-xl p-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">⚙️ CẤU HÌNH API KEYS GEMINI ROTATION</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs cursor-pointer"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-500 leading-relaxed text-[11px]">
                Nhập danh sách **API Keys Gemini** (mỗi dòng một phím). Hệ thống sẽ tự động chuyển đổi sang phím dự phòng khi phím chính đạt quota giới hạn hoặc bị chặn (lỗi 429).
              </p>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-400 block mb-1 uppercase">Danh sách Keys của bạn</label>
                <textarea
                  className="w-full h-32 p-2.5 bg-zinc-950 border border-zinc-900 rounded text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                  value={keyInputText}
                  onChange={(e) => setKeyInputText(e.target.value)}
                  placeholder="AIzaSy..."
                />
              </div>

              <div className="bg-zinc-950 border border-zinc-900 p-3 rounded space-y-1.5 font-mono text-[10px] text-zinc-450">
                <div className="flex justify-between">
                  <span>Số lượng phím khả dụng:</span>
                  <span className="text-white font-bold">{store.apiKeys.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phím hoạt động hiện tại:</span>
                  <span className="text-amber-500 font-bold">
                    {store.apiKeys.length > 0 
                      ? `Key #${store.activeApiKeyIndex + 1} (${store.apiKeys[store.activeApiKeyIndex].substring(0, 8)}...)`
                      : "API Key máy chủ mặc định"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white rounded font-bold cursor-pointer transition-colors"
                >
                  HỦY
                </button>
                <button
                  onClick={handleSaveApiKeys}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold cursor-pointer transition-colors shadow"
                >
                  LƯU PHÍM XOAY VÒNG
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
