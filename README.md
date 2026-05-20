# AI Novel & Script Generator - Trình Sinh Kịch Bản Tiểu Thuyết Mạt Thế

Chào mừng bạn đến với **AI Novel & Script Generator**, một không gian làm việc (Workspace) chuyên nghiệp, cao cấp dành riêng cho biên kịch và tác giả sáng tác truyện mạt thế, sinh tồn.

Ứng dụng được xây dựng trên nền tảng **Next.js (React) + Tailwind CSS (v4) + Zustand** kết hợp với **Google Gemini (gemini-1.5-flash)** để xử lý sinh dữ liệu kịch bản chất lượng cao.

---

## ✨ Điểm Nổi Bật Của Hệ Thống Mới

### 1. Kiến Trúc 2 Giai Đoạn (2-Phase Architecture)
*   **Giai đoạn 1 (Setup Form)**: Cung cấp giao diện trực quan thiết lập Chủ đề (Theme - Xuyên Không, Trùng Sinh, Võ Hiệp, Sinh Tồn...), Phong cách (Style - Tu Tiên, Huyền Huyễn, Mạt Thế...) cùng trình nhập bối cảnh cốt truyện và lựa chọn quy mô chương (Input cộng trừ số chương linh hoạt).
*   **Giai đoạn 2 (Workspace)**: Màn hình chia tỉ lệ vàng 3:7 chuyên nghiệp:
    *   *Sidebar trái*: Trực quan theo dõi Tên tác phẩm, Grid các nút chương, thẻ cấu hình read-only và bóc tách hồ sơ nhân vật động.
    *   *Content Panel phải*: Phân chia Tab Dàn ý / Chi tiết chương, hỗ trợ nút export tệp `.txt` tiện dụng và điều hướng chương nhanh bằng cụm Pagination.

### 2. Zero-Legacy Template Engine
*   Tích hợp trình tự động sinh ý tưởng bối cảnh ngẫu nhiên chất lượng cao ngay tại Phase 1. 
*   *Quy tắc cứng*: Tuyệt đối không sử dụng tên cũ (như Lâm Khuyết, Quảng Nam, Đinh Hương), tự động sinh ra Tên Hán Việt độc đáo mới, các khuyết tật cơ thể sinh học cụ thể của nhân vật chính và không gian hoang phế ngẫu nhiên kịch tính.

### 3. Zustand Persist & Hydration Safe
*   Tự động lưu trữ kiên trì trạng thái kịch bản và tiến trình của bạn trực tiếp vào `localStorage` của trình duyệt. 
*   Kích hoạt manual hydration an toàn giúp ứng dụng không bao giờ bị lỗi hydration mismatch Next.js SSR.

---

## 🚀 Hướng Dẫn Bắt Đầu Nhanh

### Cách 1: Sử dụng Trình Khởi Chạy Tự Động (Khuyên Dùng)
Nếu bạn đang dùng hệ điều hành Windows, chỉ cần nhấp đúp vào tệp:
👉 **`run.bat`** tại thư mục gốc của dự án. 

Tệp này sẽ tự động:
1.  Quét và cài đặt các thư viện mới (`npm install`) nếu máy bạn chưa được setup.
2.  Mở trình duyệt mặc định truy cập vào trang quản lý: [http://localhost:3000](http://localhost:3000).
3.  Kích hoạt máy chủ thử nghiệm Next.js.

### Cách 2: Khởi Chạy Bằng Dòng Lệnh Thủ Công
Mở terminal tại thư mục dự án và chạy các lệnh sau:

```bash
# 1. Cài đặt các thư viện
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

Sau đó, truy cập vào đường dẫn [http://localhost:3000](http://localhost:3000).

---

## 🔑 Cấu Hình Biến Môi Trường (API Key)

Để AI có thể sinh chữ và chạy luồng dữ liệu, bạn có hai phương án:
1.  **Nhập trực tiếp**: Nhập khóa API của bạn vào ô password ở góc trên bên phải Header của ứng dụng (dữ liệu sẽ được lưu kiên trì an toàn trên trình duyệt của bạn).
2.  **Cấu hình Server**: Tạo tệp `.env.local` tại thư mục gốc của dự án và thêm cấu hình:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

---

## 📁 Cấu Trúc Các Tệp Tin Chính

*   `src/store/useNovelStore.ts`: Quản lý trạng thái Zustand lưu trữ thông số cài đặt, danh sách chương, dàn ý, nhân vật kiên trì.
*   `src/app/api/generate/route.ts`: API Route Handler kết nối với mô hình `gemini-1.5-flash` xử lý sinh dàn ý và viết chi tiết chương.
*   `src/app/workspace/page.tsx`: Giao diện chính của bảng điều khiển Workspace 2 giai đoạn.
*   `src/app/page.tsx`: Tệp điều hướng tự động chuyển từ `/` sang `/workspace` kèm Loader sci-fi.
*   `src/app/globals.css`: Thiết lập biến màu sắc hệ thống tối sâu, custom scrollbar mỏng và hiệu ứng con trỏ nhấp nháy.
*   `run.bat`: Trình kích hoạt tự động chạy dự án chỉ với một chạm.
*   `task.md`: Bản ghi tiến độ hoàn thành dọn sạch và tái thiết lập dự án từ đầu.
