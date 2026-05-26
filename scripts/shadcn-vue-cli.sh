#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SHADCN_CLI=(pnpm dlx shadcn-vue@latest)

print_line() {
  printf '%s\n' '────────────────────────────────────────'
}

print_section() {
  printf '\n'
  print_line
  printf '%s\n' "$1"
  print_line
}

print_menu() {
  print_section 'shadcn-vue CLI 菜单'
  printf '%s\n' '说明：标记【】的是子菜单；写入类命令会二次确认，预览/查看类命令不会修改文件。'
  printf '%s\n' '1. 【add】添加/更新组件 - 进入子菜单，可安装、预览、看差异、替换 Lucide 导入'
  printf '%s\n' '2. apply - 应用 preset 到当前项目；默认 nova，会修改配置/样式/组件文件'
  printf '%s\n' '3. view - 查看 registry 中 button/card/dialog 的源码内容；只读，用于安装前检查'
  printf '%s\n' '4. search - 在 registry 搜索 button；只读，用于确认组件/区块名称'
  printf '%s\n' '5. docs - 输出 button 的文档、示例、API 链接；只读，用于查用法'
  printf '%s\n' '6. info - 解析并展示当前 components.json、别名、样式文件路径等项目信息；只读'
  printf '%s\n' '7. migrate - 运行官方迁移脚本；用于 shadcn-vue 升级/API 变化后的批量代码调整，会修改文件'
  printf '%s\n' '8. migrate rtl - 运行官方 RTL 迁移；用于添加/调整从右到左布局支持，会修改文件'
  printf '%s\n' '9. help - 查看 shadcn-vue CLI 顶层帮助；只读'
  printf '%s\n' '0. exit - 退出脚本'
  print_line
}

print_add_menu() {
  print_section 'add 子菜单'
  printf '%s\n' '说明：add 用于从 shadcn-vue registry 安装或更新组件；覆盖类命令会二次确认。'
  printf '%s\n' '1. 全量安装并覆盖 - 执行 add -a -y -o，安装全部组件并覆盖已有 UI 文件'
  printf '%s\n' '2. 预览安装 - 执行 add --dry-run，只看会安装/修改哪些文件，不写入'
  printf '%s\n' '3. 查看差异 - 执行 add --diff，用于比较 registry 文件和本地文件差异，不写入'
  printf '%s\n' '4. 查看文件 - 执行 add --view，查看 registry 中指定文件内容，不写入'
  printf '%s\n' '5. 全量安装并覆盖 + Lucide 替换 - 先 add -a -y -o，再把 @lucide/vue 改成 lucide-vue-next'
  printf '%s\n' '6. 仅替换 Lucide 导入 - 不运行 shadcn-vue，只扫描目录并把 @lucide/vue 改成 lucide-vue-next'
  printf '%s\n' '0. 返回主菜单'
  print_line
}

prompt_input() {
  local target_var="$1"
  local label="$2"
  printf '%s' "$label"
  IFS= read -r "$target_var"
}

prompt_optional() {
  local target_var="$1"
  local label="$2"

  if ! prompt_input "$target_var" "$label"; then
    printf '\n'
    printf -v "$target_var" '%s' ''
  fi
}

prompt_choice() {
  local target_var="$1"

  if ! prompt_input "$target_var" '请输入序号: '; then
    printf '\n%s\n' '输入结束，已退出。'
    return 1
  fi
}

print_command() {
  local first=1
  printf '%s\n' '即将执行命令:'
  printf '  '

  for arg in "$@"; do
    if [[ "$first" -eq 0 ]]; then
      printf ' '
    fi
    printf '%q' "$arg"
    first=0
  done

  printf '\n'
}

confirm_write_command() {
  local answer
  if ! prompt_input answer '该命令会修改项目文件，是否继续？[y/N] '; then
    printf '\n%s\n' '已取消。'
    return 1
  fi

  case "$answer" in
    y | Y | yes | YES) return 0 ;;
    *) printf '%s\n' '已取消。'; return 1 ;;
  esac
}

run_shadcn() {
  print_command "${SHADCN_CLI[@]}" "$@"
  "${SHADCN_CLI[@]}" "$@"
}

run_shadcn_write() {
  print_command "${SHADCN_CLI[@]}" "$@"
  confirm_write_command || return 0
  "${SHADCN_CLI[@]}" "$@"
}

run_shadcn_write_or_cancel() {
  print_command "${SHADCN_CLI[@]}" "$@"
  confirm_write_command || return 1
  "${SHADCN_CLI[@]}" "$@"
}

run_shadcn_from_words() {
  local input="$1"
  shift

  if [[ -z "$input" ]]; then
    run_shadcn "$@"
    return
  fi

  local -a args
  read -r -a args <<<"$input"
  run_shadcn "$@" "${args[@]}"
}

run_shadcn_write_from_words() {
  local input="$1"
  shift

  if [[ -z "$input" ]]; then
    run_shadcn_write "$@"
    return
  fi

  local -a args
  read -r -a args <<<"$input"
  run_shadcn_write "$@" "${args[@]}"
}

prompt_add_items() {
  prompt_optional "$1" '组件名/URL/路径，多个用空格分隔；输入 all 表示全部；留空进入官方交互: '
}

run_add_install() {
  run_shadcn_write add -a -y -o
}

rewrite_lucide_imports() {
  local target_dir="${1:-src/components/shadcn-vue}"
  local from_package='@lucide/vue'
  local to_package='lucide-vue-next'
  local changed_count=0

  print_section '替换 Lucide 导入'
  printf '%s\n' "扫描目录: $target_dir"
  printf '%s\n' "替换规则: $from_package -> $to_package"

  if [[ ! -d "$target_dir" ]]; then
    printf '%s\n' "扫描目录不存在：$target_dir"
    return 1
  fi

  while IFS= read -r -d '' file; do
    if ! grep -q "$from_package" "$file"; then
      continue
    fi

    perl -0pi -e 's/\@lucide\/vue/lucide-vue-next/g' "$file"
    changed_count=$((changed_count + 1))
    printf '%s\n' "- $file"
  done < <(find "$target_dir" -type f \( -name '*.vue' -o -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.mjs' -o -name '*.mts' \) -print0)

  if [[ "$changed_count" -eq 0 ]]; then
    printf '%s\n' "未发现需要替换的 $from_package 导入。"
    return 0
  fi

  printf '%s\n' "已替换 $changed_count 个文件。"
}

run_add_install_with_lucide_vue_next() {
  run_shadcn_write_or_cancel add -a -y -o || return 0
  rewrite_lucide_imports src/components/shadcn-vue
}

run_lucide_import_rewrite() {
  local target_dir
  prompt_optional target_dir '扫描目录；留空默认 src/components/shadcn-vue: '
  target_dir="${target_dir:-src/components/shadcn-vue}"

  printf '%s\n' "将把 $target_dir 下代码导入中的 @lucide/vue 替换为 lucide-vue-next。"
  confirm_write_command || return 0
  rewrite_lucide_imports "$target_dir"
}

run_add_dry_run() {
  local input
  prompt_add_items input

  if [[ "$input" == 'all' || "$input" == '--all' ]]; then
    run_shadcn add --dry-run -a
    return
  fi

  run_shadcn_from_words "$input" add --dry-run
}

run_add_file_mode() {
  local flag="$1"
  local label="$2"
  local input
  prompt_optional input "$label"

  if [[ -z "$input" ]]; then
    run_shadcn add "$flag"
    return
  fi

  run_shadcn add "$flag" "$input"
}

run_add_diff() {
  run_add_file_mode --diff '请输入 --diff 的文件路径；留空使用官方默认 diff: '
}

run_add_view() {
  run_add_file_mode --view '请输入 --view 的文件路径；留空使用官方默认 view: '
}

run_add() {
  local choice
  while true; do
    print_add_menu
    prompt_choice choice || return

    case "$choice" in
      1) run_add_install ;;
      2) run_add_dry_run ;;
      3) run_add_diff ;;
      4) run_add_view ;;
      5) run_add_install_with_lucide_vue_next ;;
      6) run_lucide_import_rewrite ;;
      0) return ;;
      *) printf '%s\n' '无效选项，请重新输入。' ;;
    esac
  done
}

run_apply() {
  local input
  prompt_optional input 'preset 名称/URL/参数；留空执行 apply --preset nova -y: '

  if [[ -z "$input" ]]; then
    run_shadcn_write apply --preset nova -y
    return
  fi

  run_shadcn_write_from_words "$input" apply -y
}

run_view() {
  run_shadcn view button card dialog
}

run_search() {
  run_shadcn search @shadcn-vue -q "button"
}

run_docs() {
  run_shadcn docs "button"
}

run_migrate() {
  local input
  prompt_optional input 'migrate 参数；留空直接执行 migrate: '
  run_shadcn_write_from_words "$input" migrate
}

run_migrate_rtl() {
  local input
  prompt_optional input 'migrate rtl 参数；留空直接执行 migrate rtl: '
  run_shadcn_write_from_words "$input" migrate rtl
}

run_menu() {
  local choice
  while true; do
    print_menu
    prompt_choice choice || return

    case "$choice" in
      1) run_add ;;
      2) run_apply ;;
      3) run_view ;;
      4) run_search ;;
      5) run_docs ;;
      6) run_shadcn info ;;
      7) run_migrate ;;
      8) run_migrate_rtl ;;
      9) run_shadcn --help ;;
      0) printf '%s\n' '已退出。'; return ;;
      *) printf '%s\n' '无效选项，请重新输入。' ;;
    esac
  done
}

cd "$ROOT_DIR"
run_menu
