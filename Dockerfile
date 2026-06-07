FROM node:22-slim

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "gitHubActions/serverDeploy.js"]