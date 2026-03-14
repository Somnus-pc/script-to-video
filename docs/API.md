# API 文档

## 基础信息

- 基础 URL: `http://localhost:8000`
- 文档地址: `http://localhost:8000/docs` (Swagger UI)

## 端点列表

### 1. 获取可用模型

**GET** `/api/models`

返回所有可用的 AI 模型列表。

**响应示例：**
```json
{
  "text_models": ["moonshot", "zhipu"],
  "image_models": {
    "pollinations": {
      "name": "Pollinations.ai",
      "type": "免费",
      "description": "完全免费的图像生成服务",
      "enabled": true
    }
  },
  "video_models": {}
}
```

### 2. 保存配置

**POST** `/api/save-config`

保存 API 配置。

**请求体：**
```json
{
  "config": {
    "text_models": { ... },
    "image_models": { ... },
    "video_models": { ... },
    "defaults": { ... }
  }
}
```

### 3. 分析剧本

**POST** `/api/analyze-script`

分析剧本文本，提取人物、场景、分段。

**请求体：**
```json
{
  "script_text": "剧本内容...",
  "model": "moonshot"
}
```

**响应示例：**
```json
{
  "characters": [
    {
      "name": "林小雨",
      "description": "25岁白领",
      "personality": "温柔内敛",
      "appearance": "长发，穿风衣",
      "age": "25",
      "gender": "女"
    }
  ],
  "scenes": [
    {
      "name": "城市街道",
      "description": "雨夜街头",
      "location": "城市街道",
      "time": "夜晚",
      "atmosphere": "浪漫忧伤"
    }
  ],
  "segments": [
    {
      "index": 0,
      "content": "林小雨独自撑伞...",
      "characters": ["林小雨"],
      "scene": "城市街道",
      "emotion": "落寞"
    }
  ]
}
```

### 4. 生成人物提示词

**POST** `/api/generate-character-prompt`

为人物生成三视图提示词。

**请求体：**
```json
{
  "name": "林小雨",
  "description": "25岁白领",
  "personality": "温柔内敛",
  "appearance": "长发，穿风衣",
  "age": "25",
  "gender": "女"
}
```

**响应：**
```json
{
  "prompt": "正面：...\n侧面：...\n背面：..."
}
```

### 5. 生成场景提示词

**POST** `/api/generate-scene-prompt`

为场景生成概念图提示词。

**请求体：**
```json
{
  "name": "城市街道",
  "description": "雨夜街头",
  "location": "城市街道",
  "time": "夜晚",
  "atmosphere": "浪漫忧伤"
}
```

### 6. 生成分镜提示词

**POST** `/api/generate-storyboard-prompt`

为剧本分段生成分镜提示词。

**请求体：**
```json
{
  "segment_content": "林小雨独自撑伞...",
  "characters": [...],
  "scene": {...},
  "emotion": "落寞"
}
```

### 7. 修改分镜提示词

**POST** `/api/modify-storyboard-prompt`

根据用户要求修改分镜提示词。

**请求体：**
```json
{
  "original_prompt": "原提示词...",
  "modification": "让镜头更远一些"
}
```

**响应：**
```json
{
  "prompt": "修改后的提示词..."
}
```

### 8. 生成图片

**POST** `/api/generate-image`

生成单张图片。

**请求体：**
```json
{
  "prompt": "英文提示词...",
  "model": "pollinations"
}
```

**响应：**
```json
{
  "image_path": "output/images/pollinations_1234567890.png"
}
```

### 9. 生成人物三视图

**POST** `/api/generate-character-views`

生成人物三视图（正面、侧面、背面）。

**请求体：**
```json
{
  "prompt": "包含三视图描述的提示词...",
  "model": "pollinations"
}
```

**响应：**
```json
{
  "views": {
    "front": "output/images/...",
    "side": "output/images/...",
    "back": "output/images/..."
  }
}
```

### 10. 获取图片

**GET** `/api/images/{filename}`

获取生成的图片文件。

### 11. 生成视频

**POST** `/api/generate-video`

根据图片生成视频。

**请求体：**
```json
{
  "image_path": "output/images/...",
  "prompt": "运动描述...",
  "model": "kling"
}
```

**响应：**
```json
{
  "video_path": "output/videos/kling_1234567890.mp4"
}
```

### 12. 获取视频

**GET** `/api/videos/{filename}`

获取生成的视频文件。

### 13. 合并视频

**POST** `/api/merge-videos`

合并多个视频为一个。

**请求体：**
```json
{
  "video_paths": [
    "output/videos/video1.mp4",
    "output/videos/video2.mp4"
  ],
  "output_filename": "merged_video.mp4"
}
```

### 14. 上传文件

**POST** `/api/upload`

上传剧本文件（.txt 或 .docx）。

**请求：**
- Content-Type: `multipart/form-data`
- 字段名: `file`

**响应：**
```json
{
  "filename": "script.txt",
  "file_path": "uploads/script.txt",
  "content": "文件内容..."
}
```

## 错误处理

所有错误响应格式：

```json
{
  "detail": "错误信息"
}
```

常见 HTTP 状态码：
- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 限流说明

- 图像生成：取决于所选模型的限制
- 视频生成：耗时较长，建议串行处理
- 文本分析：一般无严格限制

## 开发建议

1. **异步处理**：视频生成建议使用异步任务
2. **错误重试**：网络错误时可适当重试
3. **缓存结果**：相同提示词的结果可以缓存
4. **进度显示**：长耗时操作显示进度条
