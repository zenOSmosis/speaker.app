FROM node:12
LABEL maintainer "jeremy.harris@zenosmosis.com"

# RUN apt-get update && apt-get install gcc

# TODO: Only in development
RUN npm install --loglevel verbose -g nodemon

# RUN CXX=g++-6 npm install --loglevel verbose argon2

WORKDIR /app/headless_chrome_session_controller
RUN chown -R node /app/headless_chrome_session_controller

USER node

COPY ./ ./

# TODO: Only if in production
# RUN npm install --loglevel verbose --only=prod

EXPOSE 3001

# TODO: Commplete
