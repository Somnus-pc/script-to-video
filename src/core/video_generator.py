"""
视频生成器
支持多种免费和付费视频生成模型
"""

import os
import yaml
import requests
import time
from typing import Optional, Dict, Any, List
from pathlib import Path


class VideoGenerator:
    """视频生成器"""
    
    def __init__(self, config_path: str = "config/api_config.yaml"):
        self.config = self._load_config(config_path)
        self.output_dir = Path("output/videos")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def _load_config(self, path: str) -> Dict:
        """加载配置文件"""
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}
    
    def _save_video(self, video_data: bytes, filename: str) -> str:
        """保存视频"""
        filepath = self.output_dir / filename
        with open(filepath, 'wb') as f:
            f.write(video_data)
        return str(filepath)
    
    # ==================== 可灵 (Kling) ====================
    
    def generate_kling(self, image_path: str, prompt: str = "", 
                       duration: int = 5, **kwargs) -> str:
        """
        使用可灵生成视频
        
        Args:
            image_path: 输入图片路径
            prompt: 运动描述提示词
            duration: 视频时长（秒）
            
        Returns:
            保存的视频路径
        """
        config = self.config.get('video_models', {}).get('kling', {})
        api_key = config.get('api_key', os.getenv('KLING_API_KEY', ''))
        
        if not api_key:
            raise ValueError("可灵 API Key 未配置")
        
        # 读取图片并转为 base64
        with open(image_path, 'rb') as f:
            image_base64 = f.read().decode('latin1')  # 或使用 base64
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "kling-v1",
            "input": {
                "image": image_base64,
                "prompt": prompt
            },
            "parameters": {
                "duration": duration
            }
        }
        
        response = requests.post(
            f"{config.get('base_url', 'https://api.klingai.com')}/v1/videos/image2video",
            headers=headers,
            json=data,
            timeout=120
        )
        
        response.raise_for_status()
        result = response.json()
        
        # 等待任务完成
        task_id = result['data']['task_id']
        video_url = self._wait_for_kling_task(task_id, api_key, config.get('base_url'))
        
        # 下载视频
        video_response = requests.get(video_url, timeout=120)
        video_response.raise_for_status()
        
        filename = f"kling_{int(time.time())}.mp4"
        return self._save_video(video_response.content, filename)
    
    def _wait_for_kling_task(self, task_id: str, api_key: str, base_url: str) -> str:
        """等待可灵任务完成"""
        headers = {"Authorization": f"Bearer {api_key}"}
        
        for _ in range(60):  # 最多等待 60 * 5 = 300 秒
            response = requests.get(
                f"{base_url}/v1/videos/{task_id}",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            
            if result['data']['status'] == 'succeeded':
                return result['data']['video_url']
            elif result['data']['status'] == 'failed':
                raise Exception(f"任务失败: {result}")
            
            time.sleep(5)
        
        raise TimeoutError("等待任务完成超时")
    
    # ==================== Runway ====================
    
    def generate_runway(self, image_path: str, prompt: str = "",
                        duration: int = 4, **kwargs) -> str:
        """
        使用 Runway Gen-2/Gen-3 生成视频
        
        Args:
            image_path: 输入图片路径
            prompt: 运动描述
            duration: 视频时长（秒）
            
        Returns:
            保存的视频路径
        """
        config = self.config.get('video_models', {}).get('runway', {})
        api_key = config.get('api_key', os.getenv('RUNWAY_API_KEY', ''))
        
        if not api_key:
            raise ValueError("Runway API Key 未配置")
        
        # 上传图片
        image_url = self._upload_image_to_runway(image_path, api_key)
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "promptImage": image_url,
            "promptText": prompt,
            "duration": duration
        }
        
        response = requests.post(
            f"{config.get('base_url', 'https://api.runwayml.com')}/v1/generation/image-to-video",
            headers=headers,
            json=data,
            timeout=120
        )
        
        response.raise_for_status()
        result = response.json()
        
        # 等待任务完成
        task_id = result['id']
        video_url = self._wait_for_runway_task(task_id, api_key, config.get('base_url'))
        
        # 下载视频
        video_response = requests.get(video_url, timeout=120)
        video_response.raise_for_status()
        
        filename = f"runway_{int(time.time())}.mp4"
        return self._save_video(video_response.content, filename)
    
    def _upload_image_to_runway(self, image_path: str, api_key: str) -> str:
        """上传图片到 Runway"""
        # 这里需要实现图片上传逻辑
        # Runway 可能需要先上传到他们的存储或提供公开 URL
        # 简化处理：假设图片已经在可访问的 URL 上
        # 实际实现可能需要上传到 S3 或其他存储
        raise NotImplementedError("需要实现图片上传逻辑")
    
    def _wait_for_runway_task(self, task_id: str, api_key: str, base_url: str) -> str:
        """等待 Runway 任务完成"""
        headers = {"Authorization": f"Bearer {api_key}"}
        
        for _ in range(60):
            response = requests.get(
                f"{base_url}/v1/generation/{task_id}",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            
            if result['status'] == 'SUCCEEDED':
                return result['url']
            elif result['status'] == 'FAILED':
                raise Exception(f"任务失败: {result}")
            
            time.sleep(5)
        
        raise TimeoutError("等待任务完成超时")
    
    # ==================== Luma Dream Machine ====================
    
    def generate_luma(self, image_path: str, prompt: str = "",
                      duration: int = 5, **kwargs) -> str:
        """
        使用 Luma Dream Machine 生成视频
        
        Args:
            image_path: 输入图片路径
            prompt: 运动描述
            duration: 视频时长（秒）
            
        Returns:
            保存的视频路径
        """
        config = self.config.get('video_models', {}).get('luma', {})
        api_key = config.get('api_key', os.getenv('LUMA_API_KEY', ''))
        
        if not api_key:
            raise ValueError("Luma API Key 未配置")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # 先上传图片获取 URL
        image_url = self._upload_image_to_luma(image_path, api_key)
        
        data = {
            "image_url": image_url,
            "prompt": prompt
        }
        
        response = requests.post(
            f"{config.get('base_url', 'https://api.lumalabs.ai')}/dream-machine/v1/generations/image-to-video",
            headers=headers,
            json=data,
            timeout=120
        )
        
        response.raise_for_status()
        result = response.json()
        
        # 等待任务完成
        generation_id = result['id']
        video_url = self._wait_for_luma_task(generation_id, api_key, config.get('base_url'))
        
        # 下载视频
        video_response = requests.get(video_url, timeout=120)
        video_response.raise_for_status()
        
        filename = f"luma_{int(time.time())}.mp4"
        return self._save_video(video_response.content, filename)
    
    def _upload_image_to_luma(self, image_path: str, api_key: str) -> str:
        """上传图片到 Luma"""
        # 类似 Runway，需要实现上传逻辑
        raise NotImplementedError("需要实现图片上传逻辑")
    
    def _wait_for_luma_task(self, generation_id: str, api_key: str, base_url: str) -> str:
        """等待 Luma 任务完成"""
        headers = {"Authorization": f"Bearer {api_key}"}
        
        for _ in range(60):
            response = requests.get(
                f"{base_url}/dream-machine/v1/generations/{generation_id}",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            
            if result['state'] == 'completed':
                return result['assets']['video']
            elif result['state'] == 'failed':
                raise Exception(f"任务失败: {result}")
            
            time.sleep(5)
        
        raise TimeoutError("等待任务完成超时")
    
    # ==================== 通用接口 ====================
    
    def generate(self, image_path: str, prompt: str = "", 
                 model: Optional[str] = None, **kwargs) -> str:
        """
        通用生成接口
        
        Args:
            image_path: 输入图片路径
            prompt: 运动描述提示词
            model: 模型名称，None 则使用默认
            **kwargs: 其他参数
            
        Returns:
            保存的视频路径
        """
        if model is None:
            model = self.config.get('defaults', {}).get('video_model', 'kling')
        
        if model == 'kling':
            return self.generate_kling(image_path, prompt, **kwargs)
        elif model == 'runway':
            return self.generate_runway(image_path, prompt, **kwargs)
        elif model == 'luma':
            return self.generate_luma(image_path, prompt, **kwargs)
        else:
            raise ValueError(f"不支持的视频生成模型: {model}")
    
    def get_available_models(self) -> Dict[str, Dict[str, Any]]:
        """获取可用的模型列表"""
        models = {}
        
        video_config = self.config.get('video_models', {})
        
        if video_config.get('kling', {}).get('api_key'):
            models['kling'] = {
                'name': '可灵 (Kling)',
                'type': '免费/付费',
                'description': '快手可灵，支持图生视频',
                'enabled': True
            }
        
        if video_config.get('runway', {}).get('api_key'):
            models['runway'] = {
                'name': 'Runway Gen-2/Gen-3',
                'type': '付费',
                'description': '专业级 AI 视频生成',
                'enabled': True
            }
        
        if video_config.get('luma', {}).get('api_key'):
            models['luma'] = {
                'name': 'Luma Dream Machine',
                'type': '付费',
                'description': '高质量的 AI 视频生成',
                'enabled': True
            }
        
        return models
