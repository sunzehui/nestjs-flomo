FROM node:lts-alpine as frontend-build
WORKDIR /frontend-build
RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories \
&& apk update \ 
&& apk add --update git \
&& apk add --update openssh \
&& git clone https://github.com/sunzehui/vue3-flomo.git ./ \
&& yarn config set registry https://registry.npm.taobao.org/ \
&& yarn install --prod \
&& yarn build \
&& rm -rf ./node_modules
EXPOSE 80

WORKDIR /backend-build
COPY . .
RUN yarn install --prod \
&& yarn migration:run
CMD yarn start:prod
