FROM node:22-slim

WORKDIR /app

COPY . .

# NODE INSTALAR LIBS [communication]
RUN cd src/gitHubActions/communication && npm install

# INICIAR SERVIDOR GERAL DO DEPLOY
CMD ["node", "src/gitHubActions/server.js"]


