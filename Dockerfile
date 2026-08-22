FROM node:24-slim

LABEL authors="Angel Ibarra"

RUN apt-get -y update && apt-get install -y  \
    git  \
    webp \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare yarn@4.18.0 --activate

WORKDIR /app

EXPOSE 3000

ENV HOST=0.0.0.0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

CMD ["./node_modules/.bin/nuxt", "dev", "--host", "0.0.0.0"]
