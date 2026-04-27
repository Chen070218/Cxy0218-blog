from fastapi import APIRouter, Body
import os
import re
import json
from typing import Dict, Any

router = APIRouter()

# ---------------------------------------------------------
# 🛠️ 寻址引擎：物理锁死 Manager 本地根目录！(终极修复版)
# ---------------------------------------------------------
# 获取当前 python 脚本绝对路径所在的文件夹
CURRENT_API_DIR = os.path.dirname(os.path.abspath(__file__))
# 强行向上退两层，绝对锁定 my-blog-manager 的根目录
# (不管之前的脚本把 os.chdir 切到哪里去了，这个基于文件物理位置的路径永远不会错)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_API_DIR, "..", ".."))


def get_config_path():
    # 强制在 Manager 本地根目录下寻找 siteConfig.ts
    possible_paths = [
        os.path.join(PROJECT_ROOT, 'siteConfig.ts'),
        os.path.join(PROJECT_ROOT, 'src', 'siteConfig.ts'),
        # 加入容错：万一你的 siteConfig.ts 和 api 文件夹只差了一层
        os.path.join(os.path.dirname(CURRENT_API_DIR), 'siteConfig.ts')
    ]

    for p in possible_paths:
        if os.path.exists(p):
            return p

    # 如果真的找不到，打印一下它到底在找哪，方便终端排错
    print(f"❌ 警告：在 Manager 目录未找到 siteConfig.ts！正在搜索的根目录是: {PROJECT_ROOT}")
    return None


# 🌟 将字典对象转换为漂亮的 TypeScript 对象代码
def dict_to_ts_string(data, indent=2):
    if isinstance(data, dict):
        lines = ["{"]
        for k, v in data.items():
            val = f'"{v}"' if isinstance(v, str) else json.dumps(v, ensure_ascii=False)
            lines.append(f"{' ' * (indent + 2)}{k}: {val},")
        lines.append(" " * indent + "}")
        return "\n".join(lines)
    return json.dumps(data, ensure_ascii=False)


# =========================================================
# 🚀 接口 1：读取配置 (GET)
# =========================================================
@router.get("/get")
def get_site_config():
    config_path = get_config_path()
    if not config_path:
        return {"success": False, "message": "未能找到 siteConfig.ts 文件"}

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()

        parsed_config = {}
        # 提取基础字符串变量
        for match in re.finditer(r'([a-zA-Z0-9_]+)\s*:\s*(["\'])(.*?)\2', content):
            key, _, val = match.groups()
            parsed_config[key] = val

        # 强力提取多行嵌套的 social 对象
        social_match = re.search(r'social\s*:\s*\{([\s\S]+?)\}', content)
        if social_match:
            social_str = social_match.group(1)
            social_dict = {}
            for m in re.finditer(r'([a-zA-Z0-9_]+)\s*:\s*(["\'])(.*?)\2', social_str):
                k, _, v = m.groups()
                social_dict[k] = v
            parsed_config['social'] = social_dict

        return {"success": True, "data": parsed_config}
    except Exception as e:
        return {"success": False, "message": f"解析失败: {str(e)}"}


# =========================================================
# 🚀 接口 2：写入配置 (POST) - 终极绝杀版
# =========================================================
@router.post("/update")
def update_site_config(payload: Dict[str, Any] = Body(...)):
    updates = payload.get("updates", {})
    if not updates:
        return {"success": False, "message": "没有收到需要更新的数据"}

    config_path = get_config_path()
    if not config_path:
        return {"success": False, "message": "未能扫描到 siteConfig.ts"}

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()

        print("\n" + "=" * 50)
        print(f"🔥 启动物理引擎，目标文件: {config_path}")

        updated_count = 0
        for key, value in updates.items():

            # 🌟🌟🌟 核心防御阵：拦截那些会破坏 social 对象的“散装旧数据”
            if key in [
                'github', 'gitee', 'google', 'email', 'qq', 'wechat',
                'newMusicId', 'newBgUrl', 'queryLoading', 'queryResult'
            ]:
                print(f"  🛑 拦截多余散装字段，已跳过 -> [{key}]")
                continue

            # 智能格式化数据
            if isinstance(value, str):
                val_str = f'"{value}"'
            elif isinstance(value, bool):
                val_str = str(value).lower()
            elif isinstance(value, dict):
                val_str = dict_to_ts_string(value, indent=2)
            else:
                val_str = json.dumps(value, ensure_ascii=False)

            # 针对不同数据结构的正则表达式
            if isinstance(value, dict):
                pattern = rf"({key}\s*:\s*)\{{[\s\S]*?\}}"
            elif isinstance(value, list):
                pattern = rf"({key}\s*:\s*)\[[\s\S]*?\]"
            else:
                pattern = rf"({key}\s*:\s*)(['\"`][\s\S]*?['\"`]|true|false|\d+)"

            # 执行正则物理替换
            if re.search(pattern, content):
                content = re.sub(pattern, lambda m: m.group(1) + val_str, content, count=1)
                print(f"  ✅ 成功修改并落盘 -> [{key}]")
                updated_count += 1
            else:
                print(f"  ⚠️ 文件中未发现此字段，忽略 -> [{key}]")

        # 写入物理磁盘
        with open(config_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"🔥 任务圆满完成，共刷新 {updated_count} 个字段")
        print("=" * 50 + "\n")

        return {"success": True, "message": "本地 siteConfig.ts 修改成功！"}

    except Exception as e:
        print(f"❌ 物理写入发生灾难性错误: {str(e)}")
        return {"success": False, "message": f"文件读写错误: {str(e)}"}