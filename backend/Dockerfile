###
# speaker.app backend Dockerfile
###

FROM node:16.14
LABEL maintainer="jeremy.harris@zenosmosis.com"

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
RUN if [ "${BUILD_ENV}" = "production" ] ; then \
  chown -R node /app \
  && npm install --loglevel verbose --only=production \
  ; fi

# Subsequent builds usually will start here
COPY ./ ./

# Copy shared modules from parent directory
RUN if [ "${BUILD_ENV}" = "production" ] ; then \
  rm src/shared \
  && mv src/tmp.shared src/shared \
  ; fi

USER node

# Used for version number
ENV GIT_HASH="${GIT_HASH}"

EXPOSE 3001

CMD npm run start
