# BẢN GHI TOÀN DIỆN: KẾ HOẠCH TRIỂN KHAI, NHẬT KÝ HOÀN THÀNH & HƯỚNG DẪN VẬN HÀNH

Tệp tin này ghi nhận toàn bộ quá trình phát triển, nâng cấp, vận hành và danh mục các đầu việc (Checklist) đã hoàn thành kể từ đầu cuộc hội thoại đến nay đối với hệ thống **Kiến trúc Trợ lý Biên kịch Sản xuất (Macro-Logic Pipeline & Nén Bộ Nhớ Cuốn Chiếu)**.

---

# PHẦN 1: KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
*Chi tiết thiết kế và giải pháp kỹ thuật được áp dụng trong quá trình nâng cấp hệ thống.*

### 1. Giải Pháp Vượt Giới Hạn Ngữ Cảnh (Context Window Protection)
Để giải quyết bài toán viết kịch bản lên tới 1000 chương mà không bị ảo giác LLM hay tràn bộ nhớ ngữ cảnh, hệ thống được chuyển đổi từ Pipeline tuyến tính sang **Kiến trúc RAG (Retrieval-Augmented Generation) kết hợp Memory Compression (Nén bộ nhớ cuốn chiếu)**.
Bộ nhớ được chia làm 3 tầng rõ rệt:
*   **Tầng 1: Lõi Bất Biến (Lorebook):** Lưu trữ quy luật thép bất biến (định luật mạt thế, sinh thái 8 tầng, nhân vật cốt lõi).
*   **Tầng 2: Tóm Tắt Cuốn Chiếu & Bộ Nhớ Nhân Vật Động:** Cốt truyện được nén liên tục dưới 500 từ; đồng hồ sinh học, thuộc tính vật lý, vết thương thực thể, và vật dụng đang mang của nhân vật được cập nhật tự động qua từng chương.
*   **Tầng 3: Trí Nhớ Ngắn Hạn (Short-term Context):** Lưu trữ kịch bản tóm tắt cực ngắn của 3 chương gần nhất để giữ nhịp điệu cảm xúc nối tiếp.

### 2. Thiết Kế Trực Quan Hóa Quy Trình (Pipeline Architecture)
Hệ thống được chia làm 4 Node xử lý chính (4-Node Chain) chạy tuần tự qua các chốt kiểm duyệt (Approval Gates) trước khi ghi sổ bộ nhớ:
1.  `GENERATE_OUTLINE` (Sinh dàn ý) ➔ Người dùng kiểm duyệt/Chỉnh sửa.
2.  `EXTRACT_CHARACTERS` (Bóc tách nhân vật) ➔ Khóa cứng hồ sơ tĩnh, thiết lập giới hạn cơ thể phàm nhân.
3.  `WRITE_SCRIPT` (Viết kịch bản) ➔ Sinh văn bản chi tiết đa giác quan, áp dụng Cổng Từ (Word-Gate) và Stamp-Weaving (Dệt ấn ký vật dụng).
4.  `COMMIT_MEMORY` (Nén & Ghi sổ) ➔ AI đọc lại kịch bản, tự động phân tích và ghi vết nợ sinh lý, vết thương mới, vật phẩm tiêu hao, cập nhật Lorebook và tóm tắt cuốn chiếu ròng rọc.

---

# PHẦN 2: NHẬT KÝ HOÀN THÀNH & HƯỚNG DẪN VẬN HÀNH (WALKTHROUGH)
*Chi tiết các tệp tin đã nâng cấp, kết quả kiểm thử, và hướng dẫn thao tác vận hành thực tế.*

### 1. Kiến Trúc Dữ Liệu Việt Hóa & File Đã Cấu Trúc
*   **[useNovelStore.ts](file:///d:/chuyen%20gia%20mac%20the%20app/src/store/useNovelStore.ts) (Mới)**:
    *   Sử dụng TypeScript chuẩn bảo vệ kiểu dữ liệu (`MacroStateJSON`, `NovelStore`).
    *   Tích hợp **Zustand Persist Middleware** tự động đồng bộ hóa toàn bộ trạng thái vào `localStorage` của trình duyệt dưới tên `chuyen_gia_mac_the_store_new`.
    *   Cấu hình `skipHydration: true` để triệt tiêu hoàn toàn lỗi hydration bất đồng bộ Next.js SSR.
    *   Triển khai action `reset()` dọn sạch hoàn toàn `localStorage` khi tạo dự án mới.
    *   *Lưu ý:* Đã xóa bỏ tệp store cũ `useNovelStore.js` để tránh trùng lặp export.
*   **[route.ts](file:///d:/chuyen%20gia%20mac%20the%20app/src/app/api/generate/route.ts) (Cập nhật)**:
    *   Tích hợp chuỗi Prompt Cuốn Chiếu (Prompt Chaining) chia làm 4 Node xử lý.
    *   Nhánh `COMMIT_MEMORY` trả về khối JSON cấu trúc Việt hóa chuẩn xác chứa bộ nhớ cập nhật.
    *   Khắc phục lỗi cú pháp bị cắt cụt (truncation) ở nhánh `EXTRACT_CHARACTERS`, khôi phục biên dịch thành công.
*   **[page.tsx](file:///d:/chuyen%20gia%20mac%20the%20app/src/app/workspace/page.tsx) (Mới)**:
    *   Xây dựng giao diện Split-View tối giản cao cấp.
    *   *Cột trái:* Ghim cố định **Trí nhớ vĩ mô (Tự động nén)** để tác giả giám sát tình trạng thực tế của nhân vật và tóm tắt ròng rọc.
    *   *Cột phải:* Không gian làm việc Pipeline di chuyển theo Stepper (Dàn ý ➔ Nhân vật ➔ Kịch bản ➔ Ghi sổ).
    *   Tích hợp nút **`🔄 Dự Án Mới`** trên Header giúp dọn dẹp bộ nhớ kiên trì chỉ với 1 click.
*   **[page.js](file:///d:/chuyen%20gia%20mac%20the%20app/src/app/page.js) (Cập nhật)**:
    *   Trở thành trang trung chuyển (Page Redirect). Tự động và an toàn chuyển hướng người dùng sang `/workspace` kèm theo Loader sci-fi amber cao cấp.

### 2. Kết Quả Xác Minh & Biên Dịch (Next.js Build Check)
*   **Next.js Production Build**:
    *   Chạy biên dịch thành công thông qua lệnh: `cmd.exe /c "npm run build"`.
    *   **Kết quả:** 100% thành công, không phát sinh bất kỳ lỗi cú pháp, TypeScript, hay warnings nào! 
*   **Đồng Bộ GitHub**:
    *   Tất cả thay đổi đã được staged, committed với thông điệp: `"feat: migrate to Macro-Logic Pipeline with 4-Node rolling memory, Zustand persist, and home redirect"`.
    *   Đẩy thành công lên nhánh `main` trên kho lưu trữ: **[khanhtran0393/chuyen-gia-mac-the-app](https://github.com/khanhtran0393/chuyen-gia-mac-the-app)**.

### 3. Hướng Dẫn Vận Hành Hệ Thống
1.  **Khởi Chạy Nhanh**: Nhấp đúp vào tệp `run.bat` tại thư mục gốc của dự án. Batch file sẽ tự động cài đặt thư viện và kích hoạt local dev server tại `http://localhost:3000`.
2.  **Thiết Lập Ban Đầu**:
    *   Nhập khóa API Gemini của bạn vào ô mật khẩu ở góc trên bên phải (hoặc cấu hình `GEMINI_API_KEY` trong tệp `.env.local`).
    *   Chọn **MOCK MODE** nếu bạn muốn chạy thử nghiệm ngoại tuyến (offline) mô phỏng siêu tốc.
3.  **Quy Trình Tạo Tác Kịch Bản**:
    *   **Bước 1 (Lập Dàn Ý)**: Nhập ý tưởng/mô tả hoặc nhấn **AI Tự Động Lên Dàn Ý**. Kiểm tra dàn ý ở khung văn bản, sau đó nhấn **Chốt Dàn Ý & Bóc Tách Nhân Vật**.
    *   **Bước 2 (Nhân Vật)**: Xem kết quả trích xuất hồ sơ nhân vật tĩnh của AI được khóa cứng vào bối cảnh. Nhấn **Bắt Đầu Viết Kịch Bản**.
    *   **Bước 3 (Kịch Bản)**: Theo dõi AI stream kịch bản kịch tính ở màn hình soạn thảo. Bạn có thể tự do chỉnh sửa văn bản này trực tiếp. Sau đó nhấn **Chấp Nhận Kịch Bản Này**.
    *   **Bước 4 (Ghi Sổ)**: Nhấn **Nén Ký Ức Cốt Truyện & Chuyển Chương Tiếp Theo**. AI sẽ tự động đọc lại kịch bản, cập nhật các biến cố, vết thương, đồ vật của Tiêu Hàn vào cột Trí Nhớ Vĩ Mô bên trái, tăng số chương và đưa bạn quay lại Bước 1 để viết chương tiếp theo với context mới.
4.  **Tạo Lại Kịch Bản Mới**: Bấm nút **`🔄 Dự Án Mới`** trên Header, xác nhận cảnh báo để dọn dẹp toàn bộ dữ liệu lưu trữ kiên trì cũ và khởi động lại từ Chương 1.

---

# PHẦN 3: CHECKLIST TIẾN ĐỘ TOÀN DIỆN (COMPREHENSIVE CHECKLIST)
*Ghi nhận tất cả các cột mốc tính năng đã hoàn thành từ đầu cuộc hội thoại đến nay.*

- `[x]` **GIAI ĐOẠN 1: THIẾT LẬP NỀN TẢNG STATE ENGINE & WORKFLOW**
  - `[x]` Khởi tạo State JSON Việt hóa namespace (`con_tro`, `dan_y_tong_the`, `danh_sach_nhan_vat`, `danh_muc_chuong`)
  - `[x]` Tích hợp bộ đếm từ thời gian thực đạt chuẩn Cổng Từ (Word-Gate: 3,910 - 4,590 từ)
  - `[x]` Triển khai bộ phân tích dệt ấn ký (Stamp-Weaving) dò tìm vật phẩm chữ ký trong văn bản
  - `[x]` Tích hợp vòng lặp phản hồi cơ thể (Somatic Feedback Loop): Fatigue, Toxin, Trophic Level 8 tầng
  - `[x]` Xây dựng công cụ gợi ý Zero-Legacy Template Engine sinh ý tưởng bối cảnh ngẫu nhiên không trùng tên cũ

- `[x]` **GIAI ĐOẠN 2: CHUYÊN BIỆT HÓA PROMPT CHAINING BACKEND (API)**
  - `[x]` Triển khai API Route Handler sử dụng Vercel AI SDK và mô hình Gemini-1.5-Flash
  - `[x]` Thiết kế prompt `GENERATE_OUTLINE` sinh dàn ý 3 hồi kịch tính chặt chẽ
  - `[x]` Thiết kế prompt `EXTRACT_CHARACTERS` trích xuất thuộc tính cơ thể khuyết tật
  - `[x]` Thiết kế prompt `WRITE_SCRIPT` viết kịch bản tả sâu đa giác quan áp luật mạt thế cứng

- `[x]` **GIAI ĐOẠN 3: GỠ LỖI WORKSPACE & TÍCH HỢP MOCK MODE**
  - `[x]` Khắc phục lỗi im lặng (silent guardrail) bằng hệ thống thông báo lỗi đỏ nội dòng `promptError` trực quan
  - `[x]` Triển khai nút check "Giả lập Ngoại tuyến (Offline Mock)" đồng bộ 100% với `store.useMock`
  - `[x]` Bổ sung huy hiệu phát sáng `📶 MOCK MODE ACTIVE` trên Header để tác giả nhận diện trạng thái giả lập

- `[x]` **GIAI ĐOẠN 4: THIẾT LẬP KIẾN TRÚC MACRO-LOGIC PIPELINE MỚI**
  - `[x]` Tạo mới Zustand Store bằng TypeScript (`useNovelStore.ts`) hỗ trợ Persist & Manual Hydration
  - `[x]` Triển khai API Route Handler cuốn chiếu 4-Node, bao gồm Node `COMMIT_MEMORY` nén ký ức chống quên
  - `[x]` Thiết kế giao diện UI Split-View Workflow (`page.tsx`) ghim cột Trí nhớ cốt truyện bên trái
  - `[x]` Thiết kế trang Root Page Redirect (`page.js`) tự động chuyển hướng người dùng sang `/workspace` kèm Loader
  - `[x]` Triển khai nút Reset dự án mới (`store.reset()`) xóa bỏ kiên trì cũ trên trình duyệt
  - `[x]` Xóa bỏ hoàn toàn tệp tin store cũ `useNovelStore.js` để tránh trùng lặp export

- `[x]` **GIAI ĐOẠN 5: BIÊN DỊCH & KIỂM THỬ SẢN XUẤT**
  - `[x]` Sửa lỗi cú pháp bị cắt cụt ở nhánh `EXTRACT_CHARACTERS` khôi phục biên dịch thành công
  - `[x]` Chạy thành công lệnh biên dịch Next.js Production Build (`npm run build`) với **0 lỗi và 0 cảnh báo**
  - `[x]` Stage, commit và push thành công toàn bộ mã nguồn lên repository GitHub của bạn
