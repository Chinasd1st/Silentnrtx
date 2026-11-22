#!/usr/bin/env python3
"""
项目命令入口 —— 用 Python 代替 PowerShell / shell 命令。

用法:
    python tasks.py doctor      检查 Node.js / pnpm 环境
    python tasks.py install     安装依赖 (pnpm install)
    python tasks.py dev         启动开发服务器 http://localhost:4321
    python tasks.py build       构建静态站点到 dist/
    python tasks.py preview     本地预览 dist/
    python tasks.py clean       删除 dist/ .astro/ node_modules/.vite
    python tasks.py fresh       clean + 删除 node_modules 后重新安装

额外参数会原样传给 pnpm，例如:
    python tasks.py dev --host
"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MIN_NODE = (22, 23, 4)


def _pnpm() -> list[str]:
    exe = shutil.which("pnpm")
    if exe:
        return [exe]
    corepack = shutil.which("corepack")
    if corepack:
        return [corepack, "pnpm"]
    sys.exit("找不到 pnpm。请先安装 Node.js（>= 22.23.4），然后运行: python tasks.py doctor")


def _node_version() -> tuple[int, ...] | None:
    node = shutil.which("node")
    if not node:
        return None
    out = subprocess.run([node, "--version"], capture_output=True, text=True).stdout
    m = re.search(r"(\d+)\.(\d+)\.(\d+)", out)
    return tuple(int(x) for x in m.groups()) if m else None


def _pnpm_run(*args: str) -> int:
    cmd = [*_pnpm(), *args]
    print("> pnpm", " ".join(args), flush=True)
    try:
        return subprocess.call(cmd, cwd=ROOT)
    except KeyboardInterrupt:
        return 130


def _rm(*rel: str) -> None:
    for r in rel:
        p = ROOT / r
        if p.exists():
            shutil.rmtree(p, ignore_errors=True)
            print("removed", r)


def doctor(_: list[str]) -> int:
    v = _node_version()
    if v is None:
        print("[x] 未找到 Node.js —— 请安装 22.23.4 或更新版本")
        return 1
    ok = v >= MIN_NODE
    print(f"[{'ok' if ok else 'x'}] Node.js {'.'.join(map(str, v))}" + ("" if ok else "（需要 >= 22.23.4）"))
    pnpm = shutil.which("pnpm")
    if pnpm:
        ver = subprocess.run([pnpm, "--version"], capture_output=True, text=True).stdout.strip()
        print(f"[ok] pnpm {ver}")
    elif shutil.which("corepack"):
        print("[..] 未找到 pnpm，正在用 corepack 启用")
        subprocess.call([shutil.which("corepack"), "enable", "pnpm"])
    else:
        print("[x] 未找到 pnpm 和 corepack")
        return 1
    return 0 if ok else 1


def install(a: list[str]) -> int:
    return _pnpm_run("install", *a)


def dev(a: list[str]) -> int:
    return _pnpm_run("run", "dev", *a)


def build(a: list[str]) -> int:
    return _pnpm_run("run", "build", *a)


def preview(a: list[str]) -> int:
    return _pnpm_run("run", "preview", *a)


def clean(_: list[str]) -> int:
    _rm("dist", ".astro", "node_modules/.vite")
    return 0


def fresh(a: list[str]) -> int:
    clean(a)
    _rm("node_modules")
    return install(a)


TASKS = {f.__name__: f for f in (doctor, install, dev, build, preview, clean, fresh)}


def main() -> int:
    if len(sys.argv) < 2 or sys.argv[1] not in TASKS:
        print(__doc__)
        return 0 if len(sys.argv) < 2 else 2
    return TASKS[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    sys.exit(main())
