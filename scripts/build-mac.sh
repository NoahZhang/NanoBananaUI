#!/bin/bash

# NanoBananaUI Mac 应用打包脚本
# 使用方法: ./scripts/build-mac.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}=== NanoBananaUI Mac 应用打包 ===${NC}"
echo "项目目录: $PROJECT_ROOT"
echo ""

# 检查必要的工具
check_requirements() {
    echo -e "${YELLOW}检查构建环境...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到 Node.js${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: 未找到 npm${NC}"
        exit 1
    fi

    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}错误: 未找到 Python3${NC}"
        exit 1
    fi

    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Python3: $(python3 --version)"
    echo ""
}

# 构建前端
build_frontend() {
    echo -e "${YELLOW}[1/4] 构建前端...${NC}"
    cd "$PROJECT_ROOT/frontend"

    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo "安装前端依赖..."
        npm install
    fi

    # 构建
    npm run build

    echo -e "${GREEN}前端构建完成${NC}"
    echo ""
}

# 检查 Python 虚拟环境
check_python_venv() {
    echo -e "${YELLOW}[2/4] 检查 Python 环境...${NC}"
    cd "$PROJECT_ROOT/backend"

    if [ ! -d "venv" ]; then
        echo -e "${RED}错误: 未找到 Python 虚拟环境 (backend/venv)${NC}"
        echo "请先创建虚拟环境并安装依赖:"
        echo "  cd backend"
        echo "  python3 -m venv venv"
        echo "  source venv/bin/activate"
        echo "  pip install -r requirements.txt"
        exit 1
    fi

    # 检查关键依赖
    if ! "$PROJECT_ROOT/backend/venv/bin/python" -c "import fastapi; import uvicorn" 2>/dev/null; then
        echo -e "${RED}错误: Python 虚拟环境缺少必要依赖${NC}"
        echo "请运行: source venv/bin/activate && pip install -r requirements.txt"
        exit 1
    fi

    echo -e "${GREEN}Python 环境检查通过${NC}"
    echo ""
}

# 检查认证文件
check_auth() {
    echo -e "${YELLOW}[3/4] 检查认证文件...${NC}"

    if [ ! -d "$PROJECT_ROOT/auth" ]; then
        echo -e "${RED}警告: 未找到 auth 目录${NC}"
        echo "应用可能无法正常连接 Vertex AI"
    elif [ -z "$(ls -A $PROJECT_ROOT/auth 2>/dev/null)" ]; then
        echo -e "${RED}警告: auth 目录为空${NC}"
    else
        echo -e "${GREEN}认证文件存在${NC}"
    fi
    echo ""
}

# 构建 Electron 应用
build_electron() {
    echo -e "${YELLOW}[4/4] 构建 Electron 应用...${NC}"
    cd "$PROJECT_ROOT/electron"

    # 安装依赖
    if [ ! -d "node_modules" ]; then
        echo "安装 Electron 依赖..."
        npm install
    fi

    # 构建 Mac 应用
    echo "打包 Mac 应用..."
    npm run build:mac

    echo -e "${GREEN}Electron 打包完成${NC}"
    echo ""
}

# 显示结果
show_result() {
    echo -e "${GREEN}=== 打包完成 ===${NC}"
    echo ""
    echo "输出目录: $PROJECT_ROOT/electron/dist/"
    echo ""

    if [ -d "$PROJECT_ROOT/electron/dist" ]; then
        echo "生成的文件:"
        ls -la "$PROJECT_ROOT/electron/dist/"
    fi

    echo ""
    echo -e "${YELLOW}提示:${NC}"
    echo "1. 首次运行可能需要在'系统偏好设置 > 安全性与隐私'中允许"
    echo "2. 如需分发，建议进行代码签名"
    echo ""
}

# 主流程
main() {
    check_requirements
    build_frontend
    check_python_venv
    check_auth
    build_electron
    show_result
}

# 运行
main
