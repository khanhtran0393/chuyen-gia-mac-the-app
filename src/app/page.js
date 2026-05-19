'use client';

import React, { useEffect, useRef } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import useStreamingText from '@/hooks/useStreamingText';
import MarkdownBody from '@/components/MarkdownBody';

export default function Home() {
  const store = useNovelStore();
  const { 
    displayedText, 
    isStreaming, 
    triggerStream, 
    forceComplete 
  } = useStreamingText();

  const renderedTextRef = useRef(null);

  // Auto-scroll when streaming text updates
  useEffect(() => {
    if (renderedTextRef.current) {
      renderedTextRef.current.scrollTop = renderedTextRef.current.scrollHeight;
    }
  }, [displayedText]);

  // Phase 1 -> Phase 2 Outline Streaming Trigger
  const handleStartGeneration = (e) => {
    e.preventDefault();
    store.generateNovelConfigDetails();
    store.startOutlineStreaming();
    
    // Quick delay for phase transition to complete nicely
    setTimeout(() => {
      const outlineText = useNovelStore.getState().outlineText;
      triggerStream(outlineText, 15, () => {
        store.completeOutlineStreaming();
      });
    }, 450);
  };

  // Chapter Writing Streaming Trigger
  const handleWriteChapter = () => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    
    const index = store.activeChapterIndex;
    const ch = store.chapters[index];
    const chapterContent = store.getChapterContentDatabase(index);

    store.startWritingChapter();
    store.setActiveTab('chapters');

    // Quick delay for visual feedback
    setTimeout(() => {
      triggerStream(chapterContent, 20, () => {
        store.completeWritingChapter(index, chapterContent);
      });
    }, 200);
  };

  // Switch Tab Handler
  const handleSwitchTab = (tab) => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    store.setActiveTab(tab);
  };

  // Select Chapter from Sidebar Grid
  const handleSelectChapter = (index) => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    store.setActiveChapterIndex(index);
    store.setActiveTab('chapters');
  };

  // Chapter pagination navigator
  const handleNavigateChapter = (direction) => {
    if (store.isGeneratingOutline || store.isWritingChapter) return;
    const nextIdx = store.activeChapterIndex + direction;
    if (nextIdx >= 0 && nextIdx < store.chaptersCount) {
      handleSelectChapter(nextIdx);
    }
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
    text += `TÁC PHẨM SINH BỞI AI NOVEL GENERATOR\n`;
    text += `TÊN TRUYỆN: ${title.toUpperCase()}\n`;
    text += `==================================================\n\n`;
    
    text += store.outlineText;
    text += `\n\n==================================================\n`;
    text += `CHI TIẾT CÁC CHƯƠNG\n`;
    text += `==================================================\n\n`;
    
    let writtenChaptersCount = 0;
    store.chapters.forEach(ch => {
      text += `--------------------------------------------------\n`;
      text += `Chương ${ch.number}: ${ch.title.split(": ")[1]}\n`;
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
    text += `Tổng số chương thiết lập: ${store.chaptersCount}\n`;
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
      if (!ch.written) {
        alert("Chương này chưa có nội dung để tải về!");
        return;
      }
      let txt = `Chương ${ch.number}: ${ch.title.split(": ")[1]}\n\n${ch.content}`;
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
      if (!ch.written) {
        alert("Chương này chưa có nội dung để sao chép!");
        return;
      }
      text = `Chương ${ch.number}: ${ch.title.split(": ")[1]}\n\n${ch.content}`;
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
      forceComplete();
      store.resetStore();
    }
  };

  return (
    <div className="app-container">
      {/* ==================== GIAI ĐOẠN 1: MÀN HÌNH SETUP BAN ĐẦU ==================== */}
      <main id="phase-1" className={`phase ${store.phase === 1 ? 'active' : ''}`}>
        <div className="setup-container">
          
          <header className="setup-header">
            <span className="setup-badge">AI CREATIVE WRITER</span>
            <h1 className="setup-title">Trình Tạo Kịch Bản Tiểu Thuyết</h1>
            <p className="setup-subtitle">Thiết lập cấu hình nền tảng để AI bắt đầu phác thảo thế giới và nhân vật của bạn</p>
          </header>

          <form id="setup-form" onSubmit={handleStartGeneration}>
            
            {/* 1. KHỐI CHỦ ĐỀ (THEME) */}
            <section className="form-section">
              <div className="section-title-wrapper">
                <h2 className="section-number-title">1. CHỦ ĐỀ <span className="section-sub-label">THEME</span></h2>
                <span className="active-badge" id="selected-theme-badge">{store.theme}</span>
              </div>
              
              <div className="grid-radios theme-grid">
                {[
                  { value: 'Xuyên Không', desc: 'Vượt qua không gian & thời gian.', color: 'orange-glow', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="svg-icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  ) },
                  { value: 'Trùng Sinh', desc: 'Bắt đầu lại cuộc đời, báo thù...', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="svg-icon"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                  ) },
                  { value: 'Hệ Thống', desc: 'Giao diện nhiệm vụ & thăng cấp.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="svg-icon"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>
                  ) },
                  { value: 'Sinh Tồn', desc: 'Vật lộn sống sót khắc nghiệt.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="svg-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  ) },
                  { value: 'Võ Hiệp', desc: 'Ân oán giang hồ, kiếm hiệp.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 13l2 2M3 21l3-3"></path></svg>
                  ) },
                  { value: 'Trinh Thám', desc: 'Phá án & ly kỳ bí ẩn.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  ) },
                ].map((t) => (
                  <label 
                    key={t.value} 
                    className={`custom-radio theme-card ${store.theme === t.value ? 'active' : ''}`}
                    onClick={() => store.setTheme(t.value)}
                  >
                    <input 
                      type="radio" 
                      name="theme" 
                      value={t.value} 
                      checked={store.theme === t.value} 
                      onChange={() => {}}
                    />
                    <div className="card-content">
                      <div className={`card-icon ${store.theme === t.value ? 'orange-glow' : ''}`}>
                        {t.icon}
                      </div>
                      <div className="card-text">
                        <div className="card-title">{t.value}</div>
                        <div className="card-desc">{t.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* 2. KHỐI PHONG CÁCH (STYLE) */}
            <section className="form-section">
              <div className="section-title-wrapper">
                <h2 className="section-number-title">2. PHONG CÁCH <span className="section-sub-label">STYLE</span></h2>
                <span className="active-badge secondary-badge" id="selected-style-badge">{store.style}</span>
              </div>
              
              <div className="grid-radios style-grid">
                {[
                  { value: 'Tu Tiên / Tiên Hiệp', desc: 'Pháp bảo, phi thăng trời cao.', color: 'blue-glow', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><path d="M8 3l4 8 5-5 5 15H2L8 3z"></path></svg>
                  ) },
                  { value: 'Huyền Huyễn', desc: 'Dị giới, ma pháp huyền ảo.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path></svg>
                  ) },
                  { value: 'Đô Thị', desc: 'Thương trường, giới giải trí.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><line x1="15" y1="16" x2="15" y2="22"></line><line x1="9" y1="7" x2="9.01" y2="7"></line><line x1="9" y1="11" x2="9.01" y2="11"></line><line x1="15" y1="7" x2="15.01" y2="7"></line><line x1="15" y1="11" x2="15.01" y2="11"></line></svg>
                  ) },
                  { value: 'Viễn Tưởng', desc: 'Công nghệ, du hành vũ trụ.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><path d="M4.5 16.5c-1.5 1.26-2 3.5-2 3.5s2.24-.5 3.5-2M22 2s-5.7 1.4-11.4 7.1C9.2 10.5 8 13 8 13s2.5-1.2 3.9-2.6C17.6 4.7 22 2 22 2z"></path><path d="M12 12c-2 2-6 3-8 3-1 0-1-1-1-1s1-6 3-8c2-2 6-3 8-3 1 0 1 1 1 1s-1 6-3 8z"></path></svg>
                  ) },
                  { value: 'Mạt Thế', desc: 'Thế giới sụp đổ, tang thi.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                  ) },
                  { value: 'Cổ Đại', desc: 'Hoàng cung, cung đấu trạch đấu.', color: '', icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path><path d="M3 20h18a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z"></path></svg>
                  ) },
                ].map((s) => (
                  <label 
                    key={s.value} 
                    className={`custom-radio style-card ${store.style === s.value ? 'active' : ''}`}
                    onClick={() => store.setStyle(s.value)}
                  >
                    <input 
                      type="radio" 
                      name="style" 
                      value={s.value} 
                      checked={store.style === s.value} 
                      onChange={() => {}}
                    />
                    <div className="card-content">
                      <div className={`card-icon ${store.style === s.value ? 'blue-glow' : ''}`}>
                        {s.icon}
                      </div>
                      <div className="card-text">
                        <div className="card-title">{s.value}</div>
                        <div className="card-desc">{s.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* 3. MÔ TẢ CỐT TRUYỆN (TÙY CHỌN) */}
            <section className="form-section">
              <div className="section-title-wrapper">
                <h2 className="section-number-title">3. MÔ TẢ CỐT TRUYỆN <span className="optional-tag">(TÙY CHỌN)</span></h2>
              </div>
              <p className="section-subtext">NHẬP THÊM CÁC TÌNH TIẾT HOẶC Ý TƯỞNG BẠN MUỐN XUẤT HIỆN TRONG KỊCH BẢN</p>
              <textarea 
                id="prompt-input" 
                className="custom-textarea" 
                value={store.prompt}
                onChange={(e) => store.setPrompt(e.target.value)}
                placeholder="Ví dụ: Nhân vật chính là một kiếm khách mù sở hữu linh khí bất diệt, có một con rồng nhỏ đi theo hỗ trợ. Cảnh mở đầu diễn ra trong một quán trọ đổ nát giữa cơn mưa bão tuyết..."
              />
            </section>

            {/* 4. QUY MÔ TÁC PHẨM */}
            <section className="form-section">
              <div className="chapter-scale-wrapper">
                <div className="scale-info">
                  <h2 className="section-number-title inline-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-inline-icon orange-text"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    4. QUY MÔ TÁC PHẨM
                  </h2>
                  <p className="scale-subtext">XÁC ĐỊNH TỔNG SỐ CHƯƠNG CHO BẢN THẢO AI</p>
                </div>
                
                <div className="number-stepper">
                  <button type="button" className="stepper-btn minus" onClick={() => store.stepChaptersCount(-1)}>-</button>
                  <div className="stepper-value-wrapper">
                    <span id="chapter-count" className="stepper-value">{store.chaptersCount}</span>
                    <span className="stepper-unit">CHƯƠNG</span>
                  </div>
                  <button type="button" className="stepper-btn plus" onClick={() => store.stepChaptersCount(1)}>+</button>
                </div>
              </div>
            </section>

            {/* CTA BUTTON */}
            <div className="cta-container">
              <button type="submit" className="cta-btn primary-glow">
                <span className="btn-stars">✦ ✦</span>
                <span>🚀 TIẾN HÀNH SINH KỊCH BẢN AI</span>
                <span className="btn-stars">✦ ✦</span>
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* ==================== GIAI ĐOẠN 2: WORKSPACE CHÍNH ==================== */}
      <main id="phase-2" className={`phase ${store.phase === 2 ? 'active' : ''}`}>
        <div className="workspace-layout">
          
          {/* CỘT TRÁI: SIDEBAR ĐIỀU KHIỂN (30%) */}
          <aside className="workspace-sidebar">
            
            {/* Sidebar Header Card */}
            <div className="sidebar-card main-info-card">
              <div className="card-header-icon orange-glow-subtle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <h2 className="sidebar-card-title">CHI TIẾT TÁC PHẨM</h2>
            </div>

            {/* 1. TÊN TÁC PHẨM */}
            <div className="sidebar-section">
              <label className="sidebar-label">TÊN TÁC PHẨM</label>
              <input 
                type="text" 
                id="novel-title-input" 
                className="sidebar-input" 
                value={store.novelTitle}
                disabled={store.isGeneratingOutline || store.isWritingChapter}
                onChange={(e) => store.setNovelTitle(e.target.value)}
              />
              <span className="input-subtext">Dùng tên ngắn gọn, hấp dẫn.</span>
            </div>

            {/* 2. DANH SÁCH CHƯƠNG */}
            <div className="sidebar-section">
              <div className="section-header-inline">
                <label className="sidebar-label">DANH SÁCH CHƯƠNG</label>
                <span className="sidebar-badge" id="sidebar-chapter-badge">
                  {store.outlineGenerated ? `${store.chaptersCount} chương` : '0 chương'}
                </span>
              </div>
              
              {/* Empty/Scanning State */}
              {!store.outlineGenerated && (
                <div id="chapter-list-empty" className="chapter-placeholder">
                  <div className="placeholder-border-dash">
                    <span>Danh sách chương sẽ được AI tự điền</span>
                  </div>
                </div>
              )}

              {/* Active State (Grid of Square Buttons) */}
              {store.outlineGenerated && (
                <div id="chapter-list-grid" className="chapter-grid">
                  {store.chapters.map((ch, idx) => (
                    <button
                      key={ch.number}
                      className={`chapter-btn ${ch.written ? 'written' : 'unwritten'} ${idx === store.activeChapterIndex ? 'active' : ''}`}
                      disabled={store.isGeneratingOutline || store.isWritingChapter}
                      onClick={() => handleSelectChapter(idx)}
                    >
                      {ch.number}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. HỒ SƠ NHÂN VẬT */}
            <div className="sidebar-section">
              <div className="section-header-inline">
                <label className="sidebar-label">HỒ SƠ NHÂN VẬT</label>
                {store.isGeneratingOutline && (
                  <span className="scanning-indicator" id="character-scanning-indicator">
                    <span className="spinner-tiny"></span> ĐANG QUÉT
                  </span>
                )}
              </div>
              
              {/* Empty State */}
              {!store.outlineGenerated && !store.isGeneratingOutline && (
                <div id="character-list-empty" className="character-placeholder">
                  <div className="placeholder-border-dash">
                    <span>Danh sách sẽ được AI tự điền.</span>
                  </div>
                </div>
              )}

              {/* Tag List (Active State) */}
              {(store.outlineGenerated || store.isGeneratingOutline) && (
                <div id="character-list-tags" className="character-tags-container">
                  {store.characters.map((char) => (
                    <div 
                      key={char.name} 
                      className="character-chip cursor-help" 
                      title={char.desc}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-inline-icon chip-user-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <span>{char.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. CẤU HÌNH KỊCH BẢN (READ-ONLY) */}
            <div className="sidebar-section readonly-config-card">
              <div className="readonly-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-inline-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                <span className="readonly-title">CẤU HÌNH KỊCH BẢN</span>
              </div>
              <p className="readonly-desc">THIẾT LẬP NỀN TẢNG CHO TÁC PHẨM</p>
              
              <div className="readonly-tags">
                <div className="readonly-tag-group">
                  <span className="readonly-tag-label">1. CHỦ ĐỀ</span>
                  <span id="readonly-theme-val" className="readonly-pill theme-pill">{store.theme.toUpperCase()}</span>
                </div>
                <div className="readonly-tag-group">
                  <span className="readonly-tag-label">2. PHONG CÁCH</span>
                  <span id="readonly-style-val" className="readonly-pill style-pill">{store.style.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* 5. CỤM NÚT HÀNH ĐỘNG DƯỚI CÙNG */}
            <div className="sidebar-actions">
              <button 
                className="action-btn-reset secondary-btn" 
                disabled={store.isGeneratingOutline || store.isWritingChapter}
                onClick={handleConfirmReset}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-inline-icon"><path d="M23 4v6h-6M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                LÀM MỚI
              </button>
              
              <button 
                id="write-chapter-btn" 
                className={`action-btn-write primary-btn ${(!store.outlineGenerated || store.isGeneratingOutline || store.isWritingChapter) ? 'disabled' : ''}`}
                disabled={!store.outlineGenerated || store.isGeneratingOutline || store.isWritingChapter}
                onClick={handleWriteChapter}
              >
                <span id="write-btn-icon">
                  {store.isWritingChapter ? (
                    <span className="spinner-tiny !mr-0"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-inline-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  )}
                </span>
                <span id="write-btn-text">
                  {store.isWritingChapter 
                    ? 'ĐANG VIẾT...' 
                    : store.chapters[store.activeChapterIndex]?.written 
                      ? 'VIẾT LẠI CHƯƠNG NÀY' 
                      : 'SINH PHẦN TIẾP THEO'}
                </span>
              </button>
            </div>

          </aside>

          {/* CỘT PHẢI: KHÔNG GIAN HIỂN THỊ NỘI DUNG (70%) */}
          <section className="workspace-content">
            
            {/* Content Panel Header */}
            <div className="content-header">
              <div className="header-left">
                <span className="content-header-icon blue-glow-subtle">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </span>
                <h2 className="content-header-title">NỘI DUNG TÁC PHẨM</h2>
              </div>
              <button 
                className="export-btn" 
                disabled={store.isGeneratingOutline || store.isWritingChapter || !store.outlineGenerated}
                onClick={handleExportFullNovel}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" className="svg-inline-icon"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"></path></svg>
                Tải Toàn Bộ (.txt)
              </button>
            </div>

            {/* Inner Card / Editor Workspace */}
            <div className="editor-container">
              
              {/* Tabs Navigation & Action Toolbar */}
              <div className="editor-toolbar">
                <div className="editor-tabs">
                  <button 
                    id="tab-outline" 
                    className={`tab-btn ${store.activeTab === 'outline' ? 'active' : ''}`}
                    disabled={store.isGeneratingOutline || store.isWritingChapter}
                    onClick={() => handleSwitchTab('outline')}
                  >
                    Dàn Ý Kịch Bản
                  </button>
                  <button 
                    id="tab-chapters" 
                    className={`tab-btn ${store.activeTab === 'chapters' ? 'active' : ''}`}
                    disabled={store.isGeneratingOutline || store.isWritingChapter || !store.outlineGenerated}
                    onClick={() => handleSwitchTab('chapters')}
                  >
                    Chi Tiết Tác Phẩm
                  </button>
                </div>

                {/* Contextual Pagination & Action Buttons */}
                <div className="toolbar-actions">
                  
                  {/* Internal Pagination for Chapters (only shown when in Chapter view) */}
                  {store.activeTab === 'chapters' && (
                    <div id="chapter-pagination" className="chapter-pagination">
                      <button 
                        className="pagination-arrow" 
                        disabled={store.isGeneratingOutline || store.isWritingChapter || store.activeChapterIndex === 0}
                        onClick={() => handleNavigateChapter(-1)}
                      >
                        Trước
                      </button>
                      <span className="pagination-indicator" id="pagination-pages">
                        {store.activeChapterIndex + 1}/{store.chaptersCount}
                      </span>
                      <button 
                        className="pagination-arrow" 
                        disabled={store.isGeneratingOutline || store.isWritingChapter || store.activeChapterIndex === store.chaptersCount - 1}
                        onClick={() => handleNavigateChapter(1)}
                      >
                        Tiếp
                      </button>
                    </div>
                  )}
                  
                  <button 
                    className="tool-action-btn secondary" 
                    disabled={store.isGeneratingOutline || store.isWritingChapter}
                    onClick={handleDownloadActiveView}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-inline-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                    Tải về
                  </button>
                  <button 
                    className="tool-action-btn secondary" 
                    disabled={store.isGeneratingOutline || store.isWritingChapter}
                    onClick={handleCopyToClipboard}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="svg-inline-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Sao chép
                  </button>
                </div>
              </div>

              {/* Content Render Area */}
              <div ref={renderedTextRef} className="content-viewer">
                <div className="streaming-block" id="rendered-text-container">
                  
                  {/* 1. Initial Scanning Welcome State */}
                  {!store.outlineGenerated && !store.isGeneratingOutline && (
                    <div className="loading-state-initial">
                      <div className="spinner-main"></div>
                      <p>Đang chuẩn bị mô hình ngôn ngữ sáng tạo...</p>
                    </div>
                  )}

                  {/* 2. Active Outline Streaming */}
                  {store.isGeneratingOutline && store.activeTab === 'outline' && (
                    <MarkdownBody text={displayedText} isStreaming={true} />
                  )}

                  {/* 3. Static Completed Outline view */}
                  {store.outlineGenerated && store.activeTab === 'outline' && (
                    <MarkdownBody text={store.outlineText} isStreaming={false} />
                  )}

                  {/* 4. Active Chapter Streaming */}
                  {store.isWritingChapter && store.activeTab === 'chapters' && (
                    <MarkdownBody text={displayedText} isStreaming={true} />
                  )}

                  {/* 5. Completed Chapter View */}
                  {store.outlineGenerated && store.activeTab === 'chapters' && !store.isWritingChapter && (
                    <>
                      {store.chapters[store.activeChapterIndex]?.written ? (
                        <MarkdownBody 
                          text={`Chương ${store.chapters[store.activeChapterIndex].number}: ${store.chapters[store.activeChapterIndex].title.split(': ')[1]}\n\n${store.chapters[store.activeChapterIndex].content}`} 
                          isStreaming={false} 
                        />
                      ) : (
                        <div className="unwritten-indicator-box">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" className="svg-icon" style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: '16px', display: 'inline-block' }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          <p className="text-zinc-400">Chương này chưa được viết nội dung.</p>
                          <button 
                            className="unwritten-btn-trigger mt-4" 
                            disabled={store.isWritingChapter}
                            onClick={handleWriteChapter}
                          >
                            🚀 Bắt đầu viết chương {store.chapters[store.activeChapterIndex]?.number} bằng AI
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  
                </div>
              </div>

            </div>

          </section>
        </div>
      </main>
    </div>
  );
}
