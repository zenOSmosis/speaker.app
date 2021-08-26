###
# speaker.app frontend.web Dockerfile
###

FROM node:12
LABEL maintainer="jeremy.harris@zenosmosis.com"

ARG BUILD_ENV
ARG GIT_HASH
ARG COTURN_HOSTNAME
ARG COTURN_USERNAME
ARG COTURN_PASSWORD

ENV REACT_APP_GIT_HASH="${GIT_HASH}"
ENV REACT_APP_COTURN_HOSTNAME="${COTURN_HOSTNAME}"
ENV REACT_APP_COTURN_USERNAME="${COTURN_USERNAME}"
ENV REACT_APP_COTURN_PASSWORD="${COTURN_PASSWORD}"

RUN if [ "${BUILD_ENV}" = "production" ] ; then npm install -g serve ; fi

WORKDIR /app/frontend.web

# Build node_modules before copying rest of program in order to speed up 
# subsequent Docker builds which don't have changed package.json contents
#
# IMPORTANT: Development modules have to be installed here or the FE can't
# build
COPY package.json ./
RUN if [ "${BUILD_ENV}" = "production" ] ; then \
  chown -R node /app \
  && npm install --loglevel verbose \
  ; fi

# Subsequent builds usually will start here
COPY ./ ./

# Copy shared modules from parent directory
#
# Also builds .cache directory, which is needed by the CRA build process
RUN if [ "${BUILD_ENV}" = "production" ] ; then \
  rm src/shared \
  && mv src/tmp.shared src/shared \
  && mkdir -p /app/frontend.web/node_modules/.cache \
  && chown -R node /app/frontend.web/node_modules/.cache \
  ; fi

USER node

RUN if [ "${BUILD_ENV}" = "production" ] ; then \
  npm run build \
  ; fi

EXPOSE 3000

# NOTE: The -s switch rewrites all not-found requests to \`index.html\`
# @see https://github.com/vercel/serve/blob/main/bin/serve.js
CMD serve -l 3000 -s build
