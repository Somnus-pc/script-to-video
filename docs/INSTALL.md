# 安装配置指南

## 系统要求

- Python 3.8+
- Node.js 16+
- FFmpeg (用于视频合并)

## 安装步骤

### 1. 安装 Python 依赖

```bash
cd src/backend
pip install -r requirements.txt
```

### 2. 安装前端依赖

```bash
cd src/frontend
npm install
```

### 3. 安装 FFmpeg

**Windows:**
- 下载 FFmpeg: https://ffmpeg.org/download.html
- 解压并添加到系统 PATH

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### 4. 配置 API Key

1. 复制配置模板：
```bash
cp src/config/api_config.template.yaml src/config/api_config.yaml
```

2. 编辑 `src/config/api_config.yaml`，填入你的 API Key

## API Key 获取指南

### Moonshot (Kimi) - 文本分析
1. 访问 https://platform.moonshot.cn/
2. 注册账号
3. 创建 API Key
4. 复制到配置文件的 `text_models.moonshot.api_key`

### OpenAI (DALL-E 3) - 图像生成
1. 访问 https://platform.openai.com/
2. 注册账号并充值
3. 创建 API Key
4. 复制到配置文件的 `image_models.openai.api_key`

### 阿里云通义万相 - 图像生成
1. 访问 https://dashscope.aliyun.com/
2. 开通 DashScope 服务
3. 创建 API Key
4. 复制到配置文件的 `image_models.aliyun_wanxiang.api_key`

### 可灵 (Kling) - 视频生成
1. 访问 https://klingai.com/
2. 注册账号
3. 申请 API 权限
4. 获取 API Key 填入配置

### Runway - 视频生成
1. 访问 https://runwayml.com/
2. 注册账号
3. 在设置中创建 API Key
4. 复制到配置文件的 `video_models.runway.api_key`

### Luma - 视频生成
1. 访问 https://lumalabs.ai/
2. 注册账号
3. 获取 API Key
4. 复制到配置文件的 `video_models.luma.api_key`

## 启动服务

### 手动启动

**终端 1 - 启动后端：**
```bash
cd src/backend
python main.py
```

**终端 2 - 启动前端：**
```bash
cd src/frontend
npm start
```

### 使用启动脚本

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

## 验证安装

1. 打开浏览器访问 http://localhost:3000
2. 点击右上角的 "API 配置"
3. 配置至少一个文本分析模型的 API Key
4. 返回首页，输入一段测试剧本
5. 点击"开始分析"测试功能

## 常见问题

### 1. 后端启动失败
- 检查 Python 版本是否 3.8+
- 检查依赖是否安装完整：`pip install -r requirements.txt`
- 检查端口 8000 是否被占用

### 2. 前端启动失败
- 检查 Node.js 版本是否 16+
- 删除 `node_modules` 重新安装：`rm -rf node_modules && npm install`
- 检查端口 3000 是否被占用

### 3. API 调用失败
- 检查 API Key 是否正确配置
- 检查网络连接
- 查看后端日志获取详细错误信息

### 4. 视频合并失败
- 检查 FFmpeg 是否正确安装
- 检查 FFmpeg 是否在系统 PATH 中
- 在命令行运行 `ffmpeg -version` 验证

## 配置示例

完整的 `api_config.yaml` 示例：

```yaml
text_models:
  moonshot:
    api_key: "sk-your-moonshot-api-key"
    base_url: "https://api.moonshot.cn/v1"
    model: "moonshot-v1-128k"
  
  zhipu:
    api_key: "your-zhipu-api-key"
    base_url: "https://open.bigmodel.cn/api/paas/v4"
    model: "glm-4"

image_models:
  pollinations:
    enabled: true
  
  openai:
    api_key: "sk-your-openai-api-key"
    model: "dall-e-3"
  
  aliyun_wanxiang:
    api_key: "your-aliyun-api-key"
    base_url: "https://dashscope.aliyuncs.com/api/v1"

video_models:
  kling:
    api_key: "your-kling-api-key"
    base_url: "https://api.klingai.com"
  
  runway:
    api_key: "your-runway-api-key"
    base_url: "https://api.runwayml.com"
  
  luma:
    api_key: "your-luma-api-key"
    base_url: "https://api.lumalabs.ai"

defaults:
  text_model: "moonshot"
  image_model: "pollinations"
  video_model: "kling"
```

## 免费使用方案

如果暂时不想配置付费 API，可以使用免费方案：

1. **文本分析**: 配置 Moonshot (Kimi) - 有免费额度
2. **图像生成**: 使用 Pollinations.ai - 完全免费
3. **视频生成**: 需要配置付费 API，暂无免费替代方案

这样配置后，可以完整体验剧本分析、人物设计、分镜图生成等功能。
