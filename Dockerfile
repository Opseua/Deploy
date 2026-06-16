FROM node:22-slim

WORKDIR /app

COPY . .

# NODE INSTALAR LIBS [Connection]
RUN cd src/Connection && npm install

# INICIAR SERVIDOR GERAL DO DEPLOY
CMD ["node", "src/server.js"]


