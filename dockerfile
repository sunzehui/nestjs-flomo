# FROM node:16.15.0-alpine AS frontend
FROM node:lts-alpine
WORKDIR /frontend-build
RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories 
RUN apk update && \
    apk add --update git && \
    apk add --update openssh
RUN yarn config set registry https://registry.npm.taobao.org/

RUN git clone https://github.com/sunzehui/vue3-flomo.git ./
RUN yarn
RUN yarn build
RUN rm -rf ./node_modules
WORKDIR /backend-build

COPY . .
RUN yarn install --production
RUN yarn build
CMD yarn start:prod