FROM node:22-slim

WORKDIR /app

COPY . .

RUN cd src/gitHubActions && npm install

CMD ["node", "src/gitHubActions/server.js"]


