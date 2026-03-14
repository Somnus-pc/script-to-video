@echo off
echo ==========================================
echo      剧本转视频系统 - 启动脚本
echo ==========================================
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 16+
    pause
    exit /b 1
)

echo [1/4] 安装后端依赖...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/4] 启动后端服务...
start "后端服务" cmd /k "python main.py"

echo.
echo [3/4] 安装前端依赖...
cd ..\frontend
npm install
if errorlevel 1 (
    echo [错误] 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo [4/4] 启动前端服务...
start "前端服务" cmd /k "npm start"

echo.
echo ==========================================
echo  服务启动完成！
echo  后端: http://localhost:8000
echo  前端: http://localhost:3000
echo ==========================================
echo.
pause
