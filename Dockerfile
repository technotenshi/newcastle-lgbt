FROM node:current-slim

LABEL authors="Angel Ibarra"

RUN apt-get -y update && apt-get install -y  \
    git  \
    webp \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

RUN npm install -g npm@10.8.3

RUN yarn global add @gridsome/cli

RUN yarn install --check-files --non-interactive --audit

WORKDIR /app

CMD ["gridsome", "develop"]
