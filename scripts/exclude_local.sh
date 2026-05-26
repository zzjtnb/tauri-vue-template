#!/usr/bin/env bash

# ==============================================================================
# 📝 Git 本地排除工具 (切换模式版)
# ==============================================================================
# 💡 使用说明:
# 1. 批量排除 (默认):
#    ./exclude_local.sh
#    (会将下方 CONFIG_STR 中的所有项添加到本地排除)
#
# 2. 批量取消排除:
#    ./exclude_local.sh del
#    (会将下方 CONFIG_STR 中的所有项从本地排除中移除)
#
# 3. 指定路径操作:
#    ./exclude_local.sh add path/to/target  # 添加特定路径 (文件或目录)
#    ./exclude_local.sh del path/to/target  # 移除特定路径 (文件或目录)
# ==============================================================================

# 📋 配置区域：默认要管理的本地排除清单 (空格分隔)
CONFIG_STR=".agent .agents .claude .gitnexus AGENTS.md CLAUDE.md backup"

# ==============================================================================

EXCLUDE_FILE=".git/info/exclude"

# 1. 环境自检
if [ ! -d ".git" ]; then
    echo "❌ 错误: 此脚本需在 Git 仓库根目录执行。"
    exit 1
fi
touch "$EXCLUDE_FILE"

# 2. 解析配置字符串到列表 (空格分隔)
read -ra CONFIG_ITEMS <<< "$CONFIG_STR"
DEFAULT_LIST=()
for i in "${CONFIG_ITEMS[@]}"; do
    item=$(echo "$i" | xargs)
    [ -n "$item" ] && DEFAULT_LIST+=("$item")
done

# 3. 确定操作行为和目标路径
ACTION="add"
TARGET_PATH=""

if [ "$1" == "del" ]; then
    ACTION="del"
    TARGET_PATH=$2
elif [ "$1" == "add" ]; then
    ACTION="add"
    TARGET_PATH=$2
elif [ -n "$1" ]; then
    echo "❌ 错误: 未知操作 $1，请使用 add 或 del。"
    exit 1
fi

TARGET_LIST=()
if [ -n "$TARGET_PATH" ]; then
    TARGET_LIST+=("$TARGET_PATH")
else
    TARGET_LIST=("${DEFAULT_LIST[@]}")
fi

# 4. 执行同步操作
echo "⚡️ 同步模式: $ACTION"

CURRENT_CONTENT=$(cat "$EXCLUDE_FILE")

if [ "$ACTION" == "add" ]; then
    NEW_CONTENT="$CURRENT_CONTENT"
    for item in "${TARGET_LIST[@]}"; do
        if ! echo "$CURRENT_CONTENT" | grep -Fxq "$item" 2>/dev/null; then
            NEW_CONTENT+=$'\n'"$item"
            echo "➕ [已排除路径]: $item"
        else
            echo "✅ [路径已存在]: $item"
        fi
    done
elif [ "$ACTION" == "del" ]; then
    NEW_CONTENT="$CURRENT_CONTENT"
    for item in "${TARGET_LIST[@]}"; do
        if echo "$NEW_CONTENT" | grep -Fxq "$item" 2>/dev/null; then
            NEW_CONTENT=$(echo "$NEW_CONTENT" | grep -Fvx "$item")
            echo "🗑️ [已取消排除]: $item"
        else
            echo "🔘 [该路径原本未排除]: $item"
        fi
    done
fi

# 5. 最后统一格式化导出 (保留注释, 去重, 去空行, 去尾部空格)
TEMP_OUT=$(mktemp)
echo "$NEW_CONTENT" | awk '!seen[$0]++' | sed '/^$/d; s/[[:space:]]*$//' > "$TEMP_OUT"
mv "$TEMP_OUT" "$EXCLUDE_FILE"

# 6. 后续检查与统计
echo "---"
if [ "$ACTION" == "add" ]; then
    TRACKED_CONFLICTS=()
    for item in "${TARGET_LIST[@]}"; do
        if git ls-files --error-unmatch "$item" >/dev/null 2>&1; then
            TRACKED_CONFLICTS+=("$item")
        fi
    done

    if [ ${#TRACKED_CONFLICTS[@]} -gt 0 ]; then
        echo "⚠️  警告: 以下路径目前仍在 Git 索引中，排除规则暂未生效："
        for f in "${TRACKED_CONFLICTS[@]}"; do echo "  - $f"; done
        echo ""
        echo "💡 请执行以下命令清理 Git 缓存以使规则生效 (不删本地文件) ："
        echo "git rm -r --cached ${TRACKED_CONFLICTS[*]}"
    else
        echo "🚀 同步完成！所有目标路径均已配置为本地排除。"
    fi
else
    echo "✨ 操作完成！已将选中路径从本地排除列表中同步移除。"
fi
