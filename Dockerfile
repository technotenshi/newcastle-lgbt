FROM node:24-slim

LABEL authors="Angel Ibarra"

RUN apt-get -y update && apt-get install -y  \
    git  \
    webp \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app

EXPOSE 3000

ENV HOST=0.0.0.0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

CMD ["yarn", "dev", "--host", "0.0.0.0"]
