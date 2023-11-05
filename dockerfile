FROM node:lts-alpine as builder
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

WORKDIR /backend-build
COPY . .
RUN yarn install --prod \
&& yarn migration:run

# Make workspace with above generated files.
FROM node:lts-alpine AS monolithic
COPY --from=builder /frontend-build/dist /frontend-build/dist
COPY --from=builder /backend-build /backend-build
WORKDIR /backend-build
CMD npm run start:prod
