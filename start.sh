#!/bin/bash

echo "=========================================="
echo "      剧本转视频系统 - 启动脚本"
echo "=========================================="
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

echo "[1/4] 安装后端依赖..."
cd backend || exit 1
pip3 install -r requirements.txt || {
    echo "[错误] 后端依赖安装失败"
    exit 1
}

echo ""
echo "[2/4] 启动后端服务..."
python3 main.py &
BACKEND_PID=$!

echo ""
echo "[3/4] 安装前端依赖..."
cd ../frontend || exit 1
npm install || {
    echo "[错误] 前端依赖安装失败"
    kill $BACKEND_PID
    exit 1
}

echo ""
echo "[4/4] 启动前端服务..."
npm start &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "  服务启动完成！"
echo "  后端: http://localhost:8000"
echo "  前端: http://localhost:3000"
echo "=========================================="
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
