# Script to Video - Web Deployment

## 🌐 在线部署版本

本项目已配置为可部署到云端，支持随时随地访问。

## 📁 项目结构

```
script-to-video/
├── frontend/          # React 前端 → 部署到 Vercel
│   ├── src/
│   ├── package.json
│   └── vercel.json   # Vercel 配置
├── backend/           # FastAPI 后端 → 部署到 Render
│   ├── main.py
│   ├── requirements.txt
│   └── render.yaml   # Render 配置
└── docs/             # 文档
```

## 🚀 快速部署指南

### 第 1 步：Fork 本仓库

1. 访问 https://github.com/your-username/script-to-video
2. 点击右上角的 **Fork** 按钮
3. 等待 Fork 完成

### 第 2 步：部署前端（Vercel）

1. 访问 https://vercel.com
2. 点击 **Sign Up**，选择 **Continue with GitHub**
3. 点击 **Add New Project**
4. 选择你 Fork 的 `script-to-video` 仓库
5. 配置：
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. 点击 **Environment Variables**，添加：
   - `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`（稍后填写）
7. 点击 **Deploy**

部署完成后，你会获得一个域名，如：`https://script-to-video.vercel.app`

### 第 3 步：部署后端（Render）

1. 访问 https://render.com
2. 点击 **Get Started for Free**，选择 **Continue with GitHub**
3. 点击 **New Web Service**
4. 选择你 Fork 的 `script-to-video` 仓库
5. 配置：
   - **Name**: `script-to-video-api`
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. 点击 **Advanced**，添加环境变量：
   - `MOONSHOT_API_KEY` = 你的 Kimi API Key
   - `OPENAI_API_KEY` = 你的 OpenAI API Key（可选）
   - `KLING_API_KEY` = 你的可灵 API Key（可选）
7. 点击 **Create Web Service**

部署完成后，你会获得一个域名，如：`https://script-to-video-api.onrender.com`

### 第 4 步：更新前端配置

1. 回到 Vercel，进入你的项目
2. 点击 **Settings** → **Environment Variables**
3. 更新 `REACT_APP_API_URL` 为你的 Render 域名
4. 点击 **Redeploy**

### 第 5 步：完成！

访问你的 Vercel 域名，即可使用在线版剧本转视频系统！

## 🔧 配置 API Key

部署完成后，你需要在 Render 后台配置 API Key：

1. 登录 https://dashboard.render.com
2. 选择你的服务 `script-to-video-api`
3. 点击 **Environment**
4. 添加以下环境变量：

| 变量名 | 说明 | 获取地址 |
|--------|------|----------|
| `MOONSHOT_API_KEY` | Kimi API Key | https://platform.moonshot.cn/ |
| `OPENAI_API_KEY` | OpenAI API Key | https://platform.openai.com/ |
| `KLING_API_KEY` | 可灵 API Key | https://klingai.com/ |

## 📚 技术栈

- **前端**: React + Material-UI + 毛玻璃 UI
- **后端**: FastAPI + Python
- **部署**: Vercel + Render
- **CI/CD**: GitHub + Vercel/Render 自动部署

## 🆓 免费额度

| 平台 | 免费额度 |
|------|----------|
| Vercel | 无限次部署，100GB 带宽/月 |
| Render | 750 小时/月，自动休眠 |

## 📝 注意事项

1. **免费版限制**：Render 免费版会在 15 分钟无访问后休眠，首次访问可能需要等待 30 秒唤醒
2. **API Key 安全**：不要在代码中硬编码 API Key，使用环境变量
3. **文件存储**：免费版不支持永久文件存储，生成的图片和视频建议及时下载

## 🔗 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Render 文档](https://render.com/docs)
- [项目文档](./docs/)

## 💡 需要帮助？

遇到问题？查看 [常见问题](./docs/FAQ.md) 或提交 Issue。
