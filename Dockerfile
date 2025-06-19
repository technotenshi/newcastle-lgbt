FROM node:22-slim

LABEL authors="Angel Ibarra"

RUN apt-get -y update && apt-get install -y  \
    git  \
    webp \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

RUN yarn global add @gridsome/cli

WORKDIR /app

CMD ["gridsome", "develop"]
