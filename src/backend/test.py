"""
测试脚本 - 验证核心功能
"""

import sys
from pathlib import Path

# 添加 core 到路径
sys.path.append(str(Path(__file__).parent.parent / "core"))

def test_imports():
    """测试所有模块是否能正常导入"""
    print("[测试] 检查模块导入...")
    try:
        from script_analyzer import ScriptAnalyzer, Character, Scene, ScriptSegment
        from image_generator import ImageGenerator
        from video_generator import VideoGenerator
        print("✅ 所有模块导入成功")
        return True
    except Exception as e:
        print(f"❌ 导入失败: {e}")
        return False

def test_script_analyzer():
    """测试剧本分析器"""
    print("\n[测试] 剧本分析器...")
    try:
        from script_analyzer import ScriptAnalyzer
        
        analyzer = ScriptAnalyzer()
        
        # 测试剧本
        test_script = """
        《测试剧本》
        
        场景：公园 - 白天
        
        小明（20岁，男，学生）在公园散步。
        小红（19岁，女，学生）走过来。
        
        小明："你好！"
        小红："你好！"
        
        两人相视而笑。
        """
        
        result = analyzer.analyze_script(test_script)
        
        if 'characters' in result and 'scenes' in result and 'segments' in result:
            print(f"✅ 剧本分析成功")
            print(f"   - 人物: {len(result['characters'])} 个")
            print(f"   - 场景: {len(result['scenes'])} 个")
            print(f"   - 分段: {len(result['segments'])} 个")
            return True
        else:
            print("❌ 分析结果格式不正确")
            return False
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def test_image_generator():
    """测试图像生成器"""
    print("\n[测试] 图像生成器...")
    try:
        from image_generator import ImageGenerator
        
        generator = ImageGenerator()
        models = generator.get_available_models()
        
        print(f"✅ 图像生成器初始化成功")
        print(f"   - 可用模型: {list(models.keys())}")
        return True
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def test_video_generator():
    """测试视频生成器"""
    print("\n[测试] 视频生成器...")
    try:
        from video_generator import VideoGenerator
        
        generator = VideoGenerator()
        models = generator.get_available_models()
        
        print(f"✅ 视频生成器初始化成功")
        print(f"   - 可用模型: {list(models.keys())}")
        return True
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def test_directory_structure():
    """测试目录结构"""
    print("\n[测试] 目录结构...")
    
    required_dirs = [
        "../core",
        "../config",
        "../backend",
        "../frontend",
        "../../output",
        "../../output/images",
        "../../output/videos",
        "../../uploads"
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        full_path = Path(__file__).parent / dir_path
        if full_path.exists():
            print(f"   ✅ {dir_path}")
        else:
            print(f"   ❌ {dir_path} (不存在)")
            all_exist = False
    
    return all_exist

def main():
    """运行所有测试"""
    print("=" * 50)
    print("剧本转视频系统 - 功能测试")
    print("=" * 50)
    
    tests = [
        ("目录结构", test_directory_structure),
        ("模块导入", test_imports),
        ("图像生成器", test_image_generator),
        ("视频生成器", test_video_generator),
        # ("剧本分析器", test_script_analyzer),  # 需要 API Key
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ {name} 测试异常: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 50)
    print("测试结果汇总")
    print("=" * 50)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{status} - {name}")
    
    print(f"\n总计: {passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！系统已就绪。")
    else:
        print("\n⚠️ 部分测试失败，请检查配置。")

if __name__ == "__main__":
    main()
