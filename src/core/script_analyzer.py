"""
剧本分析器
使用大模型分析剧本，提取人物、场景等信息
"""

import os
import yaml
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import requests
import json


@dataclass
class Character:
    """人物角色"""
    name: str
    description: str
    personality: str
    appearance: str
    age: Optional[str] = None
    gender: Optional[str] = None


@dataclass
class Scene:
    """场景"""
    name: str
    description: str
    location: str
    time: str
    atmosphere: str


@dataclass
class ScriptSegment:
    """剧本分段"""
    index: int
    content: str
    characters: List[str]
    scene: str
    emotion: str
    shot_description: str = ""


class ScriptAnalyzer:
    """剧本分析器"""
    
    def __init__(self, config_path: str = "config/api_config.yaml"):
        self.config = self._load_config(config_path)
        self.current_model = self.config.get('defaults', {}).get('text_model', 'moonshot')
    
    def _load_config(self, path: str) -> Dict:
        """加载配置文件"""
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}
    
    def _call_moonshot(self, prompt: str, system_prompt: str = "") -> str:
        """调用 Kimi API"""
        config = self.config.get('text_models', {}).get('moonshot', {})
        api_key = config.get('api_key', os.getenv('MOONSHOT_API_KEY', ''))
        
        if not api_key:
            raise ValueError("Moonshot API Key 未配置")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": config.get('model', 'moonshot-v1-128k'),
            "messages": [
                {"role": "system", "content": system_prompt} if system_prompt else None,
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        
        # 过滤 None
        data["messages"] = [m for m in data["messages"] if m]
        
        response = requests.post(
            f"{config.get('base_url', 'https://api.moonshot.cn/v1')}/chat/completions",
            headers=headers,
            json=data,
            timeout=120
        )
        
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    
    def _call_zhipu(self, prompt: str, system_prompt: str = "") -> str:
        """调用智谱 API"""
        config = self.config.get('text_models', {}).get('zhipu', {})
        api_key = config.get('api_key', os.getenv('ZHIPU_API_KEY', ''))
        
        if not api_key:
            raise ValueError("智谱 API Key 未配置")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": config.get('model', 'glm-4'),
            "messages": [
                {"role": "system", "content": system_prompt} if system_prompt else None,
                {"role": "user", "content": prompt}
            ]
        }
        
        data["messages"] = [m for m in data["messages"] if m]
        
        response = requests.post(
            f"{config.get('base_url', 'https://open.bigmodel.cn/api/paas/v4')}/chat/completions",
            headers=headers,
            json=data,
            timeout=120
        )
        
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    
    def analyze_script(self, script_text: str) -> Dict[str, Any]:
        """
        分析剧本，提取人物、场景等信息
        
        Args:
            script_text: 剧本文本
            
        Returns:
            包含人物列表、场景列表、分段的字典
        """
        system_prompt = """你是一个专业的剧本分析师。请仔细分析提供的剧本，提取以下信息：
1. 所有出现的人物角色，包括他们的性格特点、外貌描述
2. 所有场景，包括地点、时间、氛围
3. 将剧本拆分成合理的分段，每段包含场景、人物、情绪

请以 JSON 格式返回结果，格式如下：
{
    "characters": [
        {
            "name": "角色名",
            "description": "角色描述",
            "personality": "性格特点",
            "appearance": "外貌描述",
            "age": "年龄",
            "gender": "性别"
        }
    ],
    "scenes": [
        {
            "name": "场景名",
            "description": "场景描述",
            "location": "地点",
            "time": "时间",
            "atmosphere": "氛围"
        }
    ],
    "segments": [
        {
            "index": 0,
            "content": "分段内容",
            "characters": ["角色1", "角色2"],
            "scene": "场景名",
            "emotion": "情绪描述"
        }
    ]
}"""
        
        prompt = f"请分析以下剧本：\n\n{script_text}"
        
        if self.current_model == 'moonshot':
            response = self._call_moonshot(prompt, system_prompt)
        elif self.current_model == 'zhipu':
            response = self._call_zhipu(prompt, system_prompt)
        else:
            raise ValueError(f"不支持的模型: {self.current_model}")
        
        # 解析 JSON 响应
        try:
            # 尝试提取 JSON 部分
            if '```json' in response:
                json_str = response.split('```json')[1].split('```')[0].strip()
            elif '```' in response:
                json_str = response.split('```')[1].split('```')[0].strip()
            else:
                json_str = response
            
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError as e:
            print(f"JSON 解析错误: {e}")
            print(f"原始响应: {response}")
            raise
    
    def generate_character_prompt(self, character: Character) -> str:
        """生成人物三视图的提示词"""
        prompt = f"""请为以下角色生成用于 AI 绘画的三视图提示词（正面、侧面、背面）：

角色名：{character.name}
描述：{character.description}
性格：{character.personality}
外貌：{character.appearance}
年龄：{character.age or '未知'}
性别：{character.gender or '未知'}

请生成详细的英文提示词，包含：
1. 人物外观细节
2. 服装描述
3. 姿态描述
4. 风格要求（写实/动漫等）
5. 三视图格式要求

返回格式：
正面：...
侧面：...
背面：...
"""
        
        if self.current_model == 'moonshot':
            return self._call_moonshot(prompt)
        elif self.current_model == 'zhipu':
            return self._call_zhipu(prompt)
    
    def generate_scene_prompt(self, scene: Scene) -> str:
        """生成场景概念图的提示词"""
        prompt = f"""请为以下场景生成用于 AI 绘画的提示词：

场景名：{scene.name}
描述：{scene.description}
地点：{scene.location}
时间：{scene.time}
氛围：{scene.atmosphere}

请生成详细的英文提示词，包含：
1. 场景构图
2. 光线效果
3. 色彩氛围
4. 细节元素
5. 风格要求
"""
        
        if self.current_model == 'moonshot':
            return self._call_moonshot(prompt)
        elif self.current_model == 'zhipu':
            return self._call_zhipu(prompt)
    
    def generate_storyboard_prompt(self, segment: ScriptSegment, 
                                   characters: List[Character],
                                   scenes: List[Scene]) -> str:
        """生成分镜提示词"""
        char_info = "\n".join([f"- {c.name}: {c.appearance}" for c in characters if c.name in segment.characters])
        scene_info = next((s for s in scenes if s.name == segment.scene), None)
        
        prompt = f"""请为以下剧本片段生成分镜提示词：

剧本内容：
{segment.content}

出场人物：
{char_info}

场景：{scene_info.name if scene_info else segment.scene}
场景描述：{scene_info.description if scene_info else ''}
情绪：{segment.emotion}

请生成详细的英文提示词，包含：
1. 画面构图（镜头角度、景别）
2. 人物动作和表情
3. 场景细节
4. 光线和色彩
5. 艺术风格

返回一个完整的英文提示词段落。
"""
        
        if self.current_model == 'moonshot':
            return self._call_moonshot(prompt)
        elif self.current_model == 'zhipu':
            return self._call_zhipu(prompt)
    
    def modify_storyboard_prompt(self, original_prompt: str, 
                                  modification_request: str) -> str:
        """根据用户要求修改分镜提示词"""
        prompt = f"""请根据用户的要求修改以下分镜提示词：

原始提示词：
{original_prompt}

用户修改要求：
{modification_request}

请生成修改后的完整英文提示词。
"""
        
        if self.current_model == 'moonshot':
            return self._call_moonshot(prompt)
        elif self.current_model == 'zhipu':
            return self._call_zhipu(prompt)
