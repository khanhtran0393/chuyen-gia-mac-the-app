@echo off
title AI Novel Generator Launcher
color 0b

echo ==========================================================
echo    TRINH KHOI CHAY TU DONG - AI NOVEL GENERATOR
echo ==========================================================
echo.

:: 1. Kiem tra thu muc node_modules
if not exist "node_modules\" (
    echo [1/3] Khong tim thay thu muc node_modules.
    echo       Dang tien hanh cai dat thu vien va khoi tao moi truong...
    echo.
    call npm install
) else (
    echo [1/3] Moi truong node_modules da duoc khoi tao san.
)

echo.

:: 2. Mo trinh duyet mac dinh va truy cap vao localhost:3000
echo [2/3] Dang tu dong mo Localhost:3000 tren trinh duyet mac dinh...
start http://localhost:3000

echo.

:: 3. Khoi chay Next.js Dev Server
echo [3/3] Dang khoi chay Next.js Development Server...
echo       (Giu cua so nay de duy tri ket noi server. Bam Ctrl + C de dung)
echo.
call npm run dev
