FROM node:current-slim

LABEL authors="miguelibarra"

RUN apt-get -y update && apt-get install -y  \
    git  \
    webp \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

RUN yarn global add @gridsome/cli

WORKDIR /app

#ENTRYPOINT ["top", "-b"]
CMD ["gridsome", "develop"]
