@echo off
title Book Trail - 阅读旅程
echo.
echo  ========================================
echo    📚 Book Trail - 启动中，请稍候...
echo  ========================================
echo.

cd /d "C:\Users\fucon\Cladue Code Projects\book-trail"

:: Start the dev server in background
start /B npm run dev

:: Wait a moment for server to start
timeout /t 3 /nobreak >nul

:: Open in default browser
start http://localhost:5174

echo  ✅ App 已启动！浏览器即将打开...
echo  ✅ App is running at http://localhost:5174
echo.
echo  关闭此窗口将停止 App。
echo  Close this window to stop the app.
echo.
pause
