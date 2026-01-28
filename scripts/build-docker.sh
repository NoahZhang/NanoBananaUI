#!/bin/bash

# NanoBananaUI Docker 镜像构建脚本
# 使用方法: ./scripts/build-docker.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 镜像名称和标签
IMAGE_NAME="nanobananaui"
IMAGE_TAG="${1:-latest}"

echo -e "${GREEN}=== NanoBananaUI Docker 镜像构建 ===${NC}"
echo "项目目录: $PROJECT_ROOT"
echo "镜像名称: $IMAGE_NAME:$IMAGE_TAG"
echo ""

# 检查 Docker
check_docker() {
    echo -e "${YELLOW}检查 Docker 环境...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: 未找到 Docker${NC}"
        echo "请先安装 Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo -e "${RED}错误: Docker 未运行${NC}"
        echo "请启动 Docker Desktop 或 Docker 服务"
        exit 1
    fi

    echo "Docker: $(docker --version)"
    echo ""
}

# 检查认证文件
check_auth() {
    echo -e "${YELLOW}检查认证文件...${NC}"

    if [ ! -d "$PROJECT_ROOT/auth" ]; then
        echo -e "${RED}错误: 未找到 auth 目录${NC}"
        echo "请创建 auth 目录并放入 Google Cloud 凭证文件"
        exit 1
    fi

    if [ -z "$(ls -A $PROJECT_ROOT/auth/*.json 2>/dev/null)" ]; then
        echo -e "${RED}错误: auth 目录中没有 JSON 凭证文件${NC}"
        echo "请将 Google Cloud 服务账号密钥文件放入 auth 目录"
        exit 1
    fi

    echo -e "${GREEN}认证文件存在${NC}"
    echo ""
}

# 构建镜像
build_image() {
    echo -e "${YELLOW}构建 Docker 镜像...${NC}"
    cd "$PROJECT_ROOT"

    docker build \
        -t "$IMAGE_NAME:$IMAGE_TAG" \
        -f Dockerfile \
        .

    echo ""
    echo -e "${GREEN}镜像构建完成${NC}"
}

# 显示结果
show_result() {
    echo ""
    echo -e "${GREEN}=== 构建完成 ===${NC}"
    echo ""
    echo "镜像信息:"
    docker images "$IMAGE_NAME:$IMAGE_TAG"
    echo ""
    echo -e "${YELLOW}运行方式:${NC}"
    echo "  docker run -d -p 8000:8000 --name nanobananaui $IMAGE_NAME:$IMAGE_TAG"
    echo ""
    echo -e "${YELLOW}访问地址:${NC}"
    echo "  http://localhost:8000"
    echo ""
    echo -e "${YELLOW}查看日志:${NC}"
    echo "  docker logs -f nanobananaui"
    echo ""
    echo -e "${YELLOW}停止容器:${NC}"
    echo "  docker stop nanobananaui && docker rm nanobananaui"
    echo ""
}

# 主流程
main() {
    check_docker
    check_auth
    build_image
    show_result
}

# 运行
main
