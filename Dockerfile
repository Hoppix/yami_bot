FROM node:23-bookworm

# Create app directory
WORKDIR /usr/src/yami


RUN set -x \
    && apt-get update -y \
    && apt-get dist-upgrade -y \
    && apt-get install -y --no-install-recommends \
        ffmpeg 

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
COPY . .

CMD [ "node", "build/src/bot.js" ]
