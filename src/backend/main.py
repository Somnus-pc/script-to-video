"""
FastAPI 后端服务
提供剧本分析、图像生成、视频生成等 API
"""

import os
import sys
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 添加 core 到路径
core_path = str(Path(__file__).parent.parent / "core")
sys.path.insert(0, core_path)

from script_analyzer import ScriptAnalyzer, Character, Scene, ScriptSegment
from image_generator import ImageGenerator
from video_generator import VideoGenerator


app = FastAPI(title="剧本转视频 API", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化组件
script_analyzer = ScriptAnalyzer()
image_generator = ImageGenerator()
video_generator = VideoGenerator()

# 确保输出目录存在
Path("output/images").mkdir(parents=True, exist_ok=True)
Path("output/videos").mkdir(parents=True, exist_ok=True)
Path("uploads").mkdir(parents=True, exist_ok=True)


# ==================== 数据模型 ====================

class ScriptAnalysisRequest(BaseModel):
    script_text: str
    model: Optional[str] = None


class StoryboardPromptRequest(BaseModel):
    segment_content: str
    characters: List[Dict[str, str]]
    scene: Dict[str, str]
    emotion: str


class ModifyPromptRequest(BaseModel):
    original_prompt: str
    modification: str


class SaveConfigRequest(BaseModel):
    config: Dict[str, Any]


class GenerateImageRequest(BaseModel):
    prompt: str
    model: Optional[str] = None


class GenerateVideoRequest(BaseModel):
    image_path: str
    prompt: str
    model: Optional[str] = None


class CharacterViewsRequest(BaseModel):
    prompt: str
    model: Optional[str] = None


# ==================== API 路由 ====================

@app.get("/")
async def root():
    return {"message": "剧本转视频 API 服务运行中"}


@app.get("/api/models")
async def get_available_models():
    """获取所有可用的 AI 模型"""
    return {
        "text_models": ["moonshot", "zhipu"],
        "image_models": image_generator.get_available_models(),
        "video_models": video_generator.get_available_models()
    }


@app.post("/api/save-config")
async def save_config(request: SaveConfigRequest):
    """保存 API 配置"""
    try:
        config_path = Path(__file__).parent.parent / "config" / "api_config.yaml"
        config_path.parent.mkdir(parents=True, exist_ok=True)
        
        import yaml
        with open(config_path, 'w', encoding='utf-8') as f:
            yaml.dump(request.config, f, allow_unicode=True, default_flow_style=False)
        
        # 重新加载配置
        global script_analyzer, image_generator, video_generator
        script_analyzer = ScriptAnalyzer()
        image_generator = ImageGenerator()
        video_generator = VideoGenerator()
        
        return {"message": "配置保存成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----- 剧本分析 -----

@app.post("/api/analyze-script")
async def analyze_script(request: ScriptAnalysisRequest):
    """分析剧本"""
    try:
        if request.model:
            script_analyzer.current_model = request.model
        
        result = script_analyzer.analyze_script(request.script_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-character-prompt")
async def generate_character_prompt(character: Dict[str, Any]):
    """生成人物三视图提示词"""
    try:
        char_obj = Character(**character)
        prompt = script_analyzer.generate_character_prompt(char_obj)
        return {"prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-scene-prompt")
async def generate_scene_prompt(scene: Dict[str, Any]):
    """生成场景提示词"""
    try:
        scene_obj = Scene(**scene)
        prompt = script_analyzer.generate_scene_prompt(scene_obj)
        return {"prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-storyboard-prompt")
async def generate_storyboard_prompt(request: StoryboardPromptRequest):
    """生成分镜提示词"""
    try:
        characters = [Character(**c) for c in request.characters]
        scene = Scene(**request.scene)
        segment = ScriptSegment(
            index=0,
            content=request.segment_content,
            characters=[c.name for c in characters],
            scene=scene.name,
            emotion=request.emotion
        )
        
        prompt = script_analyzer.generate_storyboard_prompt(segment, characters, [scene])
        return {"prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/modify-storyboard-prompt")
async def modify_storyboard_prompt(request: ModifyPromptRequest):
    """修改分镜提示词"""
    try:
        new_prompt = script_analyzer.modify_storyboard_prompt(
            request.original_prompt, 
            request.modification
        )
        return {"prompt": new_prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----- 图像生成 -----

@app.post("/api/generate-image")
async def generate_image(request: GenerateImageRequest):
    """生成单张图片"""
    try:
        image_path = image_generator.generate(request.prompt, request.model)
        return {"image_path": image_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-character-views")
async def generate_character_views(request: CharacterViewsRequest):
    """生成人物三视图"""
    try:
        views = image_generator.generate_character_views(request.prompt, request.model)
        return {"views": views}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """获取生成的图片"""
    image_path = Path("output/images") / filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    return FileResponse(image_path)


# ----- 视频生成 -----

@app.post("/api/generate-video")
async def generate_video(request: GenerateVideoRequest):
    """生成视频"""
    try:
        video_path = video_generator.generate(
            request.image_path, 
            request.prompt, 
            request.model
        )
        return {"video_path": video_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/videos/{filename}")
async def get_video(filename: str):
    """获取生成的视频"""
    video_path = Path("output/videos") / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="视频不存在")
    return FileResponse(video_path)


# ----- 文件上传 -----

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传文件"""
    try:
        # 保存上传的文件
        file_path = Path("uploads") / file.filename
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        # 读取文本内容
        content = ""
        if file.filename.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        elif file.filename.endswith('.docx'):
            # 需要安装 python-docx
            try:
                from docx import Document
                doc = Document(file_path)
                content = '\n'.join([para.text for para in doc.paragraphs])
            except ImportError:
                raise HTTPException(status_code=500, detail="未安装 python-docx，无法读取 .docx 文件")
        
        return {
            "filename": file.filename,
            "file_path": str(file_path),
            "content": content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----- 视频合并 -----

@app.post("/api/merge-videos")
async def merge_videos(video_paths: List[str], output_filename: Optional[str] = None):
    """合并多个视频"""
    try:
        import ffmpeg
        
        if not output_filename:
            output_filename = f"merged_{int(time.time())}.mp4"
        
        output_path = Path("output/videos") / output_filename
        
        # 创建输入文件列表
        list_file = Path("output/videos") / "input_list.txt"
        with open(list_file, 'w') as f:
            for video_path in video_paths:
                f.write(f"file '{video_path}'\n")
        
        # 使用 ffmpeg 合并
        (
            ffmpeg
            .input(str(list_file), format='concat', safe=0)
            .output(str(output_path), c='copy')
            .run(overwrite_output=True)
        )
        
        # 删除临时列表文件
        list_file.unlink()
        
        return {"output_path": str(output_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 主程序 ====================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
