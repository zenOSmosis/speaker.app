###
# speaker.app backend Dockerfile
###

FROM node:16.14
LABEL maintainer="info@zenosmosis.com"

ARG BUILD_ENV
ARG GIT_HASH

RUN if [ "${BUILD_ENV}" = "development" ] ; then npm install --loglevel verbose -g nodemon ; fi

WORKDIR /app/backend

# Build node_modules before copying rest of program in order to speed up
# subsequent Docker builds which don't have changed package.json contents
#
# IMPORTANT: "--only=production" is used here in BE, while not being used
# in FE as the FE can't build without development modules
COPY package.json ./
COPY package-lock.json ./
RUN chown -R node:node /app/backend

USER node

RUN if [ "${BUILD_ENV}" = "production" ] ; then \
  npm install --loglevel verbose --only=production \
  ; fi

# Subsequent builds usually will start here
COPY ./ ./

# Copy shared modules from parent directory
USER root
RUN if [ "${BUILD_ENV}" = "production" ] ; then \
  rm src/shared \
  && mv src/tmp.shared src/shared \
  ; fi
USER node

# Used for version number
ENV GIT_HASH="${GIT_HASH}"

EXPOSE 3001

CMD npm run start
