FROM node:lts-alpine as frontend-build
WORKDIR /frontend-build
RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories 
RUN apk update && \
    apk add --update git && \
    apk add --update openssh
RUN yarn config set registry https://registry.npm.taobao.org/

RUN git clone https://github.com/sunzehui/vue3-flomo.git ./
RUN yarn install --prod
RUN yarn build
RUN rm -rf ./node_modules
EXPOSE 80

WORKDIR /backend-build
COPY . .
RUN yarn install --prod
RUN yarn migration:run
CMD yarn start:prod
