# AI Novel & Script Generator - Trình Sinh Kịch Bản Tiểu Thuyết Mạt Thế

Chào mừng bạn đến với **AI Novel & Script Generator**, một không gian làm việc (Workspace) chuyên nghiệp, cao cấp dành riêng cho biên kịch và tác giả sáng tác truyện thể loại sinh tồn, mạt thế. 

Ứng dụng được xây dựng trên nền tảng **Next.js + Tailwind CSS (v4) + Zustand** kết hợp với **Vercel AI SDK** và mô hình **Google Gemini (gemini-1.5-flash)** để xử lý sinh dữ liệu trực tiếp theo dạng luồng (real-time stream).

---

## ✨ Điểm Nổi Bật Của Hệ Thống

### 1. Kiến Trúc Sổ Nợ Sinh Lý (`STATE_JSON`)
Hệ thống không chỉ sinh chữ đơn thuần mà liên tục theo dõi tình trạng sinh tồn thực tế của nhân vật chính (Main) thông qua một khối dữ liệu trạng thái đồng bộ giữa Frontend và Backend:
*   **💧 Hậu cần**: Theo dõi nước sạch (lít), lương thực (kcal).
*   **🩸 Vết thương thực thể**: Ghi chép chi tiết các vết thương sâu và mức độ hạn chế vận động của main.
*   **🚨 Leo thang sinh thái**: Đồng hồ đo mức độ nguy hiểm (`escalation_meter` / 100) và phân cấp tầng bậc nguy cơ (`Lv1` đến `Lv4`).

### 2. Thiết Kế Dark Mode Giao Diện Premium
*   Nền tối sâu thẳm kết hợp kính mờ (Glassmorphism), viền sáng mượt mà với dải chuyển màu sắc sảo (Amber/Orange cho Chủ đề, Blue cho Phong cách).
*   Tương tác mượt mà giữa 2 giai đoạn:
    *   **Phase 1 (Setup)**: Thiết lập bối cảnh, mô tả cốt truyện và quy mô chương.
    *   **Phase 2 (Workspace)**: Bàn làm việc chia cột tỉ lệ vàng 3:7 chuyên nghiệp.
*   Hiệu ứng chữ chạy (Streaming effect) kèm con trỏ nhấp nháy `▋` mô phỏng đầu ra AI chân thực.

### 3. Tối Ưu Hóa Trình Đóng Gói (Production Ready)
*   Sử dụng phông chữ cao cấp **Outfit**, **Inter** và **JetBrains Mono** tải động từ Google Fonts.
*   Cơ chế import tương đối (`../../store/state-json`) loại bỏ hoàn toàn các lỗi xung đột biên dịch đường dẫn alias trên các môi trường đám mây (Turbopack, Vercel).

---

## 🚀 Hướng Dẫn Bắt Đầu Nhanh

### Cách 1: Sử dụng Trình Khởi Chạy Tự Động (Khuyên Dùng)
Nếu bạn đang dùng hệ điều hành Windows, chỉ cần nhấp đúp vào tệp:
👉 **`run.bat`** tại thư mục gốc của dự án. 

Tệp này sẽ tự động:
1.  Quét và cài đặt các thư viện mới (`npm install`) nếu máy bạn chưa được setup.
2.  Mở trình duyệt mặc định truy cập vào trang quản lý: [http://localhost:3000](http://localhost:3000).
3.  Kích hoạt máy chủ thử nghiệm (`npm run dev`).

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

Để AI có thể sinh chữ và chạy luồng dữ liệu, bạn cần cung cấp API Key của Google Gemini.

1.  Tạo một tệp tin tên là `.env.local` tại thư mục gốc của dự án.
2.  Thêm cấu hình khóa API của bạn vào tệp:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Bạn có thể lấy khóa miễn phí tại cổng [Google AI Studio](https://aistudio.google.com/))*

---

## 📁 Cấu Trúc Các Tệp Tin Chính

*   `src/store/state-json.ts`: Quản lý trạng thái Zustand lưu trữ thông số sinh lý và tài nguyên nhân vật.
*   `src/app/api/generate/route.ts`: API Route Handler sử dụng Vercel AI SDK để bắt luồng stream từ mô hình `gemini-1.5-flash` và áp luật mạt thế.
*   `src/app/workspace/page.tsx`: Giao diện chính của bảng điều khiển Workspace chia 2 cột.
*   `src/app/page.js`: Tệp điều hướng tự động chuyển từ `/` sang `/workspace`.
*   `src/app/globals.css`: Thiết lập biến màu sắc, phông chữ, thanh cuộn và hiệu ứng con trỏ nhấp nháy.
*   `run.bat`: Trình kích hoạt tự động chạy dự án chỉ với một chạm.

---

## ☁️ Hướng Dẫn Triển Khai Lên Vercel

Dự án Next.js này đã được tối ưu hóa tối đa để triển khai lên cloud của Vercel:

1.  Đẩy toàn bộ mã nguồn của bạn lên kho lưu trữ **GitHub**.
2.  Truy cập vào trang chủ **[Vercel](https://vercel.com/)** và liên kết với tài khoản GitHub của bạn.
3.  Nhập dự án `chuyen-gia-mac-the-app` vào Vercel.
4.  Tại bảng cấu hình dự án, mở phần **Environment Variables** và thêm khóa API:
    *   **Name**: `GEMINI_API_KEY`
    *   **Value**: *Khóa API Gemini của bạn*
5.  Bấm nút **Deploy** và tận hưởng kịch bản mạt thế trực tuyến của riêng bạn!
