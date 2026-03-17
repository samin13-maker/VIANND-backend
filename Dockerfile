FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g ts-node-dev typescript
COPY . .
EXPOSE 3000
CMD ["ts-node-dev", "--respawn", "src/server.ts"]