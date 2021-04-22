FROM node:12
LABEL maintainer "jeremy.harris@zenosmosis.com"

WORKDIR /app/headless_chrome_app
RUN chown -R node /app/headless_chrome_app

USER node

COPY ./ ./

# TODO: Only if in production
# RUN npm install --loglevel verbose --only=prod

# In development
EXPOSE 3000

# In production
EXPOSE 5000

# TODO: Complete
