import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "AI Novel & Script Generator - Trình Sinh Kịch Bản Tiểu Thuyết AI",
  description: "Trình tạo kịch bản tiểu thuyết tối giản cao cấp (Premium Dark Mode) với hiệu ứng streaming real-time, phác thảo cốt truyện, nhân vật và phân đoạn bằng trí tuệ nhân tạo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
