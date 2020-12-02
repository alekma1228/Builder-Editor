ARG BUILD_NODE_IMAGE
ARG PROD_NGINX_IMAGE

FROM $BUILD_NODE_IMAGE AS build

RUN apk add --no-cache \
    curl \
    jq \
    coreutils

COPY package.json package-lock.json .npmrc /payever/
RUN cd /payever &&  npm ci --ignore-scripts

COPY . /payever
RUN cd /payever && npm run build:sandbox \
    && npm run init:all

RUN ["npm", "run", "package-automation"]

FROM $PROD_NGINX_IMAGE

ARG CI_COMMIT_SHA

COPY --from=build /payever/dist/sandbox /payever

COPY ./deploy /payever/deploy
RUN chmod 755 /payever/deploy -R

RUN mkdir /payever/api && echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/api/status
