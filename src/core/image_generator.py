"""
图像生成器
支持多种免费和付费图像生成模型
"""

import os
import yaml
import requests
import base64
from typing import Optional, Dict, Any, List
from pathlib import Path
import time
import urllib.parse


class ImageGenerator:
    """图像生成器"""
    
    def __init__(self, config_path: str = "config/api_config.yaml"):
        self.config = self._load_config(config_path)
        self.output_dir = Path("output/images")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def _load_config(self, path: str) -> Dict:
        """加载配置文件"""
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}
    
    def _save_image(self, image_data: bytes, filename: str) -> str:
        """保存图片"""
        filepath = self.output_dir / filename
        with open(filepath, 'wb') as f:
            f.write(image_data)
        return str(filepath)
    
    # ==================== 免费模型 ====================
    
    def generate_pollinations(self, prompt: str, width: int = 1024, 
                              height: int = 1024, seed: Optional[int] = None) -> str:
        """
        使用 Pollinations.ai 生成图片（免费）
        
        Args:
            prompt: 英文提示词
            width: 图片宽度
            height: 图片高度
            seed: 随机种子
            
        Returns:
            保存的图片路径
        """
        # URL 编码提示词
        encoded_prompt = urllib.parse.quote(prompt)
        
        # 构建 URL
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true"
        if seed:
            url += f"&seed={seed}"
        
        # 下载图片
        response = requests.get(url, timeout=120)
        response.raise_for_status()
        
        # 保存
        filename = f"pollinations_{int(time.time())}.png"
        return self._save_image(response.content, filename)
    
    # ==================== 付费模型 ====================
    
    def generate_openai(self, prompt: str, size: str = "1024x1024",
                        quality: str = "standard") -> str:
        """
        使用 DALL-E 3 生成图片
        
        Args:
            prompt: 英文提示词
            size: 图片尺寸 (1024x1024, 1024x1792, 1792x1024)
            quality: 质量 (standard, hd)
            
        Returns:
            保存的图片路径
        """
        config = self.config.get('image_models', {}).get('openai', {})
        api_key = config.get('api_key', os.getenv('OPENAI_API_KEY', ''))
        
        if not api_key:
            raise ValueError("OpenAI API Key 未配置")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": config.get('model', 'dall-e-3'),
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "n": 1
        }
        
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=headers,
            json=data,
            timeout=120
        )
        
        response.raise_for_status()
        result = response.json()
        
        # 下载图片
        image_url = result['data'][0]['url']
        image_response = requests.get(image_url, timeout=60)
        image_response.raise_for_status()
        
        filename = f"openai_{int(time.time())}.png"
        return self._save_image(image_response.content, filename)
    
    def generate_aliyun_wanxiang(self, prompt: str, size: str = "1024x1024") -> str:
        """
        使用阿里云通义万相生成图片
        
        Args:
            prompt: 英文或中文提示词
            size: 图片尺寸
            
        Returns:
            保存的图片路径
        """
        config = self.config.get('image_models', {}).get('aliyun_wanxiang', {})
        api_key = config.get('api_key', os.getenv('ALIYUN_WANXIANG_API_KEY', ''))
        
        if not api_key:
            raise ValueError("阿里云通义万相 API Key 未配置")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "wanx-v1",
            "input": {
                "prompt": prompt
            },
            "parameters": {
                "size": size
            }
        }
        
        response = requests.post(
            f"{config.get('base_url', 'https://dashscope.aliyuncs.com/api/v1')}/services/aigc/text2image/image-synthesis",
            headers=headers,
            json=data,
            timeout=120
        )
        
        response.raise_for_status()
        result = response.json()
        
        # 获取任务结果
        task_id = result['output']['task_id']
        image_url = self._wait_for_aliyun_task(task_id, api_key)
        
        # 下载图片
        image_response = requests.get(image_url, timeout=60)
        image_response.raise_for_status()
        
        filename = f"aliyun_{int(time.time())}.png"
        return self._save_image(image_response.content, filename)
    
    def _wait_for_aliyun_task(self, task_id: str, api_key: str) -> str:
        """等待阿里云任务完成"""
        headers = {"Authorization": f"Bearer {api_key}"}
        
        for _ in range(30):  # 最多等待 30 * 2 = 60 秒
            response = requests.get(
                f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            
            if result['output']['task_status'] == 'SUCCEEDED':
                return result['output']['results'][0]['url']
            elif result['output']['task_status'] == 'FAILED':
                raise Exception(f"任务失败: {result}")
            
            time.sleep(2)
        
        raise TimeoutError("等待任务完成超时")
    
    # ==================== 通用接口 ====================
    
    def generate(self, prompt: str, model: Optional[str] = None, 
                 **kwargs) -> str:
        """
        通用生成接口
        
        Args:
            prompt: 提示词
            model: 模型名称，None 则使用默认
            **kwargs: 其他参数
            
        Returns:
            保存的图片路径
        """
        if model is None:
            model = self.config.get('defaults', {}).get('image_model', 'pollinations')
        
        if model == 'pollinations':
            return self.generate_pollinations(prompt, **kwargs)
        elif model == 'openai':
            return self.generate_openai(prompt, **kwargs)
        elif model == 'aliyun_wanxiang':
            return self.generate_aliyun_wanxiang(prompt, **kwargs)
        else:
            raise ValueError(f"不支持的图像生成模型: {model}")
    
    def generate_character_views(self, prompt: str, model: Optional[str] = None) -> Dict[str, str]:
        """
        生成人物三视图
        
        Args:
            prompt: 包含三视图描述的提示词
            model: 模型名称
            
        Returns:
            包含 front, side, back 的字典
        """
        # 解析提示词
        views = {}
        if '正面：' in prompt or '正面:' in prompt:
            # 提取三个视角的提示词
            lines = prompt.split('\n')
            current_view = None
            for line in lines:
                if '正面' in line and '：' in line:
                    current_view = 'front'
                    views[current_view] = line.split('：', 1)[1].strip()
                elif '侧面' in line and '：' in line:
                    current_view = 'side'
                    views[current_view] = line.split('：', 1)[1].strip()
                elif '背面' in line and '：' in line:
                    current_view = 'back'
                    views[current_view] = line.split('：', 1)[1].strip()
                elif current_view and line.strip():
                    views[current_view] += ' ' + line.strip()
        
        # 如果没有解析到，使用默认方式
        if not views:
            views = {
                'front': f"{prompt}, front view, character design, full body",
                'side': f"{prompt}, side view, character design, full body",
                'back': f"{prompt}, back view, character design, full body"
            }
        
        # 生成三张图
        result = {}
        for view_name, view_prompt in views.items():
            result[view_name] = self.generate(view_prompt, model)
        
        return result
    
    def get_available_models(self) -> Dict[str, Dict[str, Any]]:
        """获取可用的模型列表"""
        models = {
            'pollinations': {
                'name': 'Pollinations.ai',
                'type': '免费',
                'description': '完全免费的图像生成服务',
                'enabled': True
            }
        }
        
        # 检查付费模型是否配置了 API Key
        image_config = self.config.get('image_models', {})
        
        if image_config.get('openai', {}).get('api_key'):
            models['openai'] = {
                'name': 'DALL-E 3',
                'type': '付费',
                'description': 'OpenAI 的高质量图像生成',
                'enabled': True
            }
        
        if image_config.get('aliyun_wanxiang', {}).get('api_key'):
            models['aliyun_wanxiang'] = {
                'name': '通义万相',
                'type': '付费',
                'description': '阿里云的高质量图像生成',
                'enabled': True
            }
        
        return models
