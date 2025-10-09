FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update -y && apt-get install -y openssl libssl-dev build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm prune --production

EXPOSE 50052

CMD ["node", "server.js"]