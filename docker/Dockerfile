# 拉取 nginx 镜像
FROM --platform=linux/amd64 nginx

# 将 dist 文件夹拷贝到镜像容器的 /usr/web 文件夹下
COPY ../dist /usr/web
# 映射本地编写的 nginx 配置文件
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
