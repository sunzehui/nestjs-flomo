# 设置基础镜像
# FROM nginx:latest
# #设置CTS时区
# RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' > /etc/timezone
# # 将dist文件中的内容复制到 /usr/share/nginx/html/ 这个目录下面
# COPY ./web/dist /usr/share/nginx/html/
# #用本地的 vhosts.conf 配置来替换 nginx 镜像里的默认配置
# COPY vhosts.conf /etc/nginx/conf.d/vhosts.conf

# # FROM node:16.15.0-alpine AS frontend
FROM node:lts-alpine
# WORKDIR /frontend-build
# COPY ./web/ .
# RUN yarn
# RUN yarn build

# Build backend dist.
# 设置时区
# ENV TZ=Asia/Shanghai \
#     DEBIAN_FRONTEND=noninteractive
# RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata && rm -rf /var/lib/apt/lists/*

WORKDIR /backend-build
# 复制代码
COPY . .
# COPY ./web/dist /usr/share/nginx/html/
RUN rm -rf ./web
# 运行命令，安装依
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn install --production
RUN yarn build
CMD yarn start:prod