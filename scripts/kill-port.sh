#!/usr/bin/env bash

set -u

DEFAULT_PORTS=(3000 3001)

is_valid_port() {
  local port="$1"
  [[ "$port" =~ ^[0-9]+$ ]] && ((port >= 1 && port <= 65535))
}

get_pids_by_port() {
  local port="$1"
  lsof -ti :"$port" 2>/dev/null | sort -u
}

if [[ $# -eq 0 ]]; then
  PORTS=("${DEFAULT_PORTS[@]}")
else
  PORTS=("$@")
fi

released_count=0
free_count=0
failed_count=0
invalid_count=0

for PORT in "${PORTS[@]}"; do
  echo "--- 检查端口 ${PORT} ---"

  if ! is_valid_port "${PORT}"; then
    echo "⚠️ 非法端口: ${PORT}(有效范围 1-65535)"
    invalid_count=$((invalid_count + 1))
    echo
    continue
  fi

  mapfile -t pids < <(get_pids_by_port "${PORT}")

  if [[ ${#pids[@]} -eq 0 ]]; then
    echo "✅ 端口 ${PORT} 未被占用"
    free_count=$((free_count + 1))
    echo
    continue
  fi

  echo "发现端口 ${PORT} 被进程占用: ${pids[*]}"
  echo "尝试优雅终止(SIGTERM)..."
  kill "${pids[@]}" 2>/dev/null || true
  sleep 1

  mapfile -t remain_pids < <(get_pids_by_port "${PORT}")
  if [[ ${#remain_pids[@]} -gt 0 ]]; then
    echo "仍有进程占用,强制终止(SIGKILL): ${remain_pids[*]}"
    kill -9 "${remain_pids[@]}" 2>/dev/null || true
    sleep 1
  fi

  mapfile -t final_pids < <(get_pids_by_port "${PORT}")
  if [[ ${#final_pids[@]} -eq 0 ]]; then
    echo "✅ 端口 ${PORT} 已释放"
    released_count=$((released_count + 1))
  else
    echo "❌ 端口 ${PORT} 仍被占用: ${final_pids[*]}"
    failed_count=$((failed_count + 1))
  fi
  echo
done

echo "=== 处理结果 ==="
echo "已释放: $released_count"
echo "本来空闲: $free_count"
echo "释放失败: $failed_count"
echo "非法端口: $invalid_count"
