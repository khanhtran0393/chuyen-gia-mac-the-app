'use client';

import React, { useState, useEffect } from 'react';
import { useNovelStore } from '@/store/useNovelStore';

export default function WorkspacePage() {
  const store = useNovelStore();
  const [isLoading, setIsLoading] = useState(false);

  // Trigger manual rehydration on mount to avoid Next.js hydration mismatch
  useEffect(() => {
    useNovelStore.persist.rehydrate();
  }, []);

  // HÀM MÔ PHỎNG HOẶC GỌI API THẬT CHO TỪNG BƯỚC
  const executePipeline = async (type: string) => {
    setIsLoading(true);
    
    try {
      if (store.useMock) {
        await new Promise(r => setTimeout(r, 1000));
        if (type === "GENERATE_OUTLINE") {
          store.setCurrentChapterData({ dan_y_chot: "1. Mở bài: Tiêu Hàn phát hiện bẫy. 2. Thân bài: Giao tranh. 3. Kết bài: Chạy thoát nhưng rách áo." });
          store.setPipelineStep(2);
        } else if (type === "EXTRACT_CHARACTERS") {
          store.setMacroState({ bo_nho_nhan_vat: [{ ten: "Tiêu Hàn", tinh_trang_hien_tai: "Cảnh giác cao độ", vat_dung_dang_mang: ["Súng gỉ"], moi_quan_he: {} }] });
          store.setPipelineStep(3);
        } else if (type === "WRITE_SCRIPT") {
          store.setCurrentChapterData({ script_text: "Tiêu Hàn nín thở trượt qua vách tường gỉ sét. Khẩu súng gỉ trên tay anh run lên..." });
          store.setPipelineStep(4);
        } else if (type === "COMMIT_MEMORY") {
          store.setMacroState({ tom_tat_cuon_chieu: store.macroState.tom_tat_cuon_chieu + " Tiêu Hàn đã trốn thoát thành công." });
          store.nextChapter();
        }
        setIsLoading(false);
        return;
      }

      // GỌI API THẬT
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: type,
          config: store.config,
          macroState: store.macroState,
          currentData: store.currentChapterData,
          apiKey: store.apiKey
        })
      });
      
      const data = await res.json();
      const output = data.result;

      if (type === "GENERATE_OUTLINE") {
        store.setCurrentChapterData({ dan_y_chot: output });
        store.setPipelineStep(2);
      } else if (type === "EXTRACT_CHARACTERS") {
        const jsonMatch = output.match(/\[[\s\S]*\]/); // Bắt mảng JSON
        if (jsonMatch) store.setMacroState({ bo_nho_nhan_vat: JSON.parse(jsonMatch[0]) });
        store.setPipelineStep(3);
      } else if (type === "WRITE_SCRIPT") {
        store.setCurrentChapterData({ script_text: output });
        store.setPipelineStep(4);
      } else if (type === "COMMIT_MEMORY") {
        const jsonMatch = output.match(/\{[\s\S]*\}/); // Bắt object JSON
        if (jsonMatch) store.setMacroState(JSON.parse(jsonMatch[0]));
        store.nextChapter();
      }
    } catch (err) {
      alert("Lỗi xử lý: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-gray-300 flex flex-col font-sans">
      {/* HEADER & STEPPER */}
      <header className="h-16 border-b border-[#121219] bg-[#0a0a0f] flex items-center justify-between px-6">
        <div className="font-black text-orange-500 uppercase tracking-widest text-sm flex items-center gap-4">
          MACRO-LOGIC PIPELINE 
          <span className="text-xs bg-[#1a1a24] text-gray-400 px-2 py-1 rounded border border-[#2d2d3d]">CHƯƠNG {store.macroState.con_tro.chuong_hien_tai}</span>
        </div>
        
        {/* STEPPER NAV */}
        <div className="flex gap-8 text-xs font-bold uppercase tracking-wider">
          <div className={`${store.pipelineStep === 1 ? 'text-orange-500' : 'text-gray-600'}`}>1. Dàn Ý</div>
          <div className={`${store.pipelineStep === 2 ? 'text-orange-500' : 'text-gray-600'}`}>2. Nhân Vật</div>
          <div className={`${store.pipelineStep === 3 ? 'text-orange-500' : 'text-gray-600'}`}>3. Kịch Bản</div>
          <div className={`${store.pipelineStep === 4 ? 'text-orange-500' : 'text-gray-600'}`}>4. Ghi Sổ</div>
        </div>

        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2 text-xs text-gray-400 select-none cursor-pointer">
            <input type="checkbox" checked={store.useMock} onChange={e => store.setUseMock(e.target.checked)} className="accent-orange-500" />
            MOCK MODE
          </label>
          <input type="password" placeholder="Gemini API Key" value={store.apiKey} onChange={e => store.setApiKey(e.target.value)} className="bg-[#121217] border border-[#2d2d3d] text-xs px-2 py-1 rounded focus:outline-none focus:border-orange-500" />
          <button 
            onClick={() => {
              if (confirm("Bạn có chắc chắn muốn tạo lại dự án mới và xóa toàn bộ ký ức cũ?")) {
                store.reset();
              }
            }}
            className="bg-red-950 text-red-400 border border-red-900 text-xs px-3 py-1 rounded hover:bg-red-900 hover:text-white transition-colors cursor-pointer font-bold"
          >
            🔄 Dự Án Mới
          </button>
        </div>
      </header>

      {/* SPLIT VIEW LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* CỘT TRÁI: BỘ NHỚ CỐT TRUYỆN (LOREBOOK & CHARACTERS) */}
        <aside className="w-[35%] border-r border-[#121219] bg-[#08080c] p-6 overflow-y-auto space-y-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#2d2d3d] pb-2">🧠 Trí nhớ vĩ mô (Tự động nén)</h2>
          
          <div className="bg-[#0c0c12] p-4 rounded-xl border border-[#1a1a24]">
            <h3 className="text-[10px] text-orange-400 font-bold mb-2 uppercase">Tóm tắt cuốn chiếu (Chương 1 đến nay)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{store.macroState.tom_tat_cuon_chieu}</p>
          </div>

          <div className="bg-[#0c0c12] p-4 rounded-xl border border-[#1a1a24]">
            <h3 className="text-[10px] text-blue-400 font-bold mb-2 uppercase">Bộ Nhớ Nhân Vật</h3>
            {store.macroState.bo_nho_nhan_vat.map((nv, idx) => (
              <div key={idx} className="mb-3 border-b border-[#1a1a24] pb-2 last:border-0">
                <div className="font-bold text-sm text-white">{nv.ten}</div>
                <div className="text-[10px] text-gray-400 mt-1">Trạng thái: {nv.tinh_trang_hien_tai}</div>
                <div className="text-[10px] text-gray-500">Đang mang: {nv.vat_dung_dang_mang?.join(", ")}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* CỘT PHẢI: PIPELINE CHÍNH */}
        <main className="flex-1 bg-[#0a0a0f] p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* STEP 1: DÀN Ý */}
            {store.pipelineStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Xây dựng cấu trúc Chương {store.macroState.con_tro.chuong_hien_tai}</h3>
                <textarea 
                  value={store.currentChapterData.dan_y_chot} 
                  onChange={e => store.setCurrentChapterData({ dan_y_chot: e.target.value })}
                  placeholder="Gõ dàn ý hoặc nhờ AI sinh..."
                  className="w-full h-48 bg-[#121217] border border-[#2d2d3d] rounded-xl p-4 text-sm text-gray-300 focus:border-orange-500 outline-none"
                />
                <button onClick={() => executePipeline("GENERATE_OUTLINE")} disabled={isLoading} className="px-4 py-2 bg-[#1a1a24] border border-[#2d2d3d] rounded text-xs font-bold hover:bg-[#252533] cursor-pointer">
                  {isLoading ? "ĐANG SINH..." : "AI TỰ ĐỘNG LÊN DÀN Ý"}
                </button>
                {store.currentChapterData.dan_y_chot && (
                  <button onClick={() => executePipeline("EXTRACT_CHARACTERS")} className="ml-3 px-4 py-2 bg-orange-600 text-white rounded text-xs font-bold hover:bg-orange-500 cursor-pointer">
                    CHỐT DÀN Ý & BÓC TÁCH NHÂN VẬT ➔
                  </button>
                )}
              </div>
            )}

            {/* STEP 2: NHÂN VẬT (Review kết quả trích xuất) */}
            {store.pipelineStep === 2 && (
              <div className="space-y-4 text-center py-20">
                <h3 className="text-lg font-bold text-white">Đã nạp Bộ nhớ Nhân vật thành công!</h3>
                <p className="text-sm text-gray-500">Hệ thống đã khóa chặt trạng thái vật lý và đồ vật vào ngữ cảnh tĩnh.</p>
                <button onClick={() => executePipeline("WRITE_SCRIPT")} disabled={isLoading} className="px-6 py-3 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-orange-500 mt-4 cursor-pointer">
                  {isLoading ? "ĐANG STREAM KỊCH BẢN..." : "BẮT ĐẦU VIẾT KỊCH BẢN"}
                </button>
              </div>
            )}

            {/* STEP 3 & 4: KỊCH BẢN & GHI SỔ */}
            {(store.pipelineStep === 3 || store.pipelineStep === 4) && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex justify-between items-center">
                  Văn bản Kịch bản
                  {store.pipelineStep === 4 && <span className="text-[10px] bg-green-950 text-green-400 px-2 py-1 rounded uppercase font-mono">Đã hoàn thành</span>}
                </h3>
                <textarea 
                  value={store.currentChapterData.script_text} 
                  onChange={e => store.setCurrentChapterData({ script_text: e.target.value })}
                  className="w-full h-[500px] bg-[#121217] border border-[#2d2d3d] rounded-xl p-6 text-sm text-gray-300 leading-relaxed outline-none focus:border-orange-500"
                />
                
                {store.pipelineStep === 3 ? (
                  <button onClick={() => executePipeline("WRITE_SCRIPT")} className="px-4 py-2 bg-[#1a1a24] border border-[#2d2d3d] rounded text-xs font-bold hover:bg-[#252533] cursor-pointer">
                    VIẾT LẠI KỊCH BẢN
                  </button>
                ) : null}

                {store.pipelineStep === 4 ? (
                  <button onClick={() => executePipeline("COMMIT_MEMORY")} disabled={isLoading} className="w-full py-4 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-500 shadow-lg flex justify-center items-center gap-2 cursor-pointer">
                    {isLoading ? "ĐANG NÉN KÝ ỨC VÀ GHI SỔ..." : "🔒 NÉN KÝ ỨC CỐT TRUYỆN & CHUYỂN CHƯƠNG TIẾP THEO"}
                  </button>
                ) : (
                  <button onClick={() => store.setPipelineStep(4)} className="ml-3 px-4 py-2 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-500 cursor-pointer">
                    CHẤP NHẬN KỊCH BẢN NÀY ➔
                  </button>
                )}
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  );
}
