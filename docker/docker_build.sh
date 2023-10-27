commitId=$(git rev-parse --short HEAD)
DATE_STR=$(date '+%y%m%d-%H%M')-${commitId}

PRJ_NAME=ccr.ccs.tencentyun.com/xlcodes/three

yarn

# 执行打包脚本
yarn build

IMAGE_TAG=${PRJ_NAME}:${DATE_STR}

# 架构信息
architecture=$(uname -m)
# arm64 系统（mac m1）需要加上 --platform=linux/amd64 指定打包的镜像架构，否则会报错，镜像运行不起来
if (( $architecture == arm64))
then
  docker build --platform=linux/amd64 -f ./docker/Dockerfile -t ${IMAGE_TAG} .
else
 docker build -f ./docker/Dockerfile -t ${IMAGE_TAG} .
fi

docker push ${IMAGE_TAG}
